
//mongosh < clinic-schema-and-seed.js

const db = db.getSiblingDB("clinic-management-system");


// Drop collections for clean re-run
// Clean slate
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
              available: { bsonType: "bool" }
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
        amount: {  bsonType: ["int", "double"] },
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
const appointmentIds = [ObjectId(), ObjectId(), ObjectId()];

//new insertions
const newUserIds = [
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(),
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()
];

//more new insertions
const extendedDoctorIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()];
const extendedPatientIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()];
const extendedAdminIds = [ObjectId(), ObjectId(), ObjectId()];
const extendedAppointmentIds = [
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(),
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()
];


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
  

  //new insert for users  
  
  db.users.insertMany([
    { _id: newUserIds[0], firstName: "Saad", lastName: "Malik", gender: "male", email: "saad@clinic.com", password: "hashedSaad", role: "doctor", profileImage: "https://example.com/saad.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[1], firstName: "Hina", lastName: "Shah", gender: "female", email: "hina@clinic.com", password: "hashedHina", role: "doctor", profileImage: "https://example.com/hina.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[2], firstName: "Umer", lastName: "Iqbal", gender: "male", email: "umer@clinic.com", password: "hashedUmer", role: "doctor", profileImage: "https://example.com/umer.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[3], firstName: "Nadia", lastName: "Raza", gender: "female", email: "nadia@clinic.com", password: "hashedNadia", role: "patient", profileImage: "https://example.com/nadia.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[4], firstName: "Ali", lastName: "Usman", gender: "male", email: "ali@clinic.com", password: "hashedAli", role: "patient", profileImage: "https://example.com/ali.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[5], firstName: "Fatima", lastName: "Amin", gender: "female", email: "fatima@clinic.com", password: "hashedFatima", role: "patient", profileImage: "https://example.com/fatima.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[6], firstName: "Zohaib", lastName: "Ahmed", gender: "male", email: "zohaib@clinic.com", password: "hashedZohaib", role: "patient", profileImage: "https://example.com/zohaib.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[7], firstName: "Rabia", lastName: "Kamal", gender: "female", email: "rabia@clinic.com", password: "hashedRabia", role: "admin", profileImage: "https://example.com/rabia.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[8], firstName: "Furqan", lastName: "Hussain", gender: "male", email: "furqan@clinic.com", password: "hashedFurqan", role: "admin", profileImage: "https://example.com/furqan.jpg", createdAt: new Date(), updatedAt: new Date() },
    { _id: newUserIds[9], firstName: "Maha", lastName: "Javed", gender: "female", email: "maha@clinic.com", password: "hashedMaha", role: "doctor", profileImage: "https://example.com/maha.jpg", createdAt: new Date(), updatedAt: new Date() }
  ]);
  
//more new insertions

db.users.insertMany([
  { _id: extendedDoctorIds[0], firstName: "Arslan", lastName: "Malik", gender: "male", email: "arslan@clinic.com", password: "hashedArslan", role: "doctor", profileImage: "https://example.com/arslan.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[1], firstName: "Hira", lastName: "Tariq", gender: "female", email: "hira@clinic.com", password: "hashedHira", role: "doctor", profileImage: "https://example.com/hira.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[2], firstName: "Murtaza", lastName: "Shaikh", gender: "male", email: "murtaza@clinic.com", password: "hashedMurtaza", role: "doctor", profileImage: "https://example.com/murtaza.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[3], firstName: "Sahar", lastName: "Mehmood", gender: "female", email: "sahar@clinic.com", password: "hashedSahar", role: "doctor", profileImage: "https://example.com/sahar.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[4], firstName: "Omar", lastName: "Akhtar", gender: "male", email: "omar@clinic.com", password: "hashedOmar", role: "doctor", profileImage: "https://example.com/omar.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[5], firstName: "Sameera", lastName: "Nadeem", gender: "female", email: "sameera@clinic.com", password: "hashedSameera", role: "doctor", profileImage: "https://example.com/sameera.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[6], firstName: "Kashan", lastName: "Ali", gender: "male", email: "kashan@clinic.com", password: "hashedKashan", role: "doctor", profileImage: "https://example.com/kashan.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[7], firstName: "Maham", lastName: "Zahid", gender: "female", email: "maham@clinic.com", password: "hashedMaham", role: "doctor", profileImage: "https://example.com/maham.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[8], firstName: "Zeeshan", lastName: "Qureshi", gender: "male", email: "zeeshan@clinic.com", password: "hashedZeeshan", role: "doctor", profileImage: "https://example.com/zeeshan.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedDoctorIds[9], firstName: "Ayesha", lastName: "Butt", gender: "female", email: "ayesha@clinic.com", password: "hashedAyesha", role: "doctor", profileImage: "https://example.com/ayesha.jpg", createdAt: new Date(), updatedAt: new Date() },
  
  { _id: extendedPatientIds[0], firstName: "Rehan", lastName: "Iqbal", gender: "male", email: "rehan@clinic.com", password: "hashedRehan", role: "patient", profileImage: "https://example.com/rehan.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[1], firstName: "Sana", lastName: "Khan", gender: "female", email: "sana.khan@clinic.com", password: "hashedSanaK", role: "patient", profileImage: "https://example.com/sana.khan.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[2], firstName: "Bilal", lastName: "Zaman", gender: "male", email: "bilal@clinic.com", password: "hashedBilal", role: "patient", profileImage: "https://example.com/bilal.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[3], firstName: "Iqra", lastName: "Latif", gender: "female", email: "iqra@clinic.com", password: "hashedIqra", role: "patient", profileImage: "https://example.com/iqra.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[4], firstName: "Taimoor", lastName: "Saeed", gender: "male", email: "taimoor@clinic.com", password: "hashedTaimoor", role: "patient", profileImage: "https://example.com/taimoor.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[5], firstName: "Zunaira", lastName: "Babar", gender: "female", email: "zunaira@clinic.com", password: "hashedZunaira", role: "patient", profileImage: "https://example.com/zunaira.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[6], firstName: "Junaid", lastName: "Khalid", gender: "male", email: "junaid@clinic.com", password: "hashedJunaid", role: "patient", profileImage: "https://example.com/junaid.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[7], firstName: "Anum", lastName: "Siddiqui", gender: "female", email: "anum@clinic.com", password: "hashedAnum", role: "patient", profileImage: "https://example.com/anum.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[8], firstName: "Usman", lastName: "Saleem", gender: "male", email: "usman@clinic.com", password: "hashedUsman", role: "patient", profileImage: "https://example.com/usman.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedPatientIds[9], firstName: "Hafsa", lastName: "Sami", gender: "female", email: "hafsa@clinic.com", password: "hashedHafsa", role: "patient", profileImage: "https://example.com/hafsa.jpg", createdAt: new Date(), updatedAt: new Date() },
  
  { _id: extendedAdminIds[0], firstName: "Talha", lastName: "Rashid", gender: "male", email: "talha@clinic.com", password: "hashedTalha", role: "admin", profileImage: "https://example.com/talha.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedAdminIds[1], firstName: "Sundas", lastName: "Farooq", gender: "female", email: "sundas@clinic.com", password: "hashedSundas", role: "admin", profileImage: "https://example.com/sundas.jpg", createdAt: new Date(), updatedAt: new Date() },
  { _id: extendedAdminIds[2], firstName: "Faisal", lastName: "Mehmood", gender: "male", email: "faisal@clinic.com", password: "hashedFaisal", role: "admin", profileImage: "https://example.com/faisal.jpg", createdAt: new Date(), updatedAt: new Date() }
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
      { date: ISODate("2025-05-01"), time: "09:00", available: false },
      { date: ISODate("2025-05-01"), time: "10:00", available: true }
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

//new doctor records

db.doctorProfiles.insertMany([
  { userId: newUserIds[0], specialty: "Orthopedics", credentials: "MBBS, MS", approved: true, consultationFee: 3500, availability: [{ date: ISODate("2025-05-02"), time: "10:00", available: true }], contact: { phone: "03091234567", location: "Ortho Block" }, createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[1], specialty: "Ophthalmology", credentials: "MBBS, FCPS", approved: true, consultationFee: 2500, availability: [{ date: ISODate("2025-05-02"), time: "11:00", available: true }], contact: { phone: "03191234567", location: "Eye Center" }, createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[2], specialty: "Pediatrics", credentials: "MBBS, DCH", approved: true, consultationFee: 3000, availability: [{ date: ISODate("2025-05-02"), time: "12:00", available: true }], contact: { phone: "03291234567", location: "Children's Ward" }, createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[9], specialty: "Gynecology", credentials: "MBBS, MCPS", approved: true, consultationFee: 4000, availability: [{ date: ISODate("2025-05-02"), time: "09:00", available: true }], contact: { phone: "03391234567", location: "Gynecology" }, createdAt: new Date(), updatedAt: new Date() }
]);

//more new doctor insertion

db.doctorProfiles.insertMany([
  {
    userId: extendedDoctorIds[0],
    specialty: "Orthopedics",
    credentials: "MBBS, MS Ortho",
    approved: true,
    consultationFee: 4000,
    availability: [
      { date: ISODate("2025-05-03"), time: "10:00", available: true },
      { date: ISODate("2025-05-04"), time: "11:00", available: true }
    ],
    contact: { phone: "03011230001", location: "Orthopedic Department" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[1],
    specialty: "Ophthalmology",
    credentials: "MBBS, FCPS",
    approved: true,
    consultationFee: 3000,
    availability: [
      { date: ISODate("2025-05-03"), time: "13:00", available: true },
      { date: ISODate("2025-05-04"), time: "14:00", available: true }
    ],
    contact: { phone: "03011230002", location: "Eye Clinic" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[2],
    specialty: "Pediatrics",
    credentials: "MBBS, DCH",
    approved: true,
    consultationFee: 3500,
    availability: [
      { date: ISODate("2025-05-03"), time: "09:00", available: true },
      { date: ISODate("2025-05-05"), time: "10:00", available: true }
    ],
    contact: { phone: "03011230003", location: "Children's Ward" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[3],
    specialty: "Gynecology",
    credentials: "MBBS, MCPS",
    approved: true,
    consultationFee: 4500,
    availability: [
      { date: ISODate("2025-05-03"), time: "12:00", available: true },
      { date: ISODate("2025-05-04"), time: "12:30", available: true }
    ],
    contact: { phone: "03011230004", location: "Gynecology Wing" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[4],
    specialty: "Dermatology",
    credentials: "MBBS, DD",
    approved: true,
    consultationFee: 2500,
    availability: [
      { date: ISODate("2025-05-03"), time: "15:00", available: true },
      { date: ISODate("2025-05-05"), time: "16:00", available: true }
    ],
    contact: { phone: "03011230005", location: "Skin Care Clinic" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[5],
    specialty: "Neurology",
    credentials: "MBBS, FCPS Neuro",
    approved: true,
    consultationFee: 5000,
    availability: [
      { date: ISODate("2025-05-03"), time: "08:00", available: true },
      { date: ISODate("2025-05-06"), time: "09:30", available: true }
    ],
    contact: { phone: "03011230006", location: "Neuro Center" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[6],
    specialty: "Psychiatry",
    credentials: "MBBS, FCPS Psychiatry",
    approved: true,
    consultationFee: 3200,
    availability: [
      { date: ISODate("2025-05-03"), time: "11:00", available: true },
      { date: ISODate("2025-05-07"), time: "12:30", available: true }
    ],
    contact: { phone: "03011230007", location: "Psychiatry Block" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[7],
    specialty: "ENT",
    credentials: "MBBS, MS ENT",
    approved: true,
    consultationFee: 2800,
    availability: [
      { date: ISODate("2025-05-03"), time: "14:00", available: true },
      { date: ISODate("2025-05-08"), time: "15:30", available: true }
    ],
    contact: { phone: "03011230008", location: "ENT Clinic" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[8],
    specialty: "Cardiology",
    credentials: "MBBS, MD Cardiology",
    approved: true,
    consultationFee: 6000,
    availability: [
      { date: ISODate("2025-05-03"), time: "16:00", available: true },
      { date: ISODate("2025-05-09"), time: "17:00", available: true }
    ],
    contact: { phone: "03011230009", location: "Cardiology Block" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedDoctorIds[9],
    specialty: "Gastroenterology",
    credentials: "MBBS, MD Gastro",
    approved: true,
    consultationFee: 3800,
    availability: [
      { date: ISODate("2025-05-03"), time: "17:00", available: true },
      { date: ISODate("2025-05-10"), time: "18:00", available: true }
    ],
    contact: { phone: "03011230010", location: "Gastro Ward" },
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

//new patuent insertion

db.patientProfiles.insertMany([
  { userId: newUserIds[3], age: 32, contact: { phone: "03041234567", address: "Multan" }, medicalHistory: ["Allergy"], createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[4], age: 45, contact: { phone: "03141234567", address: "Rawalpindi" }, medicalHistory: [], createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[5], age: 28, contact: { phone: "03241234567", address: "Peshawar" }, medicalHistory: ["Asthma"], createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[6], age: 50, contact: { phone: "03341234567", address: "Quetta" }, medicalHistory: ["Blood Pressure"], createdAt: new Date(), updatedAt: new Date() }
]);


//more new insertions
db.patientProfiles.insertMany([
  {
    userId: extendedPatientIds[0],
    age: 30,
    contact: { phone: "03451230001", address: "Lahore" },
    medicalHistory: ["Hypertension"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[1],
    age: 26,
    contact: { phone: "03451230002", address: "Karachi" },
    medicalHistory: ["Asthma"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[2],
    age: 35,
    contact: { phone: "03451230003", address: "Islamabad" },
    medicalHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[3],
    age: 29,
    contact: { phone: "03451230004", address: "Rawalpindi" },
    medicalHistory: ["Migraine"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[4],
    age: 40,
    contact: { phone: "03451230005", address: "Multan" },
    medicalHistory: ["Diabetes"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[5],
    age: 31,
    contact: { phone: "03451230006", address: "Faisalabad" },
    medicalHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[6],
    age: 38,
    contact: { phone: "03451230007", address: "Quetta" },
    medicalHistory: ["High Cholesterol"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[7],
    age: 27,
    contact: { phone: "03451230008", address: "Peshawar" },
    medicalHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[8],
    age: 33,
    contact: { phone: "03451230009", address: "Sialkot" },
    medicalHistory: ["Anemia"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedPatientIds[9],
    age: 24,
    contact: { phone: "03451230010", address: "Gujranwala" },
    medicalHistory: ["Thyroid Disorder"],
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


//new admin insertion
db.adminProfiles.insertMany([
  { userId: newUserIds[7], department: "Operations", designation: "Clinic Manager", contact: { phone: "03451234567", officeLocation: "Operations Block" }, createdAt: new Date(), updatedAt: new Date() },
  { userId: newUserIds[8], department: "Finance", designation: "Finance Head", contact: { phone: "03551234567", officeLocation: "Head Office" }, createdAt: new Date(), updatedAt: new Date() }
]);

//more insertion
db.adminProfiles.insertMany([
  {
    userId: extendedAdminIds[0],
    department: "Operations",
    designation: "Operations Manager",
    contact: { phone: "03551230001", officeLocation: "Admin Block A" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedAdminIds[1],
    department: "Human Resources",
    designation: "HR Head",
    contact: { phone: "03551230002", officeLocation: "HR Office" },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: extendedAdminIds[2],
    department: "Finance",
    designation: "Finance Manager",
    contact: { phone: "03551230003", officeLocation: "Accounts Section" },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);



// SHIFTS (8 hours per shift)
db.shifts.insertMany([
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


//new shifts instertion
db.shifts.insertMany([
  { doctorId: newUserIds[0], date: ISODate("2025-05-02"), startTime: "09:00", endTime: "17:00", shiftType: "morning", location: "Ortho Block", createdBy: newUserIds[7], createdAt: new Date() },
  { doctorId: newUserIds[1], date: ISODate("2025-05-02"), startTime: "17:00", endTime: "01:00", shiftType: "evening", location: "Eye Center", createdBy: newUserIds[7], createdAt: new Date() },
  { doctorId: newUserIds[2], date: ISODate("2025-05-02"), startTime: "01:00", endTime: "09:00", shiftType: "night", location: "Children's Ward", createdBy: newUserIds[8], createdAt: new Date() },
  { doctorId: newUserIds[9], date: ISODate("2025-05-02"), startTime: "09:00", endTime: "17:00", shiftType: "morning", location: "Gynecology", createdBy: newUserIds[8], createdAt: new Date() }
]);

//more new insertion

db.shifts.insertMany([
  {
    doctorId: extendedDoctorIds[0],
    date: ISODate("2025-05-02"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Orthopedic Department",
    createdBy: extendedAdminIds[0],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[1],
    date: ISODate("2025-05-03"),
    startTime: "17:00",
    endTime: "01:00",
    shiftType: "evening",
    location: "Eye Clinic",
    createdBy: extendedAdminIds[0],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[2],
    date: ISODate("2025-05-04"),
    startTime: "01:00",
    endTime: "09:00",
    shiftType: "night",
    location: "Children's Ward",
    createdBy: extendedAdminIds[1],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[2],
    date: ISODate("2025-06-05"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Gynecology Wing",
    createdBy: extendedAdminIds[1],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[4],
    date: ISODate("2025-05-06"),
    startTime: "17:00",
    endTime: "01:00",
    shiftType: "evening",
    location: "Skin Care Clinic",
    createdBy: extendedAdminIds[2],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[5],
    date: ISODate("2025-05-07"),
    startTime: "01:00",
    endTime: "09:00",
    shiftType: "night",
    location: "Neuro Center",
    createdBy: extendedAdminIds[2],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[6],
    date: ISODate("2025-05-08"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Psychiatry Block",
    createdBy: extendedAdminIds[0],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[7],
    date: ISODate("2025-05-09"),
    startTime: "17:00",
    endTime: "01:00",
    shiftType: "evening",
    location: "ENT Clinic",
    createdBy: extendedAdminIds[1],
    createdAt: new Date()
  },
  {
    doctorId: doctorIds[1],
    date: ISODate("2025-08-10"),
    startTime: "01:00",
    endTime: "09:00",
    shiftType: "night",
    location: "Cardiology Block",
    createdBy: extendedAdminIds[2],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[9],
    date: ISODate("2025-05-02"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "morning",
    location: "Gastro Ward",
    createdBy: extendedAdminIds[0],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[0],
    date: ISODate("2025-05-06"),
    startTime: "17:00",
    endTime: "01:00",
    shiftType: "evening",
    location: "Orthopedic Department",
    createdBy: extendedAdminIds[1],
    createdAt: new Date()
  },
  {
    doctorId: extendedDoctorIds[1],
    date: ISODate("2025-05-07"),
    startTime: "01:00",
    endTime: "09:00",
    shiftType: "night",
    location: "Eye Clinic",
    createdBy: extendedAdminIds[2],
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

//new doc req

db.doctorRequests.insertMany([
  { firstName: "Sana", lastName: "Jamil", gender: "female", email: "sana@clinic.com", password: "hashedSana", profileImage: "https://example.com/sana.jpg", credentials: "MBBS", specialty: "Psychiatry", contact: { phone: "03151234567", location: "Psych Ward" }, status: "pending", requestedAt: new Date() },
  { firstName: "Danish", lastName: "Ahmed", gender: "male", email: "danish@clinic.com", password: "hashedDanish", profileImage: "https://example.com/danish.jpg", credentials: "MBBS", specialty: "Dermatology", contact: { phone: "03251234567", location: "Skin Dept" }, status: "pending", requestedAt: new Date() }
]);


//more new doc requests
db.doctorRequests.insertMany([
  {
    firstName: "Amna",
    lastName: "Sheikh",
    gender: "female",
    email: "amna.sheikh@clinic.com",
    password: "hashedAmna",
    profileImage: "https://example.com/doctorrequest1.jpg",
    credentials: "MBBS",
    specialty: "Pediatrics",
    contact: { phone: "03001231001", location: "Children Ward" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Hassan",
    lastName: "Khan",
    gender: "male",
    email: "hassan.khan@clinic.com",
    password: "hashedHassan",
    profileImage: "https://example.com/doctorrequest2.jpg",
    credentials: "MBBS, FCPS",
    specialty: "Dermatology",
    contact: { phone: "03001231002", location: "Skin Center" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Areeba",
    lastName: "Syed",
    gender: "female",
    email: "areeba.syed@clinic.com",
    password: "hashedAreeba",
    profileImage: "https://example.com/doctorrequest3.jpg",
    credentials: "MBBS",
    specialty: "Gynecology",
    contact: { phone: "03001231003", location: "Gynecology Wing" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Salman",
    lastName: "Mehmood",
    gender: "male",
    email: "salman.mehmood@clinic.com",
    password: "hashedSalman",
    profileImage: "https://example.com/doctorrequest4.jpg",
    credentials: "MBBS, MS",
    specialty: "Urology",
    contact: { phone: "03001231004", location: "Urology Department" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Mahnoor",
    lastName: "Iqbal",
    gender: "female",
    email: "mahnoor.iqbal@clinic.com",
    password: "hashedMahnoor",
    profileImage: "https://example.com/doctorrequest5.jpg",
    credentials: "MBBS",
    specialty: "Ophthalmology",
    contact: { phone: "03001231005", location: "Eye Clinic" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Zain",
    lastName: "Ahmed",
    gender: "male",
    email: "zain.ahmed@clinic.com",
    password: "hashedZain",
    profileImage: "https://example.com/doctorrequest6.jpg",
    credentials: "MBBS, FCPS",
    specialty: "Orthopedics",
    contact: { phone: "03001231006", location: "Orthopedic Department" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Fatima",
    lastName: "Shah",
    gender: "female",
    email: "fatima.shah@clinic.com",
    password: "hashedFatima",
    profileImage: "https://example.com/doctorrequest7.jpg",
    credentials: "MBBS",
    specialty: "Psychiatry",
    contact: { phone: "03001231007", location: "Psychiatry Block" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Omer",
    lastName: "Riaz",
    gender: "male",
    email: "omer.riaz@clinic.com",
    password: "hashedOmer",
    profileImage: "https://example.com/doctorrequest8.jpg",
    credentials: "MBBS",
    specialty: "ENT",
    contact: { phone: "03001231008", location: "ENT Clinic" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Sadia",
    lastName: "Malik",
    gender: "female",
    email: "sadia.malik@clinic.com",
    password: "hashedSadia",
    profileImage: "https://example.com/doctorrequest9.jpg",
    credentials: "MBBS",
    specialty: "Neurology",
    contact: { phone: "03001231009", location: "Neuro Center" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Talha",
    lastName: "Naseer",
    gender: "male",
    email: "talha.naseer@clinic.com",
    password: "hashedTalhaN",
    profileImage: "https://example.com/doctorrequest10.jpg",
    credentials: "MBBS",
    specialty: "General Surgery",
    contact: { phone: "03001231010", location: "Surgical Ward" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Nida",
    lastName: "Zafar",
    gender: "female",
    email: "nida.zafar@clinic.com",
    password: "hashedNida",
    profileImage: "https://example.com/doctorrequest11.jpg",
    credentials: "MBBS",
    specialty: "Gastroenterology",
    contact: { phone: "03001231011", location: "Gastro Department" },
    status: "pending",
    requestedAt: new Date()
  },
  {
    firstName: "Adil",
    lastName: "Aslam",
    gender: "male",
    email: "adil.aslam@clinic.com",
    password: "hashedAdil",
    profileImage: "https://example.com/doctorrequest12.jpg",
    credentials: "MBBS",
    specialty: "Cardiology",
    contact: { phone: "03001231012", location: "Cardiology Block" },
    status: "pending",
    requestedAt: new Date()
  }
]);



// APPOINTMENTS 
db.appointments.insertMany([ { _id: appointmentIds[0], patientId: patientIds[0], doctorId: doctorIds[0], date: ISODate("2025-05-01"), time: "09:00", status: "completed", notes: "Consultation for acne", hasFeedback: "true", createdAt: new Date(), updatedAt: new Date() }, { _id: appointmentIds[1], patientId: patientIds[1], doctorId: doctorIds[1], date: ISODate("2025-05-01"), time: "17:00", status: "completed", notes: "Chest pain follow-up", hasFeedback: "true", createdAt: new Date(), updatedAt: new Date() }, { _id: appointmentIds[2], patientId: patientIds[2], doctorId: doctorIds[2], date: ISODate("2025-05-01"), time: "02:00", status: "cancelled", notes: "Migraine consultation", hasFeedback: "true", createdAt: new Date(), updatedAt: new Date() } ]);

//new appointments insertion
const newAppointmentIds = [
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId(),
  ObjectId(), ObjectId(), ObjectId(), ObjectId(), ObjectId()
];

db.appointments.insertMany([
  { _id: newAppointmentIds[0], patientId: newUserIds[3], doctorId: newUserIds[0], date: ISODate("2025-05-02"), time: "10:00", status: "scheduled", notes: "Knee pain", createdAt: new Date(), updatedAt: new Date() },
  { _id: newAppointmentIds[1], patientId: newUserIds[4], doctorId: newUserIds[1], date: ISODate("2025-05-02"), time: "11:00", status: "scheduled", notes: "Eye checkup", createdAt: new Date(), updatedAt: new Date() },
  { _id: newAppointmentIds[2], patientId: newUserIds[5], doctorId: newUserIds[2], date: ISODate("2025-05-02"), time: "12:00", status: "completed", notes: "Child fever", createdAt: new Date(), updatedAt: new Date() },
  { _id: newAppointmentIds[3], patientId: newUserIds[6], doctorId: newUserIds[9], date: ISODate("2025-05-02"), time: "09:00", status: "cancelled", notes: "Pregnancy consultation", createdAt: new Date(), updatedAt: new Date() }
]);


//more appointments



db.appointments.insertMany([
  {
    _id: extendedAppointmentIds[0],
    patientId: extendedPatientIds[0],
    doctorId: extendedDoctorIds[0],
    date: ISODate("2025-05-02"),
    time: "10:00",
    status: "scheduled",
    notes: "Orthopedic consultation for knee pain.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[1],
    patientId: extendedPatientIds[1],
    doctorId: extendedDoctorIds[1],
    date: ISODate("2025-05-03"),
    time: "17:30",
    status: "completed",
    notes: "Eye checkup for blurry vision.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[2],
    patientId: extendedPatientIds[2],
    doctorId: extendedDoctorIds[2],
    date: ISODate("2025-05-04"),
    time: "01:30",
    status: "cancelled",
    notes: "Pediatric fever consultation cancelled.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[3],
    patientId: extendedPatientIds[3],
    doctorId: extendedDoctorIds[3],
    date: ISODate("2025-05-05"),
    time: "12:00",
    status: "completed",
    notes: "Gynecological consultation.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[4],
    patientId: extendedPatientIds[4],
    doctorId: extendedDoctorIds[4],
    date: ISODate("2025-05-06"),
    time: "15:00",
    status: "scheduled",
    notes: "Skin allergy consultation.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[5],
    patientId: extendedPatientIds[5],
    doctorId: extendedDoctorIds[5],
    date: ISODate("2025-05-07"),
    time: "08:30",
    status: "completed",
    notes: "Neurological migraine treatment.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[6],
    patientId: extendedPatientIds[6],
    doctorId: extendedDoctorIds[6],
    date: ISODate("2025-05-08"),
    time: "11:30",
    status: "scheduled",
    notes: "Psychiatry consultation.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[7],
    patientId: extendedPatientIds[7],
    doctorId: extendedDoctorIds[7],
    date: ISODate("2025-05-09"),
    time: "14:30",
    status: "completed",
    notes: "ENT follow-up after surgery.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[8],
    patientId: extendedPatientIds[8],
    doctorId: extendedDoctorIds[8],
    date: ISODate("2025-05-10"),
    time: "16:00",
    status: "cancelled",
    notes: "Cardiology appointment cancelled.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[9],
    patientId: extendedPatientIds[9],
    doctorId: extendedDoctorIds[9],
    date: ISODate("2025-05-02"),
    time: "17:00",
    status: "scheduled",
    notes: "Gastrointestinal consultation for acidity.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[10],
    patientId: extendedPatientIds[0],
    doctorId: extendedDoctorIds[1],
    date: ISODate("2025-05-03"),
    time: "18:00",
    status: "completed",
    notes: "Second eye checkup.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: extendedAppointmentIds[11],
    patientId: extendedPatientIds[1],
    doctorId: extendedDoctorIds[2],
    date: ISODate("2025-05-04"),
    time: "02:00",
    status: "scheduled",
    notes: "Child vaccination follow-up.",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);



// FEEDBACK
db.feedback.insertMany([
  { 
    appointmentId: appointmentIds[1], 
    patientId: patientIds[1], 
    doctorId: doctorIds[1], 
    rating: 4.7, 
    comments: "Very helpful and kind.", 
    status: "reviewed",
    createdAt: new Date() 
  }, 
  { 
    appointmentId: appointmentIds[0], 
    patientId: patientIds[0], 
    doctorId: doctorIds[0], 
    rating: 4.2, 
    comments: "Quick diagnosis.", 
    status: "pending",
    createdAt: new Date() 
  }, 
  { 
    appointmentId: appointmentIds[2], 
    patientId: patientIds[2], 
    doctorId: doctorIds[2], 
    rating: 3.0,  
    comments: "Appointment was cancelled.", 
    status: "reviewed",
    createdAt: new Date() 
  } 
]);

//new insertion feedback

db.feedback.insertMany([
  { appointmentId: newAppointmentIds[2], patientId: newUserIds[5], doctorId: newUserIds[2], rating: 4.5, comments: "Very caring.", status: "reviewed", createdAt: new Date() },
  { appointmentId: newAppointmentIds[1], patientId: newUserIds[4], doctorId: newUserIds[1], rating: 4.0, comments: "Detailed checkup.", status: "reviewed", createdAt: new Date() }
]);

//more feedback

db.feedback.insertMany([
  {
    appointmentId: extendedAppointmentIds[1], // completed appointment
    patientId: extendedPatientIds[1],
    doctorId: extendedDoctorIds[1],
    rating: 4.8,
    comments: "Very professional and helpful doctor.",
    status: "reviewed",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[3], // completed appointment
    patientId: extendedPatientIds[3],
    doctorId: extendedDoctorIds[3],
    rating: 4.5,
    comments: "Very caring and understanding consultation.",
    status: "reviewed",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[5], // completed appointment
    patientId: extendedPatientIds[5],
    doctorId: extendedDoctorIds[5],
    rating: 4.2,
    comments: "Quick diagnosis, explained the problem well.",
    status: "pending", // random: pending
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[7], // completed appointment
    patientId: extendedPatientIds[7],
    doctorId: extendedDoctorIds[7],
    rating: 4.0,
    comments: "Follow-up went smoothly.",
    status: "reviewed",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[10], // completed appointment
    patientId: extendedPatientIds[0],
    doctorId: extendedDoctorIds[1],
    rating: 5.0,
    comments: "Second visit was even better!",
    status: "reviewed",
    createdAt: new Date()
  }
]);



// PAYMENTS 
db.payments.insertMany([ { appointmentId: appointmentIds[0], patientId: patientIds[0], doctorId: doctorIds[0], amount: Number("2500.00"), status: "pending", method: "card", paidAt: new Date(), createdAt: new Date() }, { appointmentId: appointmentIds[1], patientId: patientIds[1], doctorId: doctorIds[1], amount: Number("3000.00"), status: "paid", method: "cash", paidAt: new Date(), createdAt: new Date() }, { appointmentId: appointmentIds[2], patientId: patientIds[2], doctorId: doctorIds[2], amount: Number("3500.00"), status: "pending", method: "card", createdAt: new Date() } ]);


//more payments
db.payments.insertMany([
  {
    appointmentId: extendedAppointmentIds[0],
    patientId: extendedPatientIds[0],
    doctorId: extendedDoctorIds[0],
    amount: 4000,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[1],
    patientId: extendedPatientIds[1],
    doctorId: extendedDoctorIds[1],
    amount: 3000,
    status: "paid",
    method: "cash",
    paidAt: new Date(),
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[3],
    patientId: extendedPatientIds[3],
    doctorId: extendedDoctorIds[3],
    amount: 4500,
    status: "paid",
    method: "online",
    paidAt: new Date(),
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[4],
    patientId: extendedPatientIds[4],
    doctorId: extendedDoctorIds[4],
    amount: 2500,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[5],
    patientId: extendedPatientIds[5],
    doctorId: extendedDoctorIds[5],
    amount: 5000,
    status: "paid",
    method: "cash",
    paidAt: new Date(),
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[7],
    patientId: extendedPatientIds[7],
    doctorId: extendedDoctorIds[7],
    amount: 2800,
    status: "paid",
    method: "online",
    paidAt: new Date(),
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[9],
    patientId: extendedPatientIds[9],
    doctorId: extendedDoctorIds[9],
    amount: 3800,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[10],
    patientId: extendedPatientIds[0],
    doctorId: extendedDoctorIds[1],
    amount: 3000,
    status: "paid",
    method: "cash",
    paidAt: new Date(),
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[6],
    patientId: extendedPatientIds[6],
    doctorId: extendedDoctorIds[6],
    amount: 3200,
    status: "pending",
    method: "card",
    createdAt: new Date()
  },
  {
    appointmentId: extendedAppointmentIds[11],
    patientId: extendedPatientIds[1],
    doctorId: extendedDoctorIds[2],
    amount: 3500,
    status: "pending",
    method: "online",
    createdAt: new Date()
  }
]);
