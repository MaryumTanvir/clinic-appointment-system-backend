const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET assigned shifts for the logged-in doctor
router.get('/shifts', authMiddleware, doctorController.getAssignedShifts);

module.exports = router;