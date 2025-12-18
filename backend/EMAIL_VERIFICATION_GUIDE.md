# Email Verification Guide

## 📧 Email Verification System

ระบบยืนยันอีเมลสำหรับ RGA Dashboard API ที่ทำงานร่วมกับ Authentication, Users, และ Tenants

---

## 🔐 Features

### ✅ Authentication with Email Verification
- **Register**: ส่ง verification email อัตโนมัติเมื่อสมัคร
- **Login**: ตรวจสอบ email verification status
- **Verify Email**: ยืนยันอีเมลด้วย token
- **Resend Verification**: ส่ง verification email ใหม่

### ✅ Email Service
- ส่ง verification email อัตโนมัติ
- ส่ง password reset email
- รองรับ SMTP configuration
- Development mode (console logging)

---

## 🚀 API Endpoints

### 1. Register (with Email Verification)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "tenantId": "tenant-uuid",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "emailVerified": false
  },
  "verificationToken": "token-here" // Only in development mode
}
```

### 2. Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true
  }
}
```

### 3. Resend Verification Email
```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with this email exists, a verification email has been sent.",
  "verificationToken": "token-here" // Only in development mode
}
```

### 4. Login (with Email Verification Check)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "tenantId": "tenant-uuid"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "tenantId": "tenant-uuid",
    "emailVerified": true
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@rgadashboard.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Development Mode

ถ้าไม่ตั้งค่า SMTP ระบบจะทำงานใน **Development Mode**:
- Log verification token ไปที่ console
- ไม่ส่ง email จริง
- ใช้สำหรับทดสอบ

---

## 📝 Usage Examples

### 1. Register New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "tenantId": "your-tenant-id",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Verify Email

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

### 3. Resend Verification Email

```bash
curl -X POST http://localhost:3001/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 4. Login with Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "tenantId": "your-tenant-id"
  }'
```

### 5. Use Token for Protected Routes

```bash
# Get current user
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer your-jwt-token" \
  -H "x-tenant-id: your-tenant-id"

# List users (requires authentication)
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-jwt-token" \
  -H "x-tenant-id: your-tenant-id"

# List tenants (requires authentication)
curl -X GET http://localhost:3001/api/v1/tenants \
  -H "Authorization: Bearer your-jwt-token" \
  -H "x-tenant-id: your-tenant-id"
```

---

## 🔒 Security Features

### Token-Based Authentication
- JWT tokens สำหรับ authentication
- Token expiration (default: 7 days)
- Token refresh mechanism

### Email Verification
- Verification token expires in 24 hours
- Token type validation
- Prevents email enumeration

### Password Reset
- Reset token expires in 1 hour
- Secure token generation
- Email-based reset flow

---

## 📊 Database Schema

### User Model
```prisma
model User {
  id               String     @id @default(uuid())
  email            String
  emailVerified    Boolean    @default(false)  // Email verification status
  passwordHash     String
  // ... other fields
}
```

---

## 🧪 Testing

### Development Mode Testing

1. **Register User**
   ```bash
   POST /api/v1/auth/register
   ```
   - ตรวจสอบ console log สำหรับ verification token
   - Token จะอยู่ใน response (development mode only)

2. **Verify Email**
   ```bash
   POST /api/v1/auth/verify-email
   ```
   - ใช้ token จาก console log หรือ response

3. **Login**
   ```bash
   POST /api/v1/auth/login
   ```
   - ตรวจสอบ `emailVerified` ใน response

---

## 🔄 Workflow

### Registration Flow
1. User registers → System creates user with `emailVerified: false`
2. System generates verification token
3. System sends verification email
4. User clicks link in email → Verifies email
5. System updates `emailVerified: true`

### Login Flow
1. User logs in with email/password
2. System validates credentials
3. System checks `emailVerified` status
4. System returns token + user info (including `emailVerified`)
5. User can use token for protected routes

### Protected Routes
1. User includes token in `Authorization: Bearer <token>` header
2. System validates token
3. System checks user is active
4. System allows access to route

---

## 📚 Related Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with email verification
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/me` - Get current user (requires token)
- `POST /api/v1/auth/refresh` - Refresh token

### Users (requires token)
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Tenants (requires token)
- `GET /api/v1/tenants` - List tenants
- `GET /api/v1/tenants/:id` - Get tenant
- `POST /api/v1/tenants` - Create tenant
- `PUT /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant

---

## ✅ Status

**Status**: ✅ **Production Ready**

**Features**:
- ✅ Email verification on registration
- ✅ Email verification endpoint
- ✅ Resend verification email
- ✅ Token-based authentication
- ✅ Protected routes with token
- ✅ Email service (SMTP + Development mode)

---

**อัปเดตล่าสุด**: 2025-11-13  
**เวอร์ชัน**: 1.0.0

