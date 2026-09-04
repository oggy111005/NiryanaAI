/**
 * Phase 5: GeM Compliance Screening Tests
 *
 * All tests run against an isolated in-process HTTP server on dynamic port (0).
 * Database URI strictly must end with '-test'.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes-test';

// STRICT SAFETY GUARD
const dbName = TEST_DB_URI.split('/').pop().split('?')[0];
if (!dbName.endsWith('-test')) {
  throw new Error(`[SAFETY VIOLATION] Phase 5 tests must run against a -test database. Got: '${dbName}'`);
}

process.env.MONGODB_URI = TEST_DB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'phase5-test-jwt-secret';

const { app, setExtractor } = require('../server');

let server;
let baseUrl;
let validToken;

test.before(async () => {
  await mongoose.connect(TEST_DB_URI);
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  validToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', username: 'testofficer', role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  setExtractor(async () => ({
    data: new Float32Array(384).fill(0.08)
  }));
});

test.after(async () => {
  if (server) server.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});

test('1. Unauthenticated screening request returns HTTP 401', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isNumber: 'IS 269:2015' })
  });

  assert.equal(res.status, 401);
});

test('2. Missing isNumber returns HTTP 400', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({ parameters: [] })
  });

  assert.equal(res.status, 400);
});

test('3. Passing parameters return overallStatus COMPLIANT', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({
      isNumber: 'IS 269:2015',
      materialName: 'Ordinary Portland Cement',
      parameters: [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '48.5', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '2.6', unit: '%', operator: '<=' },
        { parameterName: 'BIS Mark License', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Valid & Active', operator: 'includes' }
      ]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.overallStatus, 'COMPLIANT');
  assert.equal(data.badgeColor, 'green');
  assert.equal(data.evaluatedParameters.length, 3);
  assert.ok(data.evaluatedParameters.every(p => p.status === 'PASS'));
});

test('4. Violating parameters return overallStatus POTENTIAL NON-COMPLIANCE', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({
      isNumber: 'IS 269:2015',
      materialName: 'Defective Cement',
      parameters: [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '28.0', unit: 'MPa', operator: '>=' },
        { parameterName: 'Total Sulfur Content (SO3)', clauseNumber: '4.1', requiredValue: '3.5', proposedValue: '4.2', unit: '%', operator: '<=' }
      ]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.overallStatus, 'POTENTIAL NON-COMPLIANCE');
  assert.equal(data.badgeColor, 'red');
  assert.ok(data.evaluatedParameters.some(p => p.status === 'FAIL'));
});

test('5. Borderline parameters return overallStatus VERIFY', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({
      isNumber: 'IS 269:2015',
      materialName: 'Borderline Material',
      parameters: [
        { parameterName: '28-Day Compressive Strength', clauseNumber: '4.2', requiredValue: '43.0', proposedValue: '42.0', unit: 'MPa', operator: '>=' },
        { parameterName: 'BIS Mark License', clauseNumber: '6.1', requiredValue: 'valid', proposedValue: 'Pending Renewal', operator: 'includes' }
      ]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.overallStatus, 'VERIFY');
  assert.equal(data.badgeColor, 'yellow');
});

test('6. Range parameters (between) evaluate correctly for water pipe specifications', async () => {
  const res = await fetch(`${baseUrl}/api/screen-compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({
      isNumber: 'IS 4984:2016',
      materialName: 'HDPE Water Supply Pipes',
      parameters: [
        { parameterName: 'Carbon Black Content', clauseNumber: '2.3', requiredValue: '2.0 - 2.5', proposedValue: '2.25', unit: '%', operator: 'between' },
        { parameterName: 'Hydrostatic Pressure Test', clauseNumber: '2.2', requiredValue: '1.6', proposedValue: '1.75', unit: 'MPa', operator: '>=' }
      ]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.overallStatus, 'COMPLIANT');
  assert.equal(data.evaluatedParameters[0].status, 'PASS');
});

test('7. /api/analyze-tender extracts dynamic parameters and material domain', async () => {
  const tenderText = `TENDER NO: PHED/WS/2026/PIPE-441
NAME OF WORK: Supply and Laying of High-Density Polyethylene (HDPE) Pipes for Rural Drinking Water Supply Scheme.
The contractor shall supply HDPE Pipes conforming to IS 4984.
2.2 Hydrostatic Pressure Test: Pipes must withstand internal test pressure of minimum 1.6 MPa.
2.3 Carbon Black Content: Carbon black content shall be between 2.0% and 2.5% by mass.
2.5 Elongation at Break: Minimum tensile elongation at break shall not be less than 350%.`;

  const boundary = '----WebKitFormBoundaryTenderTest1234';
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="water_pipe_tender.txt"',
    'Content-Type: text/plain',
    '',
    tenderText,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const res = await fetch(`${baseUrl}/api/analyze-tender`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${validToken}`
    },
    body
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.materialName, 'materialName should be present');
  assert.ok(Array.isArray(data.extractedParameters), 'extractedParameters should be an array');
  assert.ok(data.extractedParameters.length > 0, 'Should extract at least one parameter');

  // Verify that Hydrostatic Pressure Test (1.6 MPa) or Carbon Black was extracted
  const hasHydro = data.extractedParameters.some(p => p.parameterName.includes('Hydrostatic') || p.requiredValue === '1.6');
  const hasCarbon = data.extractedParameters.some(p => p.parameterName.includes('Carbon') || p.requiredValue.includes('2.0'));
  assert.ok(hasHydro || hasCarbon, 'Should extract specific water pipe parameters from text');
});

