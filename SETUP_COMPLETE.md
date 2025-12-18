# ✅ การตั้งค่าเสร็จสมบูรณ์ - RGA Dashboard

## 📦 สิ่งที่ได้ทำเสร็จแล้ว

### 1. Database Setup ✅
- ✅ สร้าง SQL script สำหรับ pgAdmin4: `database/setup_rga_dashboard.sql`
- ✅ สร้างคู่มือการตั้งค่า: `database/PRODUCTION_SETUP.md`
- ✅ สร้างคู่มือภาษาไทย: `database/README_TH.md`
- ✅ สร้าง verification script: `database/verify_database.sql`
- ✅ **ไม่มี seed data** - พร้อมใช้งานจริง

### 2. API Setup ✅
- ✅ สร้าง Bootstrap endpoint: `POST /api/v1/bootstrap`
- ✅ สร้าง Bootstrap status endpoint: `GET /api/v1/bootstrap/status`
- ✅ สร้าง Setup script: `backend/scripts/setup.js`
- ✅ สร้าง API documentation: `backend/API_SETUP_GUIDE.md`
- ✅ สร้าง Quick Start guide: `backend/QUICK_START.md`
- ✅ สร้าง .env.example template

### 3. Security ✅
- ✅ Bootstrap endpoint ทำงานได้เฉพาะเมื่อยังไม่มี tenant
- ✅ JWT authentication สำหรับ API endpoints
- ✅ Password hashing ด้วย bcrypt
- ✅ Input validation ด้วย express-validator

---

## 🚀 วิธีเริ่มใช้งาน

### ขั้นตอนที่ 1: ตั้งค่า Database

1. เปิด pgAdmin4
2. สร้าง database: `rga_dashboard`
3. รันไฟล์: `database/setup_rga_dashboard.sql`
4. ตรวจสอบ: `database/verify_database.sql`

### ขั้นตอนที่ 2: ตั้งค่า Backend

```bash
cd backend

# 1. สร้างไฟล์ .env
cp .env.example .env
# แก้ไข DATABASE_URL และ JWT_SECRET

# 2. ติดตั้ง dependencies
npm install

# 3. Generate Prisma Client
npm run prisma:generate

# 4. เริ่ม server
npm run dev
```

### ขั้นตอนที่ 3: Bootstrap (สร้าง Tenant และ Admin แรก)

```bash
# วิธีที่ 1: ใช้ cURL
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

# วิธีที่ 2: ใช้ Setup Script
node scripts/setup.js

# วิธีที่ 3: ใช้ Postman/Insomnia
# POST http://localhost:3001/api/v1/bootstrap
# Body: (ดูใน API_SETUP_GUIDE.md)
```

### ขั้นตอนที่ 4: Login และใช้งาน

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "tenantId": "tenant-uuid-from-bootstrap"
  }'

# ใช้ token เพื่อเข้าถึง API
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here"
```

---

## 📚 เอกสารที่เกี่ยวข้อง

### Database
- `database/PRODUCTION_SETUP.md` - คู่มือการตั้งค่า database สำหรับ production
- `database/README_TH.md` - คู่มือภาษาไทย
- `database/PGADMIN4_SETUP_GUIDE.md` - คู่มือ pgAdmin4
- `database/setup_rga_dashboard.sql` - SQL script หลัก
- `database/verify_database.sql` - Script ตรวจสอบ

### API
- `backend/API_SETUP_GUIDE.md` - คู่มือ API ละเอียด
- `backend/QUICK_START.md` - Quick start guide
- `backend/.env.example` - Template สำหรับ environment variables

### Frontend
- `frontend/URL_VERIFICATION_GUIDE.md` - คู่มือ URL verification

---

## 🔗 API Endpoints หลัก

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Health check | ❌ |
| `/api/v1/bootstrap/status` | GET | ตรวจสอบสถานะ bootstrap | ❌ |
| `/api/v1/bootstrap` | POST | สร้าง tenant และ admin แรก | ❌ |
| `/api/v1/auth/login` | POST | Login | ❌ |
| `/api/v1/auth/register` | POST | Register | ❌ |
| `/api/v1/users` | GET | ดู users | ✅ |
| `/api/v1/users` | POST | สร้าง user | ✅ |
| `/api/v1/tenants` | GET | ดู tenants | ✅ |
| `/api/v1/campaigns` | GET | ดู campaigns | ✅ |
| `/api/v1/metrics` | GET | ดู metrics | ✅ |

---

## ✅ Checklist สำหรับ Production

### Database
- [ ] สร้าง database `rga_dashboard`
- [ ] รัน `setup_rga_dashboard.sql`
- [ ] ตรวจสอบด้วย `verify_database.sql`
- [ ] ตั้งค่า backup

### Backend
- [ ] สร้างไฟล์ `.env`
- [ ] ตั้งค่า `DATABASE_URL`
- [ ] ตั้งค่า `JWT_SECRET` (เปลี่ยนจาก default)
- [ ] รัน `npm install`
- [ ] รัน `npm run prisma:generate`
- [ ] เริ่ม server และทดสอบ

### Bootstrap
- [ ] ตรวจสอบสถานะ: `GET /api/v1/bootstrap/status`
- [ ] Bootstrap สำเร็จ: `POST /api/v1/bootstrap`
- [ ] Login สำเร็จ
- [ ] ทดสอบ API ด้วย token

### Security
- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าที่แข็งแกร่ง
- [ ] ตั้งค่า `CORS_ORIGIN` ให้เฉพาะ domain ที่ต้องการ
- [ ] ใช้ HTTPS ใน production
- [ ] ตั้งค่า firewall rules

---

## 🎯 Next Steps

1. ✅ Database setup
2. ✅ API setup
3. ✅ Bootstrap
4. ⏭️ ตั้งค่า integrations (Google Ads, Facebook, etc.)
5. ⏭️ เริ่มใช้งาน dashboard
6. ⏭️ เพิ่ม users และ permissions
7. ⏭️ ตั้งค่า alerts และ reports

---

## 🆘 Support

หากมีปัญหา:
1. ตรวจสอบ logs ใน console
2. ตรวจสอบ database connection
3. ดู Troubleshooting section ในเอกสาร
4. ตรวจสอบ environment variables

---

**🎉 พร้อมใช้งานแล้ว!**

**Base URL**: `http://localhost:3001`  
**API Prefix**: `/api/v1`  
**Health Check**: `http://localhost:3001/health`

---

**อัปเดตล่าสุด**: 2025-11-13  
**เวอร์ชัน**: 1.0.0 (Production Ready)

