const express = require('express');
const app = express();
const adminRoutes = require('./routes/admin.routes');
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());
app.use(morgan('dev'));


app.use(express.json());
app.use('/api/admin', adminRoutes);

module.exports = app;
