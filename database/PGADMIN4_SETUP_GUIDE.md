# คู่มือการตั้งค่าฐานข้อมูล RGA Dashboard ใน pgAdmin4

## 📋 สารบัญ
1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนการตั้งค่า](#ขั้นตอนการตั้งค่า)
3. [การตรวจสอบ](#การตรวจสอบ)
4. [ข้อมูลเริ่มต้น](#ข้อมูลเริ่มต้น)
5. [การเชื่อมต่อจาก Application](#การเชื่อมต่อจาก-application)
6. [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดเบื้องต้น

- ✅ PostgreSQL 15 หรือสูงกว่า
- ✅ pgAdmin 4 (เวอร์ชันล่าสุด)
- ✅ สิทธิ์ในการสร้าง database และ user

---

## ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: สร้าง Database ใน pgAdmin4

1. **เปิด pgAdmin 4**
2. **เชื่อมต่อกับ PostgreSQL Server**
   - คลิกขวาที่ "Servers" → "Create" → "Server"
   - กรอกข้อมูลการเชื่อมต่อ (ถ้ายังไม่ได้เชื่อมต่อ)
3. **สร้าง Database**
   - คลิกขวาที่ "Databases" → "Create" → "Database..."
   - ตั้งค่าดังนี้:
     - **Database name**: `rga_dashboard`
     - **Owner**: `postgres` (หรือ user ที่คุณต้องการ)
     - **Encoding**: `UTF8`
     - **Template**: `template0`
   - คลิก "Save"

### ขั้นตอนที่ 2: รัน SQL Script

#### วิธีที่ 1: ใช้ Query Tool (แนะนำ)

1. **เปิด Query Tool**
   - คลิกขวาที่ database `rga_dashboard`
   - เลือก "Query Tool"

2. **เปิดไฟล์ SQL**
   - เปิดไฟล์ `database/setup_rga_dashboard.sql`
   - คัดลอกเนื้อหาทั้งหมด (Ctrl+A, Ctrl+C)

3. **วางและรัน**
   - วางใน Query Tool (Ctrl+V)
   - กด **F5** หรือคลิกปุ่ม "Execute" (▶️)
   - รอให้สคริปต์ทำงานเสร็จ (อาจใช้เวลา 1-2 นาที)

4. **ตรวจสอบผลลัพธ์**
   - ดูที่ Messages tab ควรแสดง "Successfully run. Total query runtime: ..."
   - ไม่ควรมี error (สีแดง)

#### วิธีที่ 2: ใช้ psql Command Line

```bash
# Windows (PowerShell)
psql -U postgres -d rga_dashboard -f database\setup_rga_dashboard.sql

# Linux/Mac
psql -U postgres -d rga_dashboard -f database/setup_rga_dashboard.sql
```

### ขั้นตอนที่ 3: ตรวจสอบการติดตั้ง

รันคำสั่ง SQL ต่อไปนี้ใน Query Tool:

```sql
-- 1. ตรวจสอบจำนวน tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
-- ควรได้ 17 tables

-- 2. ตรวจสอบรายชื่อ tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. ตรวจสอบข้อมูลเริ่มต้น
SELECT * FROM tenants;
SELECT * FROM users;

-- 4. ตรวจสอบ indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## การสร้าง Admin User แรก

⚠️ **สำหรับการใช้งานจริง**: สคริปต์นี้ **ไม่มี seed data** เพื่อความปลอดภัย

### วิธีสร้าง Admin User แรก:

#### วิธีที่ 1: ใช้ API (แนะนำ)
```bash
# 1. สร้าง Tenant
POST /api/v1/tenants
{
  "name": "Your Company Name",
  "slug": "your-company",
  "subscriptionPlan": "enterprise"
}

# 2. สร้าง Super Admin
POST /api/v1/users
{
  "tenantId": "<tenant_id_from_step_1>",
  "email": "admin@yourcompany.com",
  "password": "YourSecurePassword123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "super_admin"
}
```

#### วิธีที่ 2: ใช้ SQL Script
- ดูไฟล์: `database/create_admin_user.sql`
- แก้ไขข้อมูลตามต้องการ
- รันใน Query Tool

📖 **อ่านคู่มือละเอียด**: `database/PRODUCTION_SETUP.md`

---

## การเชื่อมต่อจาก Application

### Connection String Format

```
postgresql://username:password@host:port/database
```

### ตัวอย่าง Connection Strings

#### Development (Local)
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rga_dashboard
```

#### Production
```env
DATABASE_URL=postgresql://rga_user:secure_password@db.example.com:5432/rga_dashboard?sslmode=require
```

### ตั้งค่าใน Backend

1. สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`
2. เพิ่ม connection string:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/rga_dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3001
NODE_ENV=development
```

3. รัน Prisma migrations (ถ้ายังไม่รัน):

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Database Schema Overview

### Core Tables (17 tables)

| Table | Description |
|-------|-------------|
| `tenants` | Multi-tenant organizations |
| `users` | User accounts & authentication |
| `roles` | Role-based permissions |
| `integrations` | External platform connections |
| `campaigns` | Marketing campaigns |
| `metrics` | Time-series performance data |
| `alerts` | Alert configurations |
| `alert_history` | Alert trigger history |
| `reports` | Custom reports |
| `ai_insights` | AI-generated insights |
| `ai_queries` | Natural language queries |
| `audit_logs` | System audit trail |
| `sessions` | User sessions |
| `sync_histories` | Data sync history |
| `webhook_events` | Webhook events |
| `activity_logs` | User activity logs |
| `oauth_states` | OAuth state management |

### Key Relationships

```
tenants (1) ──→ (N) users
tenants (1) ──→ (N) campaigns
tenants (1) ──→ (N) integrations
campaigns (1) ──→ (N) metrics
campaigns (1) ──→ (N) alerts
users (1) ──→ (N) sessions
```

---

## Troubleshooting

### ปัญหา: Permission Denied

**แก้ไข:**
```sql
-- ให้สิทธิ์กับ user
GRANT ALL PRIVILEGES ON DATABASE rga_dashboard TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### ปัญหา: UUID Extension Error

**แก้ไข:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### ปัญหา: Table Already Exists

**แก้ไข:**
- ใช้ `CREATE TABLE IF NOT EXISTS` ในสคริปต์ (มีอยู่แล้ว)
- หรือลบ database และสร้างใหม่:

```sql
-- ระวัง: จะลบข้อมูลทั้งหมด!
DROP DATABASE rga_dashboard;
CREATE DATABASE rga_dashboard;
-- จากนั้นรัน setup_rga_dashboard.sql ใหม่
```

### ปัญหา: Foreign Key Constraint Error

**แก้ไข:**
- ตรวจสอบว่ามีข้อมูลใน parent table ก่อน insert child table
- ตรวจสอบลำดับการ insert ข้อมูล

### ปัญหา: Connection Refused

**ตรวจสอบ:**
1. PostgreSQL service กำลังทำงานอยู่หรือไม่
2. Port 5432 เปิดอยู่หรือไม่
3. Firewall settings
4. Connection string ถูกต้องหรือไม่

---

## การ Backup และ Restore

### Backup Database

```bash
# Windows
pg_dump -U postgres -d rga_dashboard -f backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql

# Linux/Mac
pg_dump -U postgres -d rga_dashboard -f backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres -d rga_dashboard -f backup_20240101.sql
```

---

## การลบข้อมูลทั้งหมด (Development Only)

⚠️ **คำเตือน**: คำสั่งนี้จะลบข้อมูลทั้งหมด!

```sql
TRUNCATE TABLE 
    metrics,
    campaigns,
    integrations,
    alerts,
    alert_history,
    reports,
    ai_insights,
    ai_queries,
    audit_logs,
    sessions,
    sync_histories,
    webhook_events,
    activity_logs,
    oauth_states,
    users,
    roles,
    tenants
CASCADE;
```

---

## Performance Tips

1. **Indexes**: Schema มี indexes สำหรับ queries ที่ใช้บ่อยแล้ว
2. **Partitioning**: สำหรับ `metrics` table ควร partition ตาม date เมื่อข้อมูลเยอะขึ้น
3. **Vacuum**: Run `VACUUM ANALYZE` เป็นประจำ
4. **Connection Pooling**: ใช้ PgBouncer หรือ connection pooling ของ ORM

---

## สรุป

✅ Database `rga_dashboard` พร้อมใช้งานแล้ว!

**Next Steps:**
1. ตั้งค่า `.env` ใน backend
2. รัน Prisma migrations
3. รัน seed data
4. เริ่มพัฒนา application

**Support:**
- ตรวจสอบ logs ใน pgAdmin4
- ดู error messages ใน Query Tool
- ตรวจสอบ Prisma schema: `backend/prisma/schema.prisma`

---

**สร้างเมื่อ**: 2025-11-13  
**เวอร์ชัน**: 1.0.0

