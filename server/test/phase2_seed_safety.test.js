const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Standard = require('../models/Standard');
const { auditAndMigrateStandards } = require('../audit-and-migrate-standards');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes-test';

// STRICT SAFETY GUARD: Verify DB name ends with '-test'
function verifyTestDatabaseName(uri) {
  const dbName = uri.split('/').pop().split('?')[0];
  if (!dbName.endsWith('-test')) {
    throw new Error(`[SAFETY VIOLATION] Tests must run against a database ending in '-test'. Received: '${dbName}'`);
  }
}

test.before(async () => {
  verifyTestDatabaseName(TEST_DB_URI);
  await mongoose.connect(TEST_DB_URI);
  // Clean test collection only
  await mongoose.connection.db.collection('standards').deleteMany({});
});

test.after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.collection('standards').deleteMany({});
    await mongoose.disconnect();
  }
});

test('1. Safety guard: Rejects databases that do not end in -test', () => {
  assert.throws(
    () => verifyTestDatabaseName('mongodb://127.0.0.1:27017/is-recommend-changes'),
    /SAFETY VIOLATION/
  );
  assert.throws(
    () => verifyTestDatabaseName('mongodb://127.0.0.1:27017/is-recommend'),
    /SAFETY VIOLATION/
  );
  assert.doesNotThrow(
    () => verifyTestDatabaseName('mongodb://127.0.0.1:27017/is-recommend-changes-test')
  );
});

test('2. Schema normalization: Canonical normalizedIsNumber and baseIsNumber computation', async () => {
  const sample1 = new Standard({
    isNumber: 'IS  269 : 2015',
    title: 'Specification for 33 Grade OPC',
    category: 'Civil Engineering',
    scope: 'Covers manufacture and chemical/physical requirements'
  });
  await sample1.validate();
  assert.equal(sample1.normalizedIsNumber, 'is269:2015');
  assert.equal(sample1.baseIsNumber, 'is269');
  assert.equal(sample1.isDemo, false);
  assert.equal(sample1.status, 'active');

  const sampleDemo = new Standard({
    isNumber: 'DEMO-IS-99999',
    title: 'Prototype Safety Test',
    category: 'Safety',
    scope: 'Covers testing guidelines for prototypes'
  });
  await sampleDemo.validate();
  assert.equal(sampleDemo.normalizedIsNumber, 'demo-is-99999');
  assert.equal(sampleDemo.baseIsNumber, 'demo-is-99999');
  assert.equal(sampleDemo.isDemo, true);
  assert.equal(sampleDemo.status, 'draft');
  assert.equal(sampleDemo.sourceUrl, null);
});

test('3. Idempotent seeding: $setOnInsert preserves manually updated fields', async () => {
  const collection = mongoose.connection.db.collection('standards');
  
  // Simulate first seed insert
  await collection.updateOne(
    { isNumber: 'IS 456:2000' },
    {
      $setOnInsert: {
        isNumber: 'IS 456:2000',
        normalizedIsNumber: 'is456:2000',
        baseIsNumber: 'is456',
        title: 'Original Title from Seed',
        scope: 'Original Scope',
        category: 'Civil Engineering',
        status: 'active',
        isDemo: false
      }
    },
    { upsert: true }
  );

  // Simulate an admin user manually customizing the standard's scope
  await collection.updateOne(
    { isNumber: 'IS 456:2000' },
    { $set: { scope: 'CUSTOMIZED BY ADMIN IN PRODUCTION' } }
  );

  // Simulate re-running the seed script (must use $setOnInsert)
  await collection.updateOne(
    { isNumber: 'IS 456:2000' },
    {
      $setOnInsert: {
        isNumber: 'IS 456:2000',
        normalizedIsNumber: 'is456:2000',
        baseIsNumber: 'is456',
        title: 'Original Title from Seed',
        scope: 'Original Scope (Should Not Overwrite)',
        category: 'Civil Engineering',
        status: 'active',
        isDemo: false
      }
    },
    { upsert: true }
  );

  const doc = await collection.findOne({ isNumber: 'IS 456:2000' });
  assert.equal(doc.scope, 'CUSTOMIZED BY ADMIN IN PRODUCTION', 'Re-seeding must not overwrite manual edits');
});

test('4. Duplicate collision detection: Audit script reports duplicates without deleting and refuses index', async () => {
  const collection = mongoose.connection.db.collection('standards');
  await collection.deleteMany({});

  // Ensure mongoose model init is complete before dropping index to prevent race condition
  await Standard.init();
  try { await collection.dropIndex('normalizedIsNumber_1'); } catch {}

  // Intentionally insert two documents with different raw strings that normalize to the same key
  await collection.insertOne({
    isNumber: 'IS 800:2007',
    title: 'General Construction In Steel - Variant A',
    category: 'Steel',
    scope: 'Scope A'
  });
  await collection.insertOne({
    isNumber: 'is 800 : 2007',
    title: 'General Construction In Steel - Variant B',
    category: 'Steel',
    scope: 'Scope B'
  });

  const auditResult = await auditAndMigrateStandards({
    mongoUri: TEST_DB_URI,
    dryRun: false
  });

  assert.equal(auditResult.success, false, 'Audit must fail when collision detected');
  assert.equal(auditResult.collisionCount, 1, 'Must detect 1 collision group');
  assert.equal(auditResult.collisions[0].normalized, 'is800:2007');

  // Verify that neither document was deleted or overwritten
  const countAfter = await collection.countDocuments({});
  assert.equal(countAfter, 2, 'Zero records may be deleted during duplicate detection');

  // Verify unique index was NOT created
  const indexes = await collection.indexes();
  const hasUniqueIndex = indexes.some(idx => idx.key && idx.key.normalizedIsNumber);
  assert.equal(hasUniqueIndex, false, 'Unique index must be refused when duplicates exist');
});

test('5. Clean migration and unique index: Ensures unique index when 0 collisions exist', async () => {
  const collection = mongoose.connection.db.collection('standards');
  await collection.deleteMany({});

  // Insert two distinct records
  await collection.insertOne({
    isNumber: 'IS 269:2015',
    title: 'Ordinary Portland Cement',
    category: 'Civil Engineering',
    scope: 'Scope 269'
  });
  await collection.insertOne({
    isNumber: 'DEMO-IS-101',
    title: 'Prototype Standard 101',
    category: 'Prototype',
    scope: 'Scope Demo'
  });

  const auditResult = await auditAndMigrateStandards({
    mongoUri: TEST_DB_URI,
    dryRun: false
  });

  assert.equal(auditResult.success, true, 'Audit must succeed when clean');
  assert.equal(auditResult.collisionCount, 0);

  // Verify records are backfilled
  const doc269 = await collection.findOne({ isNumber: 'IS 269:2015' });
  assert.equal(doc269.normalizedIsNumber, 'is269:2015');
  assert.equal(doc269.baseIsNumber, 'is269');
  assert.equal(doc269.status, 'active');
  assert.equal(doc269.isDemo, false);

  const docDemo = await collection.findOne({ isNumber: 'DEMO-IS-101' });
  assert.equal(docDemo.normalizedIsNumber, 'demo-is-101');
  assert.equal(docDemo.status, 'draft');
  assert.equal(docDemo.isDemo, true);

  // Verify unique index was created
  const indexes = await collection.indexes();
  const hasUniqueIndex = indexes.some(idx => idx.key && idx.key.normalizedIsNumber && idx.unique);
  assert.equal(hasUniqueIndex, true, 'Unique index must be present');

  // Attempt to insert duplicate normalized key must fail with duplicate key error (code 11000)
  await assert.rejects(
    async () => {
      await collection.insertOne({
        isNumber: 'is 269 : 2015',
        normalizedIsNumber: 'is269:2015',
        title: 'Collision attempt'
      });
    },
    (err) => err.code === 11000
  );
});
