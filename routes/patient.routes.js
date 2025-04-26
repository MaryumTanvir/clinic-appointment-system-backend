const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

// POST /api/patients/login
router.post('/login', authController.patientlogin);

// GET all doctors with search and filter
router.get('/doctors', authMiddleware, patientController.searchDoctors);

// GET specific doctor info by ID
router.get('/doctors/:id', authMiddleware, patientController.getDoctorInfo);

// POST book an appointment with a doctor for a specific time slot
router.post('/appointments', authMiddleware, patientController.bookAppointment);

// GET patient profile info
router.get('/profile', authMiddleware, patientController.getPatientProfile);

// GET patient dashboard (appointment history and other info)
router.get('/dashboard', authMiddleware, patientController.getPatientDashboard);

// POST submit feedback for an appointment
router.post('/feedback', authMiddleware, patientController.submitFeedback);

// GET payment details for patient
router.get('/payments', authMiddleware, patientController.getPaymentDetails);

// POST make a payment for an appointment
router.post('/payments', authMiddleware, patientController.makePayment);

module.exports = router;