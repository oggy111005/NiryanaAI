const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: 'Guest' } // Optional auth
});

module.exports = mongoose.model('History', historySchema);

