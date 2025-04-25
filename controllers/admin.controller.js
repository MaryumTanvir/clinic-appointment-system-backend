const DoctorRequest = require('../models/DoctorRequest');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Shift = require('../models/Shift');

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
    const updated = await DoctorRequest.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      reviewedAt: new Date()
    }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Doctor request not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor request rejected', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign shift to doctor
exports.assignShift = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, shiftType, location, createdBy } = req.body;

    const shift = await Shift.create({
      doctorId,
      date,
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
    res.status(500).json({ success: false, message: error.message });
  }
};

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
exports.deleteDoctorProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const profileDeleted = await DoctorProfile.deleteOne({ userId });
    const userDeleted = await User.deleteOne({ _id: userId });

    if (profileDeleted.deletedCount === 0 || userDeleted.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
