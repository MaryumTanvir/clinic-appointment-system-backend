const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Appointment' },
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["paid", "pending"], required: true },
  method: String,
  paidAt: Date,
  createdAt: Date
});

module.exports = mongoose.model('Payment', paymentSchema, 'payments');