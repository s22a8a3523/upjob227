# ✅ Server Running Successfully!

## 🎉 สถานะปัจจุบัน

- ✅ **Server**: Running on port 3001
- ✅ **API**: Available at http://localhost:3001/api/v1
- ✅ **WebSocket**: Available at ws://localhost:3001
- ✅ **Database**: Connected successfully
- ✅ **Environment**: development

---

## 🧪 ทดสอบ API

### 1. Health Check

```bash
# ใช้ curl
curl http://localhost:3001/health

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

### 2. Bootstrap Status

```bash
curl http://localhost:3001/api/v1/bootstrap/status
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

---

## 🚀 ขั้นตอนต่อไป

### ขั้นตอนที่ 1: Bootstrap (สร้าง Tenant และ Admin แรก)

#### วิธีที่ 1: ใช้ cURL

```bash
curl -X POST http://localhost:3001/api/v1/bootstrap \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantName\": \"Your Company Name\",
    \"tenantSlug\": \"your-company\",
    \"adminEmail\": \"admin@yourcompany.com\",
    \"adminPassword\": \"YourSecurePassword123!\",
    \"adminFirstName\": \"Admin\",
    \"adminLastName\": \"User\"
  }"
```

#### วิธีที่ 2: ใช้ PowerShell

```powershell
$body = @{
    tenantName = "Your Company Name"
    tenantSlug = "your-company"
    adminEmail = "admin@yourcompany.com"
    adminPassword = "YourSecurePassword123!"
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

#### วิธีที่ 4: ใช้ Postman/Insomnia

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

**⚠️ สำคัญ:** เก็บ `tenant.id` และ `token` จาก response ไว้ใช้ในขั้นตอนถัดไป

### ขั้นตอนที่ 2: Login

```bash
# ใช้ tenantId จาก bootstrap response
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@yourcompany.com\",
    \"password\": \"YourSecurePassword123!\",
    \"tenantId\": \"tenant-uuid-from-bootstrap\"
  }"
```

### ขั้นตอนที่ 3: ทดสอบ API ด้วย Token

```bash
# ดู users
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer your-token-here"

# ดู tenants
curl http://localhost:3001/api/v1/tenants \
  -H "Authorization: Bearer your-token-here"
```

---

## 📋 Checklist

- [x] Server start สำเร็จ
- [x] Database connected
- [ ] Bootstrap สำเร็จ (สร้าง tenant และ admin)
- [ ] Login สำเร็จ
- [ ] ทดสอบ API ด้วย token

---

## 🔗 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Health check | ❌ |
| `/api/v1/bootstrap/status` | GET | ตรวจสอบสถานะ bootstrap | ❌ |
| `/api/v1/bootstrap` | POST | สร้าง tenant และ admin แรก | ❌ |
| `/api/v1/auth/login` | POST | Login | ❌ |
| `/api/v1/auth/register` | POST | Register | ❌ |
| `/api/v1/users` | GET | ดู users | ✅ |
| `/api/v1/tenants` | GET | ดู tenants | ✅ |

---

## 📚 เอกสาร

- **Quick Start**: `backend/QUICK_START.md`
- **API Guide**: `backend/API_SETUP_GUIDE.md`
- **Testing Guide**: `backend/TESTING_GUIDE.md`
- **Checklist**: `CHECKLIST_COMPLETE.md`

---

## 🆘 Troubleshooting

### Bootstrap failed - 403 Forbidden

**สาเหตุ:** มี tenant อยู่แล้วในระบบ

**แก้ไข:**
- ใช้ regular API endpoints แทน
- หรือลบ tenants ทั้งหมด (development only)

### Bootstrap failed - Database error

**ตรวจสอบ:**
1. Database connection string ใน `.env`
2. Database มี tables ทั้งหมด (17 tables)
3. รัน `database/setup_rga_dashboard.sql` แล้ว

### Token ไม่ทำงาน

**ตรวจสอบ:**
1. Token ถูกต้อง (copy ทั้งหมด)
2. Token ยังไม่หมดอายุ
3. ใช้ header: `Authorization: Bearer <token>`

---

**🎉 Server พร้อมใช้งานแล้ว!**

**Base URL**: `http://localhost:3001`  
**API**: `http://localhost:3001/api/v1`  
**Health Check**: `http://localhost:3001/health`

---

**อัปเดตล่าสุด**: 2025-11-13

