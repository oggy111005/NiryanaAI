/**
 * Test utility for IS Number Normalization logic
 */
function normalizeIsNumber(raw) {
  if (!raw) return { normalized: '', base: '' };
  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  const base = normalized.split(':')[0];
  return { normalized, base };
}

const testCases = [
  { input: 'IS 269:2015', expectedNormalized: 'is269:2015', expectedBase: 'is269' },
  { input: 'is 269 : 2015 ', expectedNormalized: 'is269:2015', expectedBase: 'is269' },
  { input: 'IS  456 : 2000', expectedNormalized: 'is456:2000', expectedBase: 'is456' },
  { input: 'DEMO-IS-30075', expectedNormalized: 'demo-is-30075', expectedBase: 'demo-is-30075' },
  { input: 'IS 1786:2008 (Part 1)', expectedNormalized: 'is1786:2008(part1)', expectedBase: 'is1786' }
];

console.log('Testing IS Number Normalization:');
let passed = 0;
for (const tc of testCases) {
  const res = normalizeIsNumber(tc.input);
  const match = res.normalized === tc.expectedNormalized && res.base === tc.expectedBase;
  console.log(`[${match ? 'PASS' : 'FAIL'}] "${tc.input}" -> normalized: "${res.normalized}", base: "${res.base}"`);
  if (match) passed++;
}

console.log(`Summary: ${passed}/${testCases.length} test cases passed.`);
if (passed !== testCases.length) process.exit(1);
