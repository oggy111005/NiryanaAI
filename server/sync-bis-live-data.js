/**
 * sync-bis-live-data.js
 *
 * Connects to MongoDB, queries the official Government of India BIS portal
 * (standardsadmin.bis.gov.in) for each authentic standard, extracts:
 *   - publishedOn: official publication date
 *   - latestReviewedYear: reaffirmation / review year
 * and persists them to the Standard collection.
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Standard = require('./models/Standard');

function normalizeForMatch(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-1/g, '(part1)')
    .replace(/-2/g, '(part2)')
    .replace(/[^a-z0-9]/g, '');
}

function extractYear(dateOrYearStr) {
  if (!dateOrYearStr) return null;
  const str = String(dateOrYearStr);
  const match = str.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}

async function syncBisLiveData() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  console.log(`[SYNC-BIS] Connecting to: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  const standards = await Standard.find({ isDemo: { $ne: true } });
  console.log(`[SYNC-BIS] Found ${standards.length} authentic standards to sync with official BIS portal.\n`);

  let successCount = 0;
  let failCount = 0;

  for (const std of standards) {
    const isNum = std.isNumber;
    const searchCandidates = [isNum];

    if (isNum.includes('-1')) searchCandidates.push(isNum.replace('-1', ' (Part 1)'));
    if (isNum.includes('-2')) searchCandidates.push(isNum.replace('-2', ' (Part 2)'));
    if (std.baseIsNumber) {
      searchCandidates.push(std.baseIsNumber.replace(/([a-zA-Z]+)(\d+)/, '$1 $2'));
    }

    let match = null;

    for (const query of searchCandidates) {
      try {
        const searchRes = await fetch('https://standardsadmin.bis.gov.in/review-service/searchKnowStandards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ searchText: query })
        });

        if (searchRes.status === 200) {
          const searchJson = await searchRes.json();
          const items = searchJson.data || [];
          const targetNorm = normalizeForMatch(isNum);

          // Try exact normalized match first
          match = items.find(d => normalizeForMatch(d.standardNumber) === targetNorm);

          // Fallback to base number prefix match
          if (!match && items.length > 0) {
            match = items.find(d => normalizeForMatch(d.standardNumber).startsWith(normalizeForMatch(std.baseIsNumber || '')));
          }

          if (match) break;
        }
      } catch (err) {
        // Continue to next candidate
      }
    }

    if (!match) {
      console.warn(`  ⚠ [${isNum}] Could not find match on BIS portal.`);
      failCount++;
      continue;
    }

    let publishedOn = match.publishedOn ? new Date(match.publishedOn) : null;
    let latestReviewedYear = null;

    // Fetch deep details if standardEncId is available
    if (match.standardEncId) {
      try {
        const detailRes = await fetch('https://standardsadmin.bis.gov.in/review-service/getWebsiteStandardDetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ encId: match.standardEncId, fromPage: 'guestUserPage' })
        });

        if (detailRes.status === 200) {
          const detailJson = await detailRes.json();
          const dData = detailJson.data || {};

          if (dData.publishedOn && !publishedOn) {
            publishedOn = new Date(dData.publishedOn);
          }

          // Check reviewOn first, then reAffirmationYear
          latestReviewedYear = extractYear(dData.reviewOn) || extractYear(dData.reAffirmationYear);
        }
      } catch (err) {
        // Fallback to search payload if detail fetch errors
      }
    }

    // Fallback for latestReviewedYear if not yet determined: use publication year or version year
    if (!latestReviewedYear) {
      latestReviewedYear = extractYear(match.publishedOn) || extractYear(std.latestVersion) || extractYear(isNum);
    }

    // Fetch live official amendments if standardEncId is available
    let amendmentsList = [];
    if (match.standardEncId) {
      try {
        const amendRes = await fetch('https://standardsadmin.bis.gov.in/review-service/getAmendmentDetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ standardId: match.standardEncId })
        });

        if (amendRes.status === 200) {
          const amendJson = await amendRes.json();
          if (Array.isArray(amendJson.data) && amendJson.data.length > 0) {
            amendmentsList = amendJson.data.map(a => {
              const label = a.amendmentLabel || `Amendment ${a.noOfAmendment || ''}`.trim();
              const year = a.amendmentYear ? ` (${a.amendmentYear})` : '';
              return `${label}${year}`.trim();
            });
          }
        }
      } catch (err) {
        // Non-blocking
      }
    }

    // Update fields
    std.publishedOn = publishedOn;
    std.latestReviewedYear = latestReviewedYear;
    if (amendmentsList.length > 0) {
      std.amendments = amendmentsList;
    }
    // Certify provenance verification timestamp
    std.verifiedDate = new Date();

    await std.save();

    console.log(`  ✓ [${isNum}] -> Published: ${publishedOn ? publishedOn.toISOString().split('T')[0] : 'N/A'} | Reviewed: ${latestReviewedYear || 'N/A'} | Amendments: ${std.amendments?.length || 0} | Verified: ${std.verifiedDate.toISOString().split('T')[0]}`);
    successCount++;
  }

  console.log(`\n[SYNC-BIS COMPLETE] Successfully synced ${successCount}/${standards.length} standards (${failCount} failures).`);
  await mongoose.disconnect();
}

syncBisLiveData().catch(err => {
  console.error('[SYNC-BIS ERROR]', err);
  process.exit(1);
});
