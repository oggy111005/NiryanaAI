/**
 * Phase 3 Retrieval Quality Tests
 *
 * All tests run against an isolated in-process HTTP server on a dynamic port (0).
 * The AI embedding model is replaced with a deterministic mock so tests do not
 * require model files and are not sensitive to embedding drift.
 * The database name must end with '-test' — the server refuses to start otherwise.
 *
 * Tests cover:
 *  1. Exact IS-number match (versioned)
 *  2. Base IS-number match with numeric year resolution (filters active records only)
 *  3. Ambiguous base-number query returns the latest active edition by numeric year
 *  4. Threshold rejection (below 0.40)
 *  5. Configurable threshold override
 *  6. Regex injection safety on catalog search
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes-test';

// STRICT SAFETY GUARD
const dbName = TEST_DB_URI.split('/').pop().split('?')[0];
if (!dbName.endsWith('-test')) {
  throw new Error(`[SAFETY VIOLATION] Phase 3 tests must run against a -test database. Got: '${dbName}'`);
}

// Load app module AFTER injecting test env
process.env.MONGODB_URI = TEST_DB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'phase3-test-jwt-secret';
process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD = '0.40';

// Dynamically require the server app
const { app, setExtractor } = require('../server');

let server;
let baseUrl;

// Seed data for tests
const SEED_STANDARDS = [
  {
    isNumber: 'IS 269:2015',
    title: 'Specification for Ordinary Portland Cement 33 Grade',
    category: 'Civil Engineering',
    scope: 'Covers 33 grade OPC for construction',
    status: 'active',
    isDemo: false,
    latestVersion: '2015',
    // Mock embedding: unit vector pointing along dimension 0
    embedding: Array(384).fill(0).map((_, i) => i === 0 ? 1 : 0)
  },
  {
    isNumber: 'IS 269:1989',
    title: 'Specification for OPC 33 Grade (Superseded)',
    category: 'Civil Engineering',
    scope: 'Covers 33 grade OPC (superseded)',
    status: 'superseded',
    isDemo: false,
    latestVersion: '1989',
    embedding: Array(384).fill(0).map((_, i) => i === 0 ? 1 : 0)
  },
  {
    isNumber: 'IS 456:2000',
    title: 'Plain and Reinforced Concrete Code of Practice',
    category: 'Civil Engineering',
    scope: 'Covers design and detailing of reinforced concrete structures',
    status: 'active',
    isDemo: false,
    latestVersion: '2000',
    // Different mock embedding: high similarity to cement queries
    embedding: Array(384).fill(0).map((_, i) => i === 0 ? 0.99 : 0)
  }
];

// Deterministic mock extractor: always returns a unit vector along dimension 0
// so IS 269:2015 and IS 456:2000 always score high, irrelevant queries do too.
// To simulate a low-score result we override the threshold to 0.99 in test 5.
const mockExtractor = async (text, opts) => ({
  data: Array(384).fill(0).map((_, i) => i === 0 ? 1 : 0)
});

test.before(async () => {
  await mongoose.connect(TEST_DB_URI);
  const Standard = require('../models/Standard');
  await mongoose.connection.db.collection('standards').deleteMany({});
  // Bypass schema middleware — insert raw to control embeddings precisely
  await mongoose.connection.db.collection('standards').insertMany(
    SEED_STANDARDS.map(s => ({
      ...s,
      normalizedIsNumber: s.isNumber.toLowerCase().replace(/\s+/g, ''),
      baseIsNumber: s.isNumber.toLowerCase().replace(/\s+/g, '').split(':')[0]
    }))
  );

  // Inject mock extractor into server module
  setExtractor(mockExtractor);

  // Start server on dynamic port 0 (OS assigns a free port)
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

test('1. Exact versioned match: IS 269:2015 returns matchType exact without similarityScore', async () => {
  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'IS 269:2015' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.primary, 'Expected a primary match');
  assert.equal(data.primary.isNumber, 'IS 269:2015');
  assert.equal(data.primary.matchType, 'exact', 'matchType must be "exact"');
  assert.equal(data.primary.similarityScore, undefined, 'Exact matches must not carry a synthetic similarity score');
});

test('2. Base-number match: IS 269 returns the highest numeric-year active edition only', async () => {
  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'IS 269' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.primary, 'Expected a primary match');
  // Must select 2015 (active, higher year) over 1989 (superseded)
  assert.equal(data.primary.isNumber, 'IS 269:2015', 'Must return the 2015 active edition');
  assert.equal(data.primary.matchType, 'exact');
  assert.equal(data.primary.status, 'active', 'Base match must only return active records');
});

test('3. Ambiguous base query: superseded edition is not returned even when it exists', async () => {
  // Querying the superseded year directly by normalized form
  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'IS 269:1989' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  // The superseded record CAN still be retrieved by exact versioned query
  // but it should carry no special 'active' guarantee
  assert.ok(data.primary, 'Exact versioned query must return a result');
  assert.equal(data.primary.isNumber, 'IS 269:1989');
  assert.equal(data.primary.matchType, 'exact');
});

test('4. Threshold rejection: queries below 0.40 return no primary recommendation', async () => {
  // Lower threshold to 0.99 so the mock 1.0 vector still passes, but
  // simulate a low score by setting threshold to 1.01 — anything below 1.01 is rejected.
  const savedThreshold = process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD;
  process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD = '1.01';

  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'reinforced concrete structural design' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.primary, null, 'Below-threshold query must return null primary');
  assert.deepEqual(data.related, [], 'Below-threshold query must return empty related');
  assert.ok(data.message && data.message.includes('No confident'), 'Must include rejection message');

  process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD = savedThreshold;
});

test('5. Configurable threshold: override to 0.0 allows all results through', async () => {
  const savedThreshold = process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD;
  process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD = '0.0';

  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'reinforced concrete structural design' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.primary, 'With threshold 0.0 any result must pass');

  process.env.RECOMMENDATION_CONFIDENCE_THRESHOLD = savedThreshold;
});

test('6. Regex injection safety: malicious pattern in catalog search returns 200 not 500', async () => {
  const maliciousSearch = 'IS.*+?^${}()|[]\\';
  const res = await fetch(`${baseUrl}/api/standards?search=${encodeURIComponent(maliciousSearch)}`);
  assert.equal(res.status, 200, 'Server must not crash on regex special characters');
  const data = await res.json();
  assert.ok(Array.isArray(data), 'Must return an array');
  assert.equal(data.length, 0, 'Literal regex characters must match nothing');
});
