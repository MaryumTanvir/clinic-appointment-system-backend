const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Appointment' },
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  rating: { type: Number, required: true },
  comments: String,
  createdAt: Date
});

module.exports = mongoose.model('Feedback', feedbackSchema, 'feedback');