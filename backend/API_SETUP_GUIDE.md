# คู่มือการตั้งค่าและใช้งาน API

## 📋 สารบัญ
1. [การตั้งค่าเบื้องต้น](#การตั้งค่าเบื้องต้น)
2. [Bootstrap (สร้าง Tenant และ Admin แรก)](#bootstrap-สร้าง-tenant-และ-admin-แรก)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)

---

## การตั้งค่าเบื้องต้น

### 1. ตั้งค่า Environment Variables

```bash
cd backend
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rga_dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 2. ติดตั้ง Dependencies

```bash
cd backend
npm install
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (ถ้ายังไม่รัน)
npm run prisma:migrate
```

### 4. เริ่ม Server

```bash
npm run dev
```

Server จะรันที่: `http://localhost:3001`

---

## Bootstrap (สร้าง Tenant และ Admin แรก)

### วิธีที่ 1: ใช้ API Endpoint (แนะนำ)

**ตรวจสอบสถานะ:**
```bash
GET http://localhost:3001/api/v1/bootstrap/status
```

**สร้าง Tenant และ Super Admin:**
```bash
POST http://localhost:3001/api/v1/bootstrap
Content-Type: application/json

{
  "tenantName": "Your Company Name",
  "tenantSlug": "your-company",
  "adminEmail": "admin@yourcompany.com",
  "adminPassword": "YourSecurePassword123!",
  "adminFirstName": "Admin",
  "adminLastName": "User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bootstrap completed successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Your Company Name",
      "slug": "your-company"
    },
    "user": {
      "id": "uuid",
      "email": "admin@yourcompany.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin"
    },
    "token": "jwt-token-here"
  }
}
```

### วิธีที่ 2: ใช้ Setup Script

```bash
# แก้ไขค่าตามต้องการใน scripts/setup.js หรือใช้ environment variables
SETUP_TENANT_NAME="Your Company" \
SETUP_TENANT_SLUG="your-company" \
SETUP_ADMIN_EMAIL="admin@yourcompany.com" \
SETUP_ADMIN_PASSWORD="YourSecurePassword123!" \
node scripts/setup.js
```

### วิธีที่ 3: ใช้ cURL

```bash
curl -X POST http://localhost:3001/api/v1/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Your Company Name",
    "tenantSlug": "your-company",
    "adminEmail": "admin@yourcompany.com",
    "adminPassword": "YourSecurePassword123!",
    "adminFirstName": "Admin",
    "adminLastName": "User"
  }'
```

---

## Authentication

### Login

```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@yourcompany.com",
  "password": "YourSecurePassword123!",
  "tenantId": "tenant-uuid-here"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "admin@yourcompany.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "tenantId": "tenant-uuid"
  }
}
```

### ใช้ Token

เพิ่ม header ในทุก request:

```
Authorization: Bearer your-jwt-token-here
```

### Register (สำหรับ user ใหม่)

```bash
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@yourcompany.com",
  "password": "UserPassword123!",
  "tenantId": "tenant-uuid-here",
  "firstName": "John",
  "lastName": "Doe",
  "role": "viewer"
}
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Endpoints หลัก

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/bootstrap/status` | ตรวจสอบสถานะ bootstrap | ❌ |
| POST | `/bootstrap` | สร้าง tenant และ admin แรก | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/register` | Register | ❌ |
| GET | `/tenants` | ดู tenants ทั้งหมด | ✅ |
| POST | `/tenants` | สร้าง tenant ใหม่ | ✅ (super_admin) |
| GET | `/users` | ดู users | ✅ |
| POST | `/users` | สร้าง user ใหม่ | ✅ (admin) |
| GET | `/campaigns` | ดู campaigns | ✅ |
| GET | `/metrics` | ดู metrics | ✅ |
| GET | `/alerts` | ดู alerts | ✅ |

---

## ตัวอย่างการใช้งาน

### 1. Bootstrap (ครั้งแรก)

```bash
# ตรวจสอบสถานะ
curl http://localhost:3001/api/v1/bootstrap/status

# สร้าง tenant และ admin
curl -X POST http://localhost:3001/api/v1/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "My Company",
    "tenantSlug": "my-company",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "SecurePass123!",
    "adminFirstName": "Admin",
    "adminLastName": "User"
  }'
```

### 2. Login

```bash
# ใช้ tenantId จาก bootstrap response
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "SecurePass123!",
    "tenantId": "tenant-uuid-here"
  }'
```

### 3. ใช้ Token เพื่อเข้าถึง API

```bash
# ดู users
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here"

# สร้าง user ใหม่
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@mycompany.com",
    "password": "UserPass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  }'
```

### 4. ใช้ Postman หรือ Insomnia

1. สร้าง Collection ใหม่
2. ตั้งค่า Base URL: `http://localhost:3001/api/v1`
3. สร้าง Environment Variable:
   - `base_url`: `http://localhost:3001/api/v1`
   - `token`: (เก็บ token หลังจาก login)
4. ตั้งค่า Authorization:
   - Type: Bearer Token
   - Token: `{{token}}`

---

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### Test Bootstrap Status

```bash
curl http://localhost:3001/api/v1/bootstrap/status
```

---

## Troubleshooting

### ปัญหา: Cannot connect to database

**แก้ไข:**
1. ตรวจสอบว่า PostgreSQL กำลังทำงาน
2. ตรวจสอบ `DATABASE_URL` ใน `.env`
3. ตรวจสอบว่า database `rga_dashboard` มีอยู่

```bash
# ทดสอบ connection
psql -U postgres -d rga_dashboard -c "SELECT 1;"
```

### ปัญหา: Bootstrap endpoint returns 403

**สาเหตุ:** มี tenant อยู่แล้วในระบบ

**แก้ไข:**
- ใช้ regular API endpoints แทน
- หรือลบ tenants ทั้งหมด (development only)

### ปัญหา: JWT token invalid

**แก้ไข:**
1. ตรวจสอบว่า `JWT_SECRET` ตรงกัน
2. Token อาจหมดอายุ (default: 7 days)
3. Login ใหม่เพื่อได้ token ใหม่

### ปัญหา: CORS error

**แก้ไข:**
- ตรวจสอบ `CORS_ORIGIN` ใน `.env`
- เพิ่ม frontend URL ใน `CORS_ORIGIN`

---

## Security Best Practices

1. **เปลี่ยน JWT_SECRET** ใน production
2. **ใช้ HTTPS** ใน production
3. **ตั้งค่า CORS** ให้เฉพาะ domain ที่ต้องการ
4. **ใช้ strong passwords** (min 8 characters)
5. **เก็บ token อย่างปลอดภัย** (ไม่ commit ใน code)
6. **ตั้งค่า rate limiting** (มีอยู่แล้วใน code)

---

## Next Steps

1. ✅ Bootstrap system
2. ✅ Login และได้ token
3. ✅ สร้าง users เพิ่มเติม
4. ✅ ตั้งค่า integrations
5. ✅ เริ่มใช้งาน dashboard

---

**อัปเดตล่าสุด**: 2025-11-13  
**เวอร์ชัน API**: v1

