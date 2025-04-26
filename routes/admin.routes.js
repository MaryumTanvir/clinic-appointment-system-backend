const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// GET all pending doctor requests
router.get('/doctor-requests', adminController.getPendingDoctorRequests);

// PUT approve a doctor
router.put('/doctor-requests/:id/approve', adminController.approveDoctor);

// PUT reject a doctor
router.put('/doctor-requests/:id/reject', adminController.rejectDoctor);

// POST assign a shift to a doctor
router.post('/assign-shift', adminController.assignShift);

// GET all users (optional)
router.get('/users', adminController.getAllUsers);

// DELETE a doctor profile
router.delete('/doctors/:id', adminController.deleteDoctorProfile);

// Update Doctor Info
router.put('/doctors/:id', adminController.updateDoctorInfo);

module.exports = router;
