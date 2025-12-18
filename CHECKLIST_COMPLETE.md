# ✅ Checklist - การตั้งค่า RGA Dashboard

## สถานะการตั้งค่า

### ✅ Completed

- [x] **สร้าง Bootstrap endpoint**
  - ✅ `POST /api/v1/bootstrap` - สร้าง tenant และ admin แรก
  - ✅ `GET /api/v1/bootstrap/status` - ตรวจสอบสถานะ
  - ✅ Security: ทำงานได้เฉพาะเมื่อยังไม่มี tenant

- [x] **สร้าง Setup script**
  - ✅ `backend/scripts/setup.js` - Node.js script สำหรับ bootstrap
  - ✅ รองรับ environment variables

- [x] **สร้าง API documentation**
  - ✅ `backend/API_SETUP_GUIDE.md` - คู่มือ API ละเอียด
  - ✅ `backend/QUICK_START.md` - Quick start guide
  - ✅ `backend/TESTING_GUIDE.md` - คู่มือการทดสอบ

- [x] **สร้าง .env.example**
  - ✅ Template สำหรับ environment variables
  - ✅ มี comments อธิบายแต่ละตัวแปร

- [x] **ตั้งค่า security (JWT, validation)**
  - ✅ JWT authentication
  - ✅ Password hashing (bcrypt)
  - ✅ Input validation (express-validator)
  - ✅ Rate limiting

### 🔄 In Progress / Ready to Execute

- [ ] **ตั้งค่า database (รัน SQL script)**
  - 📝 **ต้องทำ:** เปิด pgAdmin4 และรัน `database/setup_rga_dashboard.sql`
  - 📋 **ขั้นตอน:**
    1. เปิด pgAdmin4
    2. สร้าง database: `rga_dashboard`
    3. คลิกขวาที่ database → Query Tool
    4. เปิดไฟล์ `database/setup_rga_dashboard.sql`
    5. คัดลอกและรันสคริปต์
    6. ตรวจสอบด้วย `database/verify_database.sql`

- [ ] **ตั้งค่า backend (.env, npm install)**
  - ✅ `.env` file มีอยู่แล้ว
  - ✅ `npm install` - dependencies ติดตั้งแล้ว
  - ✅ `npm run prisma:generate` - Prisma Client generate แล้ว
  - 📝 **ต้องทำ:** แก้ไข `DATABASE_URL` ใน `.env` ให้ตรงกับ database

- [ ] **Bootstrap สำเร็จ**
  - 📝 **ต้องทำ:** รัน bootstrap endpoint หลังจากตั้งค่า database
  - 📋 **วิธีทำ:**
    ```bash
    # วิธีที่ 1: ใช้ cURL
    curl -X POST http://localhost:3001/api/v1/bootstrap \
      -H "Content-Type: application/json" \
      -d '{
        "tenantName": "Your Company",
        "tenantSlug": "your-company",
        "adminEmail": "admin@yourcompany.com",
        "adminPassword": "YourSecurePassword123!",
        "adminFirstName": "Admin",
        "adminLastName": "User"
      }'
    
    # วิธีที่ 2: ใช้ Setup Script
    cd backend
    node scripts/setup.js
    
    # วิธีที่ 3: ใช้ Postman/Insomnia
    # POST http://localhost:3001/api/v1/bootstrap
    ```

- [ ] **Login และทดสอบ API**
  - 📝 **ต้องทำ:** Login และทดสอบ API endpoints
  - 📋 **วิธีทำ:**
    ```bash
    # 1. Login
    curl -X POST http://localhost:3001/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@yourcompany.com",
        "password": "YourSecurePassword123!",
        "tenantId": "tenant-uuid-from-bootstrap"
      }'
    
    # 2. ใช้ token เพื่อเข้าถึง API
    curl http://localhost:3001/api/v1/users \
      -H "Authorization: Bearer your-token-here"
    ```

---

## 🚀 Quick Start Commands

### 1. ตั้งค่า Database

```bash
# เปิด pgAdmin4 และรัน:
# database/setup_rga_dashboard.sql
```

### 2. ตั้งค่า Backend

```bash
cd backend

# แก้ไข .env (แก้ไข DATABASE_URL)
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rga_dashboard

# Generate Prisma Client (ทำแล้ว)
npm run prisma:generate

# เริ่ม server
npm run dev
```

### 3. Bootstrap

```bash
# ใช้ cURL หรือ Postman
curl -X POST http://localhost:3001/api/v1/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Your Company",
    "tenantSlug": "your-company",
    "adminEmail": "admin@yourcompany.com",
    "adminPassword": "YourSecurePassword123!",
    "adminFirstName": "Admin",
    "adminLastName": "User"
  }'
```

### 4. Login และทดสอบ

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "tenantId": "tenant-uuid"
  }'

# ทดสอบ API
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token"
```

---

## 📚 เอกสารที่เกี่ยวข้อง

- **Database Setup**: `database/PRODUCTION_SETUP.md`
- **API Setup**: `backend/API_SETUP_GUIDE.md`
- **Quick Start**: `backend/QUICK_START.md`
- **Testing**: `backend/TESTING_GUIDE.md`
- **Complete Setup**: `SETUP_COMPLETE.md`

---

## 🧪 Test Scripts

### PowerShell (Windows)

```powershell
cd backend
.\test-api.ps1
```

### Bash (Linux/Mac)

```bash
cd backend
chmod +x test-api.sh
./test-api.sh
```

---

## ✅ Final Checklist

ก่อนใช้งานจริง ตรวจสอบ:

- [ ] Database `rga_dashboard` สร้างแล้ว
- [ ] รัน `database/setup_rga_dashboard.sql` แล้ว
- [ ] `.env` ตั้งค่า `DATABASE_URL` ถูกต้อง
- [ ] Server start สำเร็จ (`npm run dev`)
- [ ] Health check ผ่าน (`http://localhost:3001/health`)
- [ ] Bootstrap สำเร็จ
- [ ] Login สำเร็จ
- [ ] API ทำงานได้ด้วย token

---

**🎉 พร้อมใช้งานแล้ว!**

**Base URL**: `http://localhost:3001`  
**API**: `http://localhost:3001/api/v1`  
**Health Check**: `http://localhost:3001/health`

---

**อัปเดตล่าสุด**: 2025-11-13

