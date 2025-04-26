const mongoose = require('mongoose');
const AdminProfile = require('../models/AdminProfile');
const DoctorRequest = require('../models/DoctorRequest');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Appointment = require('../models/Appointment');



/////////// Manage Admin


exports.getAdminProfile = async (req, res) => {
  try {
    const adminUserId = req.user.id;

    const user = await User.findById(adminUserId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const adminProfile = await AdminProfile.findOne({ userId: adminUserId });
    if (!adminProfile) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }

    const fullAdminData = {
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      email: user.email,
      profileImage: user.profileImage,
      department: adminProfile.department,
      designation: adminProfile.designation,
      contact: adminProfile.contact,
      createdAt: adminProfile.createdAt,
      updatedAt: adminProfile.updatedAt
    };

    res.status(200).json({
      success: true,
      data: fullAdminData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




/////////  Manage Doctor Requests

// Get all pending doctor requests
exports.getPendingDoctorRequests = async (req, res) => {
  try {
    const requests = await DoctorRequest.find({ status: 'pending' });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.approveDoctor = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Fetch the doctor request
    const request = await DoctorRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Doctor request not found'
      });
    }

    if (request.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This doctor request is already approved'
      });
    }
    

    // Update status and reviewedAt
    request.status = 'approved';
    request.reviewedAt = new Date();
    await request.save();

    // Create the user
    const user = await User.create({
      firstName: request.firstName,
      lastName: request.lastName,
      gender: request.gender,
      email: request.email,
      password: request.password,
      role: 'doctor',
      profileImage: request.profileImage,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create the doctor profile
    const doctorProfile = await DoctorProfile.create({
      userId: user._id,
      specialty: request.specialty,
      credentials: request.credentials,
      approved: true,
      consultationFee: 2500,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor approved and created successfully',
      data: {
        user,
        doctorProfile
      }
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};


// Reject a doctor request
exports.rejectDoctor = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find and update the doctor request
    const updatedRequest = await DoctorRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'rejected',
        reviewedAt: new Date()
      },
      { new: true } // return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Doctor request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor request rejected successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.assignShift = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, shiftType, location, createdBy } = req.body;

    // Check: Date must not be in the past
    if (new Date(date) < new Date()) {
      return res.status(400).json({ success: false, message: "Cannot assign shift in the past" });
    }

    // Check: Doctor must not already have a shift assigned on the same date
    const existingShift = await Shift.findOne({
      doctorId,
      date: new Date(date)
    });

    if (existingShift) {
      return res.status(400).json({ success: false, message: "Doctor already has a shift assigned on this date" });
    }

    // If no conflicts, assign shift
    const shift = await Shift.create({
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      shiftType,
      location,
      createdBy,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Shift assigned successfully',
      data: shift
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/////////// Manage Doctors 

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete doctor profile
// Delete doctor profile (only if no appointments)
exports.deleteDoctorProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if doctor has any appointments
    const existingAppointments = await Appointment.find({ doctorId: userId });

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete doctor. Doctor has active or past appointments.'
      });
    }

    // If no appointments, proceed to delete
    const deletedProfile = await DoctorProfile.findOneAndDelete({ userId });
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedProfile || !deletedUser) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully',
      deletedProfile,
      deletedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor Info
exports.updateDoctorInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, gender, specialty, credentials, consultationFee, phone, location } = req.body;

    // Update user basic info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        gender,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Update doctor profile info
    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { userId: userId },
      {
        specialty,
        credentials,
        consultationFee,
        'contact.phone': phone,
        'contact.location': location,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser || !updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor info updated successfully',
      data: {
        user: updatedUser,
        doctorProfile: updatedProfile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
