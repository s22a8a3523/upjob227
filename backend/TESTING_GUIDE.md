# 🧪 คู่มือการทดสอบ API

## ขั้นตอนการทดสอบ

### 1. ตรวจสอบว่า Server ทำงาน

```bash
# เริ่ม server
cd backend
npm run dev
```

Server ควรแสดง:
```
🚀 Server is running on port 3001
📡 API available at http://localhost:3001/api/v1
✅ Database connected successfully
```

### 2. ทดสอบ Health Check

```bash
# ใช้ curl
curl http://localhost:3001/health

# หรือใช้ PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get

# หรือเปิดใน browser
# http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### 3. ตรวจสอบ Bootstrap Status

```bash
# ใช้ curl
curl http://localhost:3001/api/v1/bootstrap/status

# หรือใช้ PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/bootstrap/status" -Method Get
```

**Expected Response (ถ้ายังไม่ bootstrap):**
```json
{
  "success": true,
  "data": {
    "isBootstrapped": false,
    "tenantCount": 0,
    "userCount": 0,
    "message": "System is ready for bootstrap"
  }
}
```

### 4. Bootstrap (สร้าง Tenant และ Admin แรก)

#### วิธีที่ 1: ใช้ cURL

```bash
curl -X POST http://localhost:3001/api/v1/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "My Company",
    "tenantSlug": "my-company",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "Admin@123456",
    "adminFirstName": "Admin",
    "adminLastName": "User"
  }'
```

#### วิธีที่ 2: ใช้ PowerShell

```powershell
$body = @{
    tenantName = "My Company"
    tenantSlug = "my-company"
    adminEmail = "admin@mycompany.com"
    adminPassword = "Admin@123456"
    adminFirstName = "Admin"
    adminLastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/bootstrap" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### วิธีที่ 3: ใช้ Setup Script

```bash
cd backend
node scripts/setup.js
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bootstrap completed successfully",
  "data": {
    "tenant": {
      "id": "uuid-here",
      "name": "My Company",
      "slug": "my-company"
    },
    "user": {
      "id": "uuid-here",
      "email": "admin@mycompany.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin"
    },
    "token": "jwt-token-here"
  }
}
```

**⚠️ สำคัญ:** เก็บ `tenant.id` และ `token` ไว้ใช้ในขั้นตอนถัดไป

### 5. Login

```bash
# ใช้ tenantId จาก bootstrap response
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "Admin@123456",
    "tenantId": "tenant-uuid-from-bootstrap"
  }'
```

**Expected Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "admin@mycompany.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "tenantId": "tenant-uuid"
  }
}
```

### 6. ทดสอบ API ด้วย Token

```bash
# ดู users
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here"

# ดู tenants
curl http://localhost:3001/api/v1/tenants \
  -H "Authorization: Bearer your-token-here"
```

---

## ใช้ Test Scripts

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

## ใช้ Postman/Insomnia

### 1. สร้าง Collection

1. สร้าง Collection ใหม่ชื่อ "RGA Dashboard API"
2. ตั้งค่า Base URL: `http://localhost:3001/api/v1`

### 2. สร้าง Environment

สร้าง Environment Variables:
- `base_url`: `http://localhost:3001/api/v1`
- `token`: (จะใส่หลังจาก login)

### 3. สร้าง Requests

#### Bootstrap
```
POST {{base_url}}/bootstrap
Content-Type: application/json

{
  "tenantName": "My Company",
  "tenantSlug": "my-company",
  "adminEmail": "admin@mycompany.com",
  "adminPassword": "Admin@123456",
  "adminFirstName": "Admin",
  "adminLastName": "User"
}
```

#### Login
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@mycompany.com",
  "password": "Admin@123456",
  "tenantId": "tenant-uuid"
}
```

#### Get Users (ต้องมี token)
```
GET {{base_url}}/users
Authorization: Bearer {{token}}
```

---

## Troubleshooting

### Server ไม่ start

**ตรวจสอบ:**
1. Database connection string ใน `.env`
2. PostgreSQL กำลังทำงานอยู่
3. Database `rga_dashboard` มีอยู่

```bash
# ทดสอบ database connection
psql -U postgres -d rga_dashboard -c "SELECT 1;"
```

### Bootstrap failed - 403 Forbidden

**สาเหตุ:** มี tenant อยู่แล้วในระบบ

**แก้ไข:**
- ใช้ regular API endpoints แทน
- หรือลบ tenants ทั้งหมด (development only)

### Bootstrap failed - Database error

**ตรวจสอบ:**
1. Database connection string ถูกต้อง
2. Database มี tables ทั้งหมด (17 tables)
3. รัน `database/setup_rga_dashboard.sql` แล้ว

### Token ไม่ทำงาน

**ตรวจสอบ:**
1. Token ถูกต้อง (copy ทั้งหมด)
2. Token ยังไม่หมดอายุ
3. ใช้ header: `Authorization: Bearer <token>`
4. `JWT_SECRET` ตรงกัน

### CORS Error

**แก้ไข:**
- ตรวจสอบ `CORS_ORIGIN` ใน `.env`
- เพิ่ม frontend URL ใน `CORS_ORIGIN`

---

## Checklist การทดสอบ

- [ ] Server start สำเร็จ
- [ ] Health check ผ่าน
- [ ] Bootstrap status ตรวจสอบได้
- [ ] Bootstrap สำเร็จ (สร้าง tenant และ admin)
- [ ] Login สำเร็จ
- [ ] ได้ token
- [ ] ทดสอบ API ด้วย token สำเร็จ
- [ ] ดู users สำเร็จ
- [ ] ดู tenants สำเร็จ

---

## Next Steps

หลังจากทดสอบ API สำเร็จ:

1. ✅ ตั้งค่า frontend
2. ✅ เชื่อมต่อ frontend กับ API
3. ✅ ตั้งค่า integrations
4. ✅ เริ่มใช้งาน dashboard

---

**อัปเดตล่าสุด**: 2025-11-13

