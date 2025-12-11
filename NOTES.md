# NOTES - Project Development Notes

Ghi chép các assumptions, gaps, và suggestions trong quá trình phát triển.  
**Last Updated**: 2025-12-11 (Session 7 - Google OAuth + Cleanup + Ready for Vercel)

---

## 🚀 QUICK START - READY FOR DEPLOYMENT

**App đang chạy local** → `http://localhost:3000` ✅

**Next: Deploy Vercel** (30 phút):
1. Push code to GitHub
2. Import to Vercel → Add env vars → Redeploy
3. Update Google OAuth URLs (Google Console + Supabase)
4. Test production

**Chi tiết**: `CURRENT_STATUS.md` hoặc `SETUP_GUIDE.md`

---

## 🎯 CURRENT STATUS - ✅ LOCAL COMPLETE & READY FOR VERCEL

### ✅ COMPLETED FEATURES (100% Working)

#### Authentication
- **Google OAuth Only** - Email/password removed completely
- **Email Whitelist** - Auto-check in callback, deny if not whitelisted
- **Auto Profile Creation** - From Google metadata (name, email)

#### Core Pages Implemented:
1. **Login** (`/login`) - Google OAuth button only
2. **Dashboard** (`/dashboard`) - Stats widgets + Recent requests
3. **Requests List** (`/requests`) - Filtering, Pagination, Role-based view
4. **Create Request** (`/requests/create`) - Form with validation
5. **Request Detail** (`/requests/[id]`) - Full detail with actions/comments
6. **Edit Request** (`/requests/[id]/edit`) - Edit DRAFT requests
7. **Admin Users** (`/admin/users`) - User management (Admin only)
8. **Admin Categories** (`/admin/categories`) - Category CRUD
9. **Profile** (`/profile`) - View/Edit own profile
10. **Reports** (`/reports`) - Statistics dashboard

#### Components Created:
1. `src/components/requests/request-filters.tsx` - Dropdown filters
2. `src/components/requests/request-form.tsx` - Unified form for Create/Edit
3. `src/components/requests/request-actions.tsx` - Action buttons with dialogs
4. `src/components/requests/request-comments.tsx` - Comments section
5. `src/components/admin/user-management.tsx` - User CRUD with roles ✨ NEW
6. `src/components/admin/category-management.tsx` - Category tree CRUD ✨ NEW
7. `src/components/profile/profile-form.tsx` - Profile view/edit ✨ NEW

#### Server Actions:
- `src/actions/requests.ts` (580+ lines) - Full Request CRUD
- `src/actions/admin.ts` (340+ lines) - User/Category management ✨ UPDATED
  - createUser, updateUser, toggleUserStatus
  - upsertCategory, deleteCategory
  - updateProfile

#### Documentation:
- ✅ SETUP_GUIDE.md - 45-minute comprehensive guide
- ✅ OAUTH_ONLY_SETUP.md - Google OAuth documentation
- ✅ WHITELIST_SETUP.md - User whitelist management
- ✅ CURRENT_STATUS.md - Status for new chat sessions
- ✅ CLEANUP_SUMMARY.md - File cleanup summary
- ✅ DOCUMENTATION_INDEX.md - Master index

#### Database & RLS:
- ✅ Users RLS policies applied
- ✅ Whitelist-based access control
- ✅ Build successful (no TypeScript errors)

---

## 🔴 NEXT STEPS - VERCEL DEPLOYMENT

### Priority 1 - Deploy to Production:
1. **Push to GitHub** - Commit all changes
2. **Vercel Import** - Connect GitHub repo
3. **Environment Variables** - Add Supabase keys
4. **OAuth URLs** - Update Google Console + Supabase
5. **User Migration** - Replace test users with real users

### Priority 2 - Nice to Have (Future):
- Email notifications (Resend integration)
- PDF export (Google Docs API)
- File attachments upload
- Real-time updates (Supabase Realtime)
- Admin panel for user management (instead of SQL)

---

## 📚 KEY FILES TO READ IN NEXT CHAT

```
NOTES.md                    ← YOU ARE HERE
TEST_CREDENTIALS.md         ← Test accounts for manual testing
src/lib/permissions.ts      ← Permission logic & state machine
src/actions/requests.ts     ← Request Server Actions
src/actions/admin.ts        ← Admin Server Actions (NEW)
```

---

## 📅 Development Log (Previous Sessions)

### 2025-12-11 - Session 7: Google OAuth + File Cleanup + Deployment Prep

#### Google OAuth Exclusive Implementation
- **Updated** `src/app/(auth)/login/page.tsx`
  - Removed email/password form completely
  - Only "Đăng nhập với Google" button remains
  
- **Updated** `src/app/auth/callback/route.ts`
  - Added whitelist check against `users.email`
  - Verify `is_active = true` before allowing access
  - Auto-create/update profile from Google metadata
  - Redirect to `/login?error=not_whitelisted` if denied
  
- **Updated** `src/app/page.tsx`
  - Simple redirect: authenticated → `/dashboard`, else → `/login`

#### File Cleanup
Deleted obsolete email/password authentication files:
- `TEST_CREDENTIALS.md` - Email/password test credentials
- `TEST_CHECKLIST.md` - Email auth test cases
- `scripts/seed-auth-users.sql` - Auth user seeding script
- `supabase/migrations/0002_fix_current_user.sql` - Old migration fix
- `supabase/fix_all_rls.sql`, `temp_fix_rls.sql` - Temporary RLS fixes
- `supabase/fix_security_warnings.sql`, `fix_users_rls.sql` - Security fixes

#### Database Updates
- **Updated** `supabase/seed_complete.sql`
  - Removed STEP 1-2 (auth.users creation)
  - Now only seeds `public.users` whitelist + test data
  - Users authenticate via Google OAuth, not seeded auth.users
  
- **Created** `supabase/enable_rls_authenticated.sql`
  - Simple RLS: `auth.role() = 'authenticated'`
  - All tables accessible to any authenticated user

#### Documentation Created (9 New Files)
1. **SETUP_GUIDE.md** (45 min) - Comprehensive setup from scratch
2. **ADMIN_QUICK_START.md** (30 min) - Quick start for admins
3. **QUICK_START.md** (updated) - 4-step OAuth-only guide
4. **WHITELIST_SETUP.md** - User whitelist management SQL
5. **OAUTH_ONLY_SETUP.md** - Detailed Google OAuth docs
6. **RLS_FIX_QUICK.md** - RLS troubleshooting reference
7. **DOCUMENTATION_INDEX.md** - Master doc index with diagrams
8. **CLEANUP_SUMMARY.md** - Summary of file cleanup
9. **CURRENT_STATUS.md** - Status for new chat sessions

#### Local Testing
- ✅ App running on `http://localhost:3000`
- ✅ Google OAuth button functional
- ✅ Whitelist check working in callback
- ✅ Server: Next.js 16.0.8 with Turbopack

**✅ Google OAuth + Cleanup: COMPLETE & TESTED**

---

### 2025-12-11 - Session 6: Whitelist & Deployment Guides

*(Session focused on documentation - merged into Session 7)*

---

### 2025-12-11 - Session 5: Admin & Reports Implementation

#### Admin Users Page
- Created `src/app/(dashboard)/admin/users/page.tsx`
  - List all users with roles and units
  - Only Admin can access
- Created `src/components/admin/user-management.tsx`
  - Search/filter users
  - Create new user with email, name, phone, unit, roles
  - Edit existing user (update name, phone, unit, roles)
  - Toggle user active/inactive status
  - Role badges with color coding

#### Admin Categories Page
- Created `src/app/(dashboard)/admin/categories/page.tsx`
  - Admin/Manager can access
- Created `src/components/admin/category-management.tsx`
  - Tree view display (parent/child hierarchy)
  - Create/Edit category with name, code, description, parent, unit
  - Delete category (with validation)
  - Toggle active status

#### Profile Page
- Created `src/app/(dashboard)/profile/page.tsx`
  - All authenticated users can access
- Created `src/components/profile/profile-form.tsx`
  - Display user info (email, name, phone, unit, roles, created date)
  - Edit mode for name and phone
  - Readonly fields: email, unit, roles

#### Reports Page
- Created `src/app/(dashboard)/reports/page.tsx`
  - Admin/Manager can access
  - Statistics: Total, Pending, Done, This Month
  - Breakdown by Status (bar chart style)
  - Breakdown by Priority
  - Quick stats overview
  - Role-based data filtering (Admin sees all, Manager sees unit)

#### Server Actions Updated
- Updated `src/actions/admin.ts` with full implementations:
  - createUser, updateUser, toggleUserStatus
  - upsertCategory, deleteCategory
  - updateProfile

**✅ Admin & Reports: IMPLEMENTED & BUILD SUCCESSFUL**

---

### 2025-12-11 - Session 4: Edit Request Feature

#### Dashboard Implementation
- Created `src/app/(dashboard)/dashboard/page.tsx`
- Stats widgets: Total/Pending/Processing/Completed requests
- Recent requests table with role-based filtering
- Permission-based "Create Request" button

#### Requests List Implementation
- Created `src/app/(dashboard)/requests/page.tsx`
- Server-side filtering by status/priority/category/creator
- Pagination (10 items per page)
- Role-based queries (users see own requests, staff see assigned/unassigned)
- Created `src/components/requests/request-filters.tsx` for dropdown filters

#### Create Request Implementation
- Created `src/components/requests/create-request-form.tsx`
- react-hook-form + zod validation
- Dynamic item array (useFieldArray)
- Save as DRAFT or Submit directly
- Validation: reason 10-1000 chars, at least 1 item, quantity > 0

#### Request Detail Implementation
- Created `src/app/(dashboard)/requests/[id]/page.tsx`
- Full request data with items/comments/logs
- Permission-based action buttons
- Activity timeline with status changes
- Created `src/components/requests/request-actions.tsx` for status management
- Created `src/components/requests/request-comments.tsx` for comments

#### Server Actions Implementation
- Created `src/actions/requests.ts` (580+ lines)
- Full CRUD with permission checks
- Functions: createRequest, updateRequest, submitRequest, assignRequest, updateRequestStatus, cancelRequest, addComment, getStaffList
- Proper error handling + revalidatePath

#### Bug Fixes
- Fixed users RLS policy (permission denied error)
- Created `supabase/fix_users_rls.sql` and applied
- Fixed Supabase FK relations returning arrays (created getFirst() helper)
- Fixed Next.js 16 params type (Promise<{ id: string }>)

**✅ All Features: IMPLEMENTED & BUILD SUCCESSFUL**

---

### 2025-12-11 - Session 2: QA & Fixes

#### STEP 1-2: Static Checks & Fixes
- Chạy `npx tsc --noEmit` → ✅ PASS
- Chạy `npm run lint` → 4 errors, 1 warning
- Chạy `npm run build` → ✅ PASS (sau khi fix)

**Errors đã sửa:**
| File | Lỗi | Fix |
|------|-----|-----|
| `src/actions/auth.ts` | Unused `_email` param | eslint-disable (intentional) |
| `src/app/(dashboard)/layout.tsx` | `<a>` → `<Link>` | Added Next.js Link |
| `src/app/(dashboard)/requests/[id]/page.tsx` | `<a>` → `<Link>` | Added Next.js Link |
| `src/app/(dashboard)/requests/page.tsx` | `<a>` → `<Link>` | Added Next.js Link |
| `src/types/database.types.ts` | Empty object type | Index signature |

**✅ QA: PASSED**

---

### 2025-12-11 - Session 1: Initial Scaffolding & Seed Data

#### STEP 1: Project Initialization
- Khởi tạo Next.js 14 với App Router, TypeScript strict, Tailwind CSS v4
- Cài đặt shadcn/ui (14 components), Supabase SSR, Resend, Zod, React Hook Form, Sonner
- Tạo `.env.example` với tất cả env variables cần thiết

#### STEP 2: Project Structure & Base Files
- Tạo cấu trúc thư mục theo PRD Section 6 (Sitemap & Project Structure)
- Setup Supabase clients (client.ts, server.ts) với cookie-based auth
- Tạo middleware.ts cho auth guard & route protection
- Tạo placeholder pages cho tất cả routes trong PRD
- Setup API routes: `/auth/callback`, `/api/cron/reminders`

#### STEP 3: Database Schema & Types
- Tạo `supabase/migrations/0001_init.sql` (~450 lines):
  - 10 tables: units, roles, users, user_roles, categories, requests, request_items, request_comments, attachments, request_logs, auth_logs
  - 3 enum types: request_status, priority_level, attachment_type
  - 12 indexes cho query optimization
  - RLS policies theo Role-Action Matrix
  - Triggers cho updated_at và auto-logging status changes
  - Seed data: 2 units, 4 categories, 4 roles
- Tạo `src/types/database.types.ts` với full TypeScript types

#### STEP 4: Core Permissions Logic
- Hoàn thiện `src/lib/permissions.ts` (435 lines):
  - State Machine với 7 states và valid transitions
  - 20+ permission helper functions
  - Full mapping PRD Role-Action Matrix → code
- Tạo `src/lib/validations.ts` (254 lines):
  - Zod schemas cho tất cả Server Actions
  - Input validation với error messages tiếng Việt
- Cập nhật `src/lib/auth/index.ts` để tích hợp với permissions

#### STEP 5: DEV Seed Data
- Thiết kế kịch bản seed với 9 users, 15 requests, đủ 7 statuses
- Tạo `supabase/seed_dev.sql` (737 lines):
  - 3 units (1 mới)
  - 6 categories (2 sub-categories mới)
  - 9 users với roles mapping
  - 15 requests trải đều 7 statuses
  - 22 request items
  - 10 comments (có internal comments)
  - 5 attachments (file + external_url)
  - 6 sample request logs
- Tạo `MIGRATION_AND_SEED_GUIDE.md` với hướng dẫn setup

**✅ Scaffolding & Seed: COMPLETED**

---

## 🔍 Gaps in PRD

Các điểm PRD chưa mô tả chi tiết và cách xử lý:

### 1. Database Schema Details
- **Gap**: PRD Section 5.2 chỉ liệt kê tên bảng, không có chi tiết schema
- **Resolution**: Tự định nghĩa data types, constraints, indexes dựa trên business logic
- **Location**: `supabase/migrations/0001_init.sql`

### 2. API/Server Actions Response Format
- **Gap**: Chưa định nghĩa format response thống nhất
- **Resolution**: Sử dụng `ActionResult<T>` pattern
  ```typescript
  type ActionResult<T> = { success: boolean; data?: T; error?: string; }
  ```
- **Location**: `src/actions/*.ts`

### 3. Error Codes/Messages
- **Gap**: Chưa có danh sách error codes chuẩn
- **Resolution**: Trả về error message mô tả tiếng Việt, không dùng numeric codes
- **Location**: `src/lib/validations.ts`

### 4. File Upload Temp Storage
- **Gap**: PRD đề cập temp upload nhưng chưa chi tiết cleanup mechanism
- **Resolution**: 
  - Dùng `temp_token` trong attachments table
  - `is_attached` flag để track file đã gắn với request chưa
  - TODO: Implement cron job cleanup files > 24h không có request_id
- **Location**: Schema `attachments` table

### 5. Rate Limiting Implementation
- **Gap**: PRD nói "5 requests/minute/user" nhưng không chi tiết cách implement
- **Resolution**: TODO - Implement rate limiting trong Server Actions
- **Suggestion**: Dùng Redis hoặc Supabase function với sliding window

### 6. Email Templates HTML
- **Gap**: PRD có nội dung email nhưng không có HTML template
- **Resolution**: TODO - Tạo React Email templates
- **Location**: `src/components/emails/`

### 7. Google Docs PDF Generation
- **Gap**: PRD mô tả flow nhưng không có template ID hoặc placeholder mapping
- **Resolution**: TODO - Cần user cung cấp Google Docs template
- **Env**: `GOOGLE_DOCS_TEMPLATE_ID`

### 8. Manager Unit Scope
- **Gap**: PRD không rõ Manager quản lý 1 hay nhiều units
- **Resolution**: ASSUMPTION - Manager quản lý 1 unit (users.unit_id)
- **Alternative**: Nếu cần multi-unit, tạo bảng `manager_units` mapping

---

## 💡 Assumptions Made

Các giả định đã đưa ra khi implement (đánh dấu trong code với `// ASSUMPTION:`):

### Authentication
| # | Assumption | Rationale |
|---|------------|-----------|
| A1 | Google OAuth callback: `/auth/callback` | Supabase convention |
| A2 | Local accounts do Admin tạo, không có public signup | PRD whitelist mechanism |
| A3 | `users.id` = `auth.users.id` (UUID) | Supabase Auth integration |
| A4 | Email domain không cần validate ở code (Supabase Auth handle) | Simplicity |

### Permissions & Roles
| # | Assumption | Rationale |
|---|------------|-----------|
| P1 | Multi-role check dùng `some()` (OR logic) | PRD: "một user có thể đảm nhiệm nhiều vai trò" |
| P2 | Manager scope = 1 unit via `users.unit_id` | Simplest interpretation |
| P3 | Staff chỉ xem phiếu assigned cho mình | PRD Section 3.4.1 |
| P4 | Admin có thể re-open DONE/CANCELLED | PRD Section 3.3.2: "Chỉ Admin" |

### State Machine
| # | Assumption | Rationale |
|---|------------|-----------|
| S1 | DRAFT → CANCELLED: Creator hoặc Manager | PRD không rõ, logical choice |
| S2 | Re-open states: NEW, ASSIGNED, IN_PROGRESS, NEED_INFO | Admin flexibility |
| S3 | Mọi status change tự động log via trigger | PRD logging requirement |

### Database
| # | Assumption | Rationale |
|---|------------|-----------|
| D1 | Soft delete = CANCELLED status | PRD không yêu cầu is_deleted field |
| D2 | `request_number` SERIAL cho display | User-friendly ID |
| D3 | Categories hierarchical (parent_id) | PRD mentions "Nhóm việc" |
| D4 | Attachments có thể external URL | PRD Section 3.2: file >= 5MB |

### Business Logic
| # | Assumption | Rationale |
|---|------------|-----------|
| B1 | Comment cho phép ở mọi status | PRD Section 3.5 explicit |
| B2 | Internal comments = Admin/Manager/Staff only | PRD: "trao đổi nội bộ vận hành" |
| B3 | Print/PDF available cho tất cả người có quyền view | PRD Role-Action Matrix |

---

## 🚀 Suggestions / Improvements

Các đề xuất cải tiến (không bắt buộc Phase 1):

### 🔷 High Priority (Recommend for Phase 1)

#### Performance
- [x] Database indexes đã thêm trong migration (status, created_at, assignee_id, etc.)
- [ ] Server-side pagination cho request list (schema ready, cần implement)
- [ ] Debounce search input trong UI

#### Security
- [ ] Rate limiting cho Server Actions (5 req/min/user per PRD)
- [ ] Input sanitization cho text fields (XSS prevention)
- [ ] Validate file upload MIME types server-side

### 🔶 Medium Priority (Phase 2)

#### Features
- [ ] Real-time updates với Supabase Realtime (status changes, new comments)
- [ ] Export báo cáo Excel (PRD Section 6: /reports)
- [ ] Email queue với retry mechanism

#### UX
- [ ] Optimistic updates cho status changes
- [ ] Drag & drop file upload
- [ ] Mobile bottom navigation (PRD Section 4)

### 🔹 Low Priority (Future)

#### Testing
- [ ] Unit tests cho `permissions.ts` (critical logic)
- [ ] Integration tests cho Server Actions
- [ ] E2E tests với Playwright (login → create → assign → complete flow)

#### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment với Vercel Preview
- [ ] Error monitoring (Sentry integration)
- [ ] Performance monitoring (Vercel Analytics)

#### Advanced Features
- [ ] Offline support / PWA
- [ ] Push notifications (Web Push API)
- [ ] Dashboard charts với Recharts
- [ ] AI-powered request categorization (future)

---

## 📊 Implementation Coverage

### PRD Sections → Code Mapping

| PRD Section | Status | Implementation |
|-------------|--------|----------------|
| 1. Thông tin tổng quan | ✅ | README.md, constants.ts |
| 2.1 Multi-role | ✅ | user_roles table, permissions.ts |
| 2.2 Vai trò | ✅ | roles table (seeded) |
| 2.3 Role-Action Matrix | ✅ | permissions.ts (20+ functions) |
| 3.1 Đăng nhập | 🟡 | middleware.ts, auth actions (placeholder) |
| 3.2 Tạo phiếu | 🟡 | Schema ready, Server Actions placeholder |
| 3.3 Workflow | ✅ | STATE_TRANSITIONS, canChangeStatus() |
| 3.4 Danh sách & Chi tiết | 🟡 | Page placeholders, schema ready |
| 3.5 Comment | ✅ | Schema, permissions ready |
| 3.6 In phiếu | 🔴 | TODO: Google Docs integration |
| 3.7 Thông báo & Cron | 🟡 | Route placeholder, TODO: Resend integration |
| 3.8 Dashboard | 🟡 | Page placeholder, TODO: widgets |
| 4. Mobile Responsive | 🟡 | Tailwind ready, TODO: implement |
| 5.1 Tech Stack | ✅ | All installed & configured |
| 5.2 Database | ✅ | Full schema in migration |
| 6. Sitemap | ✅ | All routes created |
| 7. Email Templates | 🔴 | TODO: React Email components |

**Legend**: ✅ Complete | 🟡 Partial/Placeholder | 🔴 Not Started

---

## ✅ Completed Tasks

### Phase 1 - Scaffolding (Sessions 1-2)
- [x] STEP 1: Project initialization
- [x] STEP 2: Project structure & base files
- [x] STEP 3: Database schema & types
- [x] STEP 4: Core permissions logic
- [x] STEP 5: Document gaps & suggestions

### Phase 2 - Implementation (Sessions 3-5)
- [x] Dashboard, Requests List, Create/Edit Request
- [x] Request Detail with actions & comments
- [x] Admin Users & Categories management
- [x] Profile page & Reports dashboard
- [x] Server Actions (requests.ts, admin.ts)

### Phase 3 - OAuth & Cleanup (Session 7)
- [x] Google OAuth exclusive implementation
- [x] Email whitelist check in callback
- [x] Auto-create profile from Google metadata
- [x] File cleanup (10+ obsolete files deleted)
- [x] Documentation suite (9 comprehensive guides)
- [x] Local testing on localhost:3000

---

## 🌱 Seed Scenarios (DEV Environment)

> **Purpose:** Mock data cho test UI, demo, và verify workflow  
> **Note:** CHỈ SỬ DỤNG CHO MÔI TRƯỜNG DEV, KHÔNG SEED VÀO PRODUCTION

### 1. Đơn vị (Units)

| ID (Fixed UUID) | Tên | Code | Mô tả |
|-----------------|-----|------|-------|
| `00000000-0000-0000-0000-000000000001` | Khoa Điều dưỡng | `NURSING` | Khoa chính (đã có trong migration) |
| `00000000-0000-0000-0000-000000000002` | Khoa Y Khoa | `MEDICINE` | Khoa phụ (đã có trong migration) |
| `00000000-0000-0000-0000-000000000003` | Phòng Đào tạo | `TRAINING` | Phòng hỗ trợ |

### 2. Danh mục (Categories) - Thêm vào existing

| Tên | Code | Unit | Parent |
|-----|------|------|--------|
| Vật tư y tế | `MEDICAL_SUPPLIES` | Nursing | - |
| Thiết bị giảng dạy | `TEACHING_EQUIPMENT` | Nursing | - |
| Văn phòng phẩm | `OFFICE_SUPPLIES` | Global | - |
| Khác | `OTHER` | Global | - |
| Mô hình giải phẫu | `ANATOMY_MODELS` | Nursing | Thiết bị giảng dạy |
| Mannequin thực hành | `PRACTICE_MANNEQUINS` | Nursing | Thiết bị giảng dạy |

### 3. Users & Roles

| Email | Full Name | Unit | Roles | Password (DEV) | Mô tả |
|-------|-----------|------|-------|----------------|-------|
| `admin@eiu.edu.vn` | Nguyễn Admin | Nursing | **admin** | `Admin@123` | Super Admin |
| `manager01@eiu.edu.vn` | Trần Quản Lý | Nursing | **manager** | `Manager@123` | Quản lý Khoa ĐD |
| `manager02@eiu.edu.vn` | Phạm Quản Lý | Medicine | **manager** | `Manager@123` | Quản lý Khoa YK |
| `staff01@eiu.edu.vn` | Lê Chuyên Viên | Nursing | **staff** | `Staff@123` | CV xử lý vật tư |
| `staff02@eiu.edu.vn` | Hoàng Chuyên Viên | Nursing | **staff** | `Staff@123` | CV xử lý thiết bị |
| `lecturer01@eiu.edu.vn` | Võ Giảng Viên | Nursing | **user** | `User@123` | GV Điều dưỡng |
| `lecturer02@eiu.edu.vn` | Đặng Giảng Viên | Nursing | **user** | `User@123` | GV Điều dưỡng |
| `lecturer03@eiu.edu.vn` | Bùi Trợ Giảng | Nursing | **user** | `User@123` | Trợ giảng |
| `multiuser@eiu.edu.vn` | Ngô Đa Vai | Nursing | **manager, staff** | `Multi@123` | Test multi-role |

**Tổng cộng: 9 users**
- 1 Admin
- 2 Managers (mỗi unit 1 người)
- 2 Staff
- 3 Users (Giảng viên/Trợ giảng)
- 1 Multi-role (Manager + Staff)

### 4. Phiếu Yêu cầu (Requests) - 15 phiếu

#### 4.1 Theo Status Distribution

| Status | Số lượng | Creator | Assignee |
|--------|----------|---------|----------|
| `DRAFT` | 2 | lecturer01, lecturer02 | - |
| `NEW` | 2 | lecturer01, lecturer03 | - |
| `ASSIGNED` | 3 | lecturer01, lecturer02, multiuser | staff01, staff02 |
| `IN_PROGRESS` | 3 | lecturer01, lecturer02, manager01 | staff01, staff02 |
| `NEED_INFO` | 2 | lecturer01, lecturer03 | staff01 |
| `DONE` | 2 | lecturer02, multiuser | staff01, staff02 |
| `CANCELLED` | 1 | lecturer01 | - |

**Tổng: 15 phiếu**

#### 4.2 Chi tiết từng phiếu

| # | Request Number | Status | Priority | Creator | Assignee | Lý do/Nội dung |
|---|----------------|--------|----------|---------|----------|----------------|
| 1 | REQ-001 | DRAFT | NORMAL | lecturer01 | - | [Nháp] Xin bổ sung găng tay y tế |
| 2 | REQ-002 | DRAFT | LOW | lecturer02 | - | [Nháp] Đề xuất mua thêm sách tham khảo |
| 3 | REQ-003 | NEW | HIGH | lecturer01 | - | Xin cấp kim tiêm thực hành cho SV |
| 4 | REQ-004 | NEW | URGENT | lecturer03 | - | Hỏng mannequin - cần thay gấp |
| 5 | REQ-005 | ASSIGNED | NORMAL | lecturer01 | staff01 | Xin vật tư băng gạc cho Lab |
| 6 | REQ-006 | ASSIGNED | HIGH | lecturer02 | staff02 | Yêu cầu bảo trì máy đo huyết áp |
| 7 | REQ-007 | ASSIGNED | NORMAL | multiuser | staff01 | Đặt mua ống nghe mới |
| 8 | REQ-008 | IN_PROGRESS | NORMAL | lecturer01 | staff01 | Xin dụng cụ tiêm truyền |
| 9 | REQ-009 | IN_PROGRESS | HIGH | lecturer02 | staff02 | Sửa chữa mô hình giải phẫu |
| 10 | REQ-010 | IN_PROGRESS | URGENT | manager01 | staff01 | [Ưu tiên] Thiết bị cho kỳ thi |
| 11 | REQ-011 | NEED_INFO | NORMAL | lecturer01 | staff01 | Xin thêm bông gòn - thiếu thông tin số lượng |
| 12 | REQ-012 | NEED_INFO | HIGH | lecturer03 | staff01 | Thay màn hình LCD - cần xác nhận model |
| 13 | REQ-013 | DONE | NORMAL | lecturer02 | staff01 | ✅ Đã cấp băng keo y tế |
| 14 | REQ-014 | DONE | LOW | multiuser | staff02 | ✅ Đã hoàn thành sửa đèn phòng Lab |
| 15 | REQ-015 | CANCELLED | NORMAL | lecturer01 | - | ❌ Huỷ - yêu cầu trùng lặp |

### 5. Request Items (Chi tiết mỗi phiếu)

Mỗi phiếu có 1-3 items. Ví dụ:

**REQ-003 (NEW - Kim tiêm):**
| Item | Category | Số lượng | ĐVT | Deadline |
|------|----------|----------|-----|----------|
| Kim tiêm 5ml | Vật tư y tế | 100 | Cái | +7 ngày |
| Kim tiêm 10ml | Vật tư y tế | 50 | Cái | +7 ngày |

**REQ-009 (IN_PROGRESS - Mô hình):**
| Item | Category | Số lượng | ĐVT | Deadline |
|------|----------|----------|-----|----------|
| Mô hình tim người | Mô hình giải phẫu | 1 | Bộ | +14 ngày |
| Phụ kiện thay thế | Mô hình giải phẫu | 2 | Cái | +14 ngày |

### 6. Comments & Attachments

**Sample Comments:**
- REQ-008: Manager comment "Đã phê duyệt, ưu tiên xử lý"
- REQ-011: Staff comment (internal) "Cần liên hệ GV xác nhận số lượng"
- REQ-013: Staff comment "Đã bàn giao đủ số lượng"

**Sample Attachments:**
- REQ-003: `danh_sach_vat_tu.xlsx` (file)
- REQ-006: `https://drive.google.com/...` (external_url)
- REQ-009: `hinh_mo_hinh_hong.jpg` (file)

### 7. Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Units | 3 | 2 đã có, thêm 1 |
| Categories | 6 | 4 đã có, thêm 2 sub-categories |
| Users | 9 | Đủ roles + 1 multi-role |
| Requests | 15 | Trải đều 7 statuses |
| Request Items | ~25-30 | 1-3 items/request |
| Comments | ~10-15 | Mix internal & public |
| Attachments | ~5-8 | Mix file & external_url |

---

## 📝 Next Steps (Ready for Production)

- [x] **Setup Supabase Project** → ✅ COMPLETE
   - Project ID: gpqtsspvskqtlsfsrame
   - Region: Singapore
   - Google OAuth enabled
   - Storage bucket configured

- [x] **Implement Authentication** → ✅ COMPLETE
   - Google OAuth only (no email/password)
   - Email whitelist check in callback
   - Auto-create profile from Google metadata
   - Login page: single "Đăng nhập với Google" button

- [x] **Implement Core CRUD** → ✅ COMPLETE
   - All pages implemented (Dashboard, Requests, Admin, Profile, Reports)
   - Server Actions with permissions
   - RLS policies enabled
   - Local testing successful

- [ ] **Deploy to Vercel** → 🚀 NEXT STEP
   - Push code to GitHub
   - Import to Vercel → Connect repo
   - Add environment variables (Supabase keys)
   - Update Google OAuth URLs (production domain)
   - Guide: `CURRENT_STATUS.md` Section "DEPLOYMENT STEPS"

- [ ] **Replace Test Users** → 🔄 AFTER DEPLOYMENT
   - Remove test users from whitelist
   - Add real institution users
   - Assign roles and units
   - Guide: `CURRENT_STATUS.md` Section "USER MANAGEMENT"

- [ ] **Email Integration** → ⚪ OPTIONAL (Future)
   - Setup Resend
   - Create React Email templates
   - Implement email triggers

- [ ] **Admin Panel for Users** → ⚪ OPTIONAL (Future)
   - Create UI for whitelist management
   - Currently via SQL (see WHITELIST_SETUP.md)
