const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.use(authMiddleware)

// GET admin profile
router.get('/profile', adminController.getAdminProfile);

// PUT update admin profile
router.put('/profile', adminController.updateAdminProfile);

// GET all pending doctor requests
router.get('/doctor-requests', adminController.getPendingDoctorRequests);

// PUT approve a doctor
router.put('/doctor-requests/:id/approve', adminController.approveDoctor);

// PUT reject a doctor
router.put('/doctor-requests/:id/reject', adminController.rejectDoctor);

// POST assign a shift to a doctor
router.post('/assign-shift', adminController.assignShift);

//GET shifts
router.get('/shifts', adminController.getAllShifts);

// GET all users (optional)
router.get('/users', adminController.getAllUsers);

// GET single doctor info
router.get('/doctors/:id', adminController.getDoctorInfo);

// GET all doctors
router.get('/doctors', adminController.getAllDoctors);


// DELETE a doctor profile
router.delete('/doctors/:id', adminController.deleteDoctorProfile);

// Update Doctor Info
router.put('/doctors/:id', adminController.updateDoctorInfo);

module.exports = router;
