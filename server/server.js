const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Standard = require('./models/Standard');
const History = require('./models/History');
const User = require('./models/User');

const app = express();

// Configurable CORS origin
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Configure Multer with strict MIME and extension matching (prevents allowlist bypass)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB maximum file size
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    const isPdf = mime === 'application/pdf' && ext === '.pdf';
    const isTxt = mime === 'text/plain' && ext === '.txt';

    if (isPdf || isTxt) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. File must have matching MIME type and extension: PDF (application/pdf with .pdf) or Plain text (text/plain with .txt).');
      err.code = 'INVALID_FILE_TYPE';
      cb(err, false);
    }
  }
});

// Helper for extracting text from PDF using pdf-parse v2 API
async function extractTextFromPdf(buffer) {
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const res = await parser.getText();
    return res && res.text ? res.text : '';
  } finally {
    if (typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {});
    }
  }
}

// AI Pipeline state
let extractor = null;
async function initPipeline() {
  try {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('AI Model loaded for inference.');
  } catch (e) {
    console.error('Failed to load transformer model:', e);
  }
}

function setExtractor(customExtractor) {
  extractor = customExtractor;
}

// Cosine similarity utility
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// Helper to safely extract db and host without printing credentials
function getSanitizedDbInfo(uri) {
  try {
    const pseudoUrl = uri.replace(/^mongodb(\+srv)?:\/\//, 'http://');
    const parsed = new URL(pseudoUrl);
    const dbName = parsed.pathname.replace(/^\//, '') || 'default';
    const host = parsed.host || 'localhost';
    return { dbName, host };
  } catch {
    return { dbName: 'configured_database', host: 'configured_host' };
  }
}

// -------------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE (Defined before routes)
// -------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied: authorization token required' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('Server configuration error: JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, jwtSecret, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decodedUser;
    next();
  });
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ error: `Forbidden: requires ${requiredRole} privileges` });
    }
    next();
  };
}

// Optional auth middleware for public endpoints that track logged-in user if token provided
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    req.user = null;
    return next();
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Health Check Endpoint (safe reporting, no secrets exposed)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbReady: mongoose.connection.readyState === 1,
    modelReady: extractor !== null
  });
});

// 1. POST /api/recommend (Public recommendation, records user ID if authenticated)
app.post('/api/recommend', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Save history (optional guest tracking)
    await History.create({ query });

    if (!extractor) {
      return res.status(503).json({ error: 'AI model is still loading, please try again in a few seconds.' });
    }

    const output = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data);

    const allStandards = await Standard.find();
    const ranked = allStandards.map(std => {
      const score = cosineSimilarity(queryEmbedding, std.embedding);
      return { ...std.toObject(), similarityScore: score };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    if (ranked.length === 0) {
      return res.json({ primary: null, related: [] });
    }

    const primary = ranked[0];
    const related = ranked.slice(1, 5);

    delete primary.embedding;
    related.forEach(r => delete r.embedding);

    res.json({ primary, related });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Server error during recommendation.' });
  }
});

// 2. GET /api/standards/:id
app.get('/api/standards/:id', async (req, res) => {
  try {
    const std = await Standard.findById(req.params.id).select('-embedding');
    if (!std) return res.status(404).json({ error: 'Standard not found' });
    res.json(std);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching standard' });
  }
});

// 3. GET /api/standards
app.get('/api/standards', async (req, res) => {
  try {
    const stds = await Standard.find().select('-embedding');
    res.json(stds);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching standards catalog' });
  }
});

// 4. POST /api/standards (Protected: Admin Only, Cold-Start Guarded)
app.post('/api/standards', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { isNumber, title, category, scope, latestVersion, amendments, alliedStandards, certifications } = req.body;

    if (!isNumber || typeof isNumber !== 'string' || !isNumber.trim()) {
      return res.status(400).json({ error: 'Valid isNumber is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!scope || !scope.trim()) {
      return res.status(400).json({ error: 'Scope is required' });
    }

    // Cold-start guard: never save standard with empty embedding
    if (!extractor) {
      return res.status(503).json({ error: 'AI embedding model is loading, please try again in a few seconds' });
    }

    const textToEmbed = `${title.trim()}. ${scope.trim()} ${category || ''}`.trim();
    const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    const newStd = new Standard({
      isNumber: isNumber.trim(),
      title: title.trim(),
      category: category ? category.trim() : 'General',
      scope: scope.trim(),
      latestVersion: latestVersion ? latestVersion.trim() : '',
      amendments: Array.isArray(amendments) ? amendments : [],
      alliedStandards: Array.isArray(alliedStandards) ? alliedStandards : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      embedding
    });

    await newStd.save();

    const returnedStd = newStd.toObject();
    delete returnedStd.embedding;
    res.status(201).json(returnedStd);
  } catch (err) {
    console.error('Error creating standard:', err);
    res.status(500).json({ error: 'Server error creating standard' });
  }
});

// 5. POST /api/extract-standard (Protected: Admin Only, Strict Validation & PDF Magic Header Check)
app.post('/api/extract-standard', authenticateToken, requireRole('admin'), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum allowed size is 10MB.' });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const mime = (req.file.mimetype || '').toLowerCase();

    const isPdf = mime === 'application/pdf' && ext === '.pdf';
    const isTxt = mime === 'text/plain' && ext === '.txt';

    if (!isPdf && !isTxt) {
      return res.status(400).json({ error: 'Disallowed file format. Expected matching PDF (.pdf) or Plain Text (.txt).' });
    }

    let text = '';
    if (isPdf) {
      // Validate PDF signature: must begin with %PDF-
      const magicSignature = req.file.buffer.subarray(0, 5).toString('ascii');
      if (magicSignature !== '%PDF-') {
        return res.status(400).json({ error: 'Invalid PDF file: missing %PDF- header signature' });
      }
      text = await extractTextFromPdf(req.file.buffer);
    } else {
      text = req.file.buffer.toString('utf8');
    }

    const isNumberMatch = text.match(/IS\s*\d+(?:\s*\(Part\s*\d+\))?(?::\s*\d{4})?/i);
    const isNumber = isNumberMatch ? isNumberMatch[0].replace(/\n/g, '').trim() : '';

    let title = '';
    const titleMatch = text.match(/Title\s*:\s*(.+)/i) || text.match(/Specification\s*for\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      if (lines.length > 1) title = lines[0];
    }

    let category = 'General';
    const lower = text.toLowerCase();
    if (lower.includes('cement')) category = 'Cement';
    else if (lower.includes('steel')) category = 'Steel';
    else if (lower.includes('electrical')) category = 'Electrical';
    else if (lower.includes('textile')) category = 'Textiles';

    let scope = '';
    const scopeMatch = text.match(/Scope\s*([^]*?)(?=\n\s*\d+\.\d+|\n\s*[A-Z][a-z]+:)/i);
    if (scopeMatch) {
      scope = scopeMatch[1].replace(/\n/g, ' ').trim().substring(0, 500);
    } else {
      scope = text.replace(/\n/g, ' ').substring(0, 200).trim();
    }

    let latestVersion = '';
    const yearMatch = isNumber.match(/:(\d{4})/);
    if (yearMatch) latestVersion = yearMatch[1];

    res.json({
      isNumber,
      title,
      category,
      scope,
      latestVersion
    });
  } catch (err) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract data from file' });
  }
});

// 6. GET /api/history
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    // Only fetch history for the currently logged-in user
    const history = await History.find({ userId: req.user.username }).sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

// 7. POST /api/chat (LLM integration)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Check if the user has provided a Gemini API Key in .env
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      // Connect to real Google Gemini API!
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are the NiryanaAI Assistant, helping users search for Indian Standards (IS). 
      The user says: "${message}"
      Please provide a brief, helpful response. If they want a query rewritten, rewrite it to be highly descriptive for semantic search.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ reply: response.text() });
    }

    // --- FALLBACK MOCK API (if no key is found) ---
    const lowerMsg = message.toLowerCase();
    let reply = '';

    if (lowerMsg.includes('search for') || lowerMsg.includes('help me find')) {
      reply = "To get the best results, try searching with specific materials or use cases. For example, instead of just 'cables', you could search: 'performance requirements for underground PVC power cables'.";
    } 
    else if (lowerMsg.includes('compare') || lowerMsg.includes('difference')) {
      reply = "When comparing IS standards, look at the 'Category' and 'Scope'. One standard might cover the **testing methods**, while another covers the **product specifications**.";
    }
    else if (lowerMsg.includes('rewrite')) {
      reply = `Here is a better way to write that query for our semantic database: "safety and testing specifications for ${message.replace(/rewrite/i, '').trim() || 'your product'}"`;
    }
    else {
      reply = "I'm the NiryanaAI mock assistant! Provide your Google Gemini API Key in the server/.env file to make me genuinely intelligent!";
    }

    setTimeout(() => {
      res.json({ reply });
    }, 1000);

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat error' });
  }
});

// -------------------------------------------------------------
// SERVER INITIALIZATION (Modular, non-auto-executing on require)
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
let serverInstance = null;

async function connectDB(uri) {
  const targetUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  await mongoose.connect(targetUri);
  // Log safely without leaking credentials
  const { dbName, host } = getSanitizedDbInfo(targetUri);
  console.log(`Connected to MongoDB database: '${dbName}' on host: '${host}'`);
}

async function startServer(port = PORT) {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required to start server');
    process.exit(1);
  }
  await initPipeline();
  await connectDB();
  serverInstance = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  return serverInstance;
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  connectDB,
  initPipeline,
  startServer,
  setExtractor,
  extractTextFromPdf,
  getSanitizedDbInfo
};
