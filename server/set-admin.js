const mongoose = require('mongoose');
const User = require('./models/User');

async function setAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  await mongoose.connect(uri);

  // 1. Remove old admin account
  const deleted = await User.deleteMany({ username: 'admin' });
  if (deleted.deletedCount > 0) {
    console.log('Removed old "admin" user account.');
  }

  // 2. Check or create divyansh
  let user = await User.findOne({ username: 'divyansh' });
  if (user) {
    user.password = 'sih@2026'; // Pre-save hook will hash it
    user.role = 'admin';
    await user.save();
    console.log('Updated user "divyansh" with new password and admin role.');
  } else {
    user = new User({
      username: 'divyansh',
      password: 'sih@2026', // Pre-save hook will hash it
      role: 'admin'
    });
    await user.save();
    console.log('Successfully created admin user "divyansh"!');
  }

  const admins = await User.find({ role: 'admin' }).select('-password');
  console.log('\n================ Current Admins ================');
  admins.forEach(function(u, idx) {
    console.log((idx + 1) + '. Username: ' + u.username + ' | Role: ' + u.role + ' | ID: ' + u._id);
  });
  console.log('================================================\n');

  await mongoose.disconnect();
}

setAdmin().catch(function(err) {
  console.error('Error:', err.message);
  process.exit(1);
});
