const db = db.getSiblingDB("clinic-management-system");

// Drop collections for clean re-run
db.users.drop();
db.doctorProfiles.drop();
db.patientProfiles.drop();
db.adminProfiles.drop();
db.doctorRequests.drop();
db.shifts.drop();
db.appointments.drop();
db.feedback.drop();
db.payments.drop();

// Create collections with validation

// USERS
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "gender", "email", "password", "role"],
      properties: {
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        gender: { enum: ["male", "female", "other"] },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        role: { enum: ["admin", "doctor", "patient"] },
        profileImage: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// DOCTOR PROFILE
db.createCollection("doctorProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "specialty", "approved", "consultationFee"],
      properties: {
        userId: { bsonType: "objectId" },
        specialty: { bsonType: "string" },
        credentials: { bsonType: "string" },
        approved: { bsonType: "bool" },
        consultationFee: { bsonType: "number" },
        availability: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["date", "time", "available"],
            properties: {
              date: { bsonType: "date" },
              time: { bsonType: "string" },
              available: { bsonType: "bool"}
            }
          }
        },
        contact: {
          bsonType: "object",
          properties: {
            phone: { bsonType: "string" },
            location: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// PATIENT PROFILE
db.createCollection("patientProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" },
        age: { bsonType: "int" },
        contact: {
          bsonType: "object",
          properties: {
            phone: { bsonType: "string" },
            address: { bsonType: "string" }
          }
        },
        medicalHistory: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// ADMIN PROFILE
db.createCollection("adminProfiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" },
        department: { bsonType: "string" },
        designation: { bsonType: "string" },
        contact: {
          bsonType: "object",
          properties: {
            phone: { bsonType: "string" },
            officeLocation: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// SHIFTS
db.createCollection("shifts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["doctorId", "date", "startTime", "endTime", "shiftType"],
      properties: {
        doctorId: { bsonType: "objectId" },
        date: { bsonType: "date" },
        startTime: { bsonType: "string" },
        endTime: { bsonType: "string" },
        shiftType: { enum: ["morning", "evening", "night"] },
        location: { bsonType: "string" },
        createdBy: { bsonType: "objectId" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// APPOINTMENTS
db.createCollection("appointments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "doctorId", "date", "time", "status"],
      properties: {
        patientId: { bsonType: "objectId" },
        doctorId: { bsonType: "objectId" },
        date: { bsonType: "date" },
        time: { bsonType: "string" },
        status: { enum: ["scheduled", "completed", "cancelled", "rescheduled"] },
        notes: { bsonType: "string" },
        rescheduledFrom: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// FEEDBACK
db.createCollection("feedback", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["appointmentId", "patientId", "doctorId", "rating", "status"],
      properties: {
        appointmentId: { bsonType: "objectId" },
        patientId: { bsonType: "objectId" },
        doctorId: { bsonType: "objectId" },
        rating: { bsonType: ["int", "double"] },
        comments: { bsonType: "string" },
        status: { enum: ["pending", "reviewed"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// PAYMENTS
db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["appointmentId", "patientId", "doctorId", "amount", "status"],
      properties: {
        appointmentId: { bsonType: "objectId" },
        patientId: { bsonType: "objectId" },
        doctorId: { bsonType: "objectId" },
        amount: { bsonType: ["int", "double"] },
        status: { enum: ["paid", "pending"] },
        method: { bsonType: "string" },
        paidAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// doctorRequests
db.createCollection("doctorRequests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "gender", "email", "password", "credentials", "specialty", "status", "requestedAt"],
      properties: {
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        gender: { enum: ["male", "female", "other"] },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        profileImage: { bsonType: "string" },
        credentials: { bsonType: "string" },
        specialty: { bsonType: "string" },
        contact: {
          bsonType: "object",
          properties: {
            phone: { bsonType: "string" },
            location: { bsonType: "string" }
          }
        },
        status: { enum: ["pending", "approved", "rejected"] },
        requestedAt: { bsonType: "date" },
        reviewedAt: { bsonType: "date" },
        reviewedBy: { bsonType: "objectId" }
      }
    }
  }
});

// =================== INSERTIONS ===================

// USERS
const adminId = ObjectId();
const doctorIds = [ObjectId(), ObjectId(), ObjectId()];
const patientIds = [ObjectId(), ObjectId(), ObjectId()];
const appointmentIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()];
const paymentIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId()];

db.users.insertMany([
  {
    _id: adminId,
    firstName: "Admin",
    lastName: "Fatima",
    gender: "female",
    email: "admin1@clinic.com",
    password: "hashedAdmin",
    role: "admin",
    profileImage: "https://example.com/admin.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: doctorIds[0],
    firstName: "Areeba",
    lastName: "Khan",
    gender: "female",
    email: "areeba@clinic.com",
    password: "hashedDoctor1",
    role: "doctor",
    profileImage: "https://example.com/doctor1.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: doctorIds[1],
    firstName: "Bilal",
    lastName: "Rana",
    gender: "male",
    email: "bilal@clinic.com",
    password: "hashedDoctor2",
    role: "doctor",
    profileImage: "https://example.com/doctor2.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: doctorIds[2],
    firstName: "Mehwish",
    lastName: "Tariq",
    gender: "female",
    email: "mehwish@clinic.com",
    password: "hashedDoctor3",
    role: "doctor",
    profileImage: "https://example.com/doctor3.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: patientIds[0],
    firstName: "Ahmed",
    lastName: "Khan",
    gender: "male",
    email: "ahmed@clinic.com",
    password: "hashedPatient1",
    role: "patient",
    profileImage: "https://example.com/patient1.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: patientIds[1],
    firstName: "Sarah",
    lastName: "Ali",
    gender: "female",
    email: "sarah@clinic.com",
    password: "hashedPatient2",
    role: "patient",
    profileImage: "https://example.com/patient2.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: patientIds[2],
    firstName: "Hamza",
    lastName: "Farooq",
    gender: "male",
    email: "hamza@clinic.com",
    password: "hashedPatient3",
    role: "patient",
    profileImage: "https://example.com/patient3.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// DOCTOR PROFILES
db.doctorProfiles.insertMany([
  {
    userId: doctorIds[0],
    specialty: "Dermatology",
    credentials: "MBBS, FCPS",
    approved: true,
    consultationFee: 2500,
    availability: [
      { date: ISODate("2025-04-01"), time: "10:00", available: true },
      { date: ISODate("2025-04-28"), time: "11:00", available: true },
      { date: ISODate("2025-05-01"), time: "09:00", available: false },
      { date: ISODate("2025-05-02"), time: "10:00", available: false },
      { date: ISODate("2025-05-03"), time: "10:00", available: true },
      { date: ISODate("2025-05-04"), time: "10:00", available: true }
    ],
    contact: { phone: "03111234567", location: "Skin Ward" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: doctorIds[1],
    specialty: "Cardiology",
    credentials: "MBBS, MD",
    approved: true,
    consultationFee: 3000,
    availability: [
      { date: ISODate("2025-05-01"), time: "17:00", available: true },
      { date: ISODate("2025-05-01"), time: "18:00", available: false }
    ],
    contact: { phone: "03221234567", location: "Cardiology Block" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: doctorIds[2],
    specialty: "Neurology",
    credentials: "MBBS, MRCP",
    approved: true,
    consultationFee: 3500,
    availability: [
      { date: ISODate("2025-05-01"), time: "01:00", available: true },
      { date: ISODate("2025-05-01"), time: "02:00", available: true }
    ],
    contact: { phone: "03331234567", location: "Neuro Wing" },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// PATIENT PROFILES
db.patientProfiles.insertMany([
  {
    userId: patientIds[0],
    age: 29,
    contact: { phone: "03001234567", address: "Lahore" },
    medicalHistory: ["Hypertension"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: patientIds[1],
    age: 34,
    contact: { phone: "03011234567", address: "Karachi" },
    medicalHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: patientIds[2],
    age: 41,
    contact: { phone: "03021234567", address: "Islamabad" },
    medicalHistory: ["Diabetes"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// ADMIN PROFILE
db.adminProfiles.insertOne({
  userId: adminId,
  department: "Management",
  designation: "System Admin",
  contact: { phone: "03441234567", officeLocation: "Main Office" },
  createdAt: new Date(),
  updatedAt: new Date()
});

// SHIFTS
db.shifts.insertMany([
  {
    doctorId: doctorIds[0],
    date: ISODate("2025-04-01"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Skin Ward",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[0],
    date: ISODate("2025-04-28"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Skin Ward",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[0],
    date: ISODate("2025-05-01"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Skin Ward",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[0],
    date: ISODate("2025-05-02"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Skin Ward",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[0],
    date: ISODate("2025-05-03"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Skin Ward",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[1],
    date: ISODate("2025-05-01"),
    startTime: "17:00",
    endTime: "01:00",
    shiftType: "evening",
    location: "Cardiology Block",
    createdBy: adminId,
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[2],
    date: ISODate("2025-05-01"),
    startTime: "01:00",
    endTime: "09:00",
    shiftType: "night",
    location: "Neuro Wing",
    createdBy: adminId,
    createdAt: new Date()
  }
]);

// DOCTOR REQUESTS
db.doctorRequests.insertMany([
  {
    firstName: "Zainab",
    lastName: "Tariq",
    gender: "female",
    email: "zainab@clinic.com",
    password: "hashedPending",
    profileImage: "https://example.com/pending.jpg",
    credentials: "MBBS",
    specialty: "ENT",
    contact: { phone: "03131234567", location: "ENT Room" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Kamran",
    lastName: "Shah",
    gender: "male",
    email: "kamran@clinic.com",
    password: "hashedPending2",
    profileImage: "https://example.com/kamran.jpg",
    credentials: "MBBS, MS",
    specialty: "Urology",
    contact: { phone: "03231234567", location: "Urology" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Iqra",
    lastName: "Hassan",
    gender: "female",
    email: "iqra@clinic.com",
    password: "hashedPending3",
    profileImage: "https://example.com/iqra.jpg",
    credentials: "MBBS",
    specialty: "Gastroenterology",
    contact: { phone: "03331234567", location: "Gastro" },
    status: "pending",
    requestedAt: new Date()
  }
]);

// APPOINTMENTS
db.appointments.insertMany([
  // Past appointment (TC_PD_13)
  {
    _id: appointmentIds[0],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    date: ISODate("2025-04-01"),
    time: "10:00",
    status: "completed",
    notes: "Consultation for acne",
    hasFeedback: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Today appointment (TC_PD_14)
  {
    _id: appointmentIds[1],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    date: ISODate("2025-04-28"),
    time: "11:00",
    status: "scheduled",
    notes: "Follow-up for skin rash",
    hasFeedback: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Future appointment (TC_PD_15, TC_PD_26, TC_PD_34)
  {
    _id: appointmentIds[2],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    date: ISODate("2025-05-02"),
    time: "10:00",
    status: "scheduled",
    notes: "Routine checkup",
    hasFeedback: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Completed appointment for payment (TC_PD_32)
  {
    _id: appointmentIds[3],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    date: ISODate("2025-05-01"),
    time: "09:00",
    status: "completed",
    notes: "Consultation for acne",
    hasFeedback: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Completed appointment for feedback (TC_PD_35)
  {
    _id: appointmentIds[4],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    date: ISODate("2025-04-27"),
    time: "12:00",
    status: "completed",
    notes: "Skin treatment",
    hasFeedback: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Appointment for Sarah (TC_PD_29)
  {
    _id: appointmentIds[5],
    patientId: patientIds[1],
    doctorId: doctorIds[1],
    date: ISODate("2025-05-01"),
    time: "17:00",
    status: "completed",
    notes: "Chest pain follow-up",
    hasFeedback: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Appointment for Hamza (TC_PD_33)
  {
    _id: appointmentIds[6],
    patientId: patientIds[2],
    doctorId: doctorIds[2],
    date: ISODate("2025-05-01"),
    time: "02:00",
    status: "completed",
    notes: "Migraine consultation",
    hasFeedback: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// FEEDBACK
db.feedback.insertMany([
  {
    appointmentId: appointmentIds[5],
    patientId: patientIds[1],
    doctorId: doctorIds[1],
    rating: 4.7,
    comments: "Very helpful and kind.",
    status: "reviewed",
    createdAt: new Date()
  },
  {
    appointmentId: appointmentIds[3],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    rating: 4.2,
    comments: "Quick diagnosis.",
    status: "pending",
    createdAt: new Date()
  },
  {
    appointmentId: appointmentIds[6],
    patientId: patientIds[2],
    doctorId: doctorIds[2],
    rating: 3.0,
    comments: "Appointment was cancelled.",
    status: "reviewed",
    createdAt: new Date()
  }
]);

// PAYMENTS
db.payments.insertMany([
  // Payment for TC_PD_30, TC_PD_32 (Ahmed, pending)
  {
    _id: paymentIds[0],
    appointmentId: appointmentIds[3],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    amount: 2500.0,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  // Payment for TC_PD_29 (Sarah, paid)
  {
    _id: paymentIds[1],
    appointmentId: appointmentIds[5],
    patientId: patientIds[1],
    doctorId: doctorIds[1],
    amount: 3000.0,
    status: "paid",
    method: "cash",
    paidAt: new Date(),
    createdAt: new Date()
  },
  // Payment for TC_PD_33 (Hamza, pending)
  {
    _id: paymentIds[2],
    appointmentId: appointmentIds[6],
    patientId: patientIds[2],
    doctorId: doctorIds[2],
    amount: 3500.0,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  // Payment for TC_PD_34 (Ahmed, scheduled appointment)
  {
    _id: paymentIds[3],
    appointmentId: appointmentIds[2],
    patientId: patientIds[0],
    doctorId: doctorIds[0],
    amount: 2500.0,
    status: "pending",
    method: "card",
    createdAt: new Date()
  }
]);