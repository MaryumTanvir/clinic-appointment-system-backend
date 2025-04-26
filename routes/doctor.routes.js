const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

const authMiddleware = require('../middlewares/auth.middleware');

/////// SHIFT ROUTES

// GET assigned shifts for the logged-in doctor
router.get('/shifts', authMiddleware, doctorController.getAssignedShifts);


/////// APPOINTMENT ROUTES

// GET appointments for the logged-in doctor
router.get('/appointments', authMiddleware, doctorController.getAppointments);

// PUT update appointment status
router.put('/appointments/:appointmentId/status', authMiddleware, doctorController.updateAppointmentStatus);


//////// FEEDBACK ROUTES

// GET feedback for the logged-in doctor
router.get('/feedback', authMiddleware, doctorController.getFeedback);

// PUT update feedback status
router.put('/feedback/:feedbackId/status', authMiddleware, doctorController.updateFeedbackStatus);


//////// DOCTOR PROFILE ROUTES

// GET doctor profile
router.get('/profile', authMiddleware, doctorController.getDoctorProfile);

// PUT update doctor profile
router.put('/profile', authMiddleware, doctorController.updateDoctorProfile);



module.exports = router;