const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const adminRoutes = require('./routes/admin.routes');
const doctorRoutes = require('./routes/doctor.routes');
const userRoutes = require('./routes/user.routes');
const multer = require('./middlewares/multer.middleware');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/users', multer.uploadProfileImage, userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;
