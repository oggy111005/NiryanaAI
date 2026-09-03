require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/is-recommend').then(async () => {
  await User.deleteMany({});
  
  const admin = new User({username: 'admin', password: 'adminpassword', role: 'admin'});
  await admin.save();
  
  const user = new User({username: 'demouser', password: 'userpassword', role: 'user'});
  await user.save();
  
  console.log('Dummy credentials successfully created!');
  process.exit(0);
});

