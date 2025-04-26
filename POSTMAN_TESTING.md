Got it — here's the exact same markdown you asked for, but **without any emojis** for a clean, professional version:

---

# Clinic Appointment System – Postman API Testing

---

## Base URL

```
http://localhost:5000/api
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

