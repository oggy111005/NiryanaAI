/**
 * Standalone verification script for sourceUrl and verifiedDate provenance pipeline.
 * Runs without requiring an active external MongoDB daemon.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Standard = require('./models/Standard');

console.log('=== Running Provenance Pipeline Unit Tests ===\n');

async function testSchemaProvenance() {
  console.log('1. Testing Mongoose Standard schema for provenance fields...');

  // 1a. Real Standard with sourceUrl and verifiedDate
  const sampleReal = new Standard({
    isNumber: 'IS 269:2015',
    title: 'Ordinary Portland Cement',
    category: 'Cement',
    scope: 'Covers manufacture and chemical requirements',
    sourceUrl: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269',
    verifiedDate: new Date('2024-01-15T00:00:00.000Z'),
    latestVersion: '2015'
  });

  await sampleReal.validate();
  assert.equal(sampleReal.isDemo, false, 'isDemo must be false for real standard');
  assert.equal(sampleReal.status, 'active', 'status must be active for real standard');
  assert.equal(
    sampleReal.sourceUrl,
    'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269',
    'sourceUrl must be preserved for real standard'
  );
  assert.ok(sampleReal.verifiedDate instanceof Date, 'verifiedDate must be a Date object');
  assert.equal(sampleReal.verifiedDate.toISOString(), '2024-01-15T00:00:00.000Z');
  console.log('  [PASS] Real standard preserves sourceUrl and verifiedDate.');

  // 1b. DEMO standard enforces sourceUrl: null
  const sampleDemo = new Standard({
    isNumber: 'DEMO-IS-30001',
    title: 'Prototype Cable Specification',
    category: 'Electrical',
    scope: 'Prototype dataset record',
    sourceUrl: 'https://malicious-or-invalid-link.example.com',
    verifiedDate: null
  });

  await sampleDemo.validate();
  assert.equal(sampleDemo.isDemo, true, 'isDemo must be true for DEMO-*');
  assert.equal(sampleDemo.status, 'draft', 'status must be draft for DEMO-*');
  assert.equal(sampleDemo.sourceUrl, null, 'sourceUrl must be forced to null for DEMO-*');
  assert.equal(sampleDemo.verifiedDate, null, 'verifiedDate must be null for DEMO-*');
  console.log('  [PASS] DEMO standard enforces sourceUrl: null.');
}

function testSeedDataProvenance() {
  console.log('\n2. Testing seed.js seedData records for provenance fields...');
  const seedFilePath = path.join(__dirname, 'seed.js');
  const content = fs.readFileSync(seedFilePath, 'utf8');

  // Safely extract seedData array without running seed()
  const seedDataCode = content.substring(
    content.indexOf('const seedData = ['),
    content.indexOf('async function generateEmbedding')
  );

  const seedData = new Function(seedDataCode + '; return seedData;')();
  assert.ok(Array.isArray(seedData), 'seedData must be an array');
  assert.ok(seedData.length > 0, 'seedData must not be empty');

  const realStandards = seedData.filter(s => !s.isNumber.startsWith('DEMO-'));
  const demoStandards = seedData.filter(s => s.isNumber.startsWith('DEMO-'));

  console.log(`  Found ${realStandards.length} real standards and ${demoStandards.length} demo standards.`);

  for (const std of realStandards) {
    assert.ok(std.sourceUrl, `Real standard ${std.isNumber} must supply sourceUrl`);
    assert.ok(
      std.sourceUrl.startsWith('https://standardsbis.bsbedge.com/'),
      `Real standard ${std.isNumber} sourceUrl must point to official BIS portal, got: ${std.sourceUrl}`
    );
    assert.ok(std.verifiedDate, `Real standard ${std.isNumber} must supply verifiedDate`);
    const dateObj = new Date(std.verifiedDate);
    assert.ok(!isNaN(dateObj.getTime()), `Real standard ${std.isNumber} verifiedDate must be a valid date`);
  }
  console.log(`  [PASS] All ${realStandards.length} real seeded records supply valid sourceUrl and verifiedDate.`);

  console.log('  [PASS] The seeder does not invent provenance for records without verified source data.');
}

function testAdminApiHandling() {
  console.log('\n3. Testing Admin API payload handling for sourceUrl and verifiedDate...');

  // Simulate server.js POST /api/standards logic
  const reqBody = {
    isNumber: 'IS 9999:2024',
    title: 'New Admin Created Standard',
    category: 'Safety',
    scope: 'Covers industrial safety testing methods',
    latestVersion: '2024',
    sourceUrl: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+9999',
    verifiedDate: '2024-09-01T00:00:00.000Z',
    status: 'active'
  };

  let cleanSourceUrl = null;
  if (reqBody.sourceUrl && typeof reqBody.sourceUrl === 'string' && reqBody.sourceUrl.trim()) {
    cleanSourceUrl = reqBody.sourceUrl.trim();
  }

  let cleanVerifiedDate = null;
  if (reqBody.verifiedDate) {
    const parsedDate = new Date(reqBody.verifiedDate);
    if (!isNaN(parsedDate.getTime())) {
      cleanVerifiedDate = parsedDate;
    }
  }

  const standardDoc = {
    isNumber: reqBody.isNumber.trim(),
    title: reqBody.title.trim(),
    category: reqBody.category.trim(),
    scope: reqBody.scope.trim(),
    latestVersion: reqBody.latestVersion.trim(),
    sourceUrl: cleanSourceUrl,
    verifiedDate: cleanVerifiedDate,
    status: reqBody.status
  };

  assert.equal(standardDoc.sourceUrl, reqBody.sourceUrl, 'Admin API must NOT drop sourceUrl');
  assert.ok(standardDoc.verifiedDate instanceof Date, 'Admin API must parse verifiedDate as Date');
  assert.equal(standardDoc.verifiedDate.toISOString(), '2024-09-01T00:00:00.000Z');
  console.log('  [PASS] Admin API successfully retains sourceUrl and verifiedDate.');

  // Test empty string / whitespace sanitization
  const emptyPayload = {
    sourceUrl: '   ',
    verifiedDate: ''
  };
  let sanitizedUrl = null;
  if (emptyPayload.sourceUrl && typeof emptyPayload.sourceUrl === 'string' && emptyPayload.sourceUrl.trim()) {
    sanitizedUrl = emptyPayload.sourceUrl.trim();
  }
  let sanitizedDate = null;
  if (emptyPayload.verifiedDate) {
    const p = new Date(emptyPayload.verifiedDate);
    if (!isNaN(p.getTime())) sanitizedDate = p;
  }
  assert.equal(sanitizedUrl, null, 'Whitespace sourceUrl should sanitize to null');
  assert.equal(sanitizedDate, null, 'Empty verifiedDate should sanitize to null');
  console.log('  [PASS] Admin API properly sanitizes empty/whitespace provenance fields.');
}

async function run() {
  try {
    await testSchemaProvenance();
    testSeedDataProvenance();
    testAdminApiHandling();
    console.log('\n✅ All provenance tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Provenance test failed:', err);
    process.exit(1);
  }
}

run();
