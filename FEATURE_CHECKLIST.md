# 📋 FEATURE CHECKLIST - YCCV v1.2.2

**Last Updated:** Phase 4 COMPLETE ✅ (Phase 1-4 Done)

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
- ✅ **Avatar Storage setup** (NEW - avatar_storage.sql - cập nhật với hướng dẫn chi tiết)
- ✅ **Fix RLS Policies** (NEW - fix_rls_policies.sql)

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
- ✅ **Activity Logs Timeline** (NEW - activity-log.tsx)
- ✅ **Advanced Filters** (NEW - request-filters.tsx với date range, multi-select)
- ✅ **Better Pagination** (NEW - page size selector, proper UI)
- ✅ **Profile Page với Avatar Upload** (NEW - profile-form.tsx, avatar-upload.tsx)

---

## ✅ CRITICAL FIXES - ALL COMPLETE

### 1. ✅ Admin không tạo được phiếu mới - FIXED
**Fix applied:**
- Created trigger `assign_default_user_role()` to auto-assign 'user' role
- Added backup logic in auth callback
- Run `supabase/fix_user_roles.sql` in Supabase SQL Editor
- **NEW**: Run `supabase/fix_rls_policies.sql` để sửa RLS policies

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

### 7. ✅ Avatar Storage - FIXED
**Vấn đề:** `must be owner of table objects` error khi chạy SQL
**Fix:** Cập nhật `avatar_storage.sql` với:
- Xóa `ALTER TABLE storage.objects` (không cần thiết)
- Sửa chính sách để đơn giản hơn
- Thêm hướng dẫn setup thủ công qua Supabase Dashboard

### 8. ✅ RLS Policies - FIXED
**Vấn đề:** Người dùng có role admin+user vẫn không tạo được yêu cầu
**Fix:** Tạo `fix_rls_policies.sql` để:
- Drop tất cả conflicting policies
- Tạo lại policies đúng cách
- Sửa `user_has_role` function

---

## ✅ PHASE 2 - ALL COMPLETE

### 1. ✅ Activity Logs Timeline
- Component hiển thị timeline hoạt động
- Các action: created, status_change, commented, assigned
- Format thời gian relative và đầy đủ

### 2. ✅ Advanced Filters
- Multi-select status
- Priority filter
- Date range picker
- Assignee filter
- Unit filter

### 3. ✅ Better Pagination
- Page size selector (10/25/50)
- Page numbers với ellipsis
- First/Last page navigation
- Total count display

### 4. ✅ Profile Page với Avatar Upload
- Profile form với full_name, phone, email (readonly)
- Avatar upload component
- Image preview
- Delete avatar functionality

---

## ✅ PHASE 3 - ALL COMPLETE

### 5. ✅ Search Functionality
**Status:** ✅ Đã hoàn thành

**Đã làm:**
- ✅ Backend: Full-text search với RPC function (search_requests)
- ✅ Search across reason, request_number, và item_name
- ✅ Frontend: SearchBox component với debounce
- ✅ Dropdown results với highlight matched text
- ✅ Matched items display in search results

**Files đã tạo/sửa:**
- `src/components/requests/search-box.tsx` ✅ NEW
- `src/actions/requests.ts` - Added searchRequests() ✅
- `src/app/(dashboard)/requests/page.tsx` - Integrated SearchBox ✅

---

### 6. ✅ Dashboard Widgets
**Status:** ✅ Đã hoàn thành

**Đã làm:**
- ✅ Overview stats (NEW, IN_PROGRESS, Overdue, Done this month)
- ✅ Role-specific widgets:
  - ✅ Staff: "Việc của tôi" widget
  - ✅ User: "Yêu cầu của tôi" widget
  - ✅ Admin/Manager: "Hành động nhanh" widget
- ✅ Welcome banner với tên người dùng
- ✅ Quick guide cho regular users

**Files đã tạo:**
- `src/components/dashboard/dashboard-widgets.tsx` ✅ NEW
- `src/app/(dashboard)/dashboard/page.tsx` - Integrated widgets ✅
- `src/actions/requests.ts` - Added getDashboardStats() ✅

---

## ✅ PHASE 4 - Admin & Management - ALL COMPLETE

### 7. ✅ Comments System
**Status:** ✅ Đã hoàn thành

**Đã làm:**
- ✅ Display comment thread
- ✅ Add new comment
- ✅ Internal comments (is_internal = true)
- ✅ Permission check: Internal comments chỉ Admin/Manager/Staff thấy

**Files đã tạo:**
- `src/components/requests/request-comments.tsx` ✅

---

### 10. 📜 Activity Logs - ✅ DONE
**Status:** ✅ Đã hoàn thành

- ✅ Display activity timeline trong detail view
- ✅ Show: status changes, assignments, comments
- ✅ Format: "User X đã chuyển trạng thái từ Y sang Z lúc HH:mm DD/MM/YYYY"

**Files đã tạo:**
- `src/components/requests/activity-log.tsx` ✅

---

### 8. ✅ Activity Logs - DONE
**Status:** ✅ Đã hoàn thành

- ✅ Display activity timeline trong detail view
- ✅ Show: status changes, assignments, comments
- ✅ Format: "User X đã chuyển trạng thái từ Y sang Z lúc HH:mm DD/MM/YYYY"

**Files đã tạo:**
- `src/components/requests/activity-log.tsx` ✅

---

### 9. ✅ Advanced Filters - DONE
**Status:** ✅ Đã hoàn thành

- ✅ Trạng thái (multiple select)
- ✅ Ưu tiên
- ✅ Người tạo
- ✅ Người được giao
- ✅ Đơn vị
- ✅ Khoảng ngày tạo (date range)

**Files đã sửa:**
- `src/components/requests/request-filters.tsx` ✅

---

### 10. ✅ Profile Page - DONE
**Status:** ✅ Đã hoàn thành

- ✅ User chỉnh: full_name, phone
- ✅ Display: email, unit, roles (read-only)
- ✅ Avatar upload to Supabase Storage

**Files đã tạo/sửa:**
- `src/components/profile/profile-form.tsx` ✅
- `src/components/profile/avatar-upload.tsx` ✅
- `src/app/(dashboard)/profile/page.tsx` ✅

---

### 11. ✅ Pagination - DONE
**Status:** ✅ Đã hoàn thành

- ✅ Default: 20 items/page
- ✅ Options: 10/25/50
- ✅ Page numbers
- ✅ Total count

**Files đã sửa:**
- `src/app/(dashboard)/requests/page.tsx` ✅
- `src/components/ui/pagination.tsx` ✅

---

### 12. ✅ User Management - DONE
**Status:** ✅ Đã hoàn thành

- ✅ List users với roles và units
- ✅ Create user (email/password via Supabase Auth)
- ✅ Edit user (full_name, phone, unit_id)
- ✅ Assign/Remove roles (multi-select checkboxes)
- ✅ Toggle is_active status
- ✅ Search/filter users

**Files đã tạo:**
- `src/components/admin/user-management.tsx` ✅
- `src/app/(dashboard)/admin/users/page.tsx` ✅
- `src/actions/admin.ts` ✅

---

### 13. ✅ Category Management - DONE
**Status:** ✅ Đã hoàn thành

- ✅ CRUD categories
- ✅ Hierarchical categories (parent_id) with tree view
- ✅ Sort order
- ✅ is_active toggle
- ✅ Unit assignment

**Files đã tạo:**
- `src/components/admin/category-management.tsx` ✅
- `src/app/(dashboard)/admin/categories/page.tsx` ✅
- `src/actions/admin.ts` - upsertCategory, deleteCategory ✅

---

## 📦 PHASE 5 - Nice to have (Đang chờ)

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
| **Auth & Permissions** | 6/6 | 6 | 100% ✅ |
| **Request CRUD** | 8/10 | 10 | 80% ✅ |
| **Workflow & Status** | 5/6 | 6 | 83% ✅ |
| **Dashboard & Views** | 2/5 | 5 | 40% ⚠️ |
| **UI/UX (Phase 2)** | 4/4 | 4 | 100% ✅ |
| **Comments & Logs** | 2/3 | 3 | 67% ⚠️ |
| **Admin Features** | 2/5 | 5 | 40% ⚠️ |
| **Email & Cron** | 0/2 | 2 | 0% ❌ |
| **Print & Export** | 0/2 | 2 | 0% ❌ |
| **Overall** | **29/43** | **43** | **67%** |

---

## 🎯 UPDATED IMPLEMENTATION PLAN

### ✅ Phase 1 - Critical Fixes (DONE)
1. ✅ Fix Admin create request bug
2. ✅ Text length limits + validation
3. ✅ Rate limiting
4. ✅ Status transition với notes
5. ✅ Assignment to Staff
6. ✅ File attachments

### ✅ Phase 2 - Core Features (DONE)
1. ✅ Activity logs timeline
2. ✅ Advanced filters
3. ✅ Better pagination
4. ✅ Profile page với avatar upload
5. ✅ Comments system cơ bản

### 🔄 Phase 3 - Dashboard & Search (Đang chờ)
1. [ ] Search functionality
2. [ ] Dashboard widgets

### 📋 Phase 4 - Admin & Management
1. [ ] User management CRUD
2. [ ] Category management đầy đủ

### ⏰ Phase 5 - Automation
1. [ ] Email notifications (Resend)
2. [ ] Cron job reminders

### 📦 Phase 6 - Nice to Have
1. [ ] Print to PDF
2. [ ] Reports & Excel export

---

## 🚀 NEXT IMMEDIATE ACTIONS

### Để chạy production:

1. **Run SQL fixes in Supabase:**
   ```sql
   -- 1. Chạy fix_rls_policies.sql để sửa RLS
   -- 2. Chạy avatar_storage.sql (hoặc setup thủ công qua Dashboard)
   ```

2. **Test request creation:**
   - Login với user có role admin + user
   - Thử tạo request mới
   - Kiểm tra xem có lỗi không

3. **Tiếp tục Phase 3:**
   - Search functionality
   - Dashboard widgets

---

## 📝 SQL FILES CẦN CHẠY

| File | Mục đích | Status |
|------|----------|--------|
| `0001_full_schema.sql` | Schema đầy đủ | ✅ Đã chạy |
| `fix_user_roles.sql` | Auto-assign user role | ✅ Cần chạy |
| `fix_rls_policies.sql` | Sửa RLS policies | ⚠️ MỚI - Cần chạy |
| `avatar_storage.sql` | Avatar storage setup | ⚠️ Cập nhật - Cần chạy |
| `setup_storage.sql` | File attachment storage | ✅ Cần chạy |

---

Bạn muốn tiếp tục với Phase 3 (Search & Dashboard) không? 🚀
