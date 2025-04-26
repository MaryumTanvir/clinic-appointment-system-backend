const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const adminRoutes = require('./routes/admin.routes');
<<<<<<< HEAD
const doctorRoutes = require('./routes/doctor.routes'); 
=======
const doctorRoutes = require('./routes/doctor.routes');
>>>>>>> 2c24abc8cda64c0c04a4e2f9fb24f94c6a982191
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());
app.use(morgan('dev'));


app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
<<<<<<< HEAD
app.use('/api/doctors', doctorRoutes); 
=======
app.use('/api/doctors', doctorRoutes);

>>>>>>> 2c24abc8cda64c0c04a4e2f9fb24f94c6a982191
module.exports = app;
