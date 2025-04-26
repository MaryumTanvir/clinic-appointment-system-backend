const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const AdminProfile = require('./models/AdminProfile');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/clinic-management-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existingAdmin = await User.findOne({ email: "admin1@clinic.com" });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const plainPassword = 'adminpassword';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "Fatima",
      gender: "female",
      email: "admin1@clinic.com",
      password: hashedPassword,
      role: "admin",
      profileImage: "https://example.com/admin.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin user created:', adminUser);

    await AdminProfile.create({
      userId: adminUser._id,
      department: "Operations",
      designation: "Clinic Manager",
      contact: {
        phone: "03441234567",
        officeLocation: "Main Office"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin profile created successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
