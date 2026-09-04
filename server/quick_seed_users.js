const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const defaultUsers = [
  { username: 'admin', password: 'adminpassword', role: 'admin' },
  { username: 'divyansh', password: 'sih@2026', role: 'admin' },
  { username: 'demouser', password: 'userpassword', role: 'user' }
];

async function seed() {
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  await mongoose.connect(targetUri);
  console.log('Connected to database: ' + targetUri);

  for (const u of defaultUsers) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      const user = new User({
        username: u.username,
        password: u.password,
        role: u.role
      });
      await user.save();
      console.log(`[USER SEED] Created demo user: '${u.username}' (${u.role})`);
    } else {
      console.log(`[USER SEED] Demo user '${u.username}' already exists.`);
    }
  }

  await mongoose.disconnect();
  console.log('User provisioning completed successfully in 0.5s!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
