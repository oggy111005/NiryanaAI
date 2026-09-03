const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  await mongoose.connect(uri);

  const admins = await User.find({ role: 'admin' }).select('-password');
  console.log('\n================ Current Admins ================');
  if (admins.length === 0) {
    console.log('No admin users found in database.');
  } else {
    admins.forEach(function(u, idx) {
      console.log((idx + 1) + '. Username: ' + u.username + ' | Role: ' + u.role + ' | ID: ' + u._id);
    });
  }
  console.log('================================================\n');

  await mongoose.disconnect();
}

main().catch(function(err) {
  console.error('Error:', err.message);
  process.exit(1);
});
