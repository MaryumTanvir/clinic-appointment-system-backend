const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Payment = require('../models/Payment');
const Shift = require('../models/Shift');

///// Manage Patient Requests

// Search and filter doctors
exports.searchDoctors = async (req, res) => {
  try {
    const { specialty, name, available } = req.query;
    const query = { role: 'doctor' };

    // Filter by specialty if provided
    if (specialty) {
      const doctorProfiles = await DoctorProfile.find({ specialty });
      const userIds = doctorProfiles.map(profile => profile.userId);
      query._id = { $in: userIds };
    }

    // Filter by name (firstName or lastName)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by availability if requested
    let doctors = await User.find(query).select('-password');
    if (available === 'true') {
      const availableDoctors = await DoctorProfile.find({
        availability: { $elemMatch: { available: true } }
      });
      const availableUserIds = availableDoctors.map(profile => profile.userId);
      doctors = doctors.filter(doctor => availableUserIds.includes(doctor._id.toString()));
    }

    // Populate doctor profiles
    doctors = await Promise.all(doctors.map(async (doctor) => {
      const profile = await DoctorProfile.findOne({ userId: doctor._id });
      return { ...doctor._doc, profile };
    }));

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get specific doctor info
exports.getDoctorInfo = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const profile = await DoctorProfile.findOne({ userId: doctorId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      data: { ...doctor._doc, profile }
    });
  } catch (error) {
    console.error('Get doctor info error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  try {
    console.log('bookAppointment - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const { doctorId, date, time, notes } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Validate doctor profile and availability
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId, approved: true });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found or not approved' });
    }

    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if appointment is in the future
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past' });
    }

    // Check availability
    const isAvailable = doctorProfile.availability.some(avail => {
        const availDateOnly = new Date(avail.date);
        const appointmentDateOnly = new Date(appointmentDate);
      
        // Set both dates to midnight to compare only the date part
        availDateOnly.setHours(0, 0, 0, 0);
        appointmentDateOnly.setHours(0, 0, 0, 0);
      
        return (
          availDateOnly.getTime() === appointmentDateOnly.getTime() &&
          avail.time === time &&
          avail.available === true
        );
    });
      

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Doctor not available at the selected time' });
    }

    // Check for existing appointments
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['scheduled', 'rescheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: appointmentDate,
      time,
      notes: notes || '', 
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create pending payment
    await Payment.create({
      appointmentId: appointment._id,
      patientId,
      doctorId,
      amount: doctorProfile.consultationFee,
      status: 'pending',
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient profile
exports.getPatientProfile = async (req, res) => {
  try {
    console.log('getPatientProfile - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const patient = await User.findById(patientId).select('-password');
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    res.status(200).json({
      success: true,
      data: { ...patient._doc, profile }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient dashboard
exports.getPatientDashboard = async (req, res) => {
  try {
    console.log('getPatientDashboard - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;

    // Fetch appointments
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'firstName lastName')
      .sort({ date: -1 });

    // Fetch recent payments
    const payments = await Payment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent feedback
    const feedback = await Feedback.find({ patientId })
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        payments,
        feedback
      }
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    console.log('submitFeedback - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const { appointmentId, rating, comments } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== patientId.toString()) {
      return res.status(404).json({ success: false, message: 'Appointment not found or not authorized' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ appointmentId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this appointment' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      rating,
      comments,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    console.log('getPaymentDetails - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;

    const payments = await Payment.find({ patientId })
      .populate('appointmentId', 'date time status')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Make a payment (can be for multiple appointments)
exports.makePayment = async (req, res) => {
  try {
    console.log('makePayment - req.user:', req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const { appointmentIds, method } = req.body;

    if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0 || !method) {
      return res.status(400).json({ success: false, message: 'appointmentIds (array) and method are required' });
    }

    const results = [];
    const errors = [];

    for (const appointmentId of appointmentIds) {
      try {
        // Validate appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || appointment.patientId.toString() !== patientId.toString()) {
          errors.push({ appointmentId, error: 'Appointment not found or not authorized' });
          continue;
        }

        // Find pending payment
        const payment = await Payment.findOne({ appointmentId, status: 'pending' });
        if (!payment) {
          errors.push({ appointmentId, error: 'No pending payment found for this appointment' });
          continue;
        }

        // Validate doctor profile
        const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId });
        if (!doctorProfile) {
          errors.push({ appointmentId, error: 'Doctor profile not found' });
          continue;
        }

        // Update payment to paid
        payment.status = 'paid';
        payment.method = method;
        payment.paidAt = new Date();
        await payment.save();

        results.push(payment);
      } catch (error) {
        errors.push({ appointmentId, error: error.message });
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No payments were processed successfully',
        errors
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payments processed successfully',
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Make payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};