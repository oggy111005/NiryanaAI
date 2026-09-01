const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Standard = require('./models/Standard');
const History = require('./models/History');

const app = express();
app.use(cors());
app.use(express.json());

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

// 5. GET /api/history
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

