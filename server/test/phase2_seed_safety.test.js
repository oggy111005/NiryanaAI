const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { exec } = require('node:child_process');
const mongoose = require('mongoose');
const path = require('node:path');
const Standard = require('../models/Standard');

// Test DB URI (using a different collection or DB to keep it isolated)
const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/is-recommend-test';

describe('Phase 2: Seed Safety & Deduplication Tests', () => {
  before(async () => {
    // Connect to test database
    await mongoose.connect(TEST_MONGO_URI);
    // Ensure clean state and indexes are built
    await Standard.deleteMany({});
    await Standard.syncIndexes();
  });

  after(async () => {
    await Standard.deleteMany({});
    await mongoose.disconnect();
  });

  it('should abort seeding if safe reset flags are missing or incomplete', async () => {
    return new Promise((resolve) => {
      const seedScript = path.join(__dirname, '..', 'seed.js');
      // Running with just --reset (missing --force-reset and --confirm-reset)
      exec(`node "${seedScript}" --reset`, (error, stdout, stderr) => {
        // It MUST fail and exit with code 1
        assert.ok(error, 'Script should exit with an error');
        assert.strictEqual(error.code, 1, 'Script exit code should be 1');
        assert.ok(stderr.includes('[SAFETY ABORT]'), 'Should log safety abort message');
        resolve();
      });
    });
  });

  it('should canonicalize and normalize IS Numbers on save', async () => {
    const std = new Standard({
      isNumber: 'IS 269:2015',
      title: 'Test Cement',
      category: 'Cement',
      scope: 'Test Scope'
    });
    
    await std.save();
    
    assert.strictEqual(std.normalizedIsNumber, 'is269:2015', 'Should normalize number (lowercase, no spaces)');
    assert.strictEqual(std.baseIsNumber, 'is269', 'Should extract base number');
  });

  it('should strictly prevent duplicate IS Numbers and throw a 11000 collision error', async () => {
    const duplicateStd = new Standard({
      isNumber: 'IS   269:2015', // Same canonical string but formatted differently
      title: 'Duplicate Test Cement',
      category: 'Cement',
      scope: 'Duplicate Scope'
    });

    let caughtError = null;
    try {
      await duplicateStd.save();
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError, 'Should throw an error on duplicate insert');
    assert.strictEqual(caughtError.code, 11000, 'Should throw a MongoDB Duplicate Key (11000) error');
  });
});
