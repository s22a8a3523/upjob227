# ✅ Checklist - Bootstrap, Login, Test API

## วิธีทำ Checklist ทั้งหมด

### วิธีที่ 1: ใช้ Complete Test Script (แนะนำ)

```powershell
cd backend
.\complete-test.ps1
```

สคริปต์จะถามข้อมูลและทำทุกอย่างให้อัตโนมัติ

### วิธีที่ 2: Manual Step by Step

#### ✅ ขั้นตอนที่ 1: Bootstrap

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

# เก็บข้อมูล
$tenantId = $response.data.tenant.id
$token = $response.data.token
$env:RGA_API_TOKEN = $token
$env:RGA_TENANT_ID = $tenantId

Write-Host "✅ Bootstrap successful!" -ForegroundColor Green
Write-Host "Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "Token saved to `$env:RGA_API_TOKEN" -ForegroundColor Gray
```

#### ✅ ขั้นตอนที่ 2: Login

ถ้า bootstrap แล้ว จะได้ token มาทันที ไม่ต้อง login

ถ้าต้องการ login ใหม่:

```powershell
.\quick-login.ps1
```

หรือ manual:

```powershell
$loginBody = @{
    email = "admin@yourcompany.com"
    password = "YourSecurePassword123!"
    tenantId = $env:RGA_TENANT_ID
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$env:RGA_API_TOKEN = $response.token
Write-Host "✅ Login successful!" -ForegroundColor Green
```

#### ✅ ขั้นตอนที่ 3: ทดสอบ API ด้วย Token

```powershell
.\test-api-with-token.ps1
```

หรือ manual:

```powershell
$token = $env:RGA_API_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
}

# Test 1: Get Current User
Write-Host "Testing Get Current User..." -ForegroundColor Yellow
$user = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/me" `
    -Method Get `
    -Headers $headers
Write-Host "✅ User: $($user.user.email)" -ForegroundColor Green

# Test 2: Get Users
Write-Host "Testing Get Users..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users" `
    -Method Get `
    -Headers $headers
Write-Host "✅ Users: $($users.users.Count) users" -ForegroundColor Green

# Test 3: Get Tenants
Write-Host "Testing Get Tenants..." -ForegroundColor Yellow
$tenants = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tenants" `
    -Method Get `
    -Headers $headers
Write-Host "✅ Tenants: $($tenants.tenants.Count) tenants" -ForegroundColor Green
```

---

## Quick Commands

### ทำทุกอย่างในครั้งเดียว

```powershell
cd backend

# 1. Bootstrap
$body = @{
    tenantName = "RGA Company"
    tenantSlug = "rga-company"
    adminEmail = "admin@rga.com"
    adminPassword = "Admin@123456"
    adminFirstName = "Admin"
    adminLastName = "User"
} | ConvertTo-Json

$bootstrap = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/bootstrap" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$env:RGA_API_TOKEN = $bootstrap.data.token
$env:RGA_TENANT_ID = $bootstrap.data.tenant.id

Write-Host "✅ Bootstrap: OK" -ForegroundColor Green

# 2. Test API
$headers = @{ "Authorization" = "Bearer $($env:RGA_API_TOKEN)" }

$user = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/me" `
    -Method Get `
    -Headers $headers
Write-Host "✅ Get Current User: OK - $($user.user.email)" -ForegroundColor Green

$users = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users" `
    -Method Get `
    -Headers $headers
Write-Host "✅ Get Users: OK - $($users.users.Count) users" -ForegroundColor Green

$tenants = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tenants" `
    -Method Get `
    -Headers $headers
Write-Host "✅ Get Tenants: OK - $($tenants.tenants.Count) tenants" -ForegroundColor Green

Write-Host "`n✅ All tests passed!" -ForegroundColor Green
```

---

## Checklist Status

- [ ] Bootstrap (ถ้ายังไม่ทำ)
  - ใช้: `.\complete-test.ps1` หรือ manual command ด้านบน
  
- [ ] Login
  - ถ้า bootstrap แล้ว จะได้ token ทันที
  - หรือใช้: `.\quick-login.ps1`
  
- [ ] ทดสอบ API ด้วย token
  - ใช้: `.\test-api-with-token.ps1`
  - หรือ manual commands ด้านบน

---

## Troubleshooting

### Bootstrap failed - 403 Forbidden

**สาเหตุ:** มี tenant อยู่แล้ว

**แก้ไข:** ใช้ login แทน bootstrap

### Login failed

**ตรวจสอบ:**
1. Email และ password ถูกต้อง
2. Tenant ID ถูกต้อง
3. Server กำลังทำงาน

### Token ไม่ทำงาน

**ตรวจสอบ:**
1. Token ถูกต้อง (copy ทั้งหมด)
2. ใช้ header: `Authorization: Bearer <token>`
3. Token ยังไม่หมดอายุ

---

**พร้อมใช้งาน!** 🎉

