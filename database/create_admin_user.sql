-- ============================================
-- สคริปต์สำหรับสร้าง Admin User แรก
-- สำหรับการใช้งานจริง (Production)
-- ============================================
-- 
-- วิธีใช้งาน:
-- 1. แก้ไขข้อมูลด้านล่างตามต้องการ
-- 2. รันสคริปต์นี้ใน pgAdmin4 Query Tool
-- 3. เก็บ password ไว้ในที่ปลอดภัย
--
-- ============================================

-- ตั้งค่าตัวแปร (แก้ไขตามต้องการ)
DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_email VARCHAR(255) := 'admin@yourcompany.com';  -- แก้ไข email
    v_password_hash VARCHAR(255);  -- จะต้อง hash ด้วย bcrypt จาก application
    v_first_name VARCHAR(100) := 'Admin';
    v_last_name VARCHAR(100) := 'User';
    v_tenant_name VARCHAR(255) := 'Your Company Name';  -- แก้ไขชื่อบริษัท
    v_tenant_slug VARCHAR(100) := 'your-company';  -- แก้ไข slug (ใช้ตัวพิมพ์เล็ก, - แทนช่องว่าง)
BEGIN
    -- สร้าง Tenant
    INSERT INTO tenants (id, name, slug, subscription_plan, subscription_status)
    VALUES (
        uuid_generate_v4(),
        v_tenant_name,
        v_tenant_slug,
        'enterprise',
        'active'
    )
    ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id INTO v_tenant_id;
    
    -- ถ้า tenant มีอยู่แล้ว ให้ดึง ID
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE slug = v_tenant_slug;
    END IF;
    
    RAISE NOTICE 'Tenant created/updated: % (ID: %)', v_tenant_name, v_tenant_id;
    
    -- คำเตือน: Password ต้อง hash ด้วย bcrypt จาก application
    -- ใช้ API endpoint: POST /api/v1/auth/register หรือ /api/v1/users
    -- หรือใช้ script create_admin_with_password.sql แทน
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '⚠️  สำคัญ: ต้องสร้าง User ผ่าน API';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE '';
    RAISE NOTICE 'ขั้นตอนต่อไป:';
    RAISE NOTICE '1. ใช้ Tenant ID ด้านบน';
    RAISE NOTICE '2. สร้าง User ผ่าน API:';
    RAISE NOTICE '   POST /api/v1/users';
    RAISE NOTICE '   Body: {';
    RAISE NOTICE '     "tenantId": "%",', v_tenant_id;
    RAISE NOTICE '     "email": "%",', v_email;
    RAISE NOTICE '     "password": "your_secure_password",';
    RAISE NOTICE '     "firstName": "%",', v_first_name;
    RAISE NOTICE '     "lastName": "%",', v_last_name;
    RAISE NOTICE '     "role": "super_admin"';
    RAISE NOTICE '   }';
    RAISE NOTICE '';
    RAISE NOTICE 'หรือใช้ script: create_admin_with_password.sql';
    
END $$;

-- ============================================
-- ตรวจสอบ Tenant ที่สร้าง
-- ============================================
SELECT 
    id,
    name,
    slug,
    subscription_plan,
    subscription_status,
    created_at
FROM tenants
WHERE slug = 'your-company'  -- แก้ไข slug ตามที่ตั้งไว้
ORDER BY created_at DESC
LIMIT 1;

