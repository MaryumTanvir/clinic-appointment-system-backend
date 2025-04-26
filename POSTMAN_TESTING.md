# Clinic Appointment System – Postman API Testing

---

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

## Admin Routes

---

### Get Pending Doctor Requests

- **Method:** `GET`
- **Endpoint:** `/admin/doctor-requests`
- **URL:** `http://localhost:5000/api/admin/doctor-requests`
- **Description:** Fetch all doctor signup requests that are pending approval.
- **Authorization:** No auth (for now)

#### Sample Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "doctorRequestId",
      "firstName": "Zainab",
      "lastName": "Tariq",
      "gender": "female",
      "email": "zainab@clinic.com",
      "specialty": "ENT",
      "status": "pending",
      "requestedAt": "2025-04-25T..."
    }
  ]
}
```

---

### Approve Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/approve`
- **Example URL:** `http://localhost:5000/api/admin/doctor-requests/680bac695e070132ef4d7956/approve`
- **Description:** Approve a pending doctor request. Moves to `users` and `doctorProfiles` collections.

#### Sample Response

```json
{
  "success": true,
  "message": "Doctor approved and created successfully",
  "data": {
    "user": {
      "firstName": "Zainab",
      "lastName": "Tariq",
      "gender": "female",
      "email": "zainab@clinic.com",
      "role": "doctor"
    },
    "doctorProfile": {
      "specialty": "ENT",
      "credentials": "MBBS",
      "consultationFee": 2500
    }
  }
}
```

---

### Reject Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/reject`
- **Example URL:** `http://localhost:5000/api/admin/doctor-requests/680bac695e070132ef4d7956/reject`
- **Description:** Rejects a pending doctor request.

#### Sample Response

```json
{
  "success": true,
  "message": "Doctor request rejected",
  "data": {
    "_id": "680bac695e070132ef4d7956",
    "firstName": "Kamran",
    "lastName": "Shah",
    "email": "kamran@clinic.com",
    "specialty": "Urology",
    "status": "rejected",
    "requestedAt": "2025-04-25T...",
    "reviewedAt": "2025-04-25T..."
  }
}
```

---

### Delete Doctor Profile

- **Method:** `DELETE`
- **Endpoint:** `/admin/doctors/:id`
- **Example URL:** `http://localhost:5000/api/admin/doctors/680bd1bfb4966f13c44d7956`
- **Description:** Deletes both the user and doctor profile based on user ID.

#### Sample Response

```json
{
  "success": true,
  "message": "Doctor profile deleted successfully",
  "deletedProfile": {
    "_id": "doctorProfileId",
    "specialty": "Dermatologist",
    "credentials": "MBBS, FCPS",
    "approved": true,
    "consultationFee": 2500,
    "createdAt": "2025-04-25T...",
    "updatedAt": "2025-04-25T..."
  },
  "deletedUser": {
    "_id": "userId",
    "firstName": "Areeba",
    "lastName": "Khan",
    "gender": "female",
    "email": "areeba@clinic.com",
    "role": "doctor",
    "createdAt": "2025-04-25T...",
    "updatedAt": "2025-04-25T..."
  }
}
```

---

### Update Doctor Info

- **Method:** `PUT`
- **Endpoint:** `/admin/doctors/:id`
- **Example URL:** `http://localhost:5000/api/admin/doctors/680bd1bfb4966f13c44d7956`
- **Description:** Update a doctor's basic profile and professional details.

#### Request Body Example

```json
{
  "firstName": "UpdatedFirstName",
  "lastName": "UpdatedLastName",
  "gender": "male",
  "specialty": "Updated Specialty",
  "credentials": "Updated Credentials",
  "consultationFee": 3200,
  "phone": "03001234567",
  "location": "Updated Location"
}
```

#### Sample Response

```json
{
  "success": true,
  "message": "Doctor info updated successfully",
  "data": {
    "user": {
      "_id": "userId",
      "firstName": "UpdatedFirstName",
      "lastName": "UpdatedLastName",
      "gender": "male",
      "email": "doctor@example.com",
      "role": "doctor"
    },
    "doctorProfile": {
      "_id": "doctorProfileId",
      "specialty": "Updated Specialty",
      "credentials": "Updated Credentials",
      "consultationFee": 3200,
      "contact": {
        "phone": "03001234567",
        "location": "Updated Location"
      }
    }
  }
}
```

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

