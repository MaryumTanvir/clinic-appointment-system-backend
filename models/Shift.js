const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  shiftType: { type: String, enum: ["morning", "evening", "night"], required: true },
  location: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: Date
});

module.exports = mongoose.model('Shift', shiftSchema, 'shifts');