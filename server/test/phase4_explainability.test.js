/**
 * Phase 4: Recommendation Explainability Tests
 *
 * All tests run against an isolated in-process HTTP server on dynamic port (0).
 * Database URI strictly must end with '-test'.
 *
 * Tests cover:
 *  1. Fallback explanation generation without Gemini API Key
 *  2. Missing input validation (standardId, userQuery) returning 400
 *  3. Non-existent standardId returning 404
 *  4. Explanation output structure and content grounding
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes-test';

// STRICT SAFETY GUARD
const dbName = TEST_DB_URI.split('/').pop().split('?')[0];
if (!dbName.endsWith('-test')) {
  throw new Error(`[SAFETY VIOLATION] Phase 4 tests must run against a -test database. Got: '${dbName}'`);
}

process.env.MONGODB_URI = TEST_DB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'phase4-test-jwt-secret';

const { app } = require('../server');

// Ensure Gemini API Key is empty for predictable deterministic fallback tests
// (Must be cleared AFTER require('../server') because server.js calls dotenv.config())
delete process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = '';


let server;
let baseUrl;
let testStandardId;

const TEST_STANDARD = {
  isNumber: 'IS 269:2015',
  title: 'Ordinary Portland Cement - Specification',
  category: 'Civil Engineering',
  scope: 'Covers the manufacture and chemical and physical requirements of ordinary Portland cement (OPC) of 33, 43 and 53 grades.',
  latestVersion: '2015',
  certifications: ['ISI Mark (Mandatory)'],
  amendments: ['Amendment 1 (2017)'],
  status: 'active',
  isDemo: false,
  embedding: Array(384).fill(0.01)
};

test.before(async () => {
  await mongoose.connect(TEST_DB_URI);
  await mongoose.connection.db.collection('standards').deleteMany({});

  const insertResult = await mongoose.connection.db.collection('standards').insertOne({
    ...TEST_STANDARD,
    normalizedIsNumber: TEST_STANDARD.isNumber.toLowerCase().replace(/\s+/g, ''),
    baseIsNumber: TEST_STANDARD.isNumber.toLowerCase().replace(/\s+/g, '').split(':')[0]
  });
  testStandardId = insertResult.insertedId.toString();

  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) server.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.collection('standards').deleteMany({});
    await mongoose.disconnect();
  }
});

test('1. Explainability fallback returns grounded explanation when no Gemini key is provided', async () => {
  const res = await fetch(`${baseUrl}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      standardId: testStandardId,
      userQuery: 'High grade 53 OPC cement for bridge foundations'
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.explanation, 'Expected an explanation string');
  assert.equal(data.source, 'fallback', 'Expected source to be fallback when no key is set');
  assert.ok(data.explanation.includes('IS 269:2015'), 'Explanation must cite the IS Number');
  assert.ok(data.explanation.includes('Ordinary Portland Cement'), 'Explanation must cite title');
  assert.ok(data.explanation.includes('ISI Mark'), 'Explanation must cite certifications');
});

test('2. Missing standardId returns HTTP 400', async () => {
  const res = await fetch(`${baseUrl}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userQuery: 'Ordinary portland cement'
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('standardId and userQuery are required'));
});

test('3. Missing or empty userQuery returns HTTP 400', async () => {
  const res = await fetch(`${baseUrl}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      standardId: testStandardId,
      userQuery: '   '
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('standardId and userQuery are required'));
});

test('4. Non-existent standardId returns HTTP 404', async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const res = await fetch(`${baseUrl}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      standardId: fakeId,
      userQuery: 'Ordinary portland cement'
    })
  });

  assert.equal(res.status, 404);
  const data = await res.json();
  assert.ok(data.error.includes('Standard not found'));
});
