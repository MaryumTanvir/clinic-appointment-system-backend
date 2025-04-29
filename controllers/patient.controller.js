const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Payment = require('../models/Payment');
const Shift = require('../models/Shift');
const { parse, startOfDay, isValid } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');

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

    // Update doctor's availability to false for the booked slot
    doctorProfile.availability = doctorProfile.availability.map(avail => {
      const availDateOnly = new Date(avail.date);
      const appointmentDateOnly = new Date(appointmentDate);
      availDateOnly.setHours(0, 0, 0, 0);
      appointmentDateOnly.setHours(0, 0, 0, 0);

      if (
        availDateOnly.getTime() === appointmentDateOnly.getTime() &&
        avail.time === time &&
        avail.available
      ) {
        return { ...avail, available: false };
      }
      return avail;
    });

    // Save updated doctor profile
    await doctorProfile.save();

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

// Get Appointment (filter on date)
exports.getAppointments = async (req, res) => {
  try {
    console.log('getAppointments - req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const timeFilter = req.query.time;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateFilter = {};
    if (timeFilter === 'past') {
      dateFilter = { date: { $lt: today } };
    } else if (timeFilter === 'today') {
      dateFilter = { date: { $gte: today, $lt: tomorrow } };
    } else if (timeFilter === 'future') {
      dateFilter = { date: { $gte: tomorrow } };
    }

    const appointments = await Appointment.find({
      patientId,
      ...dateFilter
    })
      .populate('doctorId', 'firstName lastName')
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

exports.cancelAppointment = async (req, res) => {
  try {
    console.log('--- Cancel Appointment ---');

    if (!req.user) {
      console.log('User not authenticated');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const patientId = req.user._id;
    const appointmentId = req.params.id;

    console.log('Patient ID:', patientId);
    console.log('Appointment ID:', appointmentId);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log('Appointment not found');
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    console.log('Found Appointment:', appointment);

    if (appointment.patientId.toString() !== patientId.toString()) {
      console.log('Not authorized to cancel this appointment');
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      console.log(`Cannot cancel appointment with status: ${appointment.status}`);
      return res.status(400).json({ success: false, message: `Cannot cancel an appointment that is already ${appointment.status}` });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(appointment.date) < today) {
      console.log('Cannot cancel past appointments');
      return res.status(400).json({ success: false, message: 'Cannot cancel past appointments' });
    }

    // Cancel appointment
    appointment.status = 'cancelled';
    appointment.updatedAt = new Date();
    await appointment.save();

    console.log('Appointment status updated to cancelled');

    // Remove payment if pending
    const paymentDeleteResult = await Payment.deleteOne({ appointmentId, status: 'pending' });
    console.log('Payment delete result:', paymentDeleteResult);

    // Normalize date to match availability
    const normalizedDate = new Date(new Date(appointment.date).toISOString().split('T')[0]);
    console.log('Normalized appointment date:', normalizedDate);
    console.log('Time to match:', appointment.time);

    const updateResult = await DoctorProfile.updateOne(
      {
        userId: appointment.doctorId,
        availability: {
          $elemMatch: {
            date: normalizedDate,
            time: appointment.time
          }
        }
      },
      {
        $set: { 'availability.$.available': true }
      }
    );

    console.log('Doctor availability update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.warn('No matching availability slot found to update');
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    console.log('rescheduleAppointment - req.user:', req.user);
    console.log('rescheduleAppointment - req.body:', req.body);
    console.log('rescheduleAppointment - appointmentId:', req.params.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const appointmentId = req.params.id;
    const { date, time, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Date and time are required' });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    console.log('rescheduleAppointment - appointment:', appointment);

    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this appointment' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a cancelled appointment' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a completed appointment' });
    }

    // Parse date as UTC
    const newDate = new Date(date + 'T00:00:00.000Z');
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date' });
    }
    console.log('rescheduleAppointment - newDate:', newDate, 'newDate.getTime():', newDate.getTime());

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (newDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule to a past date' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId, approved: true });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found or not approved' });
    }
    console.log('rescheduleAppointment - doctorProfile.availability:', doctorProfile.availability);

    // Check if new slot is available
    const isAvailable = doctorProfile.availability.some(avail => {
      const availDate = new Date(avail.date);
      availDate.setUTCHours(0, 0, 0, 0);

      console.log('rescheduleAppointment - availability check:', {
        availDate,
        availDateTime: availDate.getTime(),
        newDate,
        newDateTime: newDate.getTime(),
        availTime: avail.time,
        requestedTime: time,
        available: avail.available
      });

      return availDate.getTime() === newDate.getTime() && avail.time === time && avail.available;
    });
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Doctor not available at the selected time' });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      time,
      status: { $in: ['scheduled', 'rescheduled'] },
      _id: { $ne: appointmentId }
    });
    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const formatDateString = dateObj => dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"

    const oldDateStr = formatDateString(appointment.date);
    const newDateStr = formatDateString(newDate);

    // Mark old slot as available
    await DoctorProfile.updateOne(
      { userId: appointment.doctorId, 'availability.date': oldDateStr, 'availability.time': appointment.time },
      { $set: { 'availability.$.available': true } }
    );

    // Mark new slot as unavailable
    await DoctorProfile.updateOne(
      { userId: appointment.doctorId },
      { $set: {'availability.$[elem].available': false}},
      { arrayFilters: [  { 'elem.date': newDateStr, 'elem.time': time }]}
    );
    

    console.log("Updating availability:", {
      old: { date: oldDateStr, time: appointment.time },
      new: { date: newDateStr, time: time }
    });

    
    // Update appointment
    appointment.date = newDate;
    appointment.time = time;
    appointment.notes = notes || appointment.notes;
    appointment.status = 'rescheduled';
    appointment.rescheduledFrom = appointment._id;
    appointment.updatedAt = new Date();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
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

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    console.log('updatePatientProfile - req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const patientId = req.user._id;
    const { firstName, lastName, email, gender, profile } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !gender) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and gender are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if patient exists and is a patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Check for duplicate email (excluding current user)
    const existingUser = await User.findOne({ email, _id: { $ne: patientId } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Update User
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.email = email;
    patient.gender = gender;
    patient.updatedAt = new Date();
    await patient.save();

    // Update or create PatientProfile
    let patientProfile = await PatientProfile.findOne({ userId: patientId });
    if (!patientProfile) {
      patientProfile = new PatientProfile({ userId: patientId });
    }

    if (profile) {
      if (profile.age !== undefined) patientProfile.age = profile.age;
      if (profile.contact) {
        patientProfile.contact = patientProfile.contact || {};
        if (profile.contact.phone) patientProfile.contact.phone = profile.contact.phone;
        if (profile.contact.address) patientProfile.contact.address = profile.contact.address;
      }
      if (profile.medicalHistory) {
        patientProfile.medicalHistory = Array.isArray(profile.medicalHistory)
          ? profile.medicalHistory
          : profile.medicalHistory.split(',').map(item => item.trim());
      }
    }
    patientProfile.updatedAt = new Date();
    await patientProfile.save();

    // Fetch updated data for response
    const updatedPatient = await User.findById(patientId).select('-password');
    const updatedProfile = await PatientProfile.findOne({ userId: patientId });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { ...updatedPatient._doc, profile: updatedProfile }
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
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

    const profile = await PatientProfile.findOne({ userId: patientId });
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
        profile,
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
    const { appointmentId, rating, comments } = req.body;
    const patientId = req.user._id;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback for this appointment' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed appointments' });
    }
    if (appointment.hasFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this appointment' });
    }

    // Create feedback
    const feedback = new Feedback({
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      rating,
      comments,
      status: 'pending'
    });
    await feedback.save();

    // Update appointment hasFeedback
    appointment.hasFeedback = true;
    appointment.updatedAt = new Date();
    await appointment.save();

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