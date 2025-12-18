# ✅ Next Steps - พร้อมใช้งานแล้ว!

## 🎉 สถานะปัจจุบัน

- ✅ **Server**: Running on port 3001
- ✅ **Database**: Connected successfully
- ✅ **Bootstrap**: Complete
- ✅ **Token**: Available (`$env:RGA_API_TOKEN`)
- ✅ **Tenant**: RGA Company (f3564944-fe73-4917-9b59-f93fc87ffe03)
- ✅ **Admin User**: admin@rga.com (super_admin)

---

## 📋 Next Steps ที่พร้อมใช้งาน

### 1. ✅ ใช้ Token เพื่อเข้าถึง API อื่นๆ

**Token ถูกเก็บใน:** `$env:RGA_API_TOKEN`

**ทดสอบ API:**
```powershell
cd backend
.\test-with-token-fixed.ps1
```

**ดู Users:**
```powershell
.\list-users.ps1
```

**ผลลัพธ์:**
- ✅ Get Tenants: OK
- ✅ Get Campaigns: OK
- ✅ Get Alerts: OK
- ✅ Get Users: OK (1 user: admin@rga.com)

---

### 2. ✅ สร้าง Users เพิ่มเติม

**ใช้ Script:**
```powershell
.\create-user.ps1
```

**หรือใช้ API:**
```powershell
$token = $env:RGA_API_TOKEN
$tokenParts = $token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$tokenData = $payload | ConvertFrom-Json
$tenantId = $tokenData.tenantId

$body = @{
    email = "user@yourcompany.com"
    password = "UserPassword123!"
    firstName = "John"
    lastName = "Doe"
    role = "viewer"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "x-tenant-id" = $tenantId
}

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**Roles ที่ใช้ได้:**
- `super_admin` - สิทธิ์เต็ม
- `admin` - Admin
- `manager` - Manager
- `viewer` - Viewer

---

### 3. ✅ ตั้งค่า Integrations

**สร้าง Integration:**

```powershell
$token = $env:RGA_API_TOKEN
$tokenParts = $token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$tokenData = $payload | ConvertFrom-Json
$tenantId = $tokenData.tenantId

$body = @{
    type = "google_ads"
    name = "Google Ads Integration"
    provider = "google"
    credentials = @{
        clientId = "your-client-id"
        clientSecret = "your-client-secret"
        refreshToken = "your-refresh-token"
    }
    config = @{
        accountId = "your-account-id"
    }
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "x-tenant-id" = $tenantId
}

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/integrations" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**Integration Types:**
- `google_ads` - Google Ads
- `facebook_ads` - Facebook Ads
- `ga4` - Google Analytics 4
- `tiktok` - TikTok Ads
- `shopee` - Shopee
- `lazada` - Lazada

---

### 4. ✅ เริ่มใช้งาน Dashboard

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend จะรันที่: `http://localhost:3000`

#### Login Credentials

- **Email**: `admin@rga.com`
- **Password**: `Admin@123456`
- **Tenant ID**: `f3564944-fe73-4917-9b59-f93fc87ffe03`

---

## 🔧 Useful Scripts

### Quick Commands

```powershell
cd backend

# ดูคำสั่งที่ใช้บ่อย
.\quick-commands.ps1

# สร้าง user ใหม่
.\create-user.ps1

# ดู users ทั้งหมด
.\list-users.ps1

# ทดสอบ API
.\test-with-token-fixed.ps1

# Login
.\quick-login.ps1
```

---

## 📊 API Endpoints ที่พร้อมใช้งาน

### ✅ Working Endpoints

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/users` | GET | ✅ | ดู users (ต้อง super_admin/admin/manager) |
| `/api/v1/users` | POST | ✅ | สร้าง user (ต้อง admin/manager) |
| `/api/v1/tenants` | GET | ✅ | ดู tenants |
| `/api/v1/campaigns` | GET | ✅ | ดู campaigns |
| `/api/v1/alerts` | GET | ✅ | ดู alerts |
| `/api/v1/integrations` | GET | ✅ | ดู integrations |
| `/api/v1/integrations` | POST | ✅ | สร้าง integration |

---

## 📚 เอกสาร

- **Next Steps**: `backend/NEXT_STEPS.md` - คู่มือ Next Steps ละเอียด
- **API Guide**: `backend/API_SETUP_GUIDE.md` - คู่มือ API
- **Testing Guide**: `backend/TESTING_GUIDE.md` - คู่มือการทดสอบ
- **Quick Start**: `backend/QUICK_START.md` - Quick start guide

---

## 🎯 Quick Start Commands

### สร้าง User ใหม่

```powershell
cd backend
.\create-user.ps1
```

### ดู Users

```powershell
.\list-users.ps1
```

### ทดสอบ API

```powershell
.\test-with-token-fixed.ps1
```

### ดูคำสั่งทั้งหมด

```powershell
.\quick-commands.ps1
```

---

## ✅ Summary

**Completed:**
- ✅ Bootstrap
- ✅ Login
- ✅ Test API with token
- ✅ List users
- ✅ Create user script
- ✅ Integration setup guide

**Ready for:**
- ✅ Create more users
- ✅ Setup integrations
- ✅ Use all API endpoints
- ✅ Start frontend dashboard

---

**🎉 พร้อมใช้งานเต็มรูปแบบแล้ว!**

**Token**: เก็บใน `$env:RGA_API_TOKEN`  
**Tenant ID**: `f3564944-fe73-4917-9b59-f93fc87ffe03`  
**Admin**: `admin@rga.com` / `Admin@123456`

---

**อัปเดตล่าสุด**: 2025-11-13

