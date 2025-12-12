# 📋 FEATURE CHECKLIST - YCCV v1.2.2

**Last Updated:** Phase 1 Critical Fixes COMPLETE ✅

## ✅ ĐÃ HOÀN THÀNH

### Authentication & Authorization
- ✅ Google OAuth với Supabase Auth
- ✅ Whitelist mechanism (is_active check)
- ✅ Multi-role support (user_roles table)
- ✅ Role-based access control (RLS policies)
- ✅ Auth logs (auth_logs table)
- ✅ **Auto-assign 'user' role on first login** (NEW - fix_user_roles.sql)

### Request Management
- ✅ Create request form với items
- ✅ Priority levels (LOW, NORMAL, HIGH, URGENT)
- ✅ Status enum (DRAFT, NEW, ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED)
- ✅ Request items với categories
- ✅ Unit snapshot (unit_name_snapshot)
- ✅ **Assignment to Staff** (NEW - getStaffList, assignRequest)
- ✅ **Status transitions with notes** (NEW - NEED_INFO requires note)

### Database
- ✅ Full schema với constraints
- ✅ RLS enabled on all tables
- ✅ Optimistic locking (version field)
- ✅ Atomic RPCs (create_request_atomic, update_request_atomic)
- ✅ Rate limiting table structure
- ✅ **Supabase Storage bucket setup** (NEW - setup_storage.sql)

### Validation & Security
- ✅ **Text length validation** (NEW - max 500 chars for reason, notes)
- ✅ **Character counters in UI** (NEW - all textareas)
- ✅ **Rate limiting implemented** (NEW - 5 req/min)
- ✅ **Rate limit on create/update/submit/status/comment** (NEW)

### File Attachments
- ✅ **Upload component** (NEW - file-upload.tsx)
- ✅ **Upload/delete actions** (NEW - uploadAttachment, deleteAttachment)
- ✅ **Attachment display** (NEW - getAttachments)
- ✅ **Storage bucket with policies** (NEW - setup_storage.sql)

### UI/UX
- ✅ Responsive design (mobile-friendly)
- ✅ Tailwind + Shadcn/UI components
- ✅ Basic navigation

---

## ✅ CRITICAL FIXES - ALL COMPLETE

### 1. ✅ Admin không tạo được phiếu mới - FIXED
**Fix applied:**
- Created trigger `assign_default_user_role()` to auto-assign 'user' role
- Added backup logic in auth callback
- Run `supabase/fix_user_roles.sql` in Supabase SQL Editor

### 2. ✅ Text Length Validation - FIXED
- All textareas now have maxLength
- Character counters show remaining chars
- Backend validation with Zod schemas

### 3. ✅ Rate Limiting - FIXED  
- Applied to all write actions
- 5 requests/minute/user
- Friendly error messages

### 4. ✅ Status Transitions with Notes - FIXED
- NEED_INFO requires note (bắt buộc)
- DONE/CANCELLED accept optional notes
- Dialog UI with validation

### 5. ✅ Assignment to Staff - FIXED
- Staff list loading
- Assignment dialog
- Proper permission checks

### 6. ✅ File Attachments - FIXED
- Upload/delete implemented
- Storage bucket configured
- Max 5MB, 5 files/request

---

## ⚠️ MEDIUM PRIORITY - Phase 2 (Ưu tiên 2)

**Cần làm:**
- [ ] Frontend validation (Textarea maxLength)
- [ ] Backend validation trong Server Actions
- [ ] UI: Character counter hiển thị "X/500"

**Files cần sửa:**
- `src/lib/validations.ts` - Add length checks
- `src/components/requests/request-form.tsx` - Add counter

---

### 5. 🔄 Workflow - Status Transitions với Notes
**Status:** ⚠️ Chưa đầy đủ

**Hiện tại:** Có state transitions cơ bản
**Thiếu:**
- [ ] Notes khi chuyển trạng thái (ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED)
- [ ] completion_note field (required khi DONE)
- [ ] cancel_reason field (required khi CANCELLED)
- [ ] UI: Modal/Form để nhập note khi chuyển trạng thái
- [ ] Lưu notes vào request_logs.meta_data

**Files cần tạo/sửa:**
- `src/components/requests/status-transition-modal.tsx` (NEW)
- `src/components/requests/request-actions.tsx` - Update với notes

---

### 6. 👥 Assignment to Staff
**Status:** ⚠️ Schema có nhưng UI chưa đầy đủ

**Cần làm:**
- [ ] Manager/Admin assign phiếu cho Staff
- [ ] UI: Dropdown chọn Staff (filter by role)
- [ ] Update assignee_id + assigned_at
- [ ] Status transition: NEW → ASSIGNED

**Files cần tạo/sửa:**
- `src/components/requests/assign-staff-modal.tsx` (NEW)
- `src/actions/requests.ts` - Add assignRequest()

---

### 7. 🔍 Search Functionality
**Status:** ⚠️ Có search box nhưng chưa implement full

**PRD yêu cầu search:**
- requests.id (mã phiếu)
- requests.reason
- request_items.item_name

**Cần làm:**
- [ ] Backend: Full-text search query
- [ ] Index trên request_items.item_name (đã có trong migration)
- [ ] Frontend: Search input với debounce
- [ ] Highlight search results

**Files cần sửa:**
- `src/app/(dashboard)/requests/page.tsx` - Implement search
- `src/actions/requests.ts` - Add searchRequests()

---

### 8. 📊 Dashboard Widgets
**Status:** ⚠️ Có dashboard basic, thiếu widgets chi tiết

**PRD yêu cầu 3 widgets:**
1. **Tổng quan (Overview):**
   - [ ] Số phiếu NEW
   - [ ] Số phiếu ASSIGNED + IN_PROGRESS
   - [ ] Số phiếu Quá hạn (required_at < today)
   - [ ] Số phiếu DONE tháng này

2. **Việc cần làm (Staff/Manager):**
   - [ ] Staff: Phiếu được assign
   - [ ] Manager: Phiếu cần xử lý của unit

3. **Phiếu của tôi (User):**
   - [ ] Phiếu created_by = user và chưa DONE/CANCELLED

**Files cần tạo/sửa:**
- `src/components/dashboard/overview-stats.tsx` (NEW)
- `src/components/dashboard/my-tasks.tsx` (NEW)
- `src/components/dashboard/my-requests.tsx` (NEW)
- `src/app/(dashboard)/dashboard/page.tsx` - Layout widgets

---

## 📋 MEDIUM PRIORITY - Tính năng quan trọng nhưng không critical (Ưu tiên 3)

### 9. 💬 Comments System
**Status:** ⚠️ Table có, UI chưa đầy đủ

**Cần làm:**
- [ ] Display comment thread
- [ ] Add new comment
- [ ] Internal comments (is_internal = true)
- [ ] Permission check: Internal comments chỉ Admin/Manager/Staff thấy
- [ ] Comment khi NEED_INFO trigger email

**Files cần tạo/sửa:**
- `src/components/requests/request-comments.tsx` - Expand features
- `src/actions/comments.ts` (NEW)

---

### 10. 📜 Activity Logs
**Status:** ⚠️ Table có, UI chưa có

**Cần làm:**
- [ ] Display activity timeline trong detail view
- [ ] Show: status changes, assignments, comments
- [ ] Format: "User X đã chuyển trạng thái từ Y sang Z lúc HH:mm DD/MM/YYYY"

**Files cần tạo:**
- `src/components/requests/activity-log.tsx` (NEW)

---

### 11. 🔽 Advanced Filters
**Status:** ⚠️ Có filter cơ bản, chưa đầy đủ

**PRD yêu cầu filter theo:**
- [ ] Trạng thái (multiple select)
- [ ] Ưu tiên
- [ ] Người tạo
- [ ] Người được giao
- [ ] Đơn vị
- [ ] Khoảng ngày tạo (date range)

**Files cần sửa:**
- `src/components/requests/request-filters.tsx` - Expand filters

---

### 12. 👤 Profile Page
**Status:** ⚠️ Route có, content chưa đầy đủ

**Cần làm:**
- [ ] User chỉnh: full_name, avatar
- [ ] Display: email, unit, roles (read-only)
- [ ] Avatar upload to Supabase Storage

**Files cần sửa:**
- `src/components/profile/profile-form.tsx` - Full implementation
- `src/app/(dashboard)/profile/page.tsx`

---

### 13. 📑 Pagination
**Status:** ⚠️ Cơ bản có, chưa flexible

**PRD yêu cầu:**
- [ ] Default: 20 items/page
- [ ] Options: 10/25/50
- [ ] Page numbers
- [ ] Total count

**Files cần sửa:**
- `src/app/(dashboard)/requests/page.tsx` - Better pagination UI

---

## 📦 LOW PRIORITY - Nice to have (Ưu tiên 4)

### 14. 🖨️ Print to PDF (Google Docs Template)
**Status:** ❌ Chưa có

**Cần làm:**
- [ ] Setup Google Service Account
- [ ] Create Google Docs template
- [ ] Implement API: Docs → PDF stream
- [ ] Button "In phiếu" trong detail view

**Files cần tạo:**
- `src/lib/google-docs.ts` (NEW)
- `src/app/api/print/[id]/route.ts` (NEW)

**⚠️ Phức tạp, có thể làm sau khi các features khác xong**

---

### 15. 📧 Email Notifications (Resend)
**Status:** ❌ Chưa có

**PRD yêu cầu email triggers:**
- [ ] NEW → Manager
- [ ] ASSIGNED → Staff
- [ ] NEED_INFO → Creator
- [ ] DONE → Creator + Manager
- [ ] CANCELLED → Creator
- [ ] Comment trả lời khi NEED_INFO → Staff

**Files cần tạo:**
- `src/lib/email.ts` (NEW)
- `src/lib/email-templates/` (NEW folder với templates)
- Setup Resend API key

**Phụ thuộc:** Status transition với notes phải xong trước

---

### 16. ⏰ Cron Job - Nhắc việc
**Status:** ❌ Chưa có

**PRD yêu cầu:**
- [ ] Chạy 08:00 AM hàng ngày
- [ ] Quét request_items có required_at = ngày mai
- [ ] Gửi email nhắc Staff + Manager

**Files cần tạo:**
- `src/app/api/cron/reminders/route.ts` - Đã có file nhưng chưa implement
- Setup Vercel Cron config

**Phụ thuộc:** Email system phải xong trước

---

### 17. 👨‍💼 Admin - User Management
**Status:** ⚠️ Route có, content chưa đầy đủ

**Cần làm:**
- [ ] List users với roles
- [ ] Create user (email/password)
- [ ] Edit user (is_active, unit_id)
- [ ] Assign/Remove roles
- [ ] Reset password (manual)

**Files cần sửa:**
- `src/components/admin/user-management.tsx` - Full CRUD
- `src/app/(dashboard)/admin/users/page.tsx`

---

### 18. 📂 Admin - Category Management
**Status:** ⚠️ Route có, content cơ bản

**Cần làm:**
- [ ] CRUD categories
- [ ] Hierarchical categories (parent_id)
- [ ] Sort order
- [ ] is_active toggle

**Files cần sửa:**
- `src/components/admin/category-management.tsx` - Expand features
- `src/app/(dashboard)/admin/categories/page.tsx`

---

### 19. 📊 Reports
**Status:** ❌ Chưa có

**PRD yêu cầu:**
- [ ] Báo cáo theo đơn vị
- [ ] Báo cáo theo thời gian
- [ ] Xuất Excel
- [ ] Charts (optional)

**Files cần tạo:**
- `src/app/(dashboard)/reports/page.tsx` - Implement
- `src/lib/reports.ts` (NEW)
- `src/lib/excel-export.ts` (NEW)

---

## 🔧 TECHNICAL DEBT & IMPROVEMENTS

### 20. Error Handling
- [ ] Better error messages
- [ ] Toast notifications consistency
- [ ] Loading states

### 21. Performance
- [ ] Query optimization
- [ ] Caching strategies
- [ ] Image optimization

### 22. Testing
- [ ] Unit tests cho utils
- [ ] Integration tests cho Server Actions
- [ ] E2E tests cho critical flows

### 23. Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide updates

---

## 📊 SUMMARY - FEATURE COMPLETION

| Category | Completed | Total | %  |
|----------|-----------|-------|----|
| **Auth & Permissions** | 5/5 | 5 | 100% ✅ |
| **Request CRUD** | 5/10 | 10 | 50% ⚠️ |
| **Workflow & Status** | 3/6 | 6 | 50% ⚠️ |
| **Dashboard & Views** | 2/5 | 5 | 40% ⚠️ |
| **Comments & Logs** | 1/3 | 3 | 33% ⚠️ |
| **Admin Features** | 2/5 | 5 | 40% ⚠️ |
| **Email & Cron** | 0/2 | 2 | 0% ❌ |
| **Print & Export** | 0/2 | 2 | 0% ❌ |
| **Overall** | **18/38** | **38** | **47%** |

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1 - Critical Fixes (1-2 ngày)
1. Fix Admin create request bug
2. Text length limits + validation
3. Rate limiting
4. Status transition với notes
5. Assignment to Staff

### Phase 2 - Core Features (3-5 ngày)
6. File attachments
7. Search functionality
8. Dashboard widgets
9. Comments system đầy đủ
10. Activity logs
11. Advanced filters

### Phase 3 - Admin & Management (2-3 ngày)
12. User management CRUD
13. Category management đầy đủ
14. Profile page hoàn chỉnh
15. Pagination improvements

### Phase 4 - Automation (2-3 ngày)
16. Email notifications (Resend)
17. Cron job reminders
18. Email templates

### Phase 5 - Nice to Have (1-2 ngày)
19. Print to PDF
20. Reports & Excel export

### Phase 6 - Polish (1-2 ngày)
21. Error handling
22. Performance optimization
23. Testing
24. Documentation

**Total estimate: 10-17 ngày làm việc**

---

## 🚀 NEXT IMMEDIATE ACTIONS

### Bắt đầu ngay:

1. **Debug Admin create request:**
   ```sql
   -- Check admin có role 'user' không?
   SELECT u.email, r.name as role
   FROM users u
   JOIN user_roles ur ON ur.user_id = u.id
   JOIN roles r ON r.id = ur.role_id
   WHERE u.email = 'bao.nguyen@eiu.edu.vn';
   
   -- Nếu không có role 'user', add vào:
   INSERT INTO user_roles (user_id, role_id)
   SELECT u.id, r.id
   FROM users u
   CROSS JOIN roles r
   WHERE u.email = 'bao.nguyen@eiu.edu.vn'
     AND r.name = 'user';
   ```

2. **Check frontend permission:**
   - File: `src/components/requests/create-request-form.tsx`
   - Check logic có block admin tạo request không

3. **Prioritize Phase 1 items** và implement theo thứ tự

---

Bạn muốn tôi bắt đầu fix từ đâu trước? 🚀
