# ⚡ Quick Actions - Backend

## 🎯 สิ่งที่ทำได้ทันที (5-30 นาที)

### 1. ✅ เพิ่ม `/auth/me` endpoint
**Status:** ✅ เสร็จแล้ว! ทำงานได้แล้ว

### 2. ทดสอบ `/auth/me`
```powershell
cd backend
$token = $env:RGA_API_TOKEN
$tokenParts = $token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
$tokenData = $payload | ConvertFrom-Json
$headers = @{ "Authorization" = "Bearer $token"; "x-tenant-id" = $tokenData.tenantId }
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/me" -Method Get -Headers $headers
```

### 3. เพิ่ม Health Check Endpoints
```typescript
// เพิ่มใน server.ts
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});
```

### 4. เพิ่ม API Version Info
```typescript
app.get('/api/info', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: '/api/v1',
    status: 'operational'
  });
});
```

---

## 🔧 Setup Tasks (30-60 นาที)

### 1. Setup Jest Testing
```bash
cd backend
npm install --save-dev @types/jest ts-jest jest
```

สร้าง `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
};
```

### 2. เพิ่ม Swagger Documentation
```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express @types/swagger-jsdoc
```

---

## 📝 Code Improvements (1-2 ชั่วโมง)

### 1. เพิ่ม Pagination
- เพิ่มใน controllers ที่มี list endpoints
- ใช้ query params: `page`, `limit`

### 2. เพิ่ม Search
- เพิ่ม query param: `search`
- ใช้ Prisma `OR` และ `contains`

### 3. เพิ่ม Filtering
- เพิ่ม query params: `filter[field]=value`
- ใช้ Prisma `where`

---

## 🎯 Top 3 Priorities

1. **Setup Testing** (2-3 ชั่วโมง)
   - Jest configuration
   - Basic unit tests
   - Integration tests

2. **API Documentation** (1-2 ชั่วโมง)
   - Swagger setup
   - Document all endpoints

3. **Implement Integrations** (1-2 วัน)
   - Google Ads sync
   - Shopee sync
   - Lazada sync

---

**อัปเดตล่าสุด**: 2025-11-13

