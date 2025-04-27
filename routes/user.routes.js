const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

console.log('updateProfileImage:', userController.updateProfileImage);

// Upload profile image (all roles)
router.put('/profile/image', authMiddleware, userController.updateProfileImage);

module.exports = router;