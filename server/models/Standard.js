const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  isNumber: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  scope: { type: String, required: true },
  latestVersion: { type: String },
  amendments: [{ type: String }],
  alliedStandards: [
    {
      isNumber: { type: String },
      title: { type: String },
      type: { type: String }, // "Test Method", "Terminology", etc.
    }
  ],
  certifications: [{ type: String }],
  embedding: { type: [Number], select: true } // Array of floats
});

module.exports = mongoose.model('Standard', standardSchema);

