const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Update profile image
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const backendFilePath = path.join(__dirname, '../uploads', filename);
    const imageUrl = `/uploads/${filename}`;

    console.log('backendFilePath:', backendFilePath);
    console.log('imageUrl:', imageUrl);

    // Save to backend uploads
    fs.mkdirSync(path.dirname(backendFilePath), { recursive: true });
    fs.writeFileSync(backendFilePath, req.file.buffer);
    console.log('Saved to backend:', backendFilePath);

    // Delete old image if exists
    if (user.profileImage && user.profileImage !== '/Uploads/default.jpg') {
      const oldBackendPath = path.join(__dirname, '../', user.profileImage);
      if (fs.existsSync(oldBackendPath)) {
        fs.unlinkSync(oldBackendPath);
        console.log('Deleted old backend image:', oldBackendPath);
      }
    }

    // Update user profileImage
    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage: imageUrl }
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};