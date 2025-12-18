# 🧪 คู่มือการทดสอบ API ด้วย Token

## ขั้นตอนการทดสอบ

### ขั้นตอนที่ 1: Bootstrap (ถ้ายังไม่ทำ)

ถ้ายังไม่มี tenant และ admin user ต้อง bootstrap ก่อน:

```powershell
$body = @{
    tenantName = "Your Company Name"
    tenantSlug = "your-company"
    adminEmail = "admin@yourcompany.com"
    adminPassword = "YourSecurePassword123!"
    adminFirstName = "Admin"
    adminLastName = "User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/bootstrap" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# เก็บ tenant ID และ token
$tenantId = $response.data.tenant.id
$token = $response.data.token
```

### ขั้นตอนที่ 2: Login (ถ้ามี tenant แล้ว)

#### วิธีที่ 1: ใช้ Quick Login Script

```powershell
cd backend
.\quick-login.ps1
```

Script จะถาม:
- Email
- Password
- Tenant ID

และจะเก็บ token ใน `$env:RGA_API_TOKEN`

#### วิธีที่ 2: Login แบบ Manual

```powershell
$loginBody = @{
    email = "admin@yourcompany.com"
    password = "YourSecurePassword123!"
    tenantId = "your-tenant-id-here"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

# เก็บ token
$token = $response.token
$env:RGA_API_TOKEN = $token
```

### ขั้นตอนที่ 3: ทดสอบ API ด้วย Token

#### วิธีที่ 1: ใช้ Test Script (แนะนำ)

```powershell
cd backend
.\test-api-with-token.ps1
```

Script จะ:
- ตรวจสอบว่ามี token หรือไม่
- ถ้าไม่มี จะถามว่าต้องการ login หรือไม่
- ทดสอบ API endpoints ต่างๆ

#### วิธีที่ 2: ทดสอบ Manual

##### 1. Get Current User

```powershell
$token = $env:RGA_API_TOKEN

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/me" `
    -Method Get `
    -Headers $headers
```

##### 2. Get Users

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users" `
    -Method Get `
    -Headers $headers
```

##### 3. Get Tenants

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tenants" `
    -Method Get `
    -Headers $headers
```

##### 4. Get Campaigns

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/campaigns" `
    -Method Get `
    -Headers $headers
```

##### 5. Get Metrics

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/metrics" `
    -Method Get `
    -Headers $headers
```

##### 6. Get Alerts

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/alerts" `
    -Method Get `
    -Headers $headers
```

---

## ตัวอย่างการใช้งานแบบครบวงจร

### สคริปต์ทดสอบแบบเต็ม

```powershell
# ตั้งค่า
$baseUrl = "http://localhost:3001"
$apiPrefix = "/api/v1"

# 1. Login
$loginBody = @{
    email = "admin@yourcompany.com"
    password = "YourSecurePassword123!"
    tenantId = "your-tenant-id"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl$apiPrefix/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token
Write-Host "✅ Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. ตั้งค่า headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. ทดสอบ API endpoints
Write-Host "`n🧪 Testing API endpoints..." -ForegroundColor Cyan

# Get Current User
Write-Host "`n1. Get Current User..." -ForegroundColor Yellow
$user = Invoke-RestMethod -Uri "$baseUrl$apiPrefix/auth/me" `
    -Method Get `
    -Headers $headers
Write-Host "   User: $($user.user.email) ($($user.user.role))" -ForegroundColor Green

# Get Users
Write-Host "`n2. Get Users..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "$baseUrl$apiPrefix/users" `
    -Method Get `
    -Headers $headers
Write-Host "   Total Users: $($users.users.Count)" -ForegroundColor Green

# Get Tenants
Write-Host "`n3. Get Tenants..." -ForegroundColor Yellow
$tenants = Invoke-RestMethod -Uri "$baseUrl$apiPrefix/tenants" `
    -Method Get `
    -Headers $headers
Write-Host "   Total Tenants: $($tenants.tenants.Count)" -ForegroundColor Green

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
```

---

## ใช้ Postman/Insomnia

### 1. สร้าง Environment

สร้าง Environment Variables:
- `base_url`: `http://localhost:3001/api/v1`
- `token`: (จะใส่หลังจาก login)

### 2. Login และเก็บ Token

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@yourcompany.com",
  "password": "YourSecurePassword123!",
  "tenantId": "tenant-uuid"
}
```

Copy token จาก response และใส่ใน environment variable `token`

### 3. ทดสอบ API

```
GET {{base_url}}/users
Authorization: Bearer {{token}}
```

---

## Troubleshooting

### Token ไม่ทำงาน

**ตรวจสอบ:**
1. Token ถูกต้อง (copy ทั้งหมด)
2. Token ยังไม่หมดอายุ (default: 7 days)
3. ใช้ header: `Authorization: Bearer <token>`
4. `JWT_SECRET` ตรงกัน

### 401 Unauthorized

**สาเหตุ:**
- Token ไม่ถูกต้อง
- Token หมดอายุ
- Token format ผิด

**แก้ไข:**
- Login ใหม่เพื่อได้ token ใหม่
- ตรวจสอบว่าใช้ `Bearer ` นำหน้า token

### 403 Forbidden

**สาเหตุ:**
- User ไม่มีสิทธิ์เข้าถึง endpoint
- Role ไม่เพียงพอ

**แก้ไข:**
- ตรวจสอบ role ของ user
- ใช้ super_admin หรือ admin account

---

## Checklist

- [ ] Bootstrap สำเร็จ (ถ้ายังไม่มี tenant)
- [ ] Login สำเร็จ
- [ ] ได้ token
- [ ] เก็บ token ใน environment variable
- [ ] ทดสอบ Get Current User สำเร็จ
- [ ] ทดสอบ Get Users สำเร็จ
- [ ] ทดสอบ Get Tenants สำเร็จ
- [ ] ทดสอบ Get Campaigns สำเร็จ
- [ ] ทดสอบ Get Metrics สำเร็จ
- [ ] ทดสอบ Get Alerts สำเร็จ

---

## Quick Commands

```powershell
# Login และเก็บ token
cd backend
.\quick-login.ps1

# ทดสอบ API ด้วย token
.\test-api-with-token.ps1

# หรือใช้ token ที่มีอยู่
$env:RGA_API_TOKEN = "your-token-here"
.\test-api-with-token.ps1
```

---

**อัปเดตล่าสุด**: 2025-11-13

