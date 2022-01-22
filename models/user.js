const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/userLoginSystem');
const db = mongoose.connection;

const userSchema = mongoose.Schema({
  username: {
    type: 'String',
    index: true,
    unique: true,
  },
  password: {
    type: 'String',
  },
  email: {
    type: 'String',
  },
  profileimage: {
    type: 'String',
  },
});

module.exports = mongoose.model('User', userSchema);
