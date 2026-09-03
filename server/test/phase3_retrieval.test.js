const { describe, it } = require('node:test');
const assert = require('node:assert');

// Base URL for the locally running server
const API_URL = 'http://localhost:5000/api';

describe('Phase 3: Retrieval Quality & Threshold Tests', () => {

  it('should promote exact matches and bypass the AI embedding model', async () => {
    const res = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'IS 269' })
    });

    assert.strictEqual(res.status, 200, 'Expected HTTP 200 OK');
    const data = await res.json();

    assert.ok(data.primary, 'Expected a primary match to be returned');
    assert.strictEqual(data.primary.isNumber, 'IS 269:2015', 'Expected IS 269:2015 to be returned');
    assert.strictEqual(data.primary.matchType, 'Exact IS number match', 'Expected exact match tag');
    assert.strictEqual(data.primary.similarityScore, 1, 'Expected perfect similarity score of 1');
  });

  it('should reject completely irrelevant queries using the 0.40 confidence cutoff', async () => {
    const res = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'gourmet cheeseburger recipe with spicy mayonnaise' })
    });

    assert.strictEqual(res.status, 200, 'Expected HTTP 200 OK');
    const data = await res.json();

    assert.strictEqual(data.primary, null, 'Expected primary match to be null due to low confidence');
    assert.strictEqual(data.related.length, 0, 'Expected related standards to be empty');
    assert.ok(data.message.includes('No confident Indian Standard match found'), 'Expected hallucination rejection message');
  });

  it('should safely sanitize and escape Regex characters in the catalog search API', async () => {
    // We search for something that looks like regex syntax but should be safely escaped
    const res = await fetch(`${API_URL}/standards?search=${encodeURIComponent('IS.*+?^${}()|[]\\')}`);
    assert.strictEqual(res.status, 200, 'Expected HTTP 200 OK despite malicious characters');
    const data = await res.json();
    
    // Because it's safely escaped, it will treat it as a literal string and find 0 matches
    // instead of throwing a 500 ReDoS error.
    assert.ok(Array.isArray(data), 'Expected an array response');
    assert.strictEqual(data.length, 0, 'Expected 0 matches for literal regex characters');
  });

});
