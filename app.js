const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const adminRoutes = require('./routes/admin.routes');
const doctorRoutes = require('./routes/doctor.routes'); 
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());
app.use(morgan('dev'));


app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes); 
module.exports = app;
