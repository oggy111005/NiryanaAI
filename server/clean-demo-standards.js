const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';

async function cleanDemoStandards() {
  console.log(`[CLEAN-DEMO] Connecting to: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  const collection = db.collection('standards');

  // Query to find all prototype/demo records
  const query = {
    $or: [
      { isDemo: true },
      { isNumber: { $regex: /^DEMO-/i } },
      { normalizedIsNumber: { $regex: /^demo-/i } }
    ]
  };

  const demoCount = await collection.countDocuments(query);
  console.log(`[CLEAN-DEMO] Found ${demoCount} demo/prototype standard(s) in database.`);

  if (demoCount === 0) {
    console.log('[CLEAN-DEMO] Database is already clean. No demo records found.');
    await mongoose.disconnect();
    return;
  }

  // Sample the demo documents to be removed
  const sampleDocs = await collection.find(query).limit(5).toArray();
  console.log('[CLEAN-DEMO] Sample records to be deleted:');
  sampleDocs.forEach(d => {
    console.log(`  - [${d._id}] ${d.isNumber}: "${d.title}" (${d.category || 'No Category'})`);
  });

  const deleteResult = await collection.deleteMany(query);
  console.log(`[CLEAN-DEMO] Successfully deleted ${deleteResult.deletedCount} demo record(s).`);

  const remainingRealCount = await collection.countDocuments({});
  console.log(`[CLEAN-DEMO] Total authentic standards remaining in database: ${remainingRealCount}`);

  // List remaining real standards
  const realStandards = await collection.find({}).project({ isNumber: 1, title: 1, category: 1 }).toArray();
  console.log('[CLEAN-DEMO] Remaining authentic standards:');
  realStandards.forEach(s => {
    console.log(`  ✓ ${s.isNumber} - "${s.title}" [${s.category}]`);
  });

  await mongoose.disconnect();
  console.log('[CLEAN-DEMO] Done!');
}

cleanDemoStandards().catch(err => {
  console.error('[CLEAN-DEMO ERROR]', err);
  process.exit(1);
});
