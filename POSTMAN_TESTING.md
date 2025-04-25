
---

#  Clinic Appointment System – Postman API Testing

##  Base URL

http://localhost:5000/api

##  Admin Routes

### Get Pending Doctor Requests

- Method: **GET**
- Endpoint: `/admin/doctor-requests`
- URL: `http://localhost:5000/api/admin/doctor-requests`
- Description: Fetch all doctor requests where status is `pending`.
- Authorization: No auth (for now, can add later)
- Sample Response:

```json
[
  {
    "_id": "doctorRequestId",
    "name": "Dr. Zainab Tariq",
    "email": "zainab@clinic.com",
    "specialty": "ENT",
    "status": "pending",
    "requestedAt": "2025-04-25T..."
  }
] ```

###  Approve Doctor Request

- Method: **PUT**
- Endpoint: `/admin/doctor-requests/:id/approve`
- URL Example: `http://localhost:5000/api/admin/doctor-requests/66309f9f1fc5de2d82398c25/approve`
- Description: Approve a pending doctor signup request and move it to active users and doctor profiles.
- Authorization: No auth (for now)
- Sample Response (Success):

```json
{
  "success": true,
  "message": "Doctor approved and created successfully",
  "data": {
    "user": { "firstName": "Zainab", "lastName": "Tariq", "email": "zainab@clinic.com" },
    "doctorProfile": { "specialty": "ENT", "credentials": "MBBS" }
  }
}
