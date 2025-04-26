const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  specialty: { type: String, required: true },
  credentials: String,
  approved: { type: Boolean, required: true },
  consultationFee: { type: Number, required: true },
  availability: [{
    date: { type: Date, required: true },
    time: { type: String, required: true },
    available: { type: Boolean, required: true }
  }],
  contact: {
    phone: String,
    location: String
  },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema, 'doctorProfiles');