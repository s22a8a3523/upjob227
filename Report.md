# Frontend Refactor Report (DRY / SRP) — Sprint 1–2 Focus

**Project:** dioasoon-main (Frontend only)

**Scope:** วิเคราะห์ DRY / SRP และแนวทาง refactor แบบ *ไม่แก้โค้ด* โดยอิงจากเอกสารบริษัท `เอกสารภาพรวม เนื้อหาการออกแบบฟังก์ชันของ Web Dashboard ทั้งหมด.md` และสถานะโค้ด Frontend ปัจจุบัน

**เวลาที่โฟกัส:** Sprint 1 และ Sprint 2 (เพื่อจัดระเบียบ Frontend ให้รองรับ Backend ในอนาคต + เพิ่มความยืดหยุ่น)

---

## 0) TL;DR (ผู้บริหารอ่าน 3 นาที)

### สิ่งที่เอกสารบริษัทต้องการ (requirements)
จากเอกสารบริษัท เน้นระบบ Dashboard ที่มี:
- Login/Authentication + Multi-tenant
- Overview metrics + near real-time
- Detailed View / Campaign / SEO / e-Commerce / CRM
- Filters (date/platform/campaign/segment)
- Export/Download
- Alerts/Notification
- Settings (refresh, KPI thresholds, RBAC, branding/theme)
- Real-time (WebSocket/SSE/polling)

### สิ่งที่ Frontend ปัจจุบัน “ทำแล้ว/กำลังเป็น mock”
- มี routing + auth gate แบบง่าย (`frontend/src/App.tsx` เช็ค `localStorage`)
- มี Dashboard UI ขนาดใหญ่ที่รวมหลายแท็บ (Overview/Campaign/SEO/Commerce/CRM/Trend/Settings/Reports)
- มี Download modal shared ภายใน Dashboard
- Theme tokens ถูก apply ผ่าน CSS variables ใน `DashboardShell.tsx` + CSS rules ใน `index.css`
- มี API client รวมทุกโดเมนในไฟล์เดียว (`frontend/src/services/api.ts`)
- Hooks บางส่วนยังใช้ mock (`useApi.ts`, `useCurrentUser.ts`, `mockDashboard.ts`)

### Pain points หลัก (DRY/SRP)
- **SRP:** `frontend/src/components/Dashboard.tsx` เป็น *God component* (≈ 220KB) รวม UI + state + business formatting + mock orchestration + modal + tabs
- **SRP:** `frontend/src/components/dashboard/DashboardShell.tsx` ทำทั้ง layout + theme side-effects + mini-chat + draggable FAB
- **DRY:** card/table patterns ซ้ำจำนวนมากใน `Dashboard.tsx` (คลาส/โครงสร้าง card ซ้ำหลายสิบจุด)
- **DRY:** API param building + localStorage/auth concerns กระจาย (`App.tsx`, `services/api.ts`, components)
- **DRY:** loading/error/fetch pattern ซ้ำในหลายหน้ารอง (Webhook/SyncHistory/Checklist/auth forms)

### เป้าหมาย Sprint 1–2 (แนะนำ)
- **Sprint 1 (Foundation):** ทำ *frontend architecture readiness* — แยก folder ตาม feature, สร้าง UI primitives, data layer boundary, mocking strategy, routing/auth guard ที่เป็นระบบ
- **Sprint 2 (Refactor by slicing):** แยก Dashboard ออกเป็น sections + hooks + data adapters โดยไม่เปลี่ยน UI behavior

---

## 1) Inputs ที่ใช้อ้างอิง

### 1.1 เอกสารบริษัท (requirements baseline)
ไฟล์: `เอกสารภาพรวม เนื้อหาการออกแบบฟังก์ชันของ Web Dashboard ทั้งหมด.md`

สาระสำคัญที่กระทบ Frontend architecture:
- UI ต้องรองรับ **multi-tenant** และ **role-based access**
- Dashboard ต้องมี modules หลัก: Overview, Detailed view, Filters, Export/Download, Alerts, Settings, Trend
- ต้องมีแนวคิด **API-first** และแยก UI layer ออกจาก backend/data layer
- Theme/branding ตามลูกค้า (customization)
- Real-time updates (WebSocket/SSE/polling)

> หมายเหตุ: เอกสารนี้ไม่ได้ระบุ Sprint 1/2 แบบ explicit ดังนั้นรายงานนี้จะ “map Sprint” จาก requirement + สถานะโค้ดจริงใน repo เพื่อให้ actionable ใน Sprint 1–2

### 1.2 สถานะโค้ด (evidence)
- Routing/Auth gate: `frontend/src/App.tsx`
- Dashboard UI หลัก: `frontend/src/components/Dashboard.tsx`
- Shell/layout/theme side-effects: `frontend/src/components/dashboard/DashboardShell.tsx`
- API client: `frontend/src/services/api.ts`
- Mock + hooks: `frontend/src/data/mockDashboard.ts`, `frontend/src/hooks/useApi.ts`, `frontend/src/hooks/useCurrentUser.ts`
- Table components อื่น: `frontend/src/components/Tables.tsx`
- Pages อื่น: `WebhookEvents.tsx`, `SyncHistory.tsx`, `IntegrationManager.tsx`, `Checklist.tsx` ฯลฯ
- CSS variables + global wrapping rules: `frontend/src/index.css`

---

## 2) Sprint Interpretation (Sprint 1–2 Frontend Roadmap)

เพื่อให้สอดคล้องกับเอกสารบริษัท และรองรับ Backend ในอนาคต ผมเสนอการตีความ Sprint ดังนี้:

### Sprint 1 = “Frontend Foundation / Architecture Readiness”
**Outcome:** สร้างขอบเขต/มาตรฐานให้ frontend เปลี่ยนจาก mock → backend ได้โดยไม่ rewrite UI

Deliverables (ไม่จำเป็นต้องเปลี่ยน UI หน้าตา):
- โครงสร้าง folder ตาม feature + shared layer
- UI primitives ที่ reusable (Card, SectionHeader, DataTable wrapper, Empty/Loading/Error states)
- Data boundary ชัดเจน: `api client` / `query hooks` / `adapters`
- Auth boundary ชัดเจน: token/tenant/role access interface
- Mock strategy ชัดเจน (toggle ได้, ไม่ผูกกับ component)

### Sprint 2 = “Dashboard Modularization + Replace Duplication”
**Outcome:** ย้าย logic ออกจาก `Dashboard.tsx` เป็น sections/modules เพื่อ SRP/DRY และเตรียมเสียบ backend

Deliverables:
- `Dashboard.tsx` เหลือเป็น composition + routing state ของ tabs
- แยก section components: Overview/Campaign/SEO/Commerce/CRM/Trend/Settings/Reports
- แยก hooks ต่อ section (fetch + transform + state)
- download/export logic ทำเป็น shared utility/service

---

## 3) Current Frontend Architecture Map (as-is)

### 3.1 Entry & Routing
ไฟล์: `frontend/src/App.tsx`
- ใช้ `react-router-dom`
- auth gate แบบง่าย: `token` + `tenantId` ใน `localStorage` → `isAuthenticated`
- protected routes: `/dashboard`, `/profile`, `/webhooks`, `/history`, `/product-performance-details`, `/checklist`

**Observations (SRP/DRY):**
- Auth logic กระจาย: App เช็ค `localStorage`, api layer ก็เช็ค `localStorage` ใส่ header, บาง component ก็ใช้ `localStorage` อีก
- Route-level guard ทำแบบ inline ซ้ำ pattern หลาย route

### 3.2 Dashboard & Shell
ไฟล์: `frontend/src/components/Dashboard.tsx`
- เป็นหน้าหลักที่รวม features หลายโดเมน + mock dataset
- มี section tabs: `overview`, `campaign`, `seo`, `commerce`, `crm`, `trend`, `settings`, `reports`
- มี download modal และ “download buttons” หลายจุด

ไฟล์: `frontend/src/components/dashboard/DashboardShell.tsx`
- ทำ layout (sidebar + sticky header + main)
- apply theme tokens ลง CSS variables (side effect)
- mini chat + draggable FAB

### 3.3 Data & API layer
ไฟล์: `frontend/src/services/api.ts`
- axios instance + request interceptor (token + tenant)
- export functions ครอบคลุม: auth, integrations, oauth, data fetch หลาย platform, webhooks, sync history, campaigns, metrics

ไฟล์: `frontend/src/hooks/useApi.ts`, `frontend/src/hooks/useCurrentUser.ts`
- ใช้ mock data เป็นหลัก

ไฟล์: `frontend/src/data/mockDashboard.ts`
- รวม mock dataset ขนาดใหญ่ ครอบคลุมหลายโดเมน (user/overview/commerce/campaign/seo/crm/trend/settings ฯลฯ)

---

## 4) DRY Analysis (Duplication) — Frontend

### DRY-1: Card wrapper/class patterns ซ้ำหนักใน `Dashboard.tsx`
**Evidence:**
- รูปแบบ `rounded-3xl border border-gray-100 bg-white p-...` พบซ้ำจำนวนมากใน `Dashboard.tsx` (grep match count สูง)
- รูปแบบปุ่ม download: `inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white ...` ซ้ำหลายตำแหน่ง

**Impact:**
- เปลี่ยน UI guideline (padding, radius, border, dark theme) ต้องแก้หลายจุด
- ยากต่อ maintain consistency

**Refactor direction (Sprint 1):**
- สร้าง component กลาง เช่น:
  - `SectionCard` (wrapper)
  - `SectionHeader` (title/subtitle/actions/badge)
  - `DownloadAction` (button style + semantics)

> เป้าหมายไม่ใช่ “ทำให้ทุกอย่าง generic” แต่ให้ “ส่วนซ้ำที่เป็น design system” อยู่จุดเดียว

### DRY-2: Table styling + row hover patterns ซ้ำ
**Evidence:**
- ตารางหลายจุดใช้ `divide-y` + row hover เป็นสีส้ม (`hover:bg-orange-500 ... group-hover:text-white`) pattern คล้ายกันหลายตาราง
- มี file `frontend/src/components/Tables.tsx` ที่มี table primitives แบบ light-theme แต่ `Dashboard.tsx` มี tables ของตัวเองอีกชุด

**Impact:**
- มี table “2 สไตล์” อยู่คนละที่
- ยากต่อทำ dark theme consistency / responsive rules

**Refactor direction (Sprint 1–2):**
- สร้าง `DataTable` wrapper ที่รับ:
  - `columns` (header/align)
  - `rowKey` + `rows`
  - `variant` (light/dark/brand)
  - optional: `minWidth`, `stickyHeader`

### DRY-3: Fetch/loading/error patterns ซ้ำในหลายหน้า
**Evidence:**
- `WebhookEvents.tsx` และ `SyncHistory.tsx` มี pattern:
  - `loading/error state`
  - `load...` async + try/catch
  - `setLoading(true)` + `setError(null)`
  - `useEffect(() => load..., [filters])`
- auth forms ก็มี loading/error pattern ที่คล้ายกัน

**Impact:**
- เปลี่ยน error message/alert UX ต้องแก้หลายจุด
- มาตรฐาน error handling ไม่สม่ำเสมอ

**Refactor direction (Sprint 1):**
- สร้าง `useAsyncData` หรือ `useQueryState` (ไม่จำเป็นต้องใช้ react-query ทันที)
- สร้าง UI primitives: `<LoadingState/>`, `<EmptyState/>`, `<ErrorState/>`

### DRY-4: Platform mapping logic ซ้ำ (colors/icons/labels)
**Evidence:**
- `WebhookEvents.tsx` มี `getPlatformColor()`
- `SyncHistory.tsx` มี logic คล้ายกัน (จาก grep พบ)

**Impact:**
- เพิ่ม platform ใหม่ต้องแก้หลายไฟล์

**Refactor direction (Sprint 1):**
- ทำ `frontend/src/constants/platform.ts`:
  - `platformMeta = { facebook: {label, colorClass, icon}, ... }`

### DRY-5: localStorage keys กระจายหลายไฟล์
**Evidence:**
- `App.tsx` ใช้ `token`, `tenantId`
- `services/api.ts` ใช้ `token`, `tenantId` + keys อื่น (`userRole`, checklist keys)
- `DashboardShell.tsx` เก็บ avatar override

**Impact:**
- เปลี่ยน naming/behavior ยาก
- เพิ่ม security constraints (เช่น rotate token) เสี่ยง regression

**Refactor direction (Sprint 1):**
- สร้าง `frontend/src/services/storage.ts`:
  - typed getters/setters
  - centralize key names
- สร้าง `frontend/src/services/auth/session.ts`:
  - `getSession()` / `setSession()` / `clearSession()`

---

## 5) SRP Analysis (Single Responsibility) — Frontend

### SRP-1: `Dashboard.tsx` เป็น God Component
**Evidence:**
- ขนาดไฟล์ ≈ 220KB
- ทำหลาย responsibility ในไฟล์เดียว:
  - navigation state ของ tabs
  - theme panel class selection
  - filter UI state (calendar/filter dropdown)
  - modal (download)
  - data mapping/transforms
  - rendering components จำนวนมาก (charts/tables/cards)

**Impact:**
- เพิ่ม feature ใหม่ = เพิ่มความซับซ้อนแบบทวีคูณ
- ทดสอบยาก (unit/integration)
- refactor/bugfix risk สูง

**Refactor direction (Sprint 2):**
- ทำ `features/dashboard/` แล้วแยกเป็น:
  - `DashboardPage.tsx` (composition only)
  - `sections/*` (UI components)
  - `hooks/*` (data + state)
  - `adapters/*` (mapping backend → view models)

### SRP-2: `DashboardShell.tsx` ทำมากกว่า layout
**Evidence:**
- responsibilities:
  - apply theme tokens to CSS variables (side effect)
  - mini chat state + rendering
  - draggable FAB
  - profile avatar upload + persistence
  - layout & menu

**Impact:**
- เปลี่ยน theme logic อาจกระทบ chat/fab
- reuse shell ใน page อื่นยาก

**Refactor direction (Sprint 2):**
- แยกเป็น:
  - `useThemeTokens(theme)` hook
  - `<CopilotFab/>` component
  - `<ProfileCard/>` sidebar block
  - `<NavigationMenu/>` component

### SRP-3: `services/api.ts` รวมทุกโดเมน
**Evidence:**
- ไฟล์เดียวรวม auth + integrations + oauth + data platform + webhooks + sync history + campaigns + metrics

**Impact:**
- dependency graph ไม่ชัด
- ยากต่อ mock/test

**Refactor direction (Sprint 1–2):**
- แยก module:
  - `services/api/client.ts` (axios instance + interceptors)
  - `services/api/auth.ts`
  - `services/api/integrations.ts`
  - `services/api/webhooks.ts`
  - `services/api/metrics.ts`
  - `services/api/campaigns.ts`

### SRP-4: `mockDashboard.ts` เป็น monolith
**Evidence:**
- ไฟล์ ≈ 1000 บรรทัด + ครอบคลุมหลายโดเมน

**Impact:**
- merge conflict ง่าย
- ทำให้ mock & UI coupling แน่น

**Refactor direction (Sprint 1):**
- แตกตามโดเมน:
  - `data/mock/user.ts`
  - `data/mock/overview.ts`
  - `data/mock/campaign.ts`
  - `data/mock/seo.ts`
  - `data/mock/commerce.ts`
  - `data/mock/crm.ts`

---

## 6) Target Frontend Architecture (รองรับ Backend ในอนาคต)

### 6.1 หลักการออกแบบ (เหมาะกับ requirement ในเอกสารบริษัท)
- **UI layer ไม่รู้จัก backend shape ตรง ๆ** → ผ่าน adapter/view model
- **ทุก feature มี boundary**: components + hooks + api calls ของตัวเอง
- **Cross-cutting concerns** (auth/theme/notifications/export) อยู่ shared services
- **Mock เป็น “data provider”** ไม่ใช่ import ตรงใน component

### 6.2 โครงสร้างโฟลเดอร์ (เสนอสำหรับ Sprint 1)
ตัวอย่าง structure (ไม่บังคับชื่อ แต่ควรมี intent แบบนี้):

- `src/app/`
  - `routes.tsx` (route config)
  - `auth/` (guards, session)
- `src/features/`
  - `dashboard/`
    - `DashboardPage.tsx`
    - `sections/` (OverviewSection, CampaignSection, ...)
    - `hooks/` (useDashboardFilters, useCampaignInsights, ...)
    - `adapters/` (map API → view model)
  - `integrations/`
  - `webhooks/`
  - `sync-history/`
- `src/components/ui/` (primitives)
- `src/services/`
  - `api/` (client + domain modules)
  - `storage.ts`
- `src/constants/` (platform meta, roles)
- `src/types/` (API types + view models)

### 6.3 Data flow ที่แนะนำ
- Component เรียก Hook
- Hook เรียก API module
- API module คืน raw data
- Adapter แปลง raw → view model
- Component render view model

---

## 7) Sprint 1 Plan (Foundation) — Frontend-only

### Goal
สร้าง “พื้นฐานที่รองรับ backend ในอนาคต” โดยไม่แตะ business behavior มาก

### 7.1 งานหลัก (DRY)
- **UI primitives & design system**
  - `SectionHeader`, `SectionCard`, `DownloadButton`, `KpiChip`, `Badge` variants
  - Unified Table wrapper (`DataTable`) และ state components (`Loading/Empty/Error`)

- **Centralize constants**
  - `platformMeta` (label/color/icon)
  - role definitions (RBAC readiness)

### 7.2 งานหลัก (SRP)
- **Split API layer modules** (ยังไม่ต้องเปลี่ยน call sites ทั้งหมดใน Sprint 1 ก็ได้)
  - เริ่มจากสร้าง `api/client` และค่อย migrate functions แบบ incremental

- **Centralize session/storage**
  - wrapper `storage.ts`
  - `session.ts` ให้ App, api interceptor, components ใช้ร่วมกัน

- **Mock strategy**
  - สร้าง interface provider เช่น `DashboardDataProvider` ที่เลือก `mock` หรือ `api` ได้จาก env/flag

### 7.3 Verification checklist (Sprint 1)
- App routing ใช้งานได้เหมือนเดิม (login/logout/redirect)
- Dashboard render ทุก tab ได้เหมือนเดิม
- API calls (ถ้ามี) ยังส่ง header token/tenant ได้ถูก
- Dark theme tokens ยัง apply ได้

---

## 8) Sprint 2 Plan (Dashboard Modularization) — Frontend-only

### Goal
ทำให้ Dashboard maintainable และ “เสียบ backend ได้ง่าย” โดยไม่ rewrite UI

### 8.1 Work packages
- **WP1: Split `Dashboard.tsx` by sections**
  - `OverviewSection` / `CampaignSection` / `SeoSection` / `CommerceSection` / `CrmSection` / `TrendSection` / `SettingsSection` / `ReportsSection`
  - ย้าย state เฉพาะ section เข้า hook

- **WP2: Extract shared patterns**
  - download modal / download options เป็น service + shared component
  - filter UI (date range) เป็น shared component/hook

- **WP3: Simplify `DashboardShell.tsx`**
  - แยก theme side-effect เป็น hook
  - แยก Copilot/FAB เป็น component

- **WP4: Introduce view models & adapters**
  - เช่น `CampaignAdPerformanceRowVM`, `KpiCardVM` ฯลฯ
  - ทำ mapping อยู่ใน `adapters/` เพื่อ decouple API responses

### 8.2 Verification checklist (Sprint 2)
- UI/UX เท่าเดิม (หรือดีขึ้น) ทุก tab
- Download ยังทำงานครบทุก section
- Theme switching ยังถูกต้อง
- ไม่มี regression ใน WebhookEvents/SyncHistory/IntegrationManager

---

## 9) Risks & Mitigations

### Risk-1: เปลี่ยนโครงสร้างไฟล์ทำให้ import พัง
- **Mitigation:** migrate แบบ slice-by-slice, ทำ index exports เฉพาะจุด

### Risk-2: Theme tokens ผูกกับ CSS variables หลายชื่อ
- **Mitigation:** ทำ `useThemeTokens` ที่ set variables ทั้งชุดเดิมก่อน แล้วค่อยปรับชื่อทีหลัง

### Risk-3: Mock ↔ API switching ทำให้ข้อมูล shape ไม่เหมือนกัน
- **Mitigation:** ใช้ adapter/view model บังคับ shape เดียวที่ component consume

### Risk-4: Auth/session keys กระจาย
- **Mitigation:** centralize ใน `storage/session` และค่อย migrate

---

## 10) Concrete Refactor Targets (Prioritized)

### P0 (คุ้มสุดใน Sprint 1)
- `services/storage.ts` + `services/auth/session.ts`
- `constants/platform.ts`
- UI primitives: `SectionHeader`, `SectionCard`, `DownloadButton`, `Loading/Empty/Error`

### P1 (Sprint 2)
- Split `Dashboard.tsx` เป็น sections + hooks
- Split `DashboardShell.tsx` responsibilities

### P2 (หลัง Sprint 2 / เตรียม Sprint 3)
- Introduce data fetching library (เช่น react-query) ถ้าต้องการ caching/retries
- Real-time infrastructure (SSE/WebSocket) สำหรับ metrics
- RBAC enforcement ใน route/menu layer

---

## 11) Appendix: File References (Frontend)

- `frontend/src/App.tsx` — auth gate, routes
- `frontend/src/components/Dashboard.tsx` — dashboard monolith, duplication hotspot
- `frontend/src/components/dashboard/DashboardShell.tsx` — shell + theme side effects + copilot
- `frontend/src/services/api.ts` — monolithic api client
- `frontend/src/hooks/useApi.ts` — mock-based metrics/campaigns hooks
- `frontend/src/hooks/useCurrentUser.ts` — mock user
- `frontend/src/data/mockDashboard.ts` — monolithic mock dataset
- `frontend/src/components/WebhookEvents.tsx` — fetch/error patterns + platform color mapping
- `frontend/src/components/SyncHistory.tsx` — similar patterns
- `frontend/src/index.css` — global `overflow-wrap/word-break`, theme variables

---

## 12) Suggested Definition of Done (Sprint 1–2)

### Sprint 1 DoD
- มี shared primitives สำหรับ card/header/table/states
- มี `session/storage` module กลาง
- มี `platformMeta` กลาง
- API client แยกอย่างน้อยเป็น `client` + 1–2 domain modules (เริ่มต้น)
- Mock provider มีแนวทางที่ชัด

### Sprint 2 DoD
- `Dashboard.tsx` ลดบทบาทเหลือ composition
- Dashboard sections แยกไฟล์ + hooks
- `DashboardShell` แยก theme hook และ copilot component
- Regression checklist ผ่าน

