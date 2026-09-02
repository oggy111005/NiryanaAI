const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app, connectDB, setExtractor } = require('../server');
const User = require('../models/User');
const Standard = require('../models/Standard');
const History = require('../models/History');
const { bootstrapAdmin } = require('../bootstrap-admin');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes-test';
const TEST_JWT_SECRET = 'test-environment-jwt-secret-xyz123';
process.env.JWT_SECRET = TEST_JWT_SECRET;

// STRICT DATABASE GUARD: Refuse to run unless test database name ends with "-test"
const dbUrl = new URL(TEST_DB_URI.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
const dbName = dbUrl.pathname.replace(/^\//, '');
if (!dbName.endsWith('-test')) {
  throw new Error(`CRITICAL SAFETY ABORT: Test database name must end in '-test'. Received database: '${dbName}' (${TEST_DB_URI}). Non-test databases will never be touched.`);
}

let server;
let baseUrl;
let adminToken;
let userToken;
let userTokenB;
let adminUserId;
let regularUserId;
let userBId;

// Fast mock extractor for tests (prevents downloading Xenova model or external network calls)
const mockExtractor = async () => ({
  data: new Float32Array(384).fill(0.08)
});

// Minimal valid PDF binary fixture containing "IS 4151:2015 Title: Protective Helmets"
const minimalPdfBuffer = Buffer.from(
  '%PDF-1.4\n' +
  '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
  '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
  '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n' +
  '4 0 obj << /Length 72 >> stream\n' +
  'BT /F1 12 Tf 100 700 Td (IS 4151:2015 Title: Protective Helmets Scope: Helmets) Tj ET\n' +
  'endstream endobj\n' +
  '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
  'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000390 00000 n \n' +
  'trailer << /Size 6 /Root 1 0 R >>\nstartxref\n467\n%%EOF'
);

test.before(async () => {
  await mongoose.connect(TEST_DB_URI);
  await mongoose.connection.dropDatabase();

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // Seed test users
  const adminUser = new User({ username: 'superadmin', password: 'AdminPassword123', role: 'admin' });
  await adminUser.save();
  adminUserId = adminUser._id.toString();

  const normalUserA = new User({ username: 'citizenuser_a', password: 'UserPassword123', role: 'user' });
  await normalUserA.save();
  regularUserId = normalUserA._id.toString();

  const normalUserB = new User({ username: 'citizenuser_b', password: 'UserPassword123', role: 'user' });
  await normalUserB.save();
  userBId = normalUserB._id.toString();

  adminToken = jwt.sign({ id: adminUserId, username: 'superadmin', role: 'admin' }, TEST_JWT_SECRET, { expiresIn: '1h' });
  userToken = jwt.sign({ id: regularUserId, username: 'citizenuser_a', role: 'user' }, TEST_JWT_SECRET, { expiresIn: '1h' });
  userTokenB = jwt.sign({ id: userBId, username: 'citizenuser_b', role: 'user' }, TEST_JWT_SECRET, { expiresIn: '1h' });

  setExtractor(mockExtractor);
});

test.after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test('1. GET /api/health accurately reports status without exposing secrets', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.dbReady, true);
  assert.equal(data.modelReady, true);
  assert.equal(data.jwtSecret, undefined);
});

test('2. Unauthenticated write and upload routes return HTTP 401', async () => {
  // Test POST /api/standards
  const resStd = await fetch(`${baseUrl}/api/standards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isNumber: 'IS 100', title: 'Test', scope: 'Test scope' })
  });
  assert.equal(resStd.status, 401);

  // Test POST /api/extract-standard
  const resExtract = await fetch(`${baseUrl}/api/extract-standard`, {
    method: 'POST'
  });
  assert.equal(resExtract.status, 401);

  // Test POST /api/auth/register
  const resReg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hacker', password: 'password' })
  });
  assert.equal(resReg.status, 401);

  // Test GET /api/auth/users
  const resUsers = await fetch(`${baseUrl}/api/auth/users`);
  assert.equal(resUsers.status, 401);

  // Test GET /api/history without token
  const resHistory = await fetch(`${baseUrl}/api/history`);
  assert.equal(resHistory.status, 401);
});

test('3. Role enforcement: Regular user cannot access admin-only write endpoints (HTTP 403)', async () => {
  const resStd = await fetch(`${baseUrl}/api/standards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ isNumber: 'IS 200', title: 'User Attempt', scope: 'User Scope' })
  });
  assert.equal(resStd.status, 403);
  const data = await resStd.json();
  assert.ok(data.error.includes('requires admin privileges'));

  const resUsers = await fetch(`${baseUrl}/api/auth/users`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.equal(resUsers.status, 403);
});

test('4. Password hashing with bcrypt: Passwords are saved as bcrypt hashes and never exposed in responses', async () => {
  const rawAdmin = await mongoose.connection.collection('users').findOne({ username: 'superadmin' });
  assert.notEqual(rawAdmin.password, 'AdminPassword123');
  assert.ok(rawAdmin.password.startsWith('$2a$') || rawAdmin.password.startsWith('$2b$'));

  const resUsers = await fetch(`${baseUrl}/api/auth/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.equal(resUsers.status, 200);
  const users = await resUsers.json();
  users.forEach(u => {
    assert.equal(u.password, undefined, 'User password must not be returned in API');
  });
});

test('5. Login returns generic 401 response without revealing username existence', async () => {
  const resNonExistent = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'nonexistentuser', password: 'anypassword' })
  });
  assert.equal(resNonExistent.status, 401);
  const data1 = await resNonExistent.json();

  const resWrongPass = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: 'WrongPassword' })
  });
  assert.equal(resWrongPass.status, 401);
  const data2 = await resWrongPass.json();

  assert.equal(data1.error, 'Invalid username or password');
  assert.equal(data2.error, 'Invalid username or password');
});

test('6. Successful login returns JWT with user id, username, and role', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: 'AdminPassword123' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.equal(data.username, 'superadmin');
  assert.equal(data.role, 'admin');

  const decoded = jwt.verify(data.token, TEST_JWT_SECRET);
  assert.equal(decoded.id, adminUserId);
  assert.equal(decoded.username, 'superadmin');
  assert.equal(decoded.role, 'admin');
});

test('7. Upload validation: Rejects malicious.pdf with executable MIME type', async () => {
  const boundary = '----Boundary1' + Math.random().toString(36).substring(2);
  const payload =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="malicious.pdf"\r\n` +
    `Content-Type: application/x-msdownload\r\n\r\n` +
    `MZExecutableContent\r\n` +
    `--${boundary}--\r\n`;

  const res = await fetch(`${baseUrl}/api/extract-standard`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: payload
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('matching MIME type and extension'));
});

test('8. Upload validation: Rejects malicious.exe with application/pdf MIME type', async () => {
  const boundary = '----Boundary2' + Math.random().toString(36).substring(2);
  const payload =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="malicious.exe"\r\n` +
    `Content-Type: application/pdf\r\n\r\n` +
    `MZExecutableContent\r\n` +
    `--${boundary}--\r\n`;

  const res = await fetch(`${baseUrl}/api/extract-standard`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: payload
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('matching MIME type and extension'));
});

test('9. Upload validation: Rejects .pdf file without valid %PDF- header signature', async () => {
  const boundary = '----Boundary3' + Math.random().toString(36).substring(2);
  const payload =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="fake.pdf"\r\n` +
    `Content-Type: application/pdf\r\n\r\n` +
    `THIS IS NOT A VALID PDF FILE HEADER\r\n` +
    `--${boundary}--\r\n`;

  const res = await fetch(`${baseUrl}/api/extract-standard`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: payload
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('missing %PDF- header signature'));
});

test('10. PDF text extraction integration test using valid minimal PDF fixture', async () => {
  const boundary = '----PdfBoundary' + Math.random().toString(36).substring(2);
  const header =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="sample_standard.pdf"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const fullPayload = Buffer.concat([
    Buffer.from(header, 'utf8'),
    minimalPdfBuffer,
    Buffer.from(footer, 'utf8')
  ]);

  const res = await fetch(`${baseUrl}/api/extract-standard`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: fullPayload
  });

  assert.equal(res.status, 200);
  const extracted = await res.json();
  assert.equal(extracted.isNumber, 'IS 4151:2015');
  assert.ok(extracted.title.includes('Protective Helmets'));
});

test('11. Cold-start guard: Rejects standard creation with HTTP 503 when model is unavailable', async () => {
  setExtractor(null);

  const res = await fetch(`${baseUrl}/api/standards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      isNumber: 'IS 999:2026',
      title: 'Cement Spec',
      scope: 'Standard for cement'
    })
  });

  assert.equal(res.status, 503);
  const data = await res.json();
  assert.ok(data.error.includes('AI embedding model is loading'));

  const saved = await Standard.findOne({ isNumber: 'IS 999:2026' });
  assert.equal(saved, null);

  setExtractor(mockExtractor);
});

test('12. Search-history privacy and user isolation', async () => {
  // Clear any existing history
  await History.deleteMany({});

  // 1. User A executes a search with their token
  const resA = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ query: 'High grade Portland cement' })
  });
  assert.equal(resA.status, 200);

  // 2. Anonymous/Guest executes a search without token
  const resGuest = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Anonymous search for solar panels' })
  });
  assert.equal(resGuest.status, 200);

  // 3. User A retrieves their history
  const historyResA = await fetch(`${baseUrl}/api/history`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert.equal(historyResA.status, 200);
  const historyDataA = await historyResA.json();
  assert.equal(historyDataA.length, 1);
  assert.equal(historyDataA[0].query, 'High grade Portland cement');

  // 4. User B retrieves their history - must NOT see User A's search or Guest's search
  const historyResB = await fetch(`${baseUrl}/api/history`, {
    headers: { 'Authorization': `Bearer ${userTokenB}` }
  });
  assert.equal(historyResB.status, 200);
  const historyDataB = await historyResB.json();
  assert.equal(historyDataB.length, 0, 'User B must have isolated empty history');
});

test('13. Bootstrap admin CLI creates initial admin, prevents double-hashing, and refuses duplicates', async () => {
  await User.deleteMany({});

  const bootstrapResult = await bootstrapAdmin({
    username: 'newbootadmin',
    password: 'PlaintextPassword456',
    mongoUri: TEST_DB_URI
  });
  assert.equal(bootstrapResult.created, true);

  const secondRun = await bootstrapAdmin({
    username: 'anotheradmin',
    password: 'AnotherPassword789',
    mongoUri: TEST_DB_URI
  });
  assert.equal(secondRun.created, false);
  assert.equal(secondRun.reason, 'ADMIN_ALREADY_EXISTS');

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'newbootadmin',
      password: 'PlaintextPassword456'
    })
  });

  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.equal(loginData.username, 'newbootadmin');
  assert.equal(loginData.role, 'admin');
  assert.ok(loginData.token);
});
