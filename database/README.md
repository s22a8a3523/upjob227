# Database Setup Guide

## Prerequisites
- PostgreSQL 15+
- pgAdmin 4

## Setup Instructions

### 1. สร้าง Database ใน pgAdmin

1. เปิด pgAdmin 4
2. เชื่อมต่อกับ PostgreSQL server
3. Right-click บน "Databases" → Create → Database
4. ตั้งชื่อ: `rga_dashboard`
5. Owner: postgres (หรือ user ที่คุณต้องการ)
6. Click "Save"

### 2. Run Schema Script

#### วิธีที่ 1: ใช้ pgAdmin Query Tool
1. Right-click บน database `rga_dashboard`
2. เลือก "Query Tool"
3. เปิดไฟล์ `schema.sql`
4. คัดลอกเนื้อหาทั้งหมดลง Query Tool
5. กด F5 หรือคลิกปุ่ม "Execute"

#### วิธีที่ 2: ใช้ Command Line (psql)
```bash
psql -U postgres -d rga_dashboard -f schema.sql
```

### 3. Verify Installation

Run ใน Query Tool:
```sql
-- ตรวจสอบ tables ทั้งหมด
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ตรวจสอบข้อมูลเริ่มต้น
SELECT * FROM tenants;
SELECT * FROM users;
```

## Database Schema Overview

### Core Tables

#### `tenants`
- Multi-tenant organizations
- Branding และ configuration
- Subscription management

#### `users`
- User accounts
- Role-based access control
- Authentication data

#### `campaigns`
- Marketing campaigns
- Budget tracking
- Multi-platform support

#### `metrics`
- Time-series performance data
- Hourly/daily aggregation
- Multiple KPIs

#### `integrations`
- External API connections
- Credentials storage (encrypted)
- Sync configuration

#### `alerts`
- Alert rules
- Threshold monitoring
- Notification settings

#### `ai_insights`
- AI-generated insights
- Recommendations
- Trend analysis

#### `reports`
- Custom reports
- Scheduled reports
- Export functionality

#### `audit_logs`
- Activity tracking
- Security logging
- Change history

## Connection String Format

```
postgresql://username:password@localhost:5432/rga_dashboard
```

### Example Connection Strings

**Development:**
```
postgresql://postgres:yourpassword@localhost:5432/rga_dashboard
```

**Production (ควรใช้ connection pooling):**
```
postgresql://rga_user:secure_password@db.example.com:5432/rga_dashboard?sslmode=require
```

## Default Credentials

### Database
- Database: `rga_dashboard`
- User: `postgres` (หรือตามที่คุณตั้งค่า)

### Application (ตามที่กำหนดใน schema.sql)
- Email: `admin@rgademo.com`
- Password: `Admin@123`
- Tenant: `rga-demo`

**⚠️ สำคัญ:** เปลี่ยน password ก่อนใช้งาน production!

## Maintenance

### Backup Database
```bash
pg_dump -U postgres -d rga_dashboard -f backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql -U postgres -d rga_dashboard -f backup_20240101.sql
```

### Clear All Data (Development Only)
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
    users,
    tenants
CASCADE;
```

## Performance Tips

1. **Indexes**: Schema มี indexes สำหรับ queries ที่ใช้บ่อย
2. **Partitioning**: สำหรับ `metrics` table ควร partition ตาม date เมื่อข้อมูลเยอะขึ้น
3. **Vacuum**: Run `VACUUM ANALYZE` เป็นประจำ
4. **Connection Pooling**: ใช้ PgBouncer หรือ connection pooling ของ ORM

## Troubleshooting

### Permission Denied
```sql
GRANT ALL PRIVILEGES ON DATABASE rga_dashboard TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### UUID Extension Error
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Reset Database
```sql
DROP DATABASE rga_dashboard;
CREATE DATABASE rga_dashboard;
-- จากนั้น run schema.sql ใหม่
```
