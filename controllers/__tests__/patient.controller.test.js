const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  searchDoctors,
  getDoctorInfo,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboard,
  submitFeedback,
  getPaymentDetails,
  makePayment,
} = require('../patient.controller');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const PatientProfile = require('../../models/PatientProfile');
const Appointment = require('../../models/Appointment');
const Payment = require('../../models/Payment');
const Feedback = require('../../models/Feedback');

let app, mongod, server;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.get('/api/patients/doctors', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    searchDoctors(req, res);
  });
  app.get('/api/patients/doctors/:id', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    getDoctorInfo(req, res);
  });
  app.post('/api/patients/appointments', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    bookAppointment(req, res);
  });
  app.get('/api/patients/appointments', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    getAppointments(req, res);
  });
  app.put('/api/patients/appointments/:id/cancel', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    cancelAppointment(req, res);
  });
  app.put('/api/patients/appointments/:id/reschedule', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    rescheduleAppointment(req, res);
  });
  app.get('/api/patients/profile', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    getPatientProfile(req, res);
  });
  app.put('/api/patients/profile', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    updatePatientProfile(req, res);
  });
  app.get('/api/patients/dashboard', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    getPatientDashboard(req, res);
  });
  app.post('/api/patients/feedback', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    submitFeedback(req, res);
  });
  app.get('/api/patients/payments', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    getPaymentDetails(req, res);
  });
  app.post('/api/patients/payments', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d') };
    makePayment(req, res);
  });

  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
});

describe('Patient Controller', () => {
  let patient, doctor, doctorProfile, appointment, payment, patientProfile;
  let consoleLogSpy, consoleWarnSpy, consoleErrorSpy;

  beforeEach(async () => {
    patient = await User.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d'),
      email: 'ahmed@clinic.com',
      role: 'patient',
      firstName: 'Ahmed',
      lastName: 'Khan',
      gender: 'male',
      password: 'testpassword',
    });

    doctor = await User.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a'),
      email: 'areeba@clinic.com',
      role: 'doctor',
      firstName: 'Areeba',
      lastName: 'Khan',
      password: 'testpassword',
    });

    doctorProfile = await DoctorProfile.create({
      userId: doctor._id,
      approved: true,
      specialty: 'Dermatology',
      consultationFee: 100,
      availability: [
        { date: new Date('2025-04-30T00:00:00.000Z'), time: '11:00', available: false },
        { date: new Date('2025-05-03T00:00:00.000Z'), time: '10:00', available: true },
      ],
    });

    patientProfile = await PatientProfile.create({
      userId: patient._id,
      age: 30,
      contact: { phone: '1234567890', address: '123 Main St' },
      medicalHistory: ['Allergies'],
    });

    appointment = await Appointment.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f8a1'),
      patientId: patient._id,
      doctorId: doctor._id,
      date: new Date('2025-04-30T00:00:00.000Z'),
      time: '11:00',
      status: 'scheduled',
      notes: 'Follow-up for skin rash',
    });

    payment = await Payment.create({
      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctor._id,
      amount: 100,
      status: 'pending',
    });

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    await PatientProfile.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Feedback.deleteMany({});
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment successfully and update availability', async () => {
      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/cancel')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment cancelled successfully');
      expect(response.body.data.status).toBe('cancelled');

      const updatedAppointment = await Appointment.findById('6810772062f60d43bab5f8a1');
      expect(updatedAppointment.status).toBe('cancelled');

      const updatedProfile = await DoctorProfile.findOne({ userId: doctor._id });
      const slot = updatedProfile.availability.find(
        (avail) => avail.date.getTime() === new Date('2025-04-30T00:00:00.000Z').getTime() && avail.time === '11:00'
      );
      expect(slot.available).toBe(true);

      const deletedPayment = await Payment.findOne({ appointmentId: '6810772062f60d43bab5f8a1' });
      expect(deletedPayment).toBeNull();

      expect(consoleLogSpy).toHaveBeenCalledWith('Normalized appointment date:', expect.any(Date));
      expect(consoleLogSpy).toHaveBeenCalledWith('Time to match:', '11:00');
      expect(consoleLogSpy).toHaveBeenCalledWith('Appointment status updated to cancelled');
    });

    it('should return 400 for past appointment', async () => {
      await Appointment.updateOne(
        { _id: '6810772062f60d43bab5f8a1' },
        { date: new Date('2025-04-28T00:00:00.000Z') }
      );

      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/cancel')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot cancel past appointments');
      expect(consoleLogSpy).toHaveBeenCalledWith('Cannot cancel past appointments');
    });

    it('should return 400 for already cancelled appointment', async () => {
      await Appointment.updateOne(
        { _id: '6810772062f60d43bab5f8a1' },
        { status: 'cancelled' }
      );

      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/cancel')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot cancel an appointment that is already cancelled');
      expect(consoleLogSpy).toHaveBeenCalledWith('Cannot cancel appointment with status: cancelled');
    });

    it('should warn if no matching availability slot is found', async () => {
      await DoctorProfile.updateOne(
        { userId: doctor._id },
        { $set: { 'availability.0.date': new Date('2025-05-01T00:00:00.000Z') } }
      );

      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/cancel')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No matching availability slot found to update');
    });

    
    it('should return 403 if user is not authorized', async () => {
      await Appointment.updateOne(
        { _id: '6810772062f60d43bab5f8a1' },
        { patientId: new mongoose.Types.ObjectId('6810772062f60d43bab5f89e') }
      );

      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/cancel')
        .send({})
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to cancel this appointment');
      expect(consoleLogSpy).toHaveBeenCalledWith('Not authorized to cancel this appointment');
    });
  });

  describe('rescheduleAppointment', () => {
    it('should reschedule appointment successfully', async () => {
      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/reschedule')
        .send({
          date: '2025-05-03',
          time: '10:00',
          notes: 'Follow-up for skin rash',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment rescheduled successfully');
      expect(response.body.data.date).toBe('2025-05-03T00:00:00.000Z');
      expect(response.body.data.time).toBe('10:00');
      expect(response.body.data.status).toBe('rescheduled');

      const updatedAppointment = await Appointment.findById('6810772062f60d43bab5f8a1');
      expect(updatedAppointment.date).toEqual(new Date('2025-05-03T00:00:00.000Z'));

      const updatedProfile = await DoctorProfile.findOne({ userId: doctor._id });
      const newSlot = updatedProfile.availability.find(
        (avail) => avail.date.getTime() === new Date('2025-05-03T00:00:00.000Z').getTime() && avail.time === '10:00'
      );
      const oldSlot = updatedProfile.availability.find(
        (avail) => avail.date.getTime() === new Date('2025-04-30T00:00:00.000Z').getTime() && avail.time === '11:00'
      );
      expect(newSlot.available).toBe(false);
      expect(oldSlot.available).toBe(true);
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/reschedule')
        .send({
          date: 'invalid-date',
          time: '10:00',
          notes: 'Follow-up for skin rash',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid date format. Use YYYY-MM-DD');
    });

    it('should return 400 if doctor is not available', async () => {
      const response = await request(app)
        .put('/api/patients/appointments/6810772062f60d43bab5f8a1/reschedule')
        .send({
          date: '2025-05-02',
          time: '10:00',
          notes: 'Follow-up for skin rash',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor not available at the selected time');
    });
    
  });

  describe('bookAppointment', () => {
    it('should book appointment successfully', async () => {
      const response = await request(app)
        .post('/api/patients/appointments')
        .send({
          doctorId: '6810772062f60d43bab5f89a',
          date: '2025-05-03',
          time: '10:00',
          notes: 'Initial consultation',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment booked successfully');
      expect(response.body.data.date).toBe('2025-05-03T00:00:00.000Z');
      expect(response.body.data.time).toBe('10:00');
      expect(response.body.data.status).toBe('scheduled');

      const newAppointment = await Appointment.findOne({ doctorId: '6810772062f60d43bab5f89a', date: new Date('2025-05-03T00:00:00.000Z') });
      expect(newAppointment).toBeTruthy();

      const updatedProfile = await DoctorProfile.findOne({ userId: '6810772062f60d43bab5f89a' });
      const slot = updatedProfile.availability.find(
        (avail) => avail.date.getTime() === new Date('2025-05-03T00:00:00.000Z').getTime() && avail.time === '10:00'
      );
      expect(slot.available).toBe(false);

      const newPayment = await Payment.findOne({ appointmentId: newAppointment._id });
      expect(newPayment.status).toBe('pending');
      expect(newPayment.amount).toBe(100);
    });

    it('should return 400 for past date', async () => {
      const response = await request(app)
        .post('/api/patients/appointments')
        .send({
          doctorId: '6810772062f60d43bab5f89a',
          date: '2025-04-28',
          time: '10:00',
          notes: 'Initial consultation',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot book appointments in the past');
    });

    it('should return 400 if slot is not available', async () => {
      await DoctorProfile.updateOne(
        { userId: '6810772062f60d43bab5f89a', 'availability.date': new Date('2025-05-03T00:00:00.000Z'), 'availability.time': '10:00' },
        { $set: { 'availability.$.available': false } }
      );

      const response = await request(app)
        .post('/api/patients/appointments')
        .send({
          doctorId: '6810772062f60d43bab5f89a',
          date: '2025-05-03',
          time: '10:00',
          notes: 'Initial consultation',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor not available at the selected time');
    });
  });

  describe('searchDoctors', () => {
    it('should search doctors by specialty', async () => {
      const response = await request(app)
        .get('/api/patients/doctors')
        .query({ specialty: 'Dermatology' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].firstName).toBe('Areeba');
      expect(response.body.data[0].profile.specialty).toBe('Dermatology');
    });
  });

  describe('getDoctorInfo', () => {
    it('should get doctor info', async () => {
      const response = await request(app)
        .get('/api/patients/doctors/6810772062f60d43bab5f89a')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Areeba');
      expect(response.body.data.profile.specialty).toBe('Dermatology');
    });

    it('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .get('/api/patients/doctors/6810772062f60d43bab5f89b')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('getAppointments', () => {
    it('should get future appointments', async () => {
      const response = await request(app)
        .get('/api/patients/appointments')
        .query({ time: 'future' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].date).toBe('2025-04-30T00:00:00.000Z');
    });
  });

  describe('getPatientProfile', () => {
    it('should get patient profile', async () => {
      const response = await request(app)
        .get('/api/patients/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Ahmed');
      expect(response.body.data.profile.age).toBe(30);
    });
  });

  describe('updatePatientProfile', () => {
    it('should update patient profile', async () => {
      const response = await request(app)
        .put('/api/patients/profile')
        .send({
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed.new@clinic.com',
          gender: 'male',
          profile: { age: 31, contact: { phone: '0987654321' } },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.email).toBe('ahmed.new@clinic.com');
      expect(response.body.data.profile.age).toBe(31);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .put('/api/patients/profile')
        .send({
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'invalid-email',
          gender: 'male',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });
  });

  describe('getPatientDashboard', () => {
    it('should get patient dashboard', async () => {
      const response = await request(app)
        .get('/api/patients/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.age).toBe(30);
      expect(response.body.data.appointments.length).toBe(1);
      expect(response.body.data.payments.length).toBe(1);
      expect(response.body.data.feedback.length).toBe(0);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback for completed appointment', async () => {
      await Appointment.updateOne(
        { _id: '6810772062f60d43bab5f8a1' },
        { status: 'completed' }
      );

      const response = await request(app)
        .post('/api/patients/feedback')
        .send({
          appointmentId: '6810772062f60d43bab5f8a1',
          rating: 5,
          comments: 'Great service',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback submitted successfully');
      expect(response.body.data.rating).toBe(5);

      const updatedAppointment = await Appointment.findById('6810772062f60d43bab5f8a1');
      expect(updatedAppointment.hasFeedback).toBe(true);
    });

    it('should return 400 for non-completed appointment', async () => {
      const response = await request(app)
        .post('/api/patients/feedback')
        .send({
          appointmentId: '6810772062f60d43bab5f8a1',
          rating: 5,
          comments: 'Great service',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Feedback can only be submitted for completed appointments');
    });
  });

  describe('getPaymentDetails', () => {
    it('should get payment details', async () => {
      const response = await request(app)
        .get('/api/patients/payments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].amount).toBe(100);
      expect(response.body.data[0].status).toBe('pending');
    });
  });

  describe('makePayment', () => {
    it('should process payment successfully', async () => {
      const response = await request(app)
        .post('/api/patients/payments')
        .send({
          appointmentIds: ['6810772062f60d43bab5f8a1'],
          method: 'credit_card',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payments processed successfully');
      expect(response.body.data[0].status).toBe('paid');
      expect(response.body.data[0].method).toBe('credit_card');
    });

    it('should return 400 for invalid appointment', async () => {
      const response = await request(app)
        .post('/api/patients/payments')
        .send({
          appointmentIds: ['6810772062f60d43bab5f89b'],
          method: 'credit_card',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].error).toBe('Appointment not found or not authorized');
    });
  });
});