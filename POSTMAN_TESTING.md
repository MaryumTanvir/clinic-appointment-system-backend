# Clinic Appointment System – Postman API Testing

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require an `Authorization` header with a JWT token obtained from the login endpoint.

**Header Format**:
```
Authorization: Bearer <token>
```

---

## Authentication Routes

---

### Login for All Users

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **URL**: `http://localhost:5000/api/auth/login`
- **Description**: Authenticates a user (`patient`, `doctor`, or `admin`) and returns a JWT token.
- **Authorization**: None
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "email": "jane.doe@example.com",
  "password": "Patient123"
}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "680c85b95639b34217b5f89a",
    "email": "jane.doe@example.com",
    "role": "patient",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
```

---

### Signup for All Users

- **Method**: `POST`
- **Endpoint**: `/auth/signup`
- **URL**: `http://localhost:5000/api/auth/signup`
- **Description**: Registers a new user (`patient`, `doctor`, or `admin`) and creates a corresponding profile (`patientProfiles`, `doctorProfiles`, or `adminProfiles`).
- **Authorization**: None
- **Content-Type**: `application/json`

#### Request Body (Patient)

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "gender": "female",
  "email": "jane.doe@example.com",
  "password": "Patient123",
  "role": "patient",
  "profile": {
    "age": 30,
    "contact": {
      "phone": "1234567890",
      "address": "123 Main St"
    },
    "medicalHistory": ["Hypertension"]
  }
}
```

#### Request Body (Doctor)

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "gender": "male",
  "email": "john.smith@example.com",
  "password": "Doctor123",
  "role": "doctor",
  "profile": {
    "specialty": "Cardiology",
    "credentials": "MD, FACC",
    "consultationFee": 2500,
    "availability": [
      {
        "date": "2025-05-01",
        "time": "09:00",
        "available": true
      }
    ],
    "contact": {
      "phone": "0987654321",
      "location": "Clinic A"
    }
  }
}
```

#### Request Body (Admin)

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "gender": "female",
  "email": "alice.johnson@example.com",
  "password": "Admin123",
  "role": "admin",
  "profile": {
    "department": "IT",
    "designation": "System Administrator",
    "contact": {
      "phone": "1122334455",
      "officeLocation": "Building B"
    }
  }
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "680c85b95639b34217b5f89a",
    "email": "jane.doe@example.com",
    "role": "patient",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
```


---

# Admin Routes — Clinic Appointment System

## 1. Get Pending Doctor Requests

- **Method:** `GET`
- **Endpoint:** `/admin/doctor-requests`
- **URL:** `http://localhost:5000/api/admin/doctor-requests`
- **Description:** Fetch all doctor signup requests where status is `pending`.
- **Authentication:** Bearer Token (Admin)

---

## 2. Approve Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/approve`
- **URL Example:** `http://localhost:5000/api/admin/doctor-requests/{id}/approve`
- **Description:** Approves a pending doctor signup request, creates a new `User` and `DoctorProfile`.
- **Authentication:** Bearer Token (Admin)

---

## 3. Reject Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/reject`
- **URL Example:** `http://localhost:5000/api/admin/doctor-requests/{id}/reject`
- **Description:** Rejects a doctor signup request and updates status to `rejected`.
- **Authentication:** Bearer Token (Admin)

---

## 4. Delete Doctor Profile

- **Method:** `DELETE`
- **Endpoint:** `/admin/doctors/:id`
- **URL Example:** `http://localhost:5000/api/admin/doctors/{id}`
- **Description:** Deletes a doctor's User + DoctorProfile after ensuring the doctor has no appointments.
- **Authentication:** Bearer Token (Admin)

- **Special Condition:**  
  If the doctor has any appointments (scheduled, completed, etc.), deletion will be **blocked**.

---

## 5. Assign Shift to Doctor

- **Method:** `POST`
- **Endpoint:** `/admin/assign-shift`
- **URL:** `http://localhost:5000/api/admin/assign-shift`
- **Description:** Assigns a shift (morning, evening, night) to a doctor if:
  - Doctor has no existing shift on the given date
  - Date is not in the past
- **Authentication:** Bearer Token (Admin)

- **Sample Request Body:**

```json
{
  "doctorId": "doctor-objectid",
  "date": "2025-05-10",
  "startTime": "09:00",
  "endTime": "17:00",
  "shiftType": "morning",
  "location": "Cardiology Department"
}
```

---

## 6. Get Logged-In Admin Profile

- **Method:** `GET`
- **Endpoint:** `/admin/profile`
- **URL:** `http://localhost:5000/api/admin/profile`
- **Description:** Fetches full profile details of the logged-in admin (via token).
- **Authentication:** Bearer Token (Admin)

- **Sample Response:**

```json
{
  "success": true,
  "data": {
    "_id": "admin-objectid",
    "firstName": "Admin",
    "lastName": "Fatima",
    "gender": "female",
    "email": "admin1@clinic.com",
    "role": "admin",
    "profileImage": "https://example.com/admin.jpg",
    "createdAt": "2025-04-25T...",
    "updatedAt": "2025-04-25T..."
  }
}
```

---

## 7. Update Logged-In Admin Profile

- **Method:** `PUT`
- **Endpoint:** `/admin/profile`
- **URL:** `http://localhost:5000/api/admin/profile`
- **Description:** Allows an admin to update their own information (e.g., name, gender, department).
- **Authentication:** Bearer Token (Admin)

- **Sample Request Body:**

```json
{
  "firstName": "UpdatedFirstName",
  "lastName": "UpdatedLastName",
  "gender": "female",
  "email": "updatedadmin@clinic.com",
  "profileImage": "https://example.com/updated.jpg",
  "department": "Management",
  "designation": "Senior Manager",
  "contact": {
    "phone": "03441234567",
    "officeLocation": "Main Office"
  }
}
```

- **Sample Response:**

```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "user": {
      "_id": "admin-user-objectid",
      "firstName": "UpdatedFirstName",
      "lastName": "UpdatedLastName",
      ...
    },
    "adminProfile": {
      "_id": "admin-profile-objectid",
      "department": "Management",
      "designation": "Senior Manager",
      ...
    }
  }
}
```

---



---

## Patient Routes

---

### Get All Doctors

- **Method**: `GET`
- **Endpoint**: `/patients/doctors`
- **URL**: `http://localhost:5000/api/patients/doctors`
- **Description**: Fetches all approved doctors.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "680c85b95639b34217b5f89a",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "role": "doctor",
      "profile": {
        "specialty": "Cardiology",
        "consultationFee": 2500,
        "approved": true
      }
    },
    {
      "_id": "680c85b95639b34217b5f89b",
      "firstName": "Sarah",
      "lastName": "Lee",
      "email": "sarah.lee@example.com",
      "role": "doctor",
      "profile": {
        "specialty": "Neurology",
        "consultationFee": 3000,
        "approved": true
      }
    }
  ]
}
```

---

### Get Doctors by Specialty

- **Method**: `GET`
- **Endpoint**: `/patients/doctors?specialty=Cardiologist`
- **URL**: `http://localhost:5000/api/patients/doctors?specialty=Cardiologist`
- **Description**: Fetches approved doctors filtered by specialty (case-insensitive).
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "680c85b95639b34217b5f89a",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "role": "doctor",
      "profile": {
        "specialty": "Cardiology",
        "consultationFee": 2500,
        "approved": true
      }
    }
  ]
}
```

---

### Get Patient Profile

- **Method**: `GET`
- **Endpoint**: `/patients/profile`
- **URL**: `http://localhost:5000/api/patients/profile`
- **Description**: Fetches the authenticated patient’s profile details.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "680c85b95639b34217b5f89a",
      "firstName": "Jane",
      "lastName": "Doe",
      "gender": "female",
      "email": "jane.doe@example.com",
      "role": "patient"
    },
    "profile": {
      "userId": "680c85b95639b34217b5f89a",
      "age": 30,
      "contact": {
        "phone": "1234567890",
        "address": "123 Main St"
      },
      "medicalHistory": ["Hypertension"]
    }
  }
}
```

---

### Get Patient Dashboard

- **Method**: `GET`
- **Endpoint**: `/patients/dashboard`
- **URL**: `http://localhost:5000/api/patients/dashboard`
- **Description**: Fetches the patient’s dashboard data, including upcoming appointments and payment summary.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "upcomingAppointments": [
      {
        "_id": "680c85b95639b34217b5f89b",
        "doctorId": {
          "firstName": "John",
          "lastName": "Smith"
        },
        "date": "2025-05-01T00:00:00.000Z",
        "time": "09:00",
        "status": "scheduled",
        "notes": "Follow-up for chest pain"
      }
    ],
    "paymentSummary": {
      "totalPaid": 2500,
      "pendingPayments": 5000
    }
  }
}
```

---

### Get Patient Payments

- **Method**: `GET`
- **Endpoint**: `/patients/payments`
- **URL**: `http://localhost:5000/api/patients/payments`
- **Description**: Fetches all payments (`paid` and `pending`) for the authenticated patient.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "680c85b95639b34217b5f89c",
      "appointmentId": {
        "_id": "680c85b95639b34217b5f89b",
        "date": "2025-05-01T00:00:00.000Z",
        "time": "09:00",
        "status": "scheduled"
      },
      "patientId": "680c85b95639b34217b5f89a",
      "doctorId": {
        "_id": "680c85b95639b34217b5f89d",
        "firstName": "John",
        "lastName": "Smith"
      },
      "amount": 2500,
      "status": "paid",
      "method": "credit_card",
      "paidAt": "2025-04-26T12:43:00.000Z",
      "createdAt": "2025-04-26T12:41:00.000Z"
    },
    {
      "_id": "680c85b95639b34217b5f89e",
      "appointmentId": {
        "_id": "680c85b95639b34217b5f89f",
        "date": "2025-05-02T00:00:00.000Z",
        "time": "10:00",
        "status": "scheduled"
      },
      "patientId": "680c85b95639b34217b5f89a",
      "doctorId": {
        "_id": "680c85b95639b34217b5f89d",
        "firstName": "John",
        "lastName": "Smith"
      },
      "amount": 2500,
      "status": "pending",
      "createdAt": "2025-04-26T12:42:00.000Z"
    }
  ]
}
```

---

### Post Patient Feedback

- **Method**: `POST`
- **Endpoint**: `/patients/feedback`
- **URL**: `http://localhost:5000/api/patients/feedback`
- **Description**: Submits feedback for a completed appointment.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "appointmentId": "680c85b95639b34217b5f89b",
  "rating": 5,
  "comment": "Excellent consultation, very thorough."
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "_id": "680c85b95639b34217b5f8a0",
    "appointmentId": "680c85b95639b34217b5f89b",
    "patientId": "680c85b95639b34217b5f89a",
    "doctorId": "680c85b95639b34217b5f89d",
    "rating": 5,
    "comment": "Excellent consultation, very thorough.",
    "createdAt": "2025-04-26T12:45:00.000Z"
  }
}
```
---

### Post Patient Payments

- **Method**: `POST`
- **Endpoint**: `/patients/payments`
- **URL**: `http://localhost:5000/api/patients/payments`
- **Description**: Pays one or multiple pending payments for appointments.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "appointmentIds": [
    "680c85b95639b34217b5f89f",
    "680c85b95639b34217b5f8a1"
  ],
  "method": "credit_card"
}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Payments processed successfully",
  "data": [
    {
      "_id": "680c85b95639b34217b5f89e",
      "appointmentId": "680c85b95639b34217b5f89f",
      "patientId": "680c85b95639b34217b5f89a",
      "doctorId": "680c85b95639b34217b5f89d",
      "amount": 2500,
      "status": "paid",
      "method": "credit_card",
      "paidAt": "2025-04-26T12:43:00.000Z",
      "createdAt": "2025-04-26T12:42:00.000Z"
    },
    {
      "_id": "680c85b95639b34217b5f8a2",
      "appointmentId": "680c85b95639b34217b5f8a1",
      "patientId": "680c85b95639b34217b5f89a",
      "doctorId": "680c85b95639b34217b5f89d",
      "amount": 2500,
      "status": "paid",
      "method": "credit_card",
      "paidAt": "2025-04-26T12:43:00.000Z",
      "createdAt": "2025-04-26T12:42:00.000Z"
    }
  ]
}
```
---

### Post Patient Appointment

- **Method**: `POST`
- **Endpoint**: `/patients/appointments`
- **URL**: `http://localhost:5000/api/patients/appointments`
- **Description**: Books a new appointment with a doctor, including optional notes, and creates a pending payment.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "doctorId": "680c85b95639b34217b5f89d",
  "date": "2025-05-01",
  "time": "09:00",
  "notes": "Follow-up for chest pain"
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "680c85b95639b34217b5f8a3",
    "patientId": "680c85b95639b34217b5f89a",
    "doctorId": "680c85b95639b34217b5f89d",
    "date": "2025-05-01T00:00:00.000Z",
    "time": "09:00",
    "status": "scheduled",
    "notes": "Follow-up for chest pain",
    "createdAt": "2025-04-26T12:41:00.000Z",
    "updatedAt": "2025-04-26T12:41:00.000Z"
  }
}
```
---

### Get Patient Appointments by Time Period

- **Method**: `GET`
- **Endpoint**: `/patients/appointments?time=<past|today|future>`
- **URL**: `http://localhost:5000/api/patients/appointments?time=past`
- **Description**: Fetches the authenticated patient’s appointments filtered by time period (past, today, or future).
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Query Parameters
- `time` (required): One of `past`, `today`, or `future`.

#### Sample Response (200 OK)

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "680c85b95639b34217b5f8a3",
      "patientId": "680c85b95639b34217b5f89a",
      "doctorId": {
        "_id": "680c85b95639b34217b5f89d",
        "firstName": "John",
        "lastName": "Smith"
      },
      "date": "2025-04-25T00:00:00.000Z",
      "time": "09:00",
      "status": "completed",
      "notes": "Follow-up for chest pain",
      "createdAt": "2025-04-24T12:41:00.000Z",
      "updatedAt": "2025-04-24T12:41:00.000Z"
    }
  ]
}

---
### Cancel Appointment

- **Method**: `PUT`
- **Endpoint**: `/patients/appointments/:id/cancel`
- **Example URL**: `http://localhost:5000/api/patients/appointments/680c85b95639b34217b5f8a3/cancel`
- **Description**: Cancels a scheduled or rescheduled appointment, updates associated pending payment to cancelled, and frees the doctor’s availability slot.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: None

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "680c85b95639b34217b5f8a3",
    "patientId": "680c85b95639b34217b5f89a",
    "doctorId": "680c85b95639b34217b5f89d",
    "date": "2025-05-01T00:00:00.000Z",
    "time": "09:00",
    "status": "cancelled",
    "notes": "Follow-up for chest pain",
    "createdAt": "2025-04-26T12:41:00.000Z",
    "updatedAt": "2025-04-26T12:45:00.000Z"
  }
}
---

---

### Reschedule Appointment

- **Method**: `PUT`
- **Endpoint**: `/patients/appointments/:id/reschedule`
- **Example URL**: `http://localhost:5000/api/patients/appointments/680c85b95639b34217b5f8a3/reschedule`
- **Description**: Reschedules an appointment to a new date and time, updates notes if provided, and ensures the new slot is available.
- **Authorization**: Bearer Token (Patient)
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "date": "2025-05-02",
  "time": "10:00",
  "notes": "Rescheduled follow-up for chest pain"
}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "_id": "680c85b95639b34217b5f8a3",
    "patientId": "680c85b95639b34217b5f89a",
    "doctorId": "680c85b95639b34217b5f89d",
    "date": "2025-05-02T00:00:00.000Z",
    "time": "10:00",
    "status": "rescheduled",
    "notes": "Rescheduled follow-up for chest pain",
    "rescheduledFrom": "680c85b95639b34217b5f8a3",
    "createdAt": "2025-04-26T12:41:00.000Z",
    "updatedAt": "2025-04-26T12:45:00.000Z"
  }
}
```
---

---

### Step 4: Test the Endpoints

#### 4.1 Seed Test Data
Ensure your `users`, `doctorProfiles`, `appointments`, and `payments` collections have relevant data. Use the reference script or manually insert:

```bash
mongosh
use clinic-management-system
db.users.insertMany([
  {
    _id: ObjectId("680c85b95639b34217b5f89a"),
    firstName: "Ahmed",
    lastName: "Khan",
    gender: "male",
    email: "ahmed@clinic.com",
    password: "$2b$10$...",
    role: "patient",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("680c85b95639b34217b5f89d"),
    firstName: "John",
    lastName: "Smith",
    gender: "male",
    email: "john.smith@clinic.com",
    password: "$2b$10$...",
    role: "doctor",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
db.doctorProfiles.insertOne({
  userId: ObjectId("680c85b95639b34217b5f89d"),
  specialty: "Cardiology",
  credentials: "MBBS, MD",
  approved: true,
  consultationFee: 2500,
  availability: [
    { date: ISODate("2025-05-01"), time: "09:00", available: false },
    { date: ISODate("2025-05-02"), time: "10:00", available: true }
  ],
  contact: { phone: "0987654321", location: "Clinic A" },
  createdAt: new Date(),
  updatedAt: new Date()
});
db.appointments.insertOne({
  _id: ObjectId("680c85b95639b34217b5f8a3"),
  patientId: ObjectId("680c85b95639b34217b5f89a"),
  doctorId: ObjectId("680c85b95639b34217b5f89d"),
  date: ISODate("2025-05-01"),
  time: "09:00",
  status: "scheduled",
  notes: "Follow-up for chest pain",
  createdAt: new Date(),
  updatedAt: new Date()
});
db.payments.insertOne({
  appointmentId: ObjectId("680c85b95639b34217b5f8a3"),
  patientId: ObjectId("680c85b95639b34217b5f89a"),
  doctorId: ObjectId("680c85b95639b34217b5f89d"),
  amount: 2500,
  status: "pending",
  createdAt: new Date()
});
```

#### 4.2 Get a JWT Token
- **Request**:
  - **Method**: `POST`
  - **URL**: `http://localhost:5000/api/auth/login`
  - **Body**:
    ```json
    {
      "email": "ahmed@clinic.com",
      "password": "hashedPatient1" // Replace with original password
    }
    ```
  - **Expected**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

#### 4.3 Test Cancel Appointment
- **Request**:
  - **Method**: `PUT`
  - **URL**: `http://localhost:5000/api/patients/appointments/680c85b95639b34217b5f8a3/cancel`
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **Expected Response** (200 OK):
    ```json
    {
      "success": true,
      "message": "Appointment cancelled successfully",
      "data": {
        "_id": "680c85b95639b34217b5f8a3",
        "patientId": "680c85b95639b34217b5f89a",
        "doctorId": "680c85b95639b34217b5f89d",
        "date": "2025-05-01T00:00:00.000Z",
        "time": "09:00",
        "status": "cancelled",
        "notes": "Follow-up for chest pain",
        "createdAt": "2025-04-26T12:41:00.000Z",
        "updatedAt": "2025-04-26T12:45:00.000Z"
      }
    }
    ```
- **Verify**:
  ```bash
  use clinic-management-system
  db.appointments.findOne({ _id: ObjectId("680c85b95639b34217b5f8a3") }).pretty()
  db.payments.findOne({ appointmentId: ObjectId("680c85b95639b34217b5f8a3") }).pretty()
  db.doctorProfiles.findOne({ userId: ObjectId("680c85b95639b34217b5f89d") }).pretty()
  ```
  - Appointment `status`: `cancelled`.
  - Payment `status`: `cancelled` (if previously `pending`).
  - Doctor `availability`: `available: true` for `2025-05-01`, `09:00`.

#### 4.4 Test Reschedule Appointment
- **Request**:
  - **Method**: `PUT`
  - **URL**: `http://localhost:5000/api/patients/appointments/680c85b95639b34217b5f8a3/reschedule`
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Body**:
    ```json
    {
      "date": "2025-05-02",
      "time": "10:00",
      "notes": "Rescheduled follow-up for chest pain"
    }
    ```
  - **Expected Response** (200 OK):
    ```json
    {
      "success": true,
      "message": "Appointment rescheduled successfully",
      "data": {
        "_id": "680c85b95639b34217b5f8a3",
        "patientId": "680c85b95639b34217b5f89a",
        "doctorId": "680c85b95639b34217b5f89d",
        "date": "2025-05-02T00:00:00.000Z",
        "time": "10:00",
        "status": "rescheduled",
        "notes": "Rescheduled follow-up for chest pain",
        "rescheduledFrom": "680c85b95639b34217b5f8a3",
        "createdAt": "2025-04-26T12:41:00.000Z",
        "updatedAt": "2025-04-26T12:45:00.000Z"
      }
    }
    ```
---

## Notes

- **Token Management**: Use the token from `/auth/login` or `/auth/signup` for all patient routes. Tokens expire after 1 hour.
- **MongoDB Verification**:
  - After signup, check `users` and respective profile collections (`patientProfiles`, `doctorProfiles`, `adminProfiles`).
  - After appointment booking, check `appointments` and `payments` for pending payment.
  - Use `mongo` shell:
    ```bash
    use clinic
    db.users.find({ email: "jane.doe@example.com" })
    db.appointments.find({ patientId: ObjectId("<patient-id>") })
    db.payments.find({ patientId: ObjectId("<patient-id>") })
    ```
- **Error Debugging**:
  - Check server logs for errors.
  - Ensure `JWT_SECRET` is set in `.env`.
  - Verify `patient.controller.js` import to resolve `TypeError: argument handler must be a function`.

---

