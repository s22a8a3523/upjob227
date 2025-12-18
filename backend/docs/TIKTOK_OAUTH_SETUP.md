# TikTok Login Kit Setup Guide

## 🔧 การตั้งค่า TikTok Developer Portal

### 1. สร้าง TikTok Developer Account

1. ไปที่ [TikTok for Developers](https://developers.tiktok.com/)
2. คลิก **"Get Started"** → **"Login Kit for Web"**
3. ลงทะเบียนบัญชี Developer ด้วย TikTok account
4. ยืนยันตัวตนและรอการอนุมัติ (อาจใช้เวลา 1-3 วัน)

### 2. สร้าง App ใหม่

1. ไปที่ **Developer Portal** → **"My Apps"**
2. คลิก **"Create an app"**
3. กรอกข้อมูลแอป:
   - **App Name**: `RGA Dashboard`
   - **App Category**: `Business Tools`
   - **App Description**: `Marketing analytics dashboard`
   - **Platform**: เลือก **Web**

### 3. เปิดใช้งาน Login Kit

1. ในหน้า App Dashboard คลิก **"+ Add products"**
2. เลือก **"Login Kit"** → **"Add"**
3. กำหนดค่า Login Kit:
   - **Redirect domain**: `localhost:3001, yourdomain.com`
   - **Redirect URI**: 
     - `http://localhost:3001/api/v1/auth/tiktok/callback`
     - `https://yourdomain.com/api/v1/auth/tiktok/callback`

### 4. เปิดใช้งาน APIs เพิ่มเติม

เลือก APIs ที่ต้องการ:
- **Display API** - ดึงข้อมูลโปรไฟล์และวิดีโอ
- **Research API** - วิเคราะห์ข้อมูลและสถิติ
- **Content Posting API** - อัปโหลดวิดีโอ

### 5. รับ Client Credentials

หลังจากตั้งค่าเสร็จ จะได้:
- **Client Key**: `aw123456789`
- **Client Secret**: `abcdef123456789`

### 6. อัปเดต Environment Variables

สร้างไฟล์ `.env` ใน backend folder:

```bash
# TikTok Login Kit Configuration
TIKTOK_CLIENT_KEY="your-client-key"
TIKTOK_CLIENT_SECRET="your-client-secret"
TIKTOK_REDIRECT_URI="http://localhost:3001/api/v1/auth/tiktok/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"
```

## 🚀 การใช้งาน API Endpoints

### Authentication Flow

1. **เริ่มต้น OAuth Flow**
   ```
   GET /api/v1/auth/tiktok?tenantId=your-tenant&returnUrl=/dashboard
   ```

2. **Handle Callback** (อัตโนมัติ)
   ```
   GET /api/v1/auth/tiktok/callback?code=xxx&state=xxx
   ```

3. **Exchange Token** (สำหรับ Frontend)
   ```
   POST /api/v1/auth/tiktok/token
   {
     "code": "authorization_code",
     "tenantId": "your-tenant"
   }
   ```

### Protected Endpoints (ต้อง Authentication)

4. **Refresh Token**
   ```
   POST /api/v1/auth/tiktok/refresh
   Headers: Authorization: Bearer <jwt_token>
   {
     "refreshToken": "refresh_token"
   }
   ```

5. **Get User Videos**
   ```
   GET /api/v1/auth/tiktok/videos?maxResults=20
   Headers: Authorization: Bearer <jwt_token>
   ```

6. **Get Video Analytics**
   ```
   POST /api/v1/auth/tiktok/analytics
   Headers: Authorization: Bearer <jwt_token>
   {
     "videoIds": ["video_id_1", "video_id_2"]
   }
   ```

7. **Upload Video**
   ```
   POST /api/v1/auth/tiktok/upload
   Headers: Authorization: Bearer <jwt_token>
   {
     "videoData": {
       "video_url": "https://example.com/video.mp4",
       "post_info": {
         "title": "My Video Title",
         "description": "Video description",
         "privacy_level": "PUBLIC_TO_EVERYONE"
       },
       "source_info": {
         "source": "PULL_FROM_URL",
         "video_url": "https://example.com/video.mp4"
       }
     }
   }
   ```

8. **Revoke Access**
   ```
   DELETE /api/v1/auth/tiktok/revoke
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
  'user.info.basic',      // ข้อมูลพื้นฐานผู้ใช้
  'user.info.profile',    // โปรไฟล์ผู้ใช้
  'user.info.stats',      // สถิติผู้ใช้
  'video.list',           // รายการวิดีโอ
  'video.upload'          // อัปโหลดวิดีโอ
];
```

## 🎯 ข้อมูลที่ได้รับ

### User Profile:
- `open_id` - TikTok User ID
- `display_name` - ชื่อแสดง
- `avatar_url` - รูปโปรไฟล์
- `follower_count` - จำนวนผู้ติดตาม
- `following_count` - จำนวนการติดตาม
- `likes_count` - จำนวนไลค์รวม
- `video_count` - จำนวนวิดีโอ

### Video Data:
- `video_id` - รหัสวิดีโอ
- `title` - ชื่อวิดีโอ
- `cover_image_url` - รูปปก
- `video_description` - คำอธิบาย
- `duration` - ความยาววิดีโอ
- `create_time` - วันที่สร้าง

### Analytics:
- `like_count` - จำนวนไลค์
- `comment_count` - จำนวนคอมเมนต์
- `share_count` - จำนวนแชร์
- `view_count` - จำนวนการดู

## 🧪 การทดสอบ

1. **ทดสอบ OAuth Flow**:
   ```bash
   curl "http://localhost:3001/api/v1/auth/tiktok?tenantId=test-tenant"
   ```

2. **ทดสอบ Video API**:
   ```bash
   curl -H "Authorization: Bearer <jwt_token>" \
        "http://localhost:3001/api/v1/auth/tiktok/videos"
   ```

## ⚠️ หมายเหตุสำคัญ

- **App Review**: TikTok ต้องอนุมัติแอปก่อนใช้งาน production
- **Rate Limits**: TikTok APIs มี rate limits เข้มงวด
- **Content Policy**: ต้องปฏิบัติตาม TikTok Community Guidelines
- **Data Usage**: ต้องใช้ข้อมูลตาม TikTok Developer Policy

## 🔧 Troubleshooting

**ปัญหาที่พบบ่อย:**

1. **invalid_client**: ตรวจสอบ Client Key และ Secret
2. **redirect_uri_mismatch**: ตรวจสอบ Redirect URI ใน Developer Portal
3. **access_denied**: ผู้ใช้ปฏิเสธการให้สิทธิ์
4. **scope_not_authorized**: Scope ไม่ได้รับอนุมัติ
5. **rate_limit_exceeded**: เกิน rate limit

**การแก้ไข:**
- ตรวจสอบ environment variables
- ดู console logs สำหรับ error details
- ทดสอบใน Incognito mode
- ตรวจสอบสถานะแอปใน Developer Portal
- รอการอนุมัติจาก TikTok (สำหรับ production)

## 📚 เอกสารอ้างอิง

- [TikTok Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web)
- [TikTok Display API](https://developers.tiktok.com/doc/display-api-getting-started)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-getting-started)
- [TikTok Developer Policies](https://developers.tiktok.com/doc/developer-terms)
