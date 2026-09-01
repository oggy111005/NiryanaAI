const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const Standard = require('./models/Standard');
const History = require('./models/History');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI Pipeline (lazy load to avoid blocking startup)
let extractor = null;
async function initPipeline() {
  try {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('AI Model loaded for inference.');
  } catch (e) {
    console.error("Failed to load transformer model:", e);
  }
}
initPipeline();

// Utility for dot product (since vectors are already normalized, dot product == cosine similarity)
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// 1. POST /api/recommend
app.post('/api/recommend', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // Save history (optional guest tracking)
    await History.create({ query });

    if (!extractor) {
        return res.status(503).json({ error: 'AI model is still loading, please try again in a few seconds.' });
    }

    // Embed the query using the transformer
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data);

    // Fetch all standards to rank them 
    // (For large datasets, use a vector DB like Pinecone, but for MVP memory rank is fine)
    const allStandards = await Standard.find();
    
    // Calculate similarities and rank
    const ranked = allStandards.map(std => {
      // Compare the query embedding with each standard's precomputed embedding
      const score = cosineSimilarity(queryEmbedding, std.embedding);
      return { ...std.toObject(), similarityScore: score };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    if (ranked.length === 0) {
        return res.json({ primary: null, related: [] });
    }

    // Return top 1 primary and top 4 allied/related
    const primary = ranked[0];
    const related = ranked.slice(1, 5);

    // Don't send embeddings back to client to save bandwidth
    delete primary.embedding;
    related.forEach(r => delete r.embedding);

    res.json({ primary, related });
  } catch (err) {
    console.error(err);
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
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. GET /api/standards
app.get('/api/standards', async (req, res) => {
  try {
    // Return list without embeddings to save bandwidth
    const stds = await Standard.find().select('-embedding');
    res.json(stds);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. POST /api/standards
app.post('/api/standards', async (req, res) => {
  try {
    const { isNumber, title, category, scope, latestVersion, amendments, alliedStandards, certifications } = req.body;
    
    let embedding = [];
    if (extractor) {
        const textToEmbed = `${title}. ${scope} ${category}`;
        const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
        embedding = Array.from(output.data);
    }

    const newStd = new Standard({
        isNumber, title, category, scope, latestVersion, amendments, alliedStandards, certifications, embedding
    });
    
    await newStd.save();
    
    const returnedStd = newStd.toObject();
    delete returnedStd.embedding;
    res.status(201).json(returnedStd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating standard' });
  }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-secret-key-12345';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Hardcoded demo super-admin for simplicity so you don't get locked out
    if (role === 'admin' && username === 'admin' && password === 'admin') {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ token, role: 'admin', username });
    } 

    // Hardcoded demo user
    if (role === 'user' && username === 'user' && password === 'password') {
      const token = jwt.sign({ username, role: 'user' }, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ token, role: 'user', username });
    }

    // Check database for registered users
    const dbUser = await User.findOne({ username, role });
    if (dbUser && dbUser.password === password) {
      const token = jwt.sign({ username: dbUser.username, role: dbUser.role }, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ token, role: dbUser.role, username: dbUser.username });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login error' });
  }
});

// Admin-only route to register new users
app.post('/api/auth/register', authenticateToken, async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register new users' });
    }

    const { username, password, role } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const newUser = new User({ username, password, role: role || 'user' });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully', username: newUser.username, role: newUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user: ' + err.message });
  }
});

// 5. POST /api/extract-standard (Upload file to auto-fill details)
app.post('/api/extract-standard', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';
    
    // Simple check if it's a PDF or Text
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      text = req.file.buffer.toString('utf8');
    }

    // Very basic regex rules to guess standard details
    // For a real prod app, you'd use a small LLM or better regexes.
    
    const isNumberMatch = text.match(/IS\s*\d+(?:\s*\(Part\s*\d+\))?(?::\s*\d{4})?/i);
    const isNumber = isNumberMatch ? isNumberMatch[0].replace(/\n/g, '').trim() : '';

    // Guess Title: Look for lines after the IS Number, or take the first few lines
    let title = '';
    const titleMatch = text.match(/Title\s*:\s*(.+)/i) || text.match(/Specification\s*for\s*(.+)/i);
    if (titleMatch) {
        title = titleMatch[1].trim();
    } else {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        if (lines.length > 1) title = lines[0]; // Guess first line is title
    }

    // Guess Category
    let category = 'General';
    if (text.toLowerCase().includes('cement')) category = 'Cement';
    else if (text.toLowerCase().includes('steel')) category = 'Steel';
    else if (text.toLowerCase().includes('electrical')) category = 'Electrical';
    else if (text.toLowerCase().includes('textile')) category = 'Textiles';

    // Guess Scope
    let scope = '';
    const scopeMatch = text.match(/Scope\s*([^]*?)(?=\n\s*\d+\.\d+|\n\s*[A-Z][a-z]+:)/i);
    if (scopeMatch) {
      scope = scopeMatch[1].replace(/\n/g, ' ').trim().substring(0, 500); // Take up to 500 chars
    } else {
      // Fallback: take first 200 chars as scope
      scope = text.replace(/\n/g, ' ').substring(0, 200).trim();
    }

    // Guess Latest Version
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
app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

