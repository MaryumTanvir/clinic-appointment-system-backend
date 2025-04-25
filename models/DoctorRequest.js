const mongoose = require('mongoose');

const doctorRequestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // optional if you want each email to be unique
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  },
  credentials: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  contact: {
    phone: {
      type: String
    },
    location: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('DoctorRequest', doctorRequestSchema);
