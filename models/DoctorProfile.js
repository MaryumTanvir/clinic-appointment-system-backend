const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  available: { type: Boolean, required: true }
});

const contactSchema = new mongoose.Schema({
  phone: { type: String },
  location: { type: String }
});

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  specialty: { type: String, required: true },
  credentials: { type: String },
  approved: { type: Boolean, required: true },
  consultationFee: { type: Number, required: true },
  availability: [availabilitySchema],
  contact: contactSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('DoctorProfile', doctorProfileSchema, 'doctorProfiles');
