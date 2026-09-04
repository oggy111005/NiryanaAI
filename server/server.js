const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const Standard = require('./models/Standard');
const History = require('./models/History');
const User = require('./models/User');

// Shared Gemini model factory — avoids re-instantiating per request in each route
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  return genAI.getGenerativeModel({ model: modelName });
}



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

// 6. POST /api/analyze-tender (Tender Document Specification Analyzer - SIH Phase 5)
app.post('/api/analyze-tender', authenticateToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload error' });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No tender file uploaded' });

    let text = '';
    const ext = require('path').extname(req.file.originalname || '').toLowerCase();
    
    if (ext === '.pdf' || req.file.mimetype === 'application/pdf') {
      text = await extractTextFromPdf(req.file.buffer);
    } else {
      text = req.file.buffer.toString('utf-8');
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from tender document' });
    }

    if (!extractor) {
      return res.status(503).json({ error: 'AI model is still loading' });
    }

    // Heuristic: Extract "clauses" by splitting on double newlines and filtering short/irrelevant ones
    const rawBlocks = text.split(/\n\s*\n/);
    const clauses = rawBlocks
      .map(b => b.trim())
      .filter(b => b.length > 50 && b.length < 1000)
      .slice(0, 5); // Limit to top 5 clauses for demo performance

    if (clauses.length === 0) {
      clauses.push(text.substring(0, 500));
    }

    const allStandardsWithEmb = await Standard.find({ isDemo: { $ne: true } }).select('+embedding').lean();
    const analysisResults = [];

    for (const clause of clauses) {
      const output = await extractor(clause, { pooling: 'mean', normalize: true });
      const queryEmb = Array.from(output.data);

      const ranked = allStandardsWithEmb.map(std => {
        const score = cosineSimilarity(queryEmb, std.embedding);
        return { _id: std._id, isNumber: std.isNumber, title: std.title, score };
      }).sort((a, b) => b.score - a.score);

      // Apply threshold
      const matches = ranked.filter(r => r.score > 0.35).slice(0, 3);

      analysisResults.push({
        clauseText: clause,
        recommendedStandards: matches
      });
    }

    res.json({
      documentName: req.file.originalname,
      analyzedClauses: analysisResults.length,
      results: analysisResults
    });

  } catch (err) {
    console.error('Tender analysis error:', err);
    res.status(500).json({ error: 'Server error during tender analysis' });
  }
});

// 6b. POST /api/screen-compliance (AI Compliance Screening - SIH Phase 5)
// Evaluates vendor test evidence against applicable standard requirements
app.post('/api/screen-compliance', authenticateToken, async (req, res) => {
  try {
    const { isNumber, materialName, parameters } = req.body;
    if (!isNumber) {
      return res.status(400).json({ error: 'isNumber is required for compliance screening' });
    }

    const evaluatedParams = (parameters && Array.isArray(parameters) ? parameters : []).map(p => {
      const requiredVal = parseFloat(p.requiredValue);
      const proposedVal = parseFloat(p.proposedValue);
      const op = p.operator || '>=';

      let isPassing = true;
      let isBorderline = false;

      if (!isNaN(requiredVal) && !isNaN(proposedVal)) {
        if (op === '>=') {
          isPassing = proposedVal >= requiredVal;
          if (!isPassing && proposedVal >= requiredVal * 0.95) isBorderline = true;
        } else if (op === '<=') {
          isPassing = proposedVal <= requiredVal;
          if (!isPassing && proposedVal <= requiredVal * 1.05) isBorderline = true;
        } else if (op === '==') {
          isPassing = proposedVal === requiredVal;
        }
      } else if (typeof p.requiredValue === 'string') {
        const reqStr = String(p.requiredValue).toLowerCase().trim();
        const propStr = String(p.proposedValue || '').toLowerCase().trim();
        isPassing = propStr.includes(reqStr) || propStr === 'yes' || propStr === 'valid' || propStr === 'active';
        if (!isPassing && (propStr.includes('pending') || propStr.includes('renewal') || propStr.includes('provisional'))) {
          isBorderline = true;
        }
      }

      return {
        clauseNumber: p.clauseNumber || 'General',
        parameterName: p.parameterName,
        requiredValue: p.requiredValue,
        proposedValue: p.proposedValue,
        unit: p.unit || '',
        status: isPassing ? 'PASS' : (isBorderline ? 'BORDERLINE' : 'FAIL')
      };
    });

    const hasFailures = evaluatedParams.some(p => p.status === 'FAIL');
    const hasBorderline = evaluatedParams.some(p => p.status === 'BORDERLINE');

    let overallStatus = 'COMPLIANT';
    let summary = 'Meets all required standards & criteria';
    let badgeColor = 'green';

    if (hasFailures) {
      overallStatus = 'POTENTIAL NON-COMPLIANCE';
      summary = 'Does not meet one or more required criteria';
      badgeColor = 'red';
    } else if (hasBorderline) {
      overallStatus = 'VERIFY';
      summary = 'Some parameters need clarification / more evidence';
      badgeColor = 'yellow';
    }

    res.json({
      isNumber,
      materialName: materialName || 'Procured Material',
      overallStatus,
      summary,
      badgeColor,
      evaluatedParameters: evaluatedParams,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Compliance screening error:', err);
    res.status(500).json({ error: 'Server error during compliance screening' });
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
    // Switched to multilingual model for Phase 5 SIH requirements (Hindi/Regional support)
    extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
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

// -------------------------------------------------------------
// AUTH ROUTES (Restored)
// -------------------------------------------------------------
const bcrypt = require('bcryptjs');

app.post('/api/auth/register', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !username.trim() || !password) return res.status(400).json({ error: 'Username and password required' });
    
    const validRoles = ['user', 'admin'];
    const assignedRole = role || 'user';
    if (!validRoles.includes(assignedRole)) {
      return res.status(400).json({ error: "Invalid role. Role must be either 'user' or 'admin'" });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    
    const user = new User({ username: username.trim(), password, role: assignedRole });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', role: user.role, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username ? username.trim() : '' });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    
    // Check if user model has comparePassword or if we use bcrypt
    const isMatch = user.comparePassword ? await user.comparePassword(password) : await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });
    
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Send a flattened response to match Login.jsx's expectations
    res.json({ token, id: user._id.toString(), username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login error' });
  }
});

app.get('/api/auth/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/auth/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role, password } = req.body;
    const updateData = { role };
    
    if (password) {
      // Manual hash in case hook doesn't trigger on findByIdAndUpdate, 
      // or we can use findById, assign, save()
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.role = role;
      user.password = password; // pre-save hook handles hashing
      await user.save();
      return res.json({ message: 'User updated' });
    } else {
      await User.findByIdAndUpdate(req.params.id, updateData);
      return res.json({ message: 'User updated' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/auth/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 1. POST /api/recommend (Public recommendation, records user ID if authenticated)
//
// Exact IS-number lookup (e.g. "IS 269:2015" or base "IS 269") is attempted
// before the embedding model is consulted. If found, matchType is set to 'exact'
// and the record is returned immediately without a similarity score.
//
// For base-number queries with multiple active editions, the one with the
// highest numeric publication year (parsed from latestVersion) is selected.
// String-sort alone is insufficient because "1999" > "2015" lexicographically.
//
// The confidence threshold is provisional (default 0.40) and must be
// calibrated against a representative evaluation dataset before production.
// Override with env var RECOMMENDATION_CONFIDENCE_THRESHOLD.
app.post('/api/recommend', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Save history with authenticated user ID or 'guest'
    const userId = req.user ? req.user.id : 'guest';
    await History.create({ query, userId });

    // --- EXACT MATCH PRECEDENCE ---
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');

    // 1a. Exact versioned match: "IS 269:2015" -> normalizedIsNumber = "is269:2015"
    const exactMatch = await Standard.findOne({ normalizedIsNumber: normalizedQuery })
      .select('-embedding').lean();

    // 1b. Base-number match: "IS 269" -> baseIsNumber = "is269"
    //     Only active records are considered. Among multiple editions, the one
    //     with the highest numeric year in latestVersion is chosen.
    let baseMatch = null;
    if (!exactMatch && !normalizedQuery.includes(':')) {
      const candidates = await Standard.find({
        baseIsNumber: normalizedQuery,
        status: 'active'
      }).select('-embedding').lean();

      if (candidates.length > 0) {
        // Parse numeric year from strings like "2015", "2015 (Part 1)", etc.
        baseMatch = candidates.reduce((best, c) => {
          const bestYear = parseInt((best.latestVersion || '').replace(/\D/g, ''), 10) || 0;
          const cYear = parseInt((c.latestVersion || '').replace(/\D/g, ''), 10) || 0;
          return cYear > bestYear ? c : best;
        });
      }
    }

    const matchedStd = exactMatch || baseMatch;

    if (matchedStd) {
      // matchType: 'exact' — no synthetic similarity score attached
      matchedStd.matchType = 'exact';

      // Fetch related standards in the same category (excluding self and demo records)
      const related = await Standard.find({
        category: matchedStd.category,
        isDemo: { $ne: true },
        _id: { $ne: matchedStd._id }
      }).limit(4).select('-embedding').lean();

      return res.json({ primary: matchedStd, related });
    }
    // --- END EXACT MATCH PRECEDENCE ---

    if (!extractor) {
      return res.status(503).json({ error: 'AI model is still loading, please try again in a few seconds.' });
    }

    // Multilingual support: Translate Indic / non-ASCII queries into English technical terms for higher cross-lingual accuracy
    let effectiveQuery = query;
    if (/[^\u0000-\u007F]/.test(query)) {
      let translated = false;
      const model = getGeminiModel();
      if (model) {
        try {
          const transPromise = model.generateContent(`Translate this Indian procurement or engineering query into concise English technical terms for search: "${query}". Output ONLY the English translation, no other text.`);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Translation timeout')), 2500));
          const transResult = await Promise.race([transPromise, timeoutPromise]);
          const transText = transResult.response.text().trim().replace(/^["']|["']$/g, '');
          if (transText && !/[^\u0000-\u007F]/.test(transText)) {
            effectiveQuery = transText;
            translated = true;
          }
        } catch (e) {
          console.warn('Multilingual query translation fallback:', e.message);
        }
      }

      // Offline dictionary fallback for common Indic procurement keywords
      if (!translated) {
        const indicTerms = {
          'पोर्टलैंड सीमेंट': 'Portland cement',
          'सीमेंट': 'cement',
          'कंक्रीट': 'concrete',
          'निर्माण': 'construction',
          'इस्पात': 'steel',
          'स्टील': 'steel',
          'सरिया': 'tmt rebar steel',
          'पाइप': 'pipe',
          'नल': 'pipe',
          'तार': 'wire',
          'केबल': 'cable',
          'ईंट': 'brick',
          'रेत': 'sand',
          'बालू': 'sand',
          'बजरी': 'aggregate gravel',
          'पुल': 'bridge',
          'सड़क': 'road highway',
          'बिटुमेन': 'bitumen asphalt',
          'डामर': 'bitumen asphalt',
          'पेंट': 'paint coating',
          'रंग': 'paint',
          'कांच': 'glass',
          'लकड़ी': 'timber wood',
          'इमारती लकड़ी': 'timber wood',
          'ट्रांसफार्मर': 'transformer',
          'मोटर': 'motor',
          'वाल्व': 'valve',
          'जल': 'water',
          'पानी': 'water supply',
          'सुरक्षा': 'safety protective',
          'हेलमेट': 'industrial safety helmet',
          'जूते': 'safety footwear shoes',
          'दस्ताने': 'safety gloves',
          'बिजली': 'electrical power',
          'सौर': 'solar photovoltaic',
          'पंप': 'water pump',
          'अग्निशामक': 'fire extinguisher'
        };
        let mapped = query;
        for (const [hi, en] of Object.entries(indicTerms)) {
          mapped = mapped.replaceAll(hi, en);
        }
        const cleaned = mapped.replace(/[^\x00-\x7F]+/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleaned.length > 0) {
          effectiveQuery = cleaned;
        }
      }
    }

    const output = await extractor(effectiveQuery, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data);


    const allStandards = await Standard.find({ isDemo: { $ne: true } });
    const ranked = allStandards.map(std => {
      const score = cosineSimilarity(queryEmbedding, std.embedding);
      return { ...std.toObject(), similarityScore: score };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    if (ranked.length === 0) {
      return res.json({ primary: null, related: [] });
    }

    // --- CONFIDENCE CUTOFF THRESHOLD ---
    // Provisional default: 0.35. Override with RECOMMENDATION_CONFIDENCE_THRESHOLD in .env
    // This value has NOT been calibrated against a benchmark dataset and must be
    // adjusted after evaluation before production deployment.
    const rawThreshold = parseFloat(process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD);
    const THRESHOLD = Number.isFinite(rawThreshold) ? rawThreshold : 0.35;

    if (ranked[0].similarityScore < THRESHOLD) {
      return res.json({
        primary: null,
        related: [],
        message: 'No confident Indian Standard match found. Try rephrasing with more specific engineering terms.'
      });
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

// --- HELPER FUNCTIONS ---
function isOfficialBisUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname === 'standardsbis.bsbedge.com' ||
      url.hostname === 'bis.gov.in' ||
      url.hostname.endsWith('.bis.gov.in')
    );
  } catch {
    return false;
  }
}

function escapeRegex(text) {
  // Prevent ReDoS and Regex Injection by escaping special characters
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// 3. GET /api/standards
app.get('/api/standards', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      const safeSearch = escapeRegex(search);
      query = {
        $or: [
          { isNumber: { $regex: safeSearch, $options: 'i' } },
          { title: { $regex: safeSearch, $options: 'i' } }
        ]
      };
    }
    
    // Use the safe query and limit results to prevent massive payloads
    const stds = await Standard.find(query).select('-embedding').limit(200);
    res.json(stds);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching standards catalog' });
  }
});

// 4. POST /api/standards (Protected: Admin Only, Cold-Start Guarded)
app.post('/api/standards', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      isNumber,
      title,
      category,
      scope,
      latestVersion,
      amendments,
      alliedStandards,
      certifications,
      sourceUrl,
      verifiedDate,
      publishedOn,
      latestReviewedYear,
      clauses,
      status
    } = req.body;

    if (!isNumber || typeof isNumber !== 'string' || !isNumber.trim()) {
      return res.status(400).json({ error: 'Valid isNumber is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!scope || !scope.trim()) {
      return res.status(400).json({ error: 'Scope is required' });
    }
    if (sourceUrl && (typeof sourceUrl !== 'string' || !isOfficialBisUrl(sourceUrl.trim()))) {
      return res.status(400).json({ error: 'sourceUrl must be an HTTPS URL from an official BIS domain' });
    }
    if (verifiedDate && Number.isNaN(new Date(verifiedDate).getTime())) {
      return res.status(400).json({ error: 'verifiedDate must be a valid date' });
    }

    // Cold-start guard: never save standard with empty embedding
    if (!extractor) {
      return res.status(503).json({ error: 'AI embedding model is loading, please try again in a few seconds' });
    }

    const textToEmbed = `${title.trim()}. ${scope.trim()} ${category || ''}`.trim();
    const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    let cleanSourceUrl = null;
    if (sourceUrl && typeof sourceUrl === 'string' && sourceUrl.trim()) {
      cleanSourceUrl = sourceUrl.trim();
    }

    let cleanVerifiedDate = null;
    if (verifiedDate) {
      const parsedDate = new Date(verifiedDate);
      if (!isNaN(parsedDate.getTime())) {
        cleanVerifiedDate = parsedDate;
      }
    }

    let cleanPublishedOn = null;
    if (publishedOn) {
      const parsedPubDate = new Date(publishedOn);
      if (!isNaN(parsedPubDate.getTime())) {
        cleanPublishedOn = parsedPubDate;
      }
    }

    let cleanLatestReviewedYear = null;
    if (latestReviewedYear) {
      const parsedYear = parseInt(latestReviewedYear, 10);
      if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear < 2100) {
        cleanLatestReviewedYear = parsedYear;
      }
    }

    const standardDoc = {
      isNumber: isNumber.trim(),
      title: title.trim(),
      category: category ? category.trim() : 'General',
      scope: scope.trim(),
      latestVersion: latestVersion ? latestVersion.trim() : '',
      amendments: Array.isArray(amendments) ? amendments : [],
      alliedStandards: Array.isArray(alliedStandards) ? alliedStandards : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      sourceUrl: cleanSourceUrl,
      verifiedDate: cleanVerifiedDate,
      publishedOn: cleanPublishedOn,
      latestReviewedYear: cleanLatestReviewedYear,
      embedding
    };

    if (clauses && Array.isArray(clauses) && clauses.length > 0) {
      standardDoc.clauses = clauses.map(c => ({
        clauseNumber: String(c.clauseNumber || '').trim(),
        title: String(c.title || '').trim(),
        text: String(c.text || '').trim(),
        sourceUrl: c.sourceUrl ? String(c.sourceUrl).trim() : null
      })).filter(c => c.clauseNumber && c.title && c.text);
    }

    if (status && ['draft', 'active', 'superseded', 'withdrawn'].includes(status)) {
      standardDoc.status = status;
    }

    const newStd = new Standard(standardDoc);

    await newStd.save();

    const returnedStd = newStd.toObject();
    delete returnedStd.embedding;
    res.status(201).json(returnedStd);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Standard',
        message: `A standard with this IS Number already exists. The system enforces strict deduplication. Please edit the existing record instead.`
      });
    }
    console.error('Error creating standard:', err);
    res.status(500).json({ error: 'Server error creating standard' });
  }
});

// 4b. PUT /api/standards/:id (Protected: Admin Only)
app.put('/api/standards/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const std = await Standard.findById(id);
    if (!std) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    const {
      isNumber,
      title,
      category,
      scope,
      latestVersion,
      amendments,
      alliedStandards,
      certifications,
      sourceUrl,
      verifiedDate,
      publishedOn,
      latestReviewedYear,
      clauses,
      status
    } = req.body;

    if (isNumber !== undefined && typeof isNumber === 'string' && isNumber.trim()) {
      std.isNumber = isNumber.trim();
    }
    if (title !== undefined && typeof title === 'string' && title.trim()) {
      std.title = title.trim();
    }
    if (category !== undefined) {
      std.category = category ? category.trim() : 'General';
    }
    if (scope !== undefined && typeof scope === 'string' && scope.trim()) {
      std.scope = scope.trim();
    }
    if (latestVersion !== undefined) {
      std.latestVersion = latestVersion ? latestVersion.trim() : '';
    }
    if (amendments !== undefined && Array.isArray(amendments)) {
      std.amendments = amendments;
    }
    if (alliedStandards !== undefined && Array.isArray(alliedStandards)) {
      std.alliedStandards = alliedStandards;
    }
    if (certifications !== undefined && Array.isArray(certifications)) {
      std.certifications = certifications;
    }
    if (sourceUrl !== undefined) {
      if (sourceUrl && (typeof sourceUrl !== 'string' || !isOfficialBisUrl(sourceUrl.trim()))) {
        return res.status(400).json({ error: 'sourceUrl must be an HTTPS URL from an official BIS domain' });
      }
      std.sourceUrl = sourceUrl && typeof sourceUrl === 'string' && sourceUrl.trim() ? sourceUrl.trim() : null;
    }
    if (verifiedDate !== undefined) {
      if (verifiedDate) {
        const parsed = new Date(verifiedDate);
        if (Number.isNaN(parsed.getTime())) {
          return res.status(400).json({ error: 'verifiedDate must be a valid date' });
        }
        std.verifiedDate = !isNaN(parsed.getTime()) ? parsed : null;
      } else {
        std.verifiedDate = null;
      }
    }
    if (publishedOn !== undefined) {
      if (publishedOn) {
        const parsed = new Date(publishedOn);
        std.publishedOn = !isNaN(parsed.getTime()) ? parsed : null;
      } else {
        std.publishedOn = null;
      }
    }
    if (latestReviewedYear !== undefined) {
      const parsedYear = parseInt(latestReviewedYear, 10);
      std.latestReviewedYear = (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear < 2100) ? parsedYear : null;
    }
    if (clauses !== undefined && Array.isArray(clauses)) {
      std.clauses = clauses.map(c => ({
        clauseNumber: String(c.clauseNumber || '').trim(),
        title: String(c.title || '').trim(),
        text: String(c.text || '').trim(),
        sourceUrl: c.sourceUrl ? String(c.sourceUrl).trim() : null
      })).filter(c => c.clauseNumber && c.title && c.text);
    }
    if (status !== undefined && ['draft', 'active', 'superseded', 'withdrawn'].includes(status)) {
      std.status = status;
    }

    if (extractor && (req.body.title || req.body.scope || req.body.category)) {
      const textToEmbed = `${std.title}. ${std.scope} ${std.category || ''}`.trim();
      const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
      std.embedding = Array.from(output.data);
    }

    await std.save();

    const returnedStd = std.toObject();
    delete returnedStd.embedding;
    res.json(returnedStd);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Standard',
        message: 'A standard with this IS Number already exists.'
      });
    }
    console.error('Error updating standard:', err);
    res.status(500).json({ error: 'Server error updating standard' });
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

    let sourceUrl = '';
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    if (urlMatch && isOfficialBisUrl(urlMatch[0])) {
      sourceUrl = urlMatch[0];
    }

    res.json({
      isNumber,
      title,
      category,
      scope,
      latestVersion,
      sourceUrl,
      verifiedDate: ''
    });
  } catch (err) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract data from file' });
  }
});

// 6. GET /api/history
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    // Only fetch history for the currently authenticated user (matched by user ID)
    const history = await History.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

// Return only explicitly stored clauses. Never manufacture clause text or links.
function getStandardClauses(standard) {
  if (!standard.isDemo && standard.clauses && Array.isArray(standard.clauses) && standard.clauses.length > 0) {
    return standard.clauses;
  }
  return [];
}

// Deterministically rank and format structured citations for a query.
// Used as the fallback when Gemini is unavailable or returns unstructured output.
function rankAndFormatCitations(effectiveClauses, userQuery) {
  const queryTokens = userQuery.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const scored = effectiveClauses.map(clause => {
    let score = 0;
    const clauseText = `${clause.title} ${clause.text}`.toLowerCase();
    for (const token of queryTokens) {
      if (clauseText.includes(token)) score += 2;
    }
    return { clause, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, Math.min(3, scored.length)).map(item => item.clause);

  return selected.map(c => ({
    clauseId: c.clauseNumber,
    clauseNumber: c.clauseNumber,
    title: c.title,
    text: c.text,
    sourceUrl: c.sourceUrl || null,
    relevance: `Directly specifies ${c.title.toLowerCase()} relevant to "${userQuery.trim()}".`
  }));
}

// 7. POST /api/explain — Recommendation Explainability with Clause-by-Clause Citations
//
// Accepts { standardId, userQuery }.
// When a Gemini API key is configured: returns structured JSON with a plain-English
// rationale and clause citations selected by the model (grounded to stored clauses only).
// When no Gemini key is set: returns a deterministic template-based explanation
// with keyword-ranked citations from stored clauses — UI is never broken.
app.post('/api/explain', async (req, res) => {
  try {
    const { standardId, userQuery } = req.body;

    if (!standardId || !userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: 'standardId and userQuery are required' });
    }

    const standard = await Standard.findById(standardId).select('-embedding').lean();
    if (!standard) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    const { isNumber, title, category, scope, certifications = [], latestVersion } = standard;
    const effectiveClauses = getStandardClauses(standard);
    const fallbackCitations = rankAndFormatCitations(effectiveClauses, userQuery);

    const model = getGeminiModel();

    if (model) {
      const clausesContext = effectiveClauses.map(c => `[Clause ${c.clauseNumber}] ${c.title}: ${c.text}`).join('\n');

      const prompt = `You are a Bureau of Indian Standards (BIS) compliance assistant helping a procurement officer understand why a specific standard applies to their requirement.

The officer searched for: "${userQuery.trim()}"

The recommended Indian Standard is:
- IS Number: ${isNumber} (Latest: ${latestVersion || 'N/A'})
- Title: ${title}
- Category: ${category}
- Scope: ${scope}
- Required Certifications: ${certifications.length > 0 ? certifications.join(', ') : 'None listed'}
- Available Standard Clauses:
${clausesContext}

You must return a valid JSON object with the following structure:
{
  "explanation": "A 3-4 sentence plain-English explanation for a procurement officer of why this standard applies. Do not start with 'This standard'.",
  "citations": [
    {
      "clauseId": "1.1",
      "clauseNumber": "1.1",
      "title": "Title of clause",
      "text": "Exact text or key requirement excerpt from the clause",
      "relevance": "Concise 1-sentence statement on why this clause governs the query"
    }
  ]
}

Rules:
1. Only cite clauses present in the list of available standard clauses above.
2. Select 1 to 3 of the most relevant clauses matching the query.
3. Return ONLY valid JSON with no enclosing markdown backticks.`;

      try {
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();
        const cleaned = rawText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.explanation) {
          // Use Gemini's selected citations when valid, fall back to deterministic ranking
          const citations = Array.isArray(parsed.citations) && parsed.citations.length > 0
            ? parsed.citations
            : fallbackCitations;
          return res.json({ explanation: parsed.explanation, citations, source: 'gemini' });
        }
      } catch (geminiErr) {
        console.warn('Gemini structured response parsing failed, using fallback citations:', geminiErr.message);
      }
    }

    // --- FALLBACK: Template-based explanation + structured clause citations ---
    const certNote = certifications.length > 0
      ? ` Compliance requires: ${certifications.join(', ')}.`
      : '';
    const fallback = `${isNumber} — ${title} — is applicable to your query because its scope covers the technical domain you specified. `
      + `Specifically, it governs: "${scope.substring(0, 180).trim()}${scope.length > 180 ? '...' : ''}"${certNote} `
      + (fallbackCitations.length > 0
        ? ' The cited clauses below are the stored, verified requirements supporting this recommendation.'
        : ' No verified clause citations are available for this record yet.');

    return res.json({
      explanation: fallback,
      source: 'fallback',
      citations: fallbackCitations
    });

  } catch (err) {
    console.error('Explain error:', err);
    res.status(500).json({ error: 'Server error generating explanation' });
  }
});

// 8. POST /api/chat (LLM integration with 503 retry and graceful fallback)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const model = getGeminiModel();
    const hasKey = !!process.env.GEMINI_API_KEY;

    if (model) {
      // Try up to 3 times to handle transient Google 503 traffic spikes
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const prompt = `You are the NiryanaAI Assistant, helping procurement officers search for Indian Standards (IS) under Bureau of Indian Standards (BIS).
The user says: "${message}"
Please provide a brief, helpful response in 2-4 sentences. If they want a query rewritten, rewrite it to be highly descriptive for semantic search against IS standards.`;

          const result = await model.generateContent(prompt);
          return res.json({ reply: result.response.text() });
        } catch (geminiErr) {
          const is503 = geminiErr.message && geminiErr.message.includes('503');
          if (is503 && attempt < 3) {
            console.warn(`Gemini chat 503 (attempt ${attempt}/3), retrying in ${attempt * 800}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 800));
          } else {
            console.warn('Gemini chat failed after retries, using smart fallback:', geminiErr.message);
            break;
          }
        }
      }
    }

    // --- SMART FALLBACK: context-aware responses that are never embarrassing ---
    const lowerMsg = message.toLowerCase();
    let reply = '';

    if (lowerMsg.includes('search for') || lowerMsg.includes('help me find') || lowerMsg.includes('find me')) {
      reply = "To get the best results, try searching with specific materials or use cases. For example, instead of just 'cables', search for: 'performance requirements for underground PVC power cables rated 1100V'.";
    } else if (lowerMsg.includes('compare') || lowerMsg.includes('difference')) {
      reply = "When comparing IS standards, look at the 'Category' and 'Scope' fields. One standard might cover testing methods while another covers product specifications. Try searching both topics separately.";
    } else if (lowerMsg.includes('rewrite')) {
      const topic = message.replace(/rewrite/i, '').trim() || 'your product';
      reply = `Here is a better way to write that query: "Safety and technical specifications for ${topic} as per BIS requirements."`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      reply = "Hello! I am your NiryanaAI Assistant. I can help you search Indian Standards (IS), rewrite your procurement queries, or explain why a standard was recommended. What do you need?";
    } else if (lowerMsg.includes('how many') || lowerMsg.includes('topics') || lowerMsg.includes('categories')) {
      reply = "Our database covers standards across Civil, Electrical, Mechanical, Chemical, Textile, Food Safety, and many more BIS categories. Use the search bar to explore specific domains!";
    } else if (hasKey) {
      // Key is set but Gemini is temporarily overloaded — be honest
      reply = "I'm temporarily experiencing high traffic on the AI service. Please try again in a moment, or use the search bar directly for your IS standard lookup!";
    } else {
      reply = "I can help you find Indian Standards. Try describing your material or product in detail — for example: 'high tensile steel bars for concrete reinforcement'.";
    }

    res.json({ reply });

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
