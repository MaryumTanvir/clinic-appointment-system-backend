const Shift = require('../models/Shift');
const DoctorProfile = require('../models/DoctorProfile');

// Get assigned shifts for the logged-in doctor
exports.getAssignedShifts = async (req, res) => {
  try {
    console.log('getAssignedShifts - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const doctorId = req.user._id;

    // Validate if the user is a doctor
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Fetch assigned shifts
    const shifts = await Shift.find({ doctorId }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    console.error('Get assigned shifts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};