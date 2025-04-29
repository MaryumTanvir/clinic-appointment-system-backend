const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["scheduled", "completed", "cancelled", "rescheduled"], required: true },
  notes: String,
  hasFeedback: { type: Boolean, default: false },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Appointment', appointmentSchema, 'appointments');