const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

/**
 * Creates the initial admin account safely.
 * @param {Object} params
 * @param {string} params.username
 * @param {string} params.password
 * @param {string} [params.mongoUri]
 * @returns {Promise<{ created: boolean, username?: string, reason?: string }>}
 */
async function bootstrapAdmin({ username, password, mongoUri } = {}) {
  const targetUri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';

  if (!username || !password) {
    throw new Error('Both username and password are required for bootstrapping admin.');
  }

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    await mongoose.connect(targetUri);
  }

  try {
    // One-time guard: check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.warn(`[BOOTSTRAP NOTICE] An admin account already exists ('${existingAdmin.username}'). Bootstrap creates an admin only if none exists.`);
      return { created: false, reason: 'ADMIN_ALREADY_EXISTS', existingUsername: existingAdmin.username };
    }

    // Pass plaintext password into new User so the pre-save hook hashes it exactly once
    const admin = new User({
      username: username.trim(),
      password: password,
      role: 'admin'
    });

    await admin.save();
    console.log(`[BOOTSTRAP SUCCESS] Initial admin account '${admin.username}' created successfully.`);
    return { created: true, username: admin.username };
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
    }
  }
}

async function cli() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('Error: BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD environment variables are required.');
    console.error('Usage:');
    console.error('  $env:BOOTSTRAP_ADMIN_USERNAME="admin"; $env:BOOTSTRAP_ADMIN_PASSWORD="securepassword"; node bootstrap-admin.js');
    process.exit(1);
  }

  try {
    const result = await bootstrapAdmin({ username, password });
    if (!result.created) {
      process.exit(0);
    }
    process.exit(0);
  } catch (err) {
    console.error('Bootstrap error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cli();
}

module.exports = { bootstrapAdmin };
