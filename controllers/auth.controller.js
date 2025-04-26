const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const AdminProfile = require('../models/AdminProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, gender, email, password, role, profile } = req.body;
    // here profile includes info specific to the role
    // The image for profile would be added later

    // Validate required fields
    if (!firstName || !lastName || !gender || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }
    if (!['admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Invalid gender' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    // bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      gender,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create corresponding profile based on role
    if (role === 'patient') {
      const { age, contact, medicalHistory } = profile || {};
      await PatientProfile.create({
        userId: user._id,
        age,
        contact: contact || {},
        medicalHistory: medicalHistory || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else if (role === 'doctor') {
      const { specialty, credentials, consultationFee, availability, contact } = profile || {};
      if (!specialty || !consultationFee) {
        return res.status(400).json({ success: false, message: 'Specialty and consultationFee are required for doctor profile' });
      }
      await DoctorProfile.create({
        userId: user._id,
        specialty,
        credentials,
        approved: false, // Default to false, admin must approve
        consultationFee,
        availability: availability || [],
        contact: contact || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else if (role === 'admin') {
      const { department, designation, contact } = profile || {};
      await AdminProfile.create({
        userId: user._id,
        department,
        designation,
        contact: contact || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
