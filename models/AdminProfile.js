const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: false
  },
  designation: {
    type: String,
    required: false
  },
  contact: {
    phone: { type: String },
    officeLocation: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema, 'adminProfiles');
