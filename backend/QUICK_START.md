# 🚀 Quick Start Guide - RGA Dashboard API

## ขั้นตอนการตั้งค่าและใช้งาน API

### 1. ตั้งค่า Database

```bash
# สร้าง database ใน pgAdmin4
# 1. เปิด pgAdmin4
# 2. สร้าง database ชื่อ: rga_dashboard
# 3. รันไฟล์: database/setup_rga_dashboard.sql
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rga_dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 3. ติดตั้งและ Setup

```bash
cd backend

# ติดตั้ง dependencies
npm install

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

### 5. Bootstrap (สร้าง Tenant และ Admin แรก)

#### วิธีที่ 1: ใช้ cURL

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

#### วิธีที่ 2: ใช้ Postman/Insomnia

```
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

#### วิธีที่ 3: ใช้ Setup Script

```bash
# แก้ไขค่าตามต้องการใน scripts/setup.js
node scripts/setup.js
```

### 6. Login

```bash
# ใช้ tenantId จาก bootstrap response
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "tenantId": "tenant-uuid-from-bootstrap"
  }'
```

### 7. ใช้ Token เพื่อเข้าถึง API

```bash
# ตัวอย่าง: ดู users
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here"
```

---

## ✅ Checklist

- [ ] Database `rga_dashboard` สร้างแล้ว
- [ ] รัน `setup_rga_dashboard.sql` แล้ว
- [ ] สร้างไฟล์ `.env` ใน backend
- [ ] ตั้งค่า `DATABASE_URL` ถูกต้อง
- [ ] รัน `npm install`
- [ ] รัน `npm run prisma:generate`
- [ ] เริ่ม server (`npm run dev`)
- [ ] Bootstrap สำเร็จ (สร้าง tenant และ admin)
- [ ] Login สำเร็จ
- [ ] ได้ token และทดสอบ API

---

## 🔗 Links

- **API Documentation**: `backend/API_SETUP_GUIDE.md`
- **Database Setup**: `database/PRODUCTION_SETUP.md`
- **Health Check**: `http://localhost:3001/health`
- **Bootstrap Status**: `http://localhost:3001/api/v1/bootstrap/status`

---

## 🆘 Troubleshooting

### Server ไม่ start

```bash
# ตรวจสอบ database connection
psql -U postgres -d rga_dashboard -c "SELECT 1;"

# ตรวจสอบ .env
cat backend/.env
```

### Bootstrap failed

```bash
# ตรวจสอบสถานะ
curl http://localhost:3001/api/v1/bootstrap/status

# ตรวจสอบว่าไม่มี tenant อยู่แล้ว
```

### Token ไม่ทำงาน

- ตรวจสอบว่าใช้ token ที่ถูกต้อง
- Token อาจหมดอายุ (login ใหม่)
- ตรวจสอบ `JWT_SECRET` ตรงกัน

---

**พร้อมใช้งานแล้ว!** 🎉

