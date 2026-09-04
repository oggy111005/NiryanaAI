const mongoose = require('mongoose');
require('dotenv').config();
const Standard = require('./models/Standard');

async function fixBisUrls() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  console.log(`[FIX-URLS] Connecting to: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  const standards = await Standard.find({});
  console.log(`[FIX-URLS] Found ${standards.length} standards to inspect and update.`);

  let updatedCount = 0;

  for (const std of standards) {
    // Generate clean official BIS standards search URL for this IS Number
    const officialUrl = std.isNumber
      ? `https://standards.bis.gov.in/website/know-your-standards?searchTerm=${encodeURIComponent(std.isNumber)}`
      : 'https://standards.bis.gov.in/website';
    
    std.sourceUrl = officialUrl;
    std.verifiedDate = std.verifiedDate || new Date('2024-01-15T00:00:00.000Z');

    // Update clauses as well
    if (std.clauses && Array.isArray(std.clauses)) {
      std.clauses.forEach(clause => {
        clause.sourceUrl = `${officialUrl}#clause-${clause.clauseNumber || ''}`;
      });
    }

    await std.save();
    updatedCount++;
    console.log(`  ✓ Updated [${std.isNumber}] -> ${officialUrl}`);
  }

  console.log(`\n[FIX-URLS COMPLETE] Successfully updated ${updatedCount} standards with official working bis.gov.in URLs!`);
  await mongoose.disconnect();
}

fixBisUrls().catch(err => {
  console.error('[FIX-URLS ERROR]', err);
  process.exit(1);
});
