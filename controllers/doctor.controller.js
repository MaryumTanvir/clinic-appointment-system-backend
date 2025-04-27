const Shift = require('../models/Shift');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const mongoose = require('mongoose');


// Get assigned shifts for the logged-in doctor with filtering
exports.getAssignedShifts = async (req, res) => {
  try {
    console.log('getAssignedShifts - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const doctorId = req.user._id;
    const { filter } = req.query; // Get the filter from query parameters

    // Validate if the user is a doctor
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Determine the date range based on the filter
    const now = new Date(); // Current date and time
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
    let dateFilter = {};

    if (filter === 'past') {
      dateFilter = { date: { $lt: today } }; // Shifts before today
    } else if (filter === 'today') {
      dateFilter = { date: today }; // Shifts on today's date
    } else if (filter === 'future') {
      dateFilter = { date: { $gt: today } }; // Shifts after today
    }

    // Fetch assigned shifts based on the filter
    const shifts = await Shift.find({ doctorId, ...dateFilter }).sort({ date: 1 });

    // Adjust shifts that span across days (e.g., 17:00 to 01:00)
    const adjustedShifts = shifts.map(shift => {
      const shiftEndDate = new Date(shift.date);
      const [endHour, endMinute] = shift.endTime.split(':').map(Number);

      // If the shift ends after midnight, adjust the end date
      if (endHour < shift.startTime.split(':')[0]) {
        shiftEndDate.setDate(shiftEndDate.getDate() + 1);
      }

      return {
        ...shift._doc,
        endDate: shiftEndDate
      };
    });

    res.status(200).json({
      success: true,
      count: adjustedShifts.length,
      data: adjustedShifts
    });
  } catch (error) {
    console.error('Get assigned shifts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get appointments for the logged-in doctor with filtering
exports.getAppointments = async (req, res) => {
    try {
      console.log('getAppointments - req.user:', req.user); // Debug log
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
  
      const doctorId = req.user._id;
      const { filter } = req.query; // Get the filter from query parameters
  
      // Determine the date range based on the filter
      const now = new Date(); // Current date and time
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
      let dateFilter = {};
  
      if (filter === 'past') {
        dateFilter = { date: { $lt: today } }; // Appointments before today
      } else if (filter === 'today') {
        dateFilter = { date: today }; // Appointments on today's date
      } else if (filter === 'future') {
        dateFilter = { date: { $gt: today } }; // Appointments after today
      }
  
      // Fetch appointments based on the filter
      const appointments = await Appointment.find({ doctorId, ...dateFilter })
        .populate('patientId', 'firstName lastName email contact') // Populate patient details
        .sort({ date: 1, time: 1 });
  
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };


  // Update the status of an appointment
  exports.updateAppointmentStatus = async (req, res) => {
      try {
        console.log('updateAppointmentStatus - req.user:', req.user);
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
    
        const doctorId = req.user._id;
        const { appointmentId } = req.params;
        const { status } = req.body;
    
        console.log('appointmentId:', appointmentId);
        console.log('doctorId:', doctorId);
    
        if (!['completed', 'cancelled'].includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
    
        const appointment = await Appointment.findOne({
          _id: appointmentId,
          doctorId
        });
  
        console.log('Appointment found:', appointment);
    
        if (!appointment) {
          return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
    
        appointment.status = status;
        appointment.updatedAt = new Date();
        await appointment.save();
    
        res.status(200).json({
          success: true,
          message: `Appointment status updated to ${status}`,
          data: appointment
        });
      } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ success: false, message: error.message });
      }
  };
  

  // Feedback View
  // Get feedback for the logged-in doctor
exports.getFeedback = async (req, res) => {
    try {
      console.log('getFeedback - req.user:', req.user); // Debug log
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
  
      const doctorId = req.user._id;
  
      // Fetch feedback related to the doctor's past appointments
      const feedback = await Feedback.find({ doctorId })
        .populate('appointmentId', 'date time status') // Populate appointment details
        .populate('patientId', 'firstName lastName email') // Populate patient details
        .sort({ createdAt: -1 }); // Sort by most recent feedback
  
      res.status(200).json({
        success: true,
        count: feedback.length,
        data: feedback
      });
    } catch (error) {
      console.error('Get feedback error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };


// Feedback Update (reviewed)
// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
    try {
      console.log('updateFeedbackStatus - req.user:', req.user); // Debug log
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
  
      const doctorId = req.user._id;
      const { feedbackId } = req.params; // Get the feedback ID from the route parameter
      const { status } = req.body; // Get the new status from the request body
  
      console.log('feedbackId:', feedbackId);
      console.log('doctorId:', doctorId);
  
      // Validate the status
      if (!['reviewed', 'pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
  
      // Find the feedback and ensure it belongs to the logged-in doctor
      const feedback = await Feedback.findOne({ _id: feedbackId, doctorId });
      if (!feedback) {
        return res.status(404).json({ success: false, message: 'Feedback not found' });
      }
  
      // Update the status of the feedback
      feedback.status = status;
      await feedback.save();
  
      res.status(200).json({
        success: true,
        message: `Feedback status updated to ${status}`,
        data: feedback
      });
    } catch (error) {
      console.error('Update feedback status error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };



// Doctor Pofile View
// Get the profile of the logged-in doctor
exports.getDoctorProfile = async (req, res) => {
  try {
      console.log('getDoctorProfile - req.user:', req.user); // Debug log
      if (!req.user) {
          return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const doctorId = req.user._id;

      // Fetch the user details
      const user = await User.findById(doctorId);
      if (!user || user.role !== 'doctor') {
          return res.status(404).json({ success: false, message: 'Doctor user not found' });
      }

      // Fetch the doctor's profile
      const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
      if (!doctorProfile) {
          return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      // Combine user and doctor profile data
      const fullDoctorData = {
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          email: user.email,
          profileImage: user.profileImage,
          specialty: doctorProfile.specialty,
          credentials: doctorProfile.credentials,
          approved: doctorProfile.approved,
          consultationFee: doctorProfile.consultationFee,
          availability: doctorProfile.availability,
          contact: doctorProfile.contact,
          createdAt: doctorProfile.createdAt,
          updatedAt: doctorProfile.updatedAt
      };

      res.status(200).json({
          success: true,
          data: fullDoctorData
      });
  } catch (error) {
      console.error('Get doctor profile error:', error);
      res.status(500).json({ success: false, message: error.message });
  }
};

// Doctor Profile Update
// Update the profile of the logged-in doctor
exports.updateDoctorProfile = async (req, res) => {
  try {
      console.log('updateDoctorProfile - req.user:', req.user); // Debug log
      if (!req.user) {
          return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const doctorId = req.user._id;
      const updates = req.body; // Fields to update

      // Validate the doctor's profile exists
      const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
      if (!doctorProfile) {
          return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      // Check if the new email already exists in the database
      if (updates.email) {
          const existingUser = await User.findOne({ email: updates.email, _id: { $ne: doctorId } });
          if (existingUser) {
              return res.status(400).json({ success: false, message: 'Email is already in use by another user' });
          }
      }

      // Update the User model fields
      const userUpdateFields = {};
      const validUserFields = ['firstName', 'lastName', 'email', 'password', 'gender', 'profileImage'];
      for (const key in updates) {
          if (validUserFields.includes(key)) {
              userUpdateFields[key] = updates[key];
          }
      }
      userUpdateFields.updatedAt = new Date();

      const updatedUser = await User.findByIdAndUpdate(doctorId, userUpdateFields, { new: true });

      // Update the DoctorProfile model fields
      const doctorProfileUpdateFields = {};
      const validProfileFields = ['specialty', 'credentials', 'consultationFee', 'contact'];
      for (const key in updates) {
          if (validProfileFields.includes(key)) {
              doctorProfileUpdateFields[key] = updates[key];
          }
      }
      doctorProfileUpdateFields.updatedAt = new Date();

      const updatedDoctorProfile = await DoctorProfile.findOneAndUpdate(
          { userId: doctorId },
          doctorProfileUpdateFields,
          { new: true }
      );

      res.status(200).json({
          success: true,
          message: 'Doctor profile updated successfully',
          data: {
              user: updatedUser,
              doctorProfile: updatedDoctorProfile
          }
      });
  } catch (error) {
      console.error('Update doctor profile error:', error);
      res.status(500).json({ success: false, message: error.message });
  }
};
  