/**
 * Test script for Multilingual / Hindi search in NiryanaAI
 */
async function testHindiSearch() {
  const query = 'कंक्रीट निर्माण के लिए पोर्टलैंड सीमेंट';
  console.log(`[TEST] Querying in Hindi: "${query}"...`);

  try {
    const res = await fetch('http://localhost:5000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.primary) {
      console.log(`[SUCCESS] Matched Standard: ${data.primary.isNumber} - ${data.primary.title}`);
      console.log(`[SCORE] Confidence: ${(data.primary.similarityScore * 100).toFixed(1)}%`);
    } else {
      console.log('[NOTICE] No primary standard matched above threshold.');
    }
  } catch (err) {
    console.error('[ERROR] Failed to query:', err.message);
  }
}

testHindiSearch();
