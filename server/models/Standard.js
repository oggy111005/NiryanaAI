const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  isNumber: { type: String, required: true, unique: true },
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
  embedding: { type: [Number], select: true }, // Array of floats
  
  // Canonical Normalization Fields
  normalizedIsNumber: { type: String, required: true, unique: true },
  baseIsNumber: { type: String, index: true }
});

// Middleware to normalize IS Number before Validation
standardSchema.pre('validate', function() {
  if (this.isModified('isNumber') && this.isNumber) {
    this.normalizedIsNumber = this.isNumber.toLowerCase().replace(/\s+/g, '');
    this.baseIsNumber = this.normalizedIsNumber.split(':')[0];
  }
});

// Middleware to normalize IS Number on Upsert/Update
standardSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function() {
  const update = this.getUpdate();
  let rawIsNumber = null;

  if (update.isNumber) rawIsNumber = update.isNumber;
  else if (update.$set && update.$set.isNumber) rawIsNumber = update.$set.isNumber;
  else if (update.$setOnInsert && update.$setOnInsert.isNumber) rawIsNumber = update.$setOnInsert.isNumber;

  if (rawIsNumber) {
    const normalized = rawIsNumber.toLowerCase().replace(/\s+/g, '');
    const base = normalized.split(':')[0];
    
    if (update.$setOnInsert && update.$setOnInsert.isNumber) {
      update.$setOnInsert.normalizedIsNumber = normalized;
      update.$setOnInsert.baseIsNumber = base;
    } else {
      if (!update.$set) update.$set = {};
      update.$set.normalizedIsNumber = normalized;
      update.$set.baseIsNumber = base;
    }
  }
});

module.exports = mongoose.model('Standard', standardSchema);

