# 🚗 Driving School API Documentation

## Overview

The Driving School Management System API is a RESTful service built with Node.js, Express.js, and MySQL/PostgreSQL. It provides comprehensive functionality for managing driving school operations including user authentication, booking management, payment processing, and administrative features.

## Base URL

- **Development**: `http://localhost:5001`
- **Production**: `https://your-domain.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Types

- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Endpoints

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+1234567890",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### Google OAuth Login
```http
GET /api/auth/google
```

#### Google OAuth Callback
```http
GET /api/auth/google/callback
```

### 📅 Booking Endpoints

#### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 1,
        "instructorId": 1,
        "packageId": 1,
        "date": "2024-01-20",
        "time": "10:00",
        "duration": 60,
        "status": "confirmed",
        "notes": "First lesson",
        "instructor": {
          "id": 1,
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "package": {
          "id": 1,
          "name": "Beginner Package",
          "price": 299.99
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "instructorId": 1,
  "packageId": 1,
  "date": "2024-01-20",
  "time": "10:00",
  "duration": 60,
  "notes": "First lesson"
}
```

#### Update Booking
```http
PUT /api/bookings/:id
Authorization: Bearer <access-token>
```

#### Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <access-token>
```

### 👨‍🏫 Instructor Endpoints

#### Get All Instructors
```http
GET /api/instructors
```

**Query Parameters:**
- `available` (optional): Filter by availability (true/false)
- `specialty` (optional): Filter by specialty

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@drivingschool.com",
      "phone": "+1234567890",
      "experience": 5,
      "specialties": ["Beginner", "Highway"],
      "rating": 4.8,
      "bio": "Experienced instructor with 5 years of teaching",
      "availability": {
        "monday": ["09:00", "14:00"],
        "tuesday": ["10:00", "15:00"],
        "wednesday": ["09:00", "16:00"],
        "thursday": ["10:00", "14:00"],
        "friday": ["09:00", "15:00"]
      }
    }
  ]
}
```

#### Get Instructor Details
```http
GET /api/instructors/:id
```

### 📦 Package Endpoints

#### Get All Packages
```http
GET /api/packages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Beginner Package",
      "description": "Perfect for first-time drivers",
      "price": 299.99,
      "duration": 10,
      "lessons": 10,
      "features": [
        "10 driving lessons",
        "Theory classes",
        "Test preparation",
        "Certificate of completion"
      ],
      "isActive": true
    }
  ]
}
```

### 💳 Payment Endpoints

#### Create Payment Intent
```http
POST /api/payments/create-payment-intent
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "amount": 29999,
  "currency": "usd",
  "packageId": 1,
  "bookingIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

#### Confirm Payment
```http
POST /api/payments/confirm-payment
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "packageId": 1
}
```

#### Get Payment History
```http
GET /api/payments/history
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### 👥 Admin Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-access-token>
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin-access-token>
```

#### Get All Bookings
```http
GET /api/admin/bookings
Authorization: Bearer <admin-access-token>
```

#### Update Booking Status
```http
PUT /api/admin/bookings/:id
Authorization: Bearer <admin-access-token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Get Payment Analytics
```http
GET /api/admin/payments
Authorization: Bearer <admin-access-token>
```

### 📞 Contact Endpoints

#### Submit Contact Form
```http
POST /api/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry about driving lessons",
  "message": "I would like to know more about your beginner package."
}
```

### 🏥 Health Check

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Driving School API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Codes

### Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Token invalid
- `AUTH_004`: Insufficient permissions
- `AUTH_005`: Account not verified

### Validation Errors
- `VAL_001`: Required field missing
- `VAL_002`: Invalid email format
- `VAL_003`: Password too weak
- `VAL_004`: Invalid phone number
- `VAL_005`: Date in the past

### Business Logic Errors
- `BIZ_001`: Instructor not available
- `BIZ_002`: Booking time conflict
- `BIZ_003`: Package not found
- `BIZ_004`: Payment failed
- `BIZ_005`: Insufficient balance

### System Errors
- `SYS_001`: Database connection error
- `SYS_002`: External service unavailable
- `SYS_003`: File upload failed
- `SYS_004`: Email service error

## Webhooks

### Stripe Webhooks

The API accepts Stripe webhooks for payment events:

```http
POST /api/webhooks/stripe
```

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install axios
```

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Python
```bash
pip install requests
```

```python
import requests

class DrivingSchoolAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
    
    def get_bookings(self):
        response = self.session.get(f'{self.base_url}/api/bookings')
        return response.json()
```

## Testing

### Test Environment

Use the test environment for development and testing:
- **Base URL**: `http://localhost:5001`
- **Test Cards**: See Stripe test cards below

### Test Data

#### Test Users
- **Admin**: `admin@drivingschool.com` / `Admin123!`
- **Instructor**: `instructor@drivingschool.com` / `Instructor123!`
- **Student**: Register new account

#### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expiry**: `12/25`
- **CVC**: `123`

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 10 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| File Upload | 20 requests | 1 hour |
| Payment | 50 requests | 1 hour |

## Security

### HTTPS
All production endpoints require HTTPS. Development endpoints use HTTP.

### CORS
Cross-Origin Resource Sharing is configured for specific domains:
- Development: `http://localhost:3000`
- Production: Your production domain

### Headers
Security headers are automatically added:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Support

For API support and questions:
- **Documentation**: This file
- **Issues**: GitHub Issues
- **Email**: api-support@drivingschool.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Authentication system
- Booking management
- Payment processing
- Admin dashboard
- Contact form
