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
  baseIsNumber: { type: String, index: true },

  // Provenance and Lifecycle Fields
  status: {
    type: String,
    enum: ['draft', 'active', 'superseded', 'withdrawn'],
    default: 'active',
    index: true
  },
  isDemo: {
    type: Boolean,
    default: false,
    index: true
  },
  sourceUrl: {
    type: String,
    default: null
  },
  verifiedDate: {
    type: Date,
    default: null
  },
  publishedOn: {
    type: Date,
    default: null
  },
  latestReviewedYear: {
    type: Number,
    default: null
  },
  clauses: [
    {
      clauseNumber: { type: String, required: true },
      title: { type: String, required: true },
      text: { type: String, required: true },
      sourceUrl: { type: String, default: null }
    }
  ]
});

// Middleware to normalize IS Number and enforce demo-data provenance rules.
standardSchema.pre('validate', function() {
  if (this.isModified('isNumber') && this.isNumber) {
    this.normalizedIsNumber = this.isNumber.toLowerCase().replace(/\s+/g, '');
    this.baseIsNumber = this.normalizedIsNumber.split(':')[0];
  }
  if (this.isNumber && this.isNumber.startsWith('DEMO-')) {
    this.isDemo = true;
    if (!this.status || this.status === 'active') {
      this.status = 'draft';
    }
    this.sourceUrl = null;
    this.verifiedDate = null;
    this.publishedOn = null;
    this.latestReviewedYear = null;
    if (this.clauses && Array.isArray(this.clauses)) {
      this.clauses.forEach(c => { c.sourceUrl = null; });
    }
  } else {
    if (this.isDemo === undefined) this.isDemo = false;
    if (!this.status) this.status = 'active';
  }

});

// Middleware to normalize IS Number and set provenance on Upsert/Update
standardSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function() {
  const update = this.getUpdate();
  let rawIsNumber = null;

  if (update.isNumber) rawIsNumber = update.isNumber;
  else if (update.$set && update.$set.isNumber) rawIsNumber = update.$set.isNumber;
  else if (update.$setOnInsert && update.$setOnInsert.isNumber) rawIsNumber = update.$setOnInsert.isNumber;

  if (rawIsNumber) {
    const normalized = rawIsNumber.toLowerCase().replace(/\s+/g, '');
    const base = normalized.split(':')[0];
    const isDemo = rawIsNumber.startsWith('DEMO-');
    
    if (update.$setOnInsert && update.$setOnInsert.isNumber) {
      update.$setOnInsert.normalizedIsNumber = normalized;
      update.$setOnInsert.baseIsNumber = base;
      if (isDemo) {
        update.$setOnInsert.isDemo = true;
        update.$setOnInsert.status = 'draft';
        update.$setOnInsert.sourceUrl = null;
        update.$setOnInsert.verifiedDate = null;
        update.$setOnInsert.publishedOn = null;
        update.$setOnInsert.latestReviewedYear = null;
        if (update.$setOnInsert.clauses && Array.isArray(update.$setOnInsert.clauses)) {
          update.$setOnInsert.clauses.forEach(c => { c.sourceUrl = null; });
        }
      } else {
        if (update.$setOnInsert.isDemo === undefined) update.$setOnInsert.isDemo = false;
        if (!update.$setOnInsert.status) update.$setOnInsert.status = 'active';
      }
    } else {
      if (!update.$set) update.$set = {};
      update.$set.normalizedIsNumber = normalized;
      update.$set.baseIsNumber = base;
      if (isDemo) {
        update.$set.isDemo = true;
        // Mirror pre('validate') symmetry: only set draft if status is absent or active
        if (!update.$set.status || update.$set.status === 'active') {
          update.$set.status = 'draft';
        }
        update.$set.sourceUrl = null;
        update.$set.verifiedDate = null;
        update.$set.publishedOn = null;
        update.$set.latestReviewedYear = null;
        // Sanitize clause sourceUrls for DEMO records on $set updates
        if (update.$set.clauses && Array.isArray(update.$set.clauses)) {
          update.$set.clauses.forEach(c => { c.sourceUrl = null; });
        }
      } else {
        if (update.$set.isDemo === undefined) update.$set.isDemo = false;
        if (!update.$set.status) update.$set.status = 'active';
      }
    }
  }
});

module.exports = mongoose.model('Standard', standardSchema);
