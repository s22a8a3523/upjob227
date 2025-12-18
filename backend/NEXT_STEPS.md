# 🚀 Next Steps - RGA Dashboard

## ✅ Checklist เสร็จสมบูรณ์แล้ว!

- [x] Bootstrap
- [x] Login
- [x] ทดสอบ API ด้วย token

---

## 📋 Next Steps

### 1. ใช้ Token เพื่อเข้าถึง API อื่นๆ

#### ดูข้อมูลที่มีอยู่

```powershell
# List Users
.\list-users.ps1

# Test API endpoints
.\test-with-token-fixed.ps1
```

#### ตัวอย่างการใช้งาน API

```powershell
$token = $env:RGA_API_TOKEN
$tokenParts = $token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$tokenData = $payload | ConvertFrom-Json
$tenantId = $tokenData.tenantId

$headers = @{
    "Authorization" = "Bearer $token"
    "x-tenant-id" = $tenantId
}

# Get Campaigns
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/campaigns" `
    -Method Get `
    -Headers $headers

# Get Metrics
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/metrics" `
    -Method Get `
    -Headers $headers

# Get Alerts
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" `
    -Method Get `
    -Headers $headers
```

---

### 2. สร้าง Users เพิ่มเติม

#### วิธีที่ 1: ใช้ Script (แนะนำ)

```powershell
.\create-user.ps1
```

Script จะถาม:
- Email
- Password
- First Name
- Last Name
- Role (viewer/manager/admin)

#### วิธีที่ 2: ใช้ API Manual

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

#### Roles ที่มี

- `super_admin` - สิทธิ์เต็ม (สร้างได้เฉพาะ bootstrap)
- `admin` - Admin (จัดการ users, tenants)
- `manager` - Manager (จัดการ campaigns, reports)
- `viewer` - Viewer (ดูข้อมูลเท่านั้น)

---

### 3. ตั้งค่า Integrations

#### สร้าง Integration

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
    } | ConvertTo-Json
    config = @{
        accountId = "your-account-id"
    } | ConvertTo-Json
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

#### Integration Types ที่รองรับ

- `google_ads` - Google Ads
- `facebook_ads` - Facebook Ads
- `ga4` - Google Analytics 4
- `tiktok` - TikTok Ads
- `shopee` - Shopee
- `lazada` - Lazada

#### ดู Integrations

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/integrations" `
    -Method Get `
    -Headers $headers
```

---

### 4. เริ่มใช้งาน Dashboard

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend จะรันที่: `http://localhost:3000`

#### Login ใน Frontend

- Email: `admin@rga.com`
- Password: `Admin@123456`
- Tenant ID: `f3564944-fe73-4917-9b59-f93fc87ffe03`

#### API Configuration

ตั้งค่าใน `frontend/src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:3001/api/v1';
```

---

## 📚 API Endpoints ที่ใช้บ่อย

### Users

```
GET    /api/v1/users              - ดู users ทั้งหมด
POST   /api/v1/users              - สร้าง user ใหม่
GET    /api/v1/users/:id          - ดู user
PUT    /api/v1/users/:id          - แก้ไข user
DELETE /api/v1/users/:id          - ลบ user
```

### Campaigns

```
GET    /api/v1/campaigns          - ดู campaigns
POST   /api/v1/campaigns          - สร้าง campaign
GET    /api/v1/campaigns/:id      - ดู campaign
PUT    /api/v1/campaigns/:id      - แก้ไข campaign
DELETE /api/v1/campaigns/:id      - ลบ campaign
```

### Metrics

```
GET    /api/v1/metrics            - ดู metrics
POST   /api/v1/metrics            - สร้าง metric
GET    /api/v1/metrics/:id        - ดู metric
```

### Integrations

```
GET    /api/v1/integrations       - ดู integrations
POST   /api/v1/integrations       - สร้าง integration
GET    /api/v1/integrations/:id   - ดู integration
PUT    /api/v1/integrations/:id   - แก้ไข integration
DELETE /api/v1/integrations/:id   - ลบ integration
```

### Alerts

```
GET    /api/v1/alerts             - ดู alerts
POST   /api/v1/alerts             - สร้าง alert
GET    /api/v1/alerts/:id         - ดู alert
PUT    /api/v1/alerts/:id         - แก้ไข alert
DELETE /api/v1/alerts/:id         - ลบ alert
```

---

## 🔧 Useful Scripts

### List Scripts

```powershell
# List all available scripts
Get-ChildItem -Path . -Filter "*.ps1" | Select-Object Name
```

### Scripts ที่มี

- `complete-test.ps1` - ทดสอบ API แบบครบวงจร
- `quick-login.ps1` - Login อย่างรวดเร็ว
- `test-with-token-fixed.ps1` - ทดสอบ API ด้วย token
- `create-user.ps1` - สร้าง user ใหม่
- `list-users.ps1` - ดู users ทั้งหมด
- `run-tests-now.ps1` - Bootstrap และทดสอบ

---

## 📖 เอกสารเพิ่มเติม

- **API Setup Guide**: `backend/API_SETUP_GUIDE.md`
- **Testing Guide**: `backend/TESTING_GUIDE.md`
- **Quick Start**: `backend/QUICK_START.md`
- **Database Setup**: `database/PRODUCTION_SETUP.md`

---

## 🎯 Quick Commands

### สร้าง User ใหม่

```powershell
.\create-user.ps1
```

### ดู Users ทั้งหมด

```powershell
.\list-users.ps1
```

### ทดสอบ API

```powershell
.\test-with-token-fixed.ps1
```

### Login ใหม่

```powershell
.\quick-login.ps1
```

---

## ✅ Summary

**Current Status:**
- ✅ Server: Running
- ✅ Database: Connected
- ✅ Bootstrap: Complete
- ✅ Token: Available (`$env:RGA_API_TOKEN`)
- ✅ Tenant ID: `f3564944-fe73-4917-9b59-f93fc87ffe03`

**Ready for:**
- ✅ Create users
- ✅ Setup integrations
- ✅ Use API endpoints
- ✅ Start frontend dashboard

---

**🎉 พร้อมใช้งานแล้ว!**

**อัปเดตล่าสุด**: 2025-11-13

