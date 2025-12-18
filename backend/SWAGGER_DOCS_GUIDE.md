# 📚 Swagger API Documentation Guide

## ✅ Swagger Documentation พร้อมใช้งานแล้ว!

### 🔗 Access Swagger UI

เปิดเบราว์เซอร์ไปที่:
```
http://localhost:3001/api-docs
```

---

## 📊 API Documentation ที่มี

### ✅ Auth Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/me` - Get current user (requires token)
- `POST /api/v1/auth/refresh` - Refresh token

### ✅ Users Endpoints
- `GET /api/v1/users` - List all users (requires token)
- `GET /api/v1/users/{id}` - Get user by ID (requires token)
- `POST /api/v1/users` - Create user (requires token)
- `PUT /api/v1/users/{id}` - Update user (requires token)
- `DELETE /api/v1/users/{id}` - Delete user (requires token)

### ✅ Tenants Endpoints
- `GET /api/v1/tenants` - List all tenants (requires token)
- `GET /api/v1/tenants/{id}` - Get tenant by ID (requires token)
- `POST /api/v1/tenants` - Create tenant (requires token)
- `PUT /api/v1/tenants/{id}` - Update tenant (requires token)
- `DELETE /api/v1/tenants/{id}` - Delete tenant (requires token)

---

## 🔐 การใช้งาน Token ใน Swagger

### 1. Login เพื่อรับ Token

1. ไปที่ `POST /api/v1/auth/login`
2. คลิก "Try it out"
3. ใส่ข้อมูล:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password",
     "tenantId": "your-tenant-id"
   }
   ```
4. คลิก "Execute"
5. คัดลอก `token` จาก response

### 2. ตั้งค่า Authorization

1. คลิกปุ่ม **"Authorize"** ด้านบนขวา
2. ใส่ token ในรูปแบบ: `Bearer <your-token>`
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. คลิก "Authorize"
4. คลิก "Close"

### 3. ทดสอบ Protected Endpoints

หลังจาก authorize แล้ว คุณสามารถ:
- ทดสอบ endpoints ที่ต้องการ authentication
- ดู response แบบ real-time
- ดู request/response examples

---

## 🧪 ตัวอย่างการใช้งาน

### 1. Register User
```
POST /api/v1/auth/register
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant-uuid",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant-uuid"
}
```

### 3. Get Current User (with token)
```
GET /api/v1/auth/me
Headers:
  Authorization: Bearer <token>
  x-tenant-id: <tenant-id>
```

### 4. List Users (with token)
```
GET /api/v1/users?page=1&limit=20
Headers:
  Authorization: Bearer <token>
  x-tenant-id: <tenant-id>
```

---

## 📝 Features ใน Swagger UI

### ✅ Available Features
- **Interactive API Testing** - ทดสอบ API ได้โดยตรง
- **Request/Response Examples** - ดูตัวอย่าง request/response
- **Schema Documentation** - ดู schema ของ request/response
- **Authentication** - ตั้งค่า token ได้ง่าย
- **Try it out** - ทดสอบ endpoints ได้ทันที

### 🔧 Swagger UI Features
- **Expand/Collapse** - ขยาย/ย่อ sections
- **Copy** - คัดลอก curl commands
- **Download** - ดาวน์โหลด OpenAPI spec
- **Search** - ค้นหา endpoints

---

## 🚀 Quick Start

### Step 1: เปิด Swagger UI
```
http://localhost:3001/api-docs
```

### Step 2: Login เพื่อรับ Token
1. ไปที่ `POST /api/v1/auth/login`
2. คลิก "Try it out"
3. ใส่ credentials
4. Execute และคัดลอก token

### Step 3: Authorize
1. คลิก "Authorize" button
2. ใส่ `Bearer <token>`
3. Authorize

### Step 4: ทดสอบ Endpoints
- ทดสอบ `GET /api/v1/auth/me`
- ทดสอบ `GET /api/v1/users`
- ทดสอบ `GET /api/v1/tenants`

---

## 📚 Documentation Structure

### Tags
- **Auth** - Authentication endpoints
- **Users** - User management
- **Tenants** - Tenant management
- **Campaigns** - Campaign management
- **Metrics** - Metrics and analytics
- **Alerts** - Alert management
- **Integrations** - Platform integrations
- **Reports** - Report generation
- **AI** - AI features

---

## ✅ Status

**Status**: ✅ **Working**

**Features**:
- ✅ Swagger UI accessible
- ✅ API documentation complete
- ✅ Authentication support
- ✅ Interactive testing
- ✅ Request/Response examples

---

## 🔧 Configuration

Swagger configuration อยู่ใน:
- `backend/src/config/swagger.ts` - Swagger config
- `backend/src/routes/*.ts` - API annotations

---

**🎉 Swagger Documentation พร้อมใช้งานแล้ว!**

เปิดเบราว์เซอร์ไปที่: **http://localhost:3001/api-docs**

---

**อัปเดตล่าสุด**: 2025-11-13  
**เวอร์ชัน**: 1.0.0

