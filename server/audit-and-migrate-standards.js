const mongoose = require('mongoose');
const Standard = require('./models/Standard');

function sanitizeUri(uri) {
  return (uri || '').replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

/**
 * Audit and migrate existing standards:
 * 1. Checks all documents for missing normalized fields.
 * 2. Detects any collision on normalizedIsNumber.
 * 3. If collisions exist, reports them clearly, halts, and DOES NOT delete or overwrite records.
 * 4. If clean, safely backfills missing fields and builds the unique index.
 */
async function auditAndMigrateStandards(options = {}) {
  const mongoUri = options.mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  const dryRun = options.dryRun || false;
  const isDirectCall = !mongoose.connection || mongoose.connection.readyState !== 1;

  if (isDirectCall) {
    console.log(`[AUDIT] Connecting to MongoDB: ${sanitizeUri(mongoUri)}`);
    await mongoose.connect(mongoUri);
  }

  const dbHost = mongoose.connection.host;
  const dbName = mongoose.connection.name;
  console.log(`[AUDIT] Connected to Database: '${dbName}' on Host: '${dbHost}'`);

  try {
    const rawDocs = await mongoose.connection.db.collection('standards').find({}).toArray();
    console.log(`[AUDIT] Found ${rawDocs.length} total standard records to inspect.`);

    // 1. Group records by prospective normalizedIsNumber
    const grouped = new Map();
    for (const doc of rawDocs) {
      const rawIsNumber = doc.isNumber || '';
      const normalized = (doc.normalizedIsNumber || rawIsNumber.toLowerCase().replace(/\s+/g, '')).trim();
      const base = (doc.baseIsNumber || normalized.split(':')[0]).trim();
      const isDemo = doc.isDemo !== undefined ? doc.isDemo : rawIsNumber.startsWith('DEMO-');
      const status = doc.status || (isDemo ? 'draft' : 'active');

      if (!grouped.has(normalized)) {
        grouped.set(normalized, []);
      }
      grouped.get(normalized).push({
        _id: doc._id,
        isNumber: rawIsNumber,
        title: doc.title,
        normalized,
        base,
        isDemo,
        status
      });
    }

    // 2. Identify Collisions
    const collisions = [];
    for (const [normalized, records] of grouped.entries()) {
      if (records.length > 1) {
        collisions.push({ normalized, records, count: records.length });
      }
    }

    if (collisions.length > 0) {
      console.error('\n======================================================');
      console.error('[AUDIT COLLISION DETECTED] DUPLICATE NORMALIZED IS NUMBERS FOUND!');
      console.error(`Found ${collisions.length} collision group(s) across existing records.`);
      console.error('Data safety policy: NO records will be deleted or overwritten.');
      console.error('Unique index creation is REFUSED until collisions are manually resolved.');
      console.error('======================================================');
      collisions.forEach((c, idx) => {
        console.error(`\nCollision #${idx + 1}: Normalized key '${c.normalized}' has ${c.count} records:`);
        c.records.forEach(r => {
          console.error(`  - ID: ${r._id} | Raw isNumber: "${r.isNumber}" | Title: "${r.title || 'N/A'}"`);
        });
      });
      console.error('======================================================\n');

      return {
        success: false,
        totalRecords: rawDocs.length,
        collisionCount: collisions.length,
        collisions
      };
    }

    console.log(`[AUDIT] Zero duplicate collisions detected across ${grouped.size} unique normalized IS numbers.`);

    // 3. Backfill missing canonical fields if not a dry run
    let updatedCount = 0;
    if (!dryRun) {
      for (const [normalized, records] of grouped.entries()) {
        const item = records[0];
        const updateOps = {};
        
        // Find raw doc to see what's missing
        const rawDoc = rawDocs.find(d => d._id.toString() === item._id.toString());
        if (!rawDoc.normalizedIsNumber) updateOps.normalizedIsNumber = item.normalized;
        if (!rawDoc.baseIsNumber) updateOps.baseIsNumber = item.base;
        if (rawDoc.isDemo === undefined) updateOps.isDemo = item.isDemo;
        if (!rawDoc.status) updateOps.status = item.status;
        if (item.isDemo) {
          if (rawDoc.sourceUrl) updateOps.sourceUrl = null;
          if (rawDoc.verifiedDate) updateOps.verifiedDate = null;
        }

        if (Object.keys(updateOps).length > 0) {
          await mongoose.connection.db.collection('standards').updateOne(
            { _id: item._id },
            { $set: updateOps }
          );
          updatedCount++;
        }
      }

      console.log(`[MIGRATION] Backfilled canonical and provenance fields for ${updatedCount} records.`);

      // 4. Create Unique Index on normalizedIsNumber
      console.log('[INDEX] Ensuring unique index on field "normalizedIsNumber"...');
      await mongoose.connection.db.collection('standards').createIndex(
        { normalizedIsNumber: 1 },
        { unique: true, background: true }
      );
      console.log('[INDEX] Unique index confirmed on "normalizedIsNumber".');
    } else {
      console.log('[AUDIT] Dry-run mode enabled: No database modifications made.');
    }

    return {
      success: true,
      totalRecords: rawDocs.length,
      collisionCount: 0,
      updatedCount
    };
  } finally {
    if (isDirectCall) {
      await mongoose.disconnect();
      console.log('[AUDIT] Disconnected from MongoDB.');
    }
  }
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  auditAndMigrateStandards({ dryRun: isDryRun })
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('[AUDIT FATAL ERROR]:', err);
      process.exit(1);
    });
}

module.exports = { auditAndMigrateStandards };
