# Google OAuth2 Setup Guide

## 🔧 การตั้งค่า Google Cloud Console

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. คลิก **"Select a project"** → **"New Project"**
3. ตั้งชื่อโปรเจค: `rga-dashboard`
4. คลิก **"Create"**

### 2. เปิดใช้งาน APIs

1. ไปที่ **APIs & Services** → **Library**
2. เปิดใช้งาน APIs ต่อไปนี้:
   - **Google+ API** (สำหรับ User Info)
   - **Gmail API** (สำหรับ Email)
   - **Google Calendar API** (สำหรับ Calendar)
   - **Google Drive API** (สำหรับ Drive Files)
   - **Google Ads API** (สำหรับ Ads Data)

### 3. สร้าง OAuth 2.0 Credentials

1. ไปที่ **APIs & Services** → **Credentials**
2. คลิก **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. เลือก **Application type**: **Web application**
4. ตั้งชื่อ: `RGA Dashboard OAuth Client`

### 4. กำหนด Authorized URIs

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:3001/api/v1/auth/google/callback
http://localhost:3000/oauth/callback
https://yourdomain.com/api/v1/auth/google/callback
https://yourdomain.com/oauth/callback
```

### 5. คัดลอก Credentials

หลังจากสร้างเสร็จ จะได้:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxxxxxxxxxxxxx`

### 6. อัปเดต Environment Variables

สร้างไฟล์ `.env` ใน backend folder:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/v1/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"
```

## 🚀 การใช้งาน API Endpoints

### Authentication Flow

1. **เริ่มต้น OAuth Flow**
   ```
   GET /api/v1/auth/google?tenantId=your-tenant&returnUrl=/dashboard
   ```

2. **Handle Callback** (อัตโนมัติ)
   ```
   GET /api/v1/auth/google/callback?code=xxx&state=xxx
   ```

3. **Exchange Token** (สำหรับ Frontend)
   ```
   POST /api/v1/auth/google/token
   {
     "code": "authorization_code",
     "tenantId": "your-tenant"
   }
   ```

### Protected Endpoints (ต้อง Authentication)

4. **Refresh Token**
   ```
   POST /api/v1/auth/google/refresh
   Headers: Authorization: Bearer <jwt_token>
   {
     "refreshToken": "refresh_token"
   }
   ```

5. **Get Calendar Events**
   ```
   GET /api/v1/auth/google/calendar?maxResults=10
   Headers: Authorization: Bearer <jwt_token>
   ```

6. **Get Drive Files**
   ```
   GET /api/v1/auth/google/drive?maxResults=10
   Headers: Authorization: Bearer <jwt_token>
   ```

7. **Revoke Access**
   ```
   DELETE /api/v1/auth/google/revoke
   Headers: Authorization: Bearer <jwt_token>
   ```

## 🔐 Security Features

- **State Parameter**: ป้องกัน CSRF attacks
- **JWT Tokens**: Secure authentication
- **Token Refresh**: อัตโนมัติ refresh expired tokens
- **Scope Limitation**: จำกัดสิทธิ์การเข้าถึงเฉพาะที่จำเป็น
- **Token Revocation**: ยกเลิกการเข้าถึงได้

## 📊 Scopes ที่ใช้งาน

```javascript
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',     // อีเมลผู้ใช้
  'https://www.googleapis.com/auth/userinfo.profile',   // ข้อมูลโปรไฟล์
  'https://www.googleapis.com/auth/calendar.readonly',  // อ่าน Calendar
  'https://www.googleapis.com/auth/drive.readonly'      // อ่าน Drive Files
];
```

## 🧪 การทดสอบ

1. **ทดสอบ OAuth Flow**:
   ```bash
   curl "http://localhost:3001/api/v1/auth/google?tenantId=test-tenant"
   ```

2. **ทดสอบ Calendar API**:
   ```bash
   curl -H "Authorization: Bearer <jwt_token>" \
        "http://localhost:3001/api/v1/auth/google/calendar"
   ```

## ⚠️ หมายเหตุสำคัญ

- **Production**: ต้องใช้ HTTPS สำหรับ redirect URIs
- **Domain Verification**: อาจต้องยืนยันโดเมนใน Google Console
- **Rate Limits**: Google APIs มี rate limits ต่างกัน
- **Consent Screen**: ตั้งค่า OAuth consent screen ให้เรียบร้อย

## 🔧 Troubleshooting

**ปัญหาที่พบบ่อย:**

1. **redirect_uri_mismatch**: ตรวจสอบ redirect URI ใน Google Console
2. **invalid_client**: ตรวจสอบ Client ID และ Secret
3. **access_denied**: ผู้ใช้ปฏิเสธการให้สิทธิ์
4. **token_expired**: ใช้ refresh token เพื่อต่ออายุ

**การแก้ไข:**
- ตรวจสอบ environment variables
- ดู console logs สำหรับ error details
- ทดสอบใน Incognito mode
- ตรวจสอบ network requests ใน DevTools
