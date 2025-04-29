const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  getAdminProfile,
  updateAdminProfile,
  getPendingDoctorRequests,
  approveDoctor,
  rejectDoctor,
  assignShift,
  getAllShifts,
  getAllUsers,
  getDoctorInfo,
  getAllDoctors,
  deleteDoctorProfile,
  updateDoctorInfo,
} = require('../admin.controller');
const User = require('../../models/User');
const AdminProfile = require('../../models/AdminProfile');
const DoctorRequest = require('../../models/DoctorRequest');
const DoctorProfile = require('../../models/DoctorProfile');
const Shift = require('../../models/Shift');
const Appointment = require('../../models/Appointment');

let app, mongod, server;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  // Define routes without authMiddleware
  app.get('/api/admin/profile', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getAdminProfile(req, res);
  });
  app.put('/api/admin/profile', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    updateAdminProfile(req, res);
  });
  app.get('/api/admin/doctor-requests', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getPendingDoctorRequests(req, res);
  });
  app.put('/api/admin/doctor-requests/:id/approve', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    approveDoctor(req, res);
  });
  app.put('/api/admin/doctor-requests/:id/reject', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    rejectDoctor(req, res);
  });
  app.post('/api/admin/assign-shift', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    assignShift(req, res);
  });
  app.get('/api/admin/shifts', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getAllShifts(req, res);
  });
  app.get('/api/admin/users', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getAllUsers(req, res);
  });
  app.get('/api/admin/doctors/:id', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getDoctorInfo(req, res);
  });
  app.get('/api/admin/doctors', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    getAllDoctors(req, res);
  });
  app.delete('/api/admin/doctors/:id', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    deleteDoctorProfile(req, res);
  });
  app.put('/api/admin/doctors/:id', (req, res) => {
    req.user = { id: '6810772062f60d43bab5f89c' };
    updateDoctorInfo(req, res);
  });

  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
});

describe('Admin Controller', () => {
  let admin, doctor, doctorRequest, doctorProfile, shift, appointment;
  let consoleErrorSpy;

  beforeEach(async () => {
    admin = await User.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89c'),
      firstName: 'Admin',
      lastName: 'Fatima',
      gender: 'female',
      email: 'admin1@clinic.com',
      password: 'hashedAdmin',
      role: 'admin',
      profileImage: 'https://example.com/admin.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await AdminProfile.create({
      userId: admin._id,
      department: 'Management',
      designation: 'System Admin',
      contact: { phone: '03441234567', officeLocation: 'Main Office' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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

    doctorProfile = await DoctorProfile.create({
      userId: doctor._id,
      specialty: 'Dermatology',
      credentials: 'MBBS, FCPS',
      approved: true,
      consultationFee: 2500,
      availability: [
        { date: new Date('2025-04-30T00:00:00.000Z'), time: '10:00', available: true },
        { date: new Date('2025-05-02T00:00:00.000Z'), time: '11:00', available: false },
        { date: new Date('2025-05-03T00:00:00.000Z'), time: '10:00', available: true },
      ],
      contact: { phone: '03111234567', location: 'Skin Ward' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    doctorRequest = await DoctorRequest.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f89e'),
      firstName: 'Zainab',
      lastName: 'Tariq',
      gender: 'female',
      email: 'zainab@clinic.com',
      password: 'hashedPending',
      profileImage: 'https://example.com/pending.jpg',
      credentials: 'MBBS',
      specialty: 'ENT',
      contact: { phone: '03131234567', location: 'ENT Room' },
      status: 'pending',
      requestedAt: new Date(),
    });

    shift = await Shift.create({
      doctorId: doctor._id,
      date: new Date('2025-05-02T00:00:00.000Z'),
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'morning',
      location: 'Skin Ward',
      createdBy: admin._id,
      createdAt: new Date(),
    });

    appointment = await Appointment.create({
      _id: new mongoose.Types.ObjectId('6810772062f60d43bab5f8a1'),
      patientId: new mongoose.Types.ObjectId('6810772062f60d43bab5f89d'),
      doctorId: doctor._id,
      date: new Date('2025-05-02T00:00:00.000Z'),
      time: '11:00',
      status: 'scheduled',
      notes: 'Routine checkup',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await AdminProfile.deleteMany({});
    await DoctorRequest.deleteMany({});
    await DoctorProfile.deleteMany({});
    await Shift.deleteMany({});
    await Appointment.deleteMany({});
    consoleErrorSpy.mockRestore();
  });

  describe('getAdminProfile', () => {
    it('should get admin profile successfully', async () => {
      const response = await request(app)
        .get('/api/admin/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Admin');
      expect(response.body.data.department).toBe('Management');
    });

    it('should return 404 if admin user not found', async () => {
      await User.deleteOne({ _id: '6810772062f60d43bab5f89c' });
      const response = await request(app)
        .get('/api/admin/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin user not found');
    });

    it('should return 404 if admin profile not found', async () => {
      await AdminProfile.deleteOne({ userId: '6810772062f60d43bab5f89c' });
      const response = await request(app)
        .get('/api/admin/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin profile not found');
    });
  });

  describe('updateAdminProfile', () => {
    it('should update admin profile successfully', async () => {
      const response = await request(app)
        .put('/api/admin/profile')
        .send({
          firstName: 'Updated',
          lastName: 'Admin',
          gender: 'female',
          profileImage: 'https://example.com/updated.jpg',
          department: 'Operations',
          designation: 'Chief Admin',
          contact: { phone: '03441234568', officeLocation: 'Head Office' },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin profile updated successfully');
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.adminProfile.department).toBe('Operations');
    });

    it('should return 404 if admin not found', async () => {
      await User.deleteOne({ _id: '6810772062f60d43bab5f89c' });
      const response = await request(app)
        .put('/api/admin/profile')
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin not found');
    });

  });

  describe('getPendingDoctorRequests', () => {
    it('should get all pending doctor requests', async () => {
      const response = await request(app)
        .get('/api/admin/doctor-requests')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].email).toBe('zainab@clinic.com');
    });

    it('should return empty array if no pending requests', async () => {
      await DoctorRequest.deleteMany({});
      const response = await request(app)
        .get('/api/admin/doctor-requests')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('approveDoctor', () => {
    it('should approve doctor request and create user and profile', async () => {
      const response = await request(app)
        .put('/api/admin/doctor-requests/6810772062f60d43bab5f89e/approve')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Doctor approved and created successfully');
      expect(response.body.data.user.email).toBe('zainab@clinic.com');
      expect(response.body.data.doctorProfile.specialty).toBe('ENT');

      const updatedRequest = await DoctorRequest.findById('6810772062f60d43bab5f89e');
      expect(updatedRequest.status).toBe('approved');
    });

    it('should return 404 if request not found', async () => {
      const response = await request(app)
        .put('/api/admin/doctor-requests/6810772062f60d43bab5f89f/approve')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor request not found');
    });

    it('should return 400 if request already approved', async () => {
      await DoctorRequest.updateOne(
        { _id: '6810772062f60d43bab5f89e' },
        { status: 'approved', reviewedAt: new Date() }
      );

      const response = await request(app)
        .put('/api/admin/doctor-requests/6810772062f60d43bab5f89e/approve')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('This doctor request is already approved');
    });
  });

  describe('rejectDoctor', () => {
    it('should reject doctor request successfully', async () => {
      const response = await request(app)
        .put('/api/admin/doctor-requests/6810772062f60d43bab5f89e/reject')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Doctor request rejected successfully');
      expect(response.body.data.status).toBe('rejected');

      const updatedRequest = await DoctorRequest.findById('6810772062f60d43bab5f89e');
      expect(updatedRequest.status).toBe('rejected');
    });

    it('should return 404 if request not found', async () => {
      const response = await request(app)
        .put('/api/admin/doctor-requests/6810772062f60d43bab5f89f/reject')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor request not found');
    });
  });

  describe('assignShift', () => {
    it('should assign shift successfully', async () => {
      const response = await request(app)
        .post('/api/admin/assign-shift')
        .send({
          doctorId: '6810772062f60d43bab5f89a',
          date: '2025-05-03',
          startTime: '09:00',
          endTime: '17:00',
          shiftType: 'morning',
          location: 'Skin Ward',
          createdBy: '6810772062f60d43bab5f89c',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Shift assigned successfully');
      expect(response.body.data.date).toBe('2025-05-03T00:00:00.000Z');
    });

    it('should return 400 if shift already exists on date', async () => {
      const response = await request(app)
        .post('/api/admin/assign-shift')
        .send({
          doctorId: '6810772062f60d43bab5f89a',
          date: '2025-05-02',
          startTime: '09:00',
          endTime: '17:00',
          shiftType: 'morning',
          location: 'Skin Ward',
          createdBy: '6810772062f60d43bab5f89c',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor already has a shift assigned on this date');
    });
  });

  describe('getAllShifts', () => {
    it('should get all shifts successfully', async () => {
      const response = await request(app)
        .get('/api/admin/shifts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].doctorId.firstName).toBe('Areeba');
      expect(response.body.data[0].date).toBe('2025-05-02T00:00:00.000Z');
    });

    it('should return empty array if no shifts', async () => {
      await Shift.deleteMany({});
      const response = await request(app)
        .get('/api/admin/shifts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: 'admin1@clinic.com' }),
          expect.objectContaining({ email: 'areeba@clinic.com' }),
        ])
      );
    });
  });

  describe('getDoctorInfo', () => {
    it('should get doctor info successfully', async () => {
      const response = await request(app)
        .get('/api/admin/doctors/6810772062f60d43bab5f89a')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Areeba');
      expect(response.body.data.profile.specialty).toBe('Dermatology');
    });

    it('should return 404 if doctor user not found', async () => {
      const response = await request(app)
        .get('/api/admin/doctors/6810772062f60d43bab5f89f')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor user not found');
    });

    it('should return 404 if doctor profile not found', async () => {
      await DoctorProfile.deleteOne({ userId: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .get('/api/admin/doctors/6810772062f60d43bab5f89a')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor profile not found');
    });
  });

  describe('getAllDoctors', () => {
    it('should get all doctors successfully', async () => {
      const response = await request(app)
        .get('/api/admin/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].user.firstName).toBe('Areeba');
      expect(response.body.data[0].profile.specialty).toBe('Dermatology');
    });

    it('should return empty array if no doctors', async () => {
      await User.deleteMany({ role: 'doctor' });
      await DoctorProfile.deleteMany({});
      const response = await request(app)
        .get('/api/admin/doctors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('deleteDoctorProfile', () => {
    it('should delete doctor profile successfully if no appointments', async () => {
      await Appointment.deleteMany({ doctorId: '6810772062f60d43bab5f89a' });
      const response = await request(app)
        .delete('/api/admin/doctors/6810772062f60d43bab5f89a')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Doctor profile deleted successfully');
      expect(response.body.deletedUser.firstName).toBe('Areeba');
      expect(response.body.deletedProfile.specialty).toBe('Dermatology');

      const user = await User.findById('6810772062f60d43bab5f89a');
      const profile = await DoctorProfile.findOne({ userId: '6810772062f60d43bab5f89a' });
      expect(user).toBeNull();
      expect(profile).toBeNull();
    });

    it('should return 400 if doctor has appointments', async () => {
      const response = await request(app)
        .delete('/api/admin/doctors/6810772062f60d43bab5f89a')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete doctor. Doctor has active or past appointments.');
    });

    it('should return 404 if doctor not found', async () => {
      const response = await request(app)
        .delete('/api/admin/doctors/6810772062f60d43bab5f89f')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('updateDoctorInfo', () => {
    it('should update doctor info successfully', async () => {
      const response = await request(app)
        .put('/api/admin/doctors/6810772062f60d43bab5f89a')
        .send({
          firstName: 'Updated',
          lastName: 'Khan',
          gender: 'female',
          specialty: 'Cardiology',
          credentials: 'MBBS, MD',
          consultationFee: 3000,
          phone: '03221234567',
          location: 'Cardiology Block',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Doctor info updated successfully');
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.doctorProfile.specialty).toBe('Cardiology');
      expect(response.body.data.doctorProfile.contact.phone).toBe('03221234567');
    });

    it('should return 404 if doctor not found', async () => {
      const response = await request(app)
        .put('/api/admin/doctors/6810772062f60d43bab5f89f')
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Doctor not found');
    });
  });
});
