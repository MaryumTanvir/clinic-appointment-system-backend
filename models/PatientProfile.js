const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  age: Number,
  contact: {
    phone: String,
    address: String
  },
  medicalHistory: [String],
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema, 'patientProfiles');