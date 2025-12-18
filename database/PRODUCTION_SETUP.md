# คู่มือการตั้งค่าฐานข้อมูลสำหรับการใช้งานจริง (Production)

## 📋 สารบัญ
1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [ขั้นตอนการตั้งค่า](#ขั้นตอนการตั้งค่า)
3. [การสร้าง Admin User แรก](#การสร้าง-admin-user-แรก)
4. [การตั้งค่า Security](#การตั้งค่า-security)
5. [การ Backup](#การ-backup)
6. [Best Practices](#best-practices)

---

## ข้อกำหนดเบื้องต้น

- ✅ PostgreSQL 15+ (แนะนำ PostgreSQL 16+)
- ✅ pgAdmin 4 หรือ psql
- ✅ สิทธิ์ในการสร้าง database และ user
- ✅ Connection ที่ปลอดภัย (SSL/TLS สำหรับ production)

---

## ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: สร้าง Database

```sql
-- สร้าง database
CREATE DATABASE rga_dashboard
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;
```

หรือใช้ pgAdmin4:
1. คลิกขวาที่ "Databases" → Create → Database
2. ตั้งชื่อ: `rga_dashboard`
3. Owner: `postgres` (หรือ user ที่ต้องการ)
4. Encoding: `UTF8`
5. Template: `template0`
6. คลิก Save

### ขั้นตอนที่ 2: สร้าง Database User (แนะนำ)

```sql
-- สร้าง user เฉพาะสำหรับ application
CREATE USER rga_app_user WITH PASSWORD 'your_secure_password_here';

-- ให้สิทธิ์
GRANT ALL PRIVILEGES ON DATABASE rga_dashboard TO rga_app_user;

-- เชื่อมต่อกับ database ก่อน
\c rga_dashboard

-- ให้สิทธิ์ใน schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rga_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rga_app_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO rga_app_user;

-- ให้สิทธิ์สำหรับ tables ที่จะสร้างในอนาคต
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON TABLES TO rga_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON SEQUENCES TO rga_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON FUNCTIONS TO rga_app_user;
```

### ขั้นตอนที่ 3: รัน Schema Script

1. เปิด pgAdmin4 → Query Tool
2. เปิดไฟล์ `database/setup_rga_dashboard.sql`
3. คัดลอกและรันสคริปต์
4. ตรวจสอบว่าไม่มี error

### ขั้นตอนที่ 4: ตรวจสอบ

```sql
-- ตรวจสอบจำนวน tables (ควรได้ 17)
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- ตรวจสอบว่าไม่มี seed data
SELECT COUNT(*) as tenant_count FROM tenants;
SELECT COUNT(*) as user_count FROM users;
-- ควรได้ 0 ทั้งคู่
```

---

## การสร้าง Admin User แรก

### วิธีที่ 1: ใช้ API (แนะนำ)

หลังจากรัน schema แล้ว:

1. **สร้าง Tenant ผ่าน API:**
```bash
POST /api/v1/tenants
Content-Type: application/json

{
  "name": "Your Company Name",
  "slug": "your-company",
  "subscriptionPlan": "enterprise"
}
```

2. **สร้าง Super Admin User:**
```bash
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <initial_token_if_needed>

{
  "tenantId": "<tenant_id_from_step_1>",
  "email": "admin@yourcompany.com",
  "password": "YourSecurePassword123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "super_admin"
}
```

### วิธีที่ 2: ใช้ SQL Script

1. แก้ไขไฟล์ `database/create_admin_user.sql`
   - แก้ไข email, ชื่อบริษัท, slug
2. รันใน Query Tool
3. ใช้ Tenant ID ที่ได้สร้าง User ผ่าน API

### วิธีที่ 3: ใช้ Prisma Seed (Development)

```bash
cd backend
npm run prisma:seed
```

⚠️ **หมายเหตุ**: Seed script มี demo data ใช้สำหรับ development เท่านั้น

---

## การตั้งค่า Security

### 1. Connection String (Production)

```env
# ใช้ SSL/TLS
DATABASE_URL=postgresql://rga_app_user:password@db.example.com:5432/rga_dashboard?sslmode=require

# หรือใช้ connection pooling
DATABASE_URL=postgresql://rga_app_user:password@db.example.com:5432/rga_dashboard?sslmode=require&pool_timeout=10
```

### 2. Firewall Rules

- อนุญาตเฉพาะ IP ของ application server
- ใช้ VPN หรือ Private Network
- ปิดการเข้าถึงจาก public internet

### 3. Password Policy

- ใช้ password ที่แข็งแกร่ง (min 16 characters)
- เปลี่ยน password เป็นประจำ
- ใช้ password manager

### 4. Database User Permissions

```sql
-- ตรวจสอบสิทธิ์
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'rga_app_user';
```

### 5. Enable SSL

ใน `postgresql.conf`:
```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

---

## การ Backup

### Automated Backup Script

สร้างไฟล์ `backup_database.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/rga_dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rga_dashboard_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -U rga_app_user -d rga_dashboard -F c -f $BACKUP_FILE

# ลบ backup เก่ากว่า 30 วัน
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### Manual Backup

```bash
# Full backup
pg_dump -U postgres -d rga_dashboard -F c -f backup_$(date +%Y%m%d).dump

# SQL format
pg_dump -U postgres -d rga_dashboard -f backup_$(date +%Y%m%d).sql
```

### Restore

```bash
# จาก dump file
pg_restore -U postgres -d rga_dashboard backup_20240101.dump

# จาก SQL file
psql -U postgres -d rga_dashboard -f backup_20240101.sql
```

---

## Best Practices

### 1. Connection Pooling

ใช้ connection pooling เช่น PgBouncer:

```ini
[databases]
rga_dashboard = host=localhost port=5432 dbname=rga_dashboard

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### 2. Monitoring

- ตั้งค่า monitoring (เช่น pgAdmin, Datadog, New Relic)
- ติดตาม slow queries
- ตรวจสอบ connection count
- ตรวจสอบ disk space

### 3. Indexes

Schema มี indexes พื้นฐานแล้ว แต่ควรเพิ่มตามการใช้งาน:

```sql
-- ตัวอย่าง: เพิ่ม index สำหรับ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_date_platform 
ON metrics(tenant_id, date DESC, platform)
WHERE date >= CURRENT_DATE - INTERVAL '90 days';
```

### 4. Partitioning (สำหรับข้อมูลเยอะ)

สำหรับ `metrics` table เมื่อข้อมูลเยอะ:

```sql
-- ตัวอย่าง: Partition ตามเดือน
CREATE TABLE metrics_2024_01 PARTITION OF metrics
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 5. Vacuum และ Analyze

```sql
-- รันเป็นประจำ (อาจตั้ง cron job)
VACUUM ANALYZE;

-- สำหรับ table เฉพาะ
VACUUM ANALYZE metrics;
```

### 6. Logging

ตั้งค่าใน `postgresql.conf`:

```
log_statement = 'all'  # หรือ 'mod' สำหรับ production
log_min_duration_statement = 1000  # log queries ที่ช้ากว่า 1 วินาที
```

---

## Performance Tuning

### 1. PostgreSQL Configuration

แก้ไข `postgresql.conf`:

```ini
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB

# Connections
max_connections = 200

# Checkpoint
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Query Planner
random_page_cost = 1.1  # สำหรับ SSD
```

### 2. Query Optimization

- ใช้ EXPLAIN ANALYZE เพื่อดู execution plan
- ตรวจสอบ slow queries
- เพิ่ม indexes ตามต้องการ

---

## Troubleshooting

### Connection Issues

```sql
-- ตรวจสอบ connections
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'rga_dashboard';
```

### Lock Issues

```sql
-- ตรวจสอบ locks
SELECT 
    locktype,
    relation::regclass,
    mode,
    granted
FROM pg_locks
WHERE relation = 'tenants'::regclass;
```

### Disk Space

```sql
-- ตรวจสอบขนาด database
SELECT 
    pg_size_pretty(pg_database_size('rga_dashboard')) as database_size;

-- ตรวจสอบขนาด tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Checklist สำหรับ Production

- [ ] สร้าง database `rga_dashboard`
- [ ] สร้าง dedicated database user
- [ ] รัน `setup_rga_dashboard.sql`
- [ ] ตรวจสอบว่าไม่มี seed data
- [ ] ตั้งค่า SSL/TLS
- [ ] ตั้งค่า firewall rules
- [ ] สร้าง tenant แรกผ่าน API
- [ ] สร้าง super admin user แรก
- [ ] ตั้งค่า connection string ใน `.env`
- [ ] ตั้งค่า automated backup
- [ ] ตั้งค่า monitoring
- [ ] ทดสอบ connection จาก application
- [ ] ทดสอบ backup และ restore
- [ ] ตั้งค่า connection pooling (ถ้าจำเป็น)
- [ ] ตั้งค่า performance tuning

---

## สรุป

✅ Database พร้อมใช้งานจริงแล้ว!

**Next Steps:**
1. สร้าง tenant และ admin user แรก
2. ตั้งค่า security และ backup
3. เริ่มใช้งาน application

---

**อัปเดตล่าสุด**: 2025-11-13  
**เวอร์ชัน**: 1.0.0 (Production Ready)

