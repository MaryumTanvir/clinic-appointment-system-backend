const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const {
  getAssignedShifts,
  getAppointments,
  updateAppointmentStatus,
  updateAvailabilityAfterAppointment,
  getFeedback,
  updateFeedbackStatus,
  getDoctorProfile,
  updateDoctorProfile,
} = require('../doctor.controller');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const PatientProfile = require('../../models/PatientProfile');
const Shift = require('../../models/Shift');
const Appointment = require('../../models/Appointment');
const Feedback = require('../../models/Feedback');

let app, mongod, server;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  // Define routes without authMiddleware
  app.get('/api/doctor/shifts', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    getAssignedShifts(req, res);
  });
  app.get('/api/doctor/appointments', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    getAppointments(req, res);
  });
  app.put('/api/doctor/appointments/:appointmentId/status', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    updateAppointmentStatus(req, res);
  });
  app.put('/api/doctor/appointments/:appointmentId/availability', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    updateAvailabilityAfterAppointment(req, res);
  });
  app.get('/api/doctor/feedback', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    getFeedback(req, res);
  });
  app.put('/api/doctor/feedback/:feedbackId/status', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    updateFeedbackStatus(req, res);
  });
  app.get('/api/doctor/profile', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    getDoctorProfile(req, res);
  });
  app.put('/api/doctor/profile', (req, res) => {
    req.user = { _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a') };
    updateDoctorProfile(req, res);
  });

  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
});

describe('Doctor Controller', () => {
  let doctor, patient, doctorProfile, patientProfile, shift, appointment, feedback;
  let consoleErrorSpy, consoleLogSpy;

  beforeEach(async () => {
    // Mock bcrypt.hash
    jest.spyOn(bcrypt, 'hash').mockImplementation(async (password, salt) => `hashed_${password}`);

    doctor = await User.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89a'),
      firstName: 'Areeba',
      lastName: 'Khan',
      gender: 'female',
      email: 'areeba@clinic.com',
      password: 'hashedDoctor1',
      role: 'doctor',
      profileImage: 'https://example.com/doctor1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    patient = await User.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d'),
      firstName: 'Ahmed',
      lastName: 'Khan',
      gender: 'male',
      email: 'ahmed@clinic.com',
      password: 'hashedPatient1',
      role: 'patient',
      profileImage: 'https://example.com/patient1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    doctorProfile = await DoctorProfile.create({
      userId: doctor._id,
      specialty: 'Dermatology',
      credentials: 'MBBS, FCPS',
      approved: true,
      consultationFee: 2500,
      availability: [
        { date: new Date('2025-04-30T00:00:00.000Z'), time: '10:00', available: true },
        { date: new Date('2025-05-01T00:00:00.000Z'), time: '11:00', available: true },
        { date: new Date('2025-05-02T00:00:00.000Z'), time: '10:00', available: false },
      ],
      contact: { phone: '03111234567', location: 'Skin Ward' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    patientProfile = await PatientProfile.create({
      userId: patient._id,
      age: 29,
      contact: { phone: '03001234567', address: 'Lahore' },
      medicalHistory: ['Hypertension'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    shift = await Shift.create({
      doctorId: doctor._id,
      date: new Date('2025-05-01T00:00:00.000Z'),
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'morning',
      location: 'Skin Ward',
      createdBy: new mongoose.Types.ObjectId('6810772062f60d43bab5f89c'),
      createdAt: new Date(),
    });

    appointment = await Appointment.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f8a1'),
      patientId: patient._id,
      doctorId: doctor._id,
      date: new Date('2025-05-01T00:00:00.000Z'),
      time: '11:00',
      status: 'scheduled',
      notes: 'Follow-up for skin rash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    feedback = await Feedback.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f8a2'),
      appointmentId: appointment._id,
      patientId: patient._id,
      doctorId: doctor._id,
      rating: 4.5,
      comments: 'Great consultation',
      status: 'pending',
      createdAt: new Date(),
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    await PatientProfile.deleteMany({});
    await Shift.deleteMany({});
    await Appointment.deleteMany({});
    await Feedback.deleteMany({});
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('getAssignedShifts', () => {

    it('should return 404 if doctor profile not found', async () => {
      await DoctorProfile.deleteOne({ userId: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .get('/api/doctor/shifts')
        .query({ filter: 'today' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor profile not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.get('/api/doctor/shifts', (req, res) => {
        req.user = null;
        getAssignedShifts(req, res);
      });

      const response = await request(unauthenticatedApp)
        .get('/api/doctor/shifts')
        .query({ filter: 'today' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('getAppointments', () => {

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.get('/api/doctor/appointments', (req, res) => {
        req.user = null;
        getAppointments(req, res);
      });

      const response = await request(unauthenticatedApp)
        .get('/api/doctor/appointments')
        .query({ filter: 'today' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status to completed', async () => {
      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/status')
        .send({ status: 'completed', notes: 'Completed consultation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment status updated to completed');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.notes).toBe('Completed consultation');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/status')
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status value');
    });

    it('should return 404 if appointment not found', async () => {
      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f89f/status')
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.put('/api/doctor/appointments/:appointmentId/status', (req, res) => {
        req.user = null;
        updateAppointmentStatus(req, res);
      });

      const response = await request(unauthenticatedApp)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/status')
        .send({ status: 'completed' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('updateAvailabilityAfterAppointment', () => {

    it('should return 400 if appointment not completed', async () => {
      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/availability')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Availability only updated for completed appointments');
    });

    it('should return 404 if appointment not found', async () => {
      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f89f/availability')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 404 if doctor profile not found', async () => {
      await DoctorProfile.deleteOne({ userId: '6810772062f60d43bab5f89a' });
      await Appointment.updateOne(
        { _id: '6810772062f60d43bab5f8a1' },
        { status: 'completed' }
      );

      const response = await request(app)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/availability')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor profile not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.put('/api/doctor/appointments/:appointmentId/availability', (req, res) => {
        req.user = null;
        updateAvailabilityAfterAppointment(req, res);
      });

      const response = await request(unauthenticatedApp)
        .put('/api/doctor/appointments/6810772062f60d43bab5f8a1/availability')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('getFeedback', () => {
    it('should get feedback successfully', async () => {
      const response = await request(app)
        .get('/api/doctor/feedback')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].rating).toBe(4.5);
      expect(response.body.data[0].patientId.firstName).toBe('Ahmed');
    });

    it('should return empty array if no feedback', async () => {
      await Feedback.deleteMany({});
      const response = await request(app)
        .get('/api/doctor/feedback')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.get('/api/doctor/feedback', (req, res) => {
        req.user = null;
        getFeedback(req, res);
      });

      const response = await request(unauthenticatedApp)
        .get('/api/doctor/feedback')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update feedback status to reviewed', async () => {
      const response = await request(app)
        .put('/api/doctor/feedback/6810772062f60d43bab5f8a2/status')
        .send({ status: 'reviewed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback status updated to reviewed');
      expect(response.body.data.status).toBe('reviewed');

      const updatedFeedback = await Feedback.findById('6810772062f60d43bab5f8a2');
      expect(updatedFeedback.status).toBe('reviewed');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/doctor/feedback/6810772062f60d43bab5f8a2/status')
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status value');
    });

    it('should return 404 if feedback not found', async () => {
      const response = await request(app)
        .put('/api/doctor/feedback/6810772062f60d43bab5f89f/status')
        .send({ status: 'reviewed' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Feedback not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.put('/api/doctor/feedback/:feedbackId/status', (req, res) => {
        req.user = null;
        updateFeedbackStatus(req, res);
      });

      const response = await request(unauthenticatedApp)
        .put('/api/doctor/feedback/6810772062f60d43bab5f8a2/status')
        .send({ status: 'reviewed' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('getDoctorProfile', () => {
    it('should get doctor profile successfully', async () => {
      const response = await request(app)
        .get('/api/doctor/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Areeba');
      expect(response.body.data.specialty).toBe('Dermatology');
      expect(response.body.data.consultationFee).toBe(2500);
    });

    it('should return 404 if doctor user not found', async () => {
      await User.deleteOne({ _id: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .get('/api/doctor/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor user not found');
    });

    it('should return 404 if doctor profile not found', async () => {
      await DoctorProfile.deleteOne({ userId: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .get('/api/doctor/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor profile not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.get('/api/doctor/profile', (req, res) => {
        req.user = null;
        getDoctorProfile(req, res);
      });

      const response = await request(unauthenticatedApp)
        .get('/api/doctor/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('updateDoctorProfile', () => {

    it('should return 400 if email is already in use', async () => {
      await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'other@clinic.com',
        password: 'hashedOther',
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/doctor/profile')
        .send({ email: 'other@clinic.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email is already in use by another user');
    });

    it('should return 404 if doctor profile not found', async () => {
      await DoctorProfile.deleteOne({ userId: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .put('/api/doctor/profile')
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor profile not found');
    });

    it('should return 401 if user is not authenticated', async () => {
      const unauthenticatedApp = express();
      unauthenticatedApp.use(express.json());
      unauthenticatedApp.put('/api/doctor/profile', (req, res) => {
        req.user = null;
        updateDoctorProfile(req, res);
      });

      const response = await request(unauthenticatedApp)
        .put('/api/doctor/profile')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not authenticated');
    });
  });
});
