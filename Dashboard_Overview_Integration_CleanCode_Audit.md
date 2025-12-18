# Audit: Integration Checklist + Overview Dashboard (Frontend)

**Repo:** dioasoon-main  
**Scope (ตามรูปที่แนบ):** หน้า Dashboard ที่มีส่วน `Integration Checklist` และ `Overview Dashboard` (Realtime cards/Financial overview/Funnel/Conversions platform ฯลฯ)  
**วันที่ตรวจ:** 2025-12-13

---

## 1) หน้านี้อยู่ตรงไหนในโค้ด (Authoritative entry points)

- `frontend/src/components/Dashboard.tsx`
  - มี `IntegrationChecklistWidget` และ `renderOverview()` ซึ่งเป็นส่วน UI ตามภาพ
  - เป็นจุดรวม state/logic จำนวนมาก (God component)

ไฟล์ที่เกี่ยวข้องเชิงพฤติกรรม (สำหรับ checklist/integration):
- `frontend/src/components/Checklist.tsx`
  - เป็น onboarding checklist (route `/checklist`) ที่ทำ integration checklist ซ้ำ (logic/UX อีกแบบ)
- `frontend/src/hooks/useIntegrationNotifications.ts`
  - hook แจ้งเตือน integration (ถูกเรียกทั้งใน `Dashboard.tsx` และ `Checklist.tsx`)
- `frontend/src/services/api.ts`
  - มี `getIntegrations`, `updateIntegration` (Dashboard/Checklist ใช้งาน)

ไฟล์ที่ “น่าสงสัยว่าเป็น legacy/unused” (รายละเอียดในหัวข้อถัดไป):
- `frontend/src/components/IntegrationManager.tsx`
- `frontend/src/components/SimpleIntegrationManager.js`
- `frontend/src/components/SimpleIntegrationManager.jsx`

---

## 2) ปัญหาใหญ่สุดที่กระทบ Clean code ทันที (High impact findings)

### 2.1 มีการ `navigate('/integrations')` หลายจุด แต่ **ไม่มี route `/integrations` ใน `App.tsx`**
**Evidence**
- `frontend/src/components/Dashboard.tsx` มีหลายปุ่มเรียก `navigate('/integrations')`
- `frontend/src/components/Checklist.tsx` มีปุ่ม `Open workspace` → `navigate('/integrations')`
- `frontend/src/components/OAuthCallback.tsx` redirect ไป `/integrations`
- แต่ `frontend/src/App.tsx` มี protected routes แค่:
  - `/checklist`, `/dashboard`, `/profile`, `/webhooks`, `/history`, `/product-performance-details`

**Impact**
- ผู้ใช้กดปุ่มใน Integration Checklist แล้วไปหน้า `/integrations` จะโดน catch-all แล้ว redirect กลับ `/` (หรือไม่เป็นไปตามที่คาด)
- ทำให้มี UI action ที่ “ดูเหมือนทำงาน” แต่จริง ๆ dead path

**Recommendation (เลือกอย่างใดอย่างหนึ่ง)**
- **Option A (แนะนำ):** เพิ่ม route `/integrations` ให้ชัดเจน (แล้วเลือกว่าจะใช้ `IntegrationManager.tsx` หรือหน้าใหม่)
- **Option B:** ถ้าไม่มีแผนทำหน้าจริง ให้เปลี่ยนปุ่มทั้งหมดจาก `navigate('/integrations')` เป็น action อื่นที่มีอยู่จริง (เช่นเปิด modal/แสดง message) และลบไฟล์ integration manager ที่ไม่ใช้

> จุดนี้เป็น “functional bug + dead navigation” และเป็นตัวชี้ว่ามีโค้ดค้าง/legacy อยู่จริง

---

### 2.2 มีไฟล์ Integration Manager 3 ชุด แต่ **ไม่ถูก import/route ใช้งาน**

#### 2.2.1 `frontend/src/components/IntegrationManager.tsx` (ไม่ถูกใช้)
**Evidence**
- ไม่มี import ใน `App.tsx` และไม่มีการ render `<IntegrationManager />` จากที่อื่น
- มีการ import API จาก `../services/api` หลายตัว แต่กลับไปใช้ `fetch('/api/v1/...')` และ `localStorage.getItem('token')` เอง

**Impact**
- SRP/DRY แย่: duplicate network/auth concerns
- ถ้าเอามาใช้จริงจะชนกับแนวทางใน `services/api.ts` และกับ refactor roadmap (centralized session/storage)

**Disposition**
- ถ้าไม่ทำ route `/integrations` → จัดเป็น **candidate for deletion**
- ถ้าจะทำ `/integrations` → ควร refactor ให้ใช้ `services/api.ts` (หรือในอนาคต `services/api/*`) และใช้ session/storage module กลาง

#### 2.2.2 `frontend/src/components/SimpleIntegrationManager.js` (น่าจะเป็นโค้ดค้าง/ผิดสเปค)
**Evidence/Red flags**
- ไฟล์ `.js` แต่มี TypeScript syntax (`interface Integration`, `React.FC`, `useState<Integration[]>`) ซึ่งโดยปกติ build ของ React จะไม่ strip types ใน `.js`

**Impact**
- หากถูก import ใช้งานจริง มีโอกาส build fail

**Disposition**
- จากการค้นหา: ไม่มีไฟล์ไหน import ใช้ → **candidate for deletion**

#### 2.2.3 `frontend/src/components/SimpleIntegrationManager.jsx` (ซ้ำกับ .js)
**Evidence**
- โค้ดเกือบเหมือนกันกับ `.js` แต่เป็น JS ธรรมดา
- ไม่ถูก import/route

**Disposition**
- **candidate for deletion** (หรือเก็บไว้เฉพาะใน branch/commit history)

---

## 3) โค้ดที่มีแนวโน้ม “ไม่ได้ใช้แล้ว/ไม่ได้ใช้จริง” ภายใน `Dashboard.tsx`

> หมายเหตุ: การยืนยัน 100% ควรใช้ ESLint/TS noUnusedLocals/noUnusedParameters แต่จากการอ่านโค้ดและ grep พบจุดที่ชัดเจนมากว่าไม่ถูก render หรือไม่มี call-site

### 3.1 Unused import ที่ชัดเจน
- `frontend/src/components/Dashboard.tsx`
  - `import api from '../services/api';`  
    จากการค้นหาไม่มี `api.` usage ในไฟล์ → **unused import**

### 3.2 State/variables ที่ประกาศแล้วไม่ถูกใช้งาน (หรือไม่ครบ flow)
- `themeIndex`, `setThemeIndex`, `themePresets`  
  พบประกาศ แต่ไม่พบการใช้งาน/ไม่พบ `setThemeIndex` call-site → **dead state**

- `headerSearch`, `setHeaderSearch`  
  พบประกาศ แต่ไม่พบการ render input/search ที่ผูกกับ state นี้ → **dead state**

- `customDateRange`, `setCustomDateRange`  
  พบประกาศ แต่ไม่พบการใช้งานในการ build query/filter → **dead state**

### 3.3 Integration Checklist: state/hook ที่ถูกสร้างแต่ไม่ได้ถูกแสดงผล
- `integrationError` ถูก set ใน `loadIntegrations()` / `handleToggle()` แต่ใน `IntegrationChecklistWidget` ไม่มีส่วนแสดง error (ไม่ render error banner) → **error is written but never read**

- `useIntegrationNotifications('open')` ใน `Dashboard.tsx` คืนค่า:
  - `notifications`, `loading: loadingNotifications`, `error: notificationError`, `refetch`
  แต่ใน `IntegrationChecklistWidget` ปัจจุบันไม่ได้ render notifications list/alert panel แบบเดียวกับ `Checklist.tsx` → **hook result mostly unused**

**Impact**
- ทำให้ component ดูเหมือนรองรับ notification/error แต่จริง ๆ ไม่มี UX แสดงผล
- เพิ่มความซับซ้อนและเพิ่ม call API/hook โดยไม่ให้ประโยชน์

**Recommendation**
- ถ้าต้องการ notifications ใน dashboard จริง: ทำ UI แสดงผลให้ชัด (หรือ reuse UI จาก `Checklist.tsx` แบบ componentized)
- ถ้าไม่ต้องการ: ลบการเรียก hook และ state ที่เกี่ยวข้อง เพื่อลด side effects

---

## 4) DRY violations (ของหน้าตามรูป) ที่เห็นชัด และควรทำให้ DRY/SRP ง่ายขึ้น

### 4.1 Integration checklist ถูกทำซ้ำอย่างน้อย 2 ที่ (Dashboard vs Checklist)
- `Dashboard.tsx`:
  - มี `REQUIRED_PLATFORMS` + `integrationMap` + `integrationSteps` + `completionPercent` + `handleToggle` + `handleConfigure`
- `Checklist.tsx`:
  - มี `REQUIRED_PLATFORMS` + `integrationMap` + `steps` + `completionPercent` + `handleToggle` + `handleConfigure` (+ `handleResetAll`)

**Inconsistency ที่พบ**
- Dashboard มี platform `googleanalytics` แต่ Checklist ไม่มี
- ขนาด icon (`h-8 w-8` vs `h-6 w-6`) และ styling แตกต่าง → maintenance ยาก

**Recommendation (DRY + SRP)**
- แยกเป็นโมดูลกลาง เช่น
  - `features/integrations/integrationPlatforms.ts` (รวม REQUIRED_PLATFORMS เดียว)
  - `features/integrations/hooks/useIntegrationChecklist.ts` (รวม logic load/map/percent/toggle)
  - `features/integrations/components/IntegrationChecklistWidget.tsx`
- แล้วให้
  - `/checklist` ใช้ widget แบบ onboarding variant
  - Dashboard Overview ใช้ widget แบบ compact variant

### 4.2 IntegrationManager ใช้ fetch + localStorage เอง (ไม่สอดคล้องกับ api layer)
- `IntegrationManager.tsx` ใช้ `fetch('/api/v1/...')` + `localStorage.getItem('token')`
- ขณะที่หน้าอื่นใช้ `services/api.ts` + hooks

**Recommendation**
- ถ้าจะมีหน้า integrations จริง ให้บังคับใช้ data boundary เดียวกัน (ตาม `Refactor_Roadmap.md` / `Report.md`) เพื่อไม่ให้ auth logic กระจาย

---

## 5) โค้ด “เสี่ยงเป็นขยะ/legacy” ของ Overview Dashboard UI

### 5.1 การ inject FontAwesome ผ่าน CDN ใน `Dashboard.tsx`
- มี `useEffect` สร้าง `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome...">`
- เหตุผลหลักเพื่อใช้ `<i className="fa-solid fa-chart-simple" ... />` (พบใน Financial Overview)

**Impact**
- เป็น side effect ระดับ document ที่อยู่ใน component ใหญ่
- เพิ่ม external dependency (CDN) และกระทบ CSP/security ในอนาคต
- เพิ่มความยากในการทำให้ UI เป็น design system เดียว (เพราะ icon source ปนกัน)

**Recommendation**
- เปลี่ยน `<i className=...>` เป็น icon จาก `lucide-react` ที่ใช้อยู่แล้ว แล้วลบ useEffect inject ทั้งก้อน

### 5.2 Download/export flow ยังเป็น “semi-generic” และมี duplication potential
- มี `downloadModal` + `downloadOptions` + `handleDownloadOption`
- บาง section เรียก `openDownloadModal('...')` แต่บางจุดเรียก download function ตรง (`handleConversionsPlatformDownload`) ทำให้ semantic ไม่一致

**Recommendation**
- สอดคล้องกับ roadmap WP-S2-02: แยก Download modal เป็น shared component/service และใช้ enum/union `DownloadSectionId`

---

## 6) สิ่งที่ "มีอยู่แล้ว" ใน `Refactor_Roadmap.md` / `Report.md` vs สิ่งที่ "เพิ่มเติม" จากการตรวจหน้านี้

### 6.1 เรื่องที่ roadmap/report ครอบคลุมอยู่แล้ว
- `Dashboard.tsx` เป็น God component → ต้องแตกเป็น sections (Sprint 2)
- DRY ของ card/table patterns ซ้ำ → ทำ UI primitives (Sprint 1)
- download modal/button semantics → ทำ shared flow (Sprint 2)
- session/localStorage กระจาย → ทำ centralized storage/session (Sprint 1)

### 6.2 เรื่องที่ “ยังไม่ถูกพูดแบบเฉพาะเจาะจง” และควรใส่ในงาน cleanup ของคุณ
- Route `/integrations` ไม่มี แต่มี navigation หลายจุด (functional dead path)
- มีไฟล์ `IntegrationManager.tsx` + `SimpleIntegrationManager.(js|jsx)` ไม่ถูกใช้งาน (candidate for deletion)
- ใน `Dashboard.tsx` มี state/import/hook results ที่เขียนไว้แต่ไม่ถูก render/ไม่ถูกใช้ (dead code)
- การ inject FontAwesome CDN ใน component (ควรถูกถอดออกเพื่อ clean & predictable)

---

## 7) Checklist แนะนำสำหรับการ Clean code (ปลอดภัยและทำเป็นลำดับ)

### 7.1 Quick wins (เสี่ยงต่ำ)
- ตัดไฟล์ที่ไม่ถูกใช้งาน (หลังยืนยันว่าไม่มี route/import):
  - `frontend/src/components/SimpleIntegrationManager.js`
  - `frontend/src/components/SimpleIntegrationManager.jsx`
  - `frontend/src/components/IntegrationManager.tsx` (ถ้าไม่ทำ `/integrations`)

- แก้ route mismatch:
  - เพิ่ม route `/integrations` หรือเปลี่ยน navigation ให้ไม่ชี้ไปเส้นทางที่ไม่มี

- ลบ dead state/import ใน `Dashboard.tsx`:
  - `api` import
  - `themeIndex/themePresets`
  - `headerSearch`
  - `customDateRange`
  - (พิจารณา) `useIntegrationNotifications` ใน Dashboard ถ้ายังไม่ render จริง

### 7.2 Medium (ต้องระวัง regression)
- ดึง Integration checklist logic ออกเป็น hook/component กลาง แล้ว reuse ใน Dashboard + Checklist
- ทำ error/notification UI ให้ตรงกับ state ที่มี (หรือถอด state ออก)

### 7.3 Sprint-aligned (ตรง roadmap)
- แตก `Dashboard.tsx` → `features/dashboard/sections/OverviewSection.tsx` และแยก subcomponents
- แยก `DownloadModal` เป็น shared

---

## 8) สรุปสถานะ (Answer ต่อคำถามของคุณ)

- มี “โค้ดก่อนหน้า/โค้ดที่ไม่ได้ใช้แล้ว” อยู่จริงใน scope หน้านี้ โดยเฉพาะ:
  - ไฟล์ `IntegrationManager.tsx` และ `SimpleIntegrationManager.(js|jsx)` ที่ไม่ถูกใช้งาน
  - navigation `/integrations` ที่ไม่มี route จริง
  - dead state/import/hook results ใน `Dashboard.tsx`
- `Refactor_Roadmap.md` และ `Report.md` ครอบคลุมแนวทางใหญ่ (SRP/DRY) แล้ว แต่ยังไม่ได้ระบุจุดขยะ/legacy เฉพาะเหล่านี้แบบ actionable เท่าการ audit รอบนี้
