# Roadmap: Big Refactor / Clean Code (Frontend) — Sprint 1–2

**Project:** dioasoon-main

**Scope:** Frontend เป็นหลัก (ตามที่ตกลง) โดยวางโครงให้ “รองรับ Backend ในอนาคต” และเพิ่มความยืดหยุ่น

**ข้อกำหนดสำคัญ:** แผนนี้เป็น Roadmap สำหรับการ refactor/clean code ครั้งใหญ่ (structural change) ที่ควบคุมความเสี่ยงด้วยการทำแบบ incremental ไม่ใช่แก้ทีเดียวทั้งหมด

**ไฟล์ประกอบที่เกี่ยวข้อง:**
- `Report.md` — วิเคราะห์ DRY/SRP และแผน refactor แบบ phased
- `เอกสารภาพรวม เนื้อหาการออกแบบฟังก์ชันของ Web Dashboard ทั้งหมด.md` — requirement baseline

---

## 1) เป้าหมายของ Big Refactor (What success looks like)

### 1.1 เป้าหมายเชิงเทคนิค
- ทำให้ Frontend มี **ขอบเขตชัดเจน** (feature boundary) และลดการพึ่งพาไฟล์ monolith
- ลด DRY violations:
  - ลดการคัดลอก UI patterns (card/header/table)
  - ลดการคัดลอก fetch/loading/error patterns
  - ลดการคัดลอก mapping/platform utilities
- แก้ SRP violations:
  - `Dashboard.tsx` ไม่เป็น God component
  - `DashboardShell.tsx` ไม่รวมหลายหน้าที่ (layout/theme/chat/fab)
  - `services/api.ts` ไม่เป็นไฟล์รวมทุกโดเมน
- เพิ่มความสามารถในการต่อยอด:
  - เปลี่ยนจาก mock → backend ได้ง่าย
  - รองรับ multi-tenant/role/branding ได้เป็นระบบ

### 1.2 เป้าหมายเชิงทีม/โปรเจ็ค
- ลดเวลาการเพิ่ม feature ใหม่
- ลด regression จากการแก้ UI/logic
- ทำให้ onboarding dev ใหม่เร็วขึ้น
- ทำให้การรีวิว PR ง่ายขึ้น (diff เล็กลง)

---

## 2) ผลกระทบหลัง Refactor (Project Impact)

### 2.1 ผลกระทบเชิงบวก (Expected Benefits)
- **Maintainability สูงขึ้น**
  - แก้ UI pattern 1 จุดกระทบทั้งระบบอย่างตั้งใจ (ผ่าน UI primitives)
- **Testability สูงขึ้น**
  - section-level components + hooks แยก ทำให้เขียน unit/integration test ได้จริง
- **Extensibility สูงขึ้น**
  - เพิ่ม section ใหม่ใน Dashboard ได้แบบ plug-in
  - ต่อ backend APIs ใหม่ได้โดยไม่แตะ UI มาก (ผ่าน adapters/view models)
- **Consistency สูงขึ้น**
  - Theme/dark mode/spacing/table behavior จะไปในทิศทางเดียวกัน

### 2.2 ผลกระทบเชิงลบ/ต้นทุน (Short-term Costs)
- **Merge conflict เพิ่มขึ้นชั่วคราว**
  - เพราะต้องย้ายไฟล์/แตกโมดูล
- **Velocity ตกชั่วคราว**
  - feature ใหม่จะช้าลงระหว่าง refactor (ถ้าไม่บริหาร scope)
- **QA/Regression testing เพิ่มขึ้น**
  - ต้องทดสอบเส้นทางผู้ใช้หลายหน้า

### 2.3 ความเสี่ยง (Risks) และแนวทางลดความเสี่ยง (Mitigations)
- **Risk: UI behavior เปลี่ยนโดยไม่ตั้งใจ**
  - Mitigation:
    - ทำทีละ slice และ freeze UI acceptance criteria ต่อ section
    - เพิ่ม visual checklist และ manual test script
- **Risk: Theme/CSS variables พัง**
  - Mitigation:
    - ห้ามเปลี่ยนชื่อ CSS variable ใน Sprint 1–2
    - ย้าย logic ไป hook แต่ set variable ชุดเดิม
- **Risk: Mock กับ Backend shape ไม่ตรง**
  - Mitigation:
    - ทำ adapter/view model เป็น contract กลาง
- **Risk: Auth/session แตก**
  - Mitigation:
    - รวม localStorage keys เข้า module เดียวก่อน แล้วค่อย migrate usage

---

## 3) หลักการทำงาน (Operating Model) สำหรับ Sprint 1–2

### 3.1 กฎสำคัญ
- **No big-bang merge**: ทุกการเปลี่ยนต้อง merge ได้ทุก 1–2 วัน
- **Refactor must be behavior-preserving** ใน Sprint 1–2
- **มี “Definition of Done” ชัดเจน** ต่อแต่ละ work package
- **แยกงาน refactor ออกจาก feature ใหม่**
  - ถ้าต้องทำคู่กัน ให้ทำ “strangler pattern”: ครอบของเดิมด้วยของใหม่ แล้วค่อยย้ายทีละส่วน

### 3.2 Artifacts ที่ต้องมี
- Roadmap นี้ (`Refactor_Roadmap.md`)
- Checklist QA ต่อหน้า (manual regression script)
- ADR (Architecture Decision Record) สั้น ๆ สำหรับ decision สำคัญ (optional แต่แนะนำ)

---

## 4) Roadmap Overview (Sprint 1–2)

### Sprint 1: Foundation / Architecture Readiness
**Theme:** จัดระเบียบพื้นฐาน ลด duplication แบบไม่แตะ behavior มาก

**ผลลัพธ์ที่ต้องได้:**
- UI primitives + shared utilities พร้อมใช้งาน
- Centralized session/storage
- API client modularization (เริ่มต้น)
- Mock strategy ชัดเจน

### Sprint 2: Modularization / Dashboard Decomposition
**Theme:** แตก Dashboard และ Shell ให้ SRP/DRY ดีขึ้น และเตรียมเสียบ backend

**ผลลัพธ์ที่ต้องได้:**
- `Dashboard.tsx` เหลือ composition
- Sections/Hooks/Adapters แยกชัด
- `DashboardShell.tsx` แยก theme hook + copilot component

---

## 5) Sprint 1 Roadmap (ละเอียด)

> สมมติ Sprint 1 มี 2 สัปดาห์ (ปรับตามความจริงของทีมได้)

### 5.1 WP-S1-01: Establish folder boundaries (Low risk)
**Objective:** วางโครงสร้างสำหรับ feature + shared โดยไม่รีไรท์ทั้งหมด

**Deliverables**
- สร้างโฟลเดอร์เป้าหมาย (ยังไม่ต้องย้ายทุกไฟล์ในทันที):
  - `src/features/` (เตรียมแยก dashboard, integrations, webhooks, sync-history)
  - `src/services/` (api, storage)
  - `src/constants/` (platform, roles)

**DoD**
- โฟลเดอร์ใหม่ถูก commit และ build ผ่าน

**Impact**
- ไม่มีผลต่อ runtime

---

### 5.2 WP-S1-02: Centralize session & storage
**Objective:** ลด DRY ของ localStorage usage และเตรียม RBAC/multi-tenant

**Scope**
- ทำ service กลาง:
  - `services/storage.ts`
  - `services/auth/session.ts`

**สิ่งที่ต้อง cover**
- keys สำคัญ: `token`, `tenantId`, `userRole`, checklist keys, avatar override

**DoD**
- มี API กลาง เช่น:
  - `getToken()`, `setToken()`, `clearSession()`
  - `getTenantId()`, `setTenantId()`
  - `getUserRole()`

**Risk**
- ถ้า migrate ไม่ครบจะเกิด mismatch

**Mitigation**
- migrate ทีละไฟล์ เริ่มจาก `services/api.ts` และ `App.tsx`

---

### 5.3 WP-S1-03: API client modularization (Start)
**Objective:** แยก `services/api.ts` เพื่อ SRP และรองรับ backend evolution

**Deliverables**
- `services/api/client.ts` (axios instance + interceptors)
- `services/api/auth.ts`
- `services/api/integrations.ts`
- (เลือก 1 เพิ่ม) `services/api/webhooks.ts` หรือ `services/api/metrics.ts`

**DoD**
- ไม่มีการเปลี่ยน API contract ที่ component เรียกใช้ (อาจ re-export ชั่วคราวได้)

**Impact**
- ลดความเสี่ยงจากไฟล์เดียวที่ใหญ่ขึ้นเรื่อย ๆ

---

### 5.4 WP-S1-04: UI primitives สำหรับ Card/Header/Table/States
**Objective:** ลด DRY ใน `Dashboard.tsx` และหน้ารอง

**Deliverables (ขั้นต่ำ)**
- `components/ui/SectionCard.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/State.tsx` (Loading/Empty/Error)
- `components/ui/DataTable.tsx` (wrapper แบบเบา)

**DoD**
- มีอย่างน้อย 1–2 จุดใน Dashboard ที่ migrate มาใช้ primitive เพื่อพิสูจน์ว่าใช้งานได้

**Impact**
- ทำให้ UX consistency ดีขึ้นโดยอัตโนมัติ

---

### 5.5 WP-S1-05: Platform meta constants
**Objective:** ลด duplication ของ platform mapping

**Deliverables**
- `constants/platform.ts`:
  - label, color class, icon mapping

**Target adoption**
- `WebhookEvents.tsx`
- `SyncHistory.tsx`

---

### 5.6 Sprint 1 QA / Verification
**Manual regression checklist (ขั้นต่ำ)**
- Login → Dashboard เข้าได้
- Logout → redirect ไป login
- เปิด Dashboard ทุก tab แล้วไม่ crash
- Webhooks/SyncHistory โหลด/กด action ได้ (เท่าที่ mock/API รองรับ)
- Theme mode (dark/light/canvas ถ้ามี) ยัง render ได้

---

## 6) Sprint 2 Roadmap (ละเอียด)

### 6.1 WP-S2-01: Decompose Dashboard into Sections
**Objective:** แก้ SRP ของ `Dashboard.tsx`

**Target structure (ตัวอย่าง)**
- `features/dashboard/DashboardPage.tsx` (composition)
- `features/dashboard/sections/OverviewSection.tsx`
- `features/dashboard/sections/CampaignSection.tsx`
- `features/dashboard/sections/SeoSection.tsx`
- `features/dashboard/sections/CommerceSection.tsx`
- `features/dashboard/sections/CrmSection.tsx`
- `features/dashboard/sections/TrendSection.tsx`
- `features/dashboard/sections/SettingsSection.tsx`
- `features/dashboard/sections/ReportsSection.tsx`

**Sequencing**
1) ย้าย section ที่ dependency น้อยก่อน (เช่น Reports/Trend)
2) ย้าย section ที่ใหญ่สุดทีหลัง (Campaign/SEO/Commerce)

**DoD**
- `Dashboard.tsx` เหลือ:
  - tab state
  - shell composition
  - route-level wiring

---

### 6.2 WP-S2-02: Extract shared download/export flow
**Objective:** ลด DRY ของ download modal/button semantics

**Deliverables**
- `features/download/DownloadModal.tsx` (หรือ shared component)
- `services/export/*` (placeholder สำหรับอนาคต: csv/pdf/xlsx)
- นิยาม `DownloadSectionId` เป็น enum/string union

**DoD**
- Dashboard ทุก section เรียก download ผ่าน interface เดียว

---

### 6.3 WP-S2-03: Consolidate filter UI + date-range logic
**Objective:** รองรับ requirement “Filters” และลด duplication

**Deliverables**
- `features/dashboard/components/DateRangeFilter.tsx`
- `features/dashboard/hooks/useDateRangeFilter.ts`

**DoD**
- Campaign/SEO/Global filter ใช้ logic เดียวกัน (หรือ share มากขึ้น)

---

### 6.4 WP-S2-04: Simplify DashboardShell responsibilities
**Objective:** แก้ SRP ของ `DashboardShell.tsx`

**Deliverables**
- `features/theme/useThemeTokens.ts`
- `features/copilot/CopilotFab.tsx`
- `components/shell/SidebarProfileCard.tsx`

**DoD**
- `DashboardShell` เหลือ layout + composition

---

### 6.5 WP-S2-05: Introduce view models & adapters (Backend-ready)
**Objective:** decouple UI from API response shapes

**Deliverables**
- `features/dashboard/adapters/*`
  - map mock/api responses → `*VM` objects
- `types/view-models/*`

**DoD**
- อย่างน้อย 1 section ใช้ adapter จริง (แนะนำ Campaign หรือ Overview)

---

### 6.6 Sprint 2 QA / Verification
**Manual regression checklist (เพิ่มจาก Sprint 1)**
- ทุก tab ของ Dashboard render เหมือนเดิม
- Download modal ใช้งานได้ทุก section
- Date-range filter ยังทำงาน และไม่ทำให้ UI พัง
- ไม่มี console errors สำคัญ

---

## 7) การจัดลำดับ PR/งาน (Suggested PR Slicing)

เพื่อให้ merge ง่ายและลด conflict:
- **PR-1:** เพิ่มโฟลเดอร์ใหม่ + storage/session modules (ยังไม่ migrate)
- **PR-2:** ย้าย `services/api.ts` → `services/api/client.ts` + re-export
- **PR-3:** เพิ่ม UI primitives + migrate 1–2 cards
- **PR-4:** platform constants + migrate webhooks/sync-history
- **PR-5..N:** แยก dashboard sections ทีละ section

---

## 8) สิ่งที่ควรทำเพิ่มเติม “หลัง Refactor” (เหมาะกับ Sprint 1–2)

> หมายถึงงานที่ควรวางไว้ใน backlog หรือทำแบบเบา ๆ ระหว่าง sprint เพื่อให้ refactor คุ้มค่า

### 8.1 Quality Gates (แนะนำเริ่มใน Sprint 1 และ finalize ใน Sprint 2)
- **Lint/Format มาตรฐาน**
  - ESLint rules ที่เน้น maintainability
  - Prettier (ถ้ามี) ให้ทำงานร่วมกับ Tailwind class sorting (optional)
- **Type safety**
  - ลด `any` ในจุด core (API responses, adapters)

### 8.2 Testing strategy (ไม่ต้องใหญ่ แต่ต้องเริ่ม)
- **Unit tests** สำหรับ adapters + utilities
- **Smoke tests** สำหรับ routing/auth guard
- (ถ้าทีมพร้อม) เพิ่ม Playwright/Cypress สำหรับ critical flows

### 8.3 CI/CD (ถ้ามี pipeline)
- ขั้นต่ำ:
  - `lint` + `typecheck` + `build`
- เพิ่ม:
  - test step
  - artifact preview (optional)

### 8.4 Performance / UX readiness
- ตรวจสอบ bundle size และ lazy-load sections ที่หนัก (หลังแยก section ทำได้ง่าย)
- เพิ่ม skeleton loading และ empty states ให้ consistent

### 8.5 Documentation (เพื่อยืดหยุ่นในอนาคต)
- ADR สั้น ๆ 3–5 เรื่อง:
  - โครงสร้าง features
  - data flow (hooks/adapters)
  - theme tokens
  - export/download strategy

---

## 9) Metrics ที่แนะนำให้ใช้วัดความสำเร็จ

### Before/After
- จำนวนไฟล์ที่ต้องแก้เมื่อปรับ UI guideline 1 จุด (ควรลดลง)
- เวลาเฉลี่ยในการเพิ่ม section ใหม่
- ขนาด `Dashboard.tsx` (ควรลดลงอย่างชัดเจน)
- จำนวน duplication patterns ที่ลดยุบได้ (card/table/fetch)

---

## 10) สรุป

Roadmap นี้ตั้งใจให้คุณทำ **Clean Code ครั้งใหญ่** แบบควบคุมความเสี่ยง โดยใช้ Sprint 1 ทำ “Foundation” และ Sprint 2 ทำ “Modularization” เพื่อให้:
- รองรับ backend ในอนาคตได้ง่ายขึ้น
- ลด DRY/SRP violations ในจุดที่เป็นคอขวดของโปรเจ็ค
- ลดต้นทุนการดูแลระยะยาว

