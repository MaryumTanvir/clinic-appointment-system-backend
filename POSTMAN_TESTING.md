Got it — no emojis, and use correct route `/admin/assign-shift` (singular shift).

Here’s the clean, updated and properly formatted **Postman Markdown**:

---

# Clinic Appointment System – Postman API Testing

## Base URL

```
http://localhost:5000/api
```

---

## Admin Routes

### 1. Get Pending Doctor Requests

- **Method:** `GET`
- **Endpoint:** `/admin/doctor-requests`
- **URL:** `http://localhost:5000/api/admin/doctor-requests`
- **Description:** Fetch all doctor signup requests where status is `pending`.

---

### 2. Approve Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/approve`
- **URL Example:** `http://localhost:5000/api/admin/doctor-requests/{id}/approve`
- **Description:** Approve a pending doctor signup request, create a User and Doctor Profile.

---

### 3. Reject Doctor Request

- **Method:** `PUT`
- **Endpoint:** `/admin/doctor-requests/:id/reject`
- **URL Example:** `http://localhost:5000/api/admin/doctor-requests/{id}/reject`
- **Description:** Reject a pending doctor request and update its status to `rejected`.

---

### 4. Delete Doctor Profile

- **Method:** `DELETE`
- **Endpoint:** `/admin/doctors/:id`
- **URL Example:** `http://localhost:5000/api/admin/doctors/{id}`
- **Description:** Deletes a doctor’s profile and user after ensuring no appointments are linked.

---

### 5. Assign Shift to Doctor

- **Method:** `POST`
- **Endpoint:** `/admin/assign-shift`
- **URL:** `http://localhost:5000/api/admin/assign-shift`
- **Description:** Assigns a shift (morning, evening, night) to a doctor if:
  - The doctor is available
  - No previous shift exists for that doctor on the same date
  - The date is not in the past

---

### 6. Get Logged-In Admin Profile

- **Method:** `GET`
- **Endpoint:** `/admin/profile`
- **URL:** `http://localhost:5000/api/admin/profile`
- **Description:** Fetch the profile details of the currently logged-in admin (temporary hardcoded admin for now).

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

