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

const { app } = require('../server');

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
