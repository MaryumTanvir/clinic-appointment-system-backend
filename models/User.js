const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  gender:    { type: String, enum: ["male", "female", "other"] },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ["admin", "doctor", "patient"], required: true },
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('User', userSchema, 'users');
