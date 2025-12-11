# Manual Testing Checklist

**Last Updated**: 2025-12-11  
**Project**: Job Request Management System  
**Version**: MVP v1.0

---

## 📋 YÊU CẦU TRƯỚC KHI TEST

- [x] Supabase đã setup (xem `SUPABASE_MANUAL_SETUP.md`)
- [x] App đã deploy lên Vercel (xem `DEPLOYMENT_GUIDE.md`)
- [x] Có ít nhất 4 test accounts (Admin, Manager, Staff, User)

---

## 🧪 TEST ACCOUNTS

Sử dụng các tài khoản sau để test (đã seed trong Supabase):

| Role | Email | Password | Unit | Mục đích test |
|------|-------|----------|------|---------------|
| Admin | `admin@eiu.edu.vn` | `Admin@123` | Khoa Điều dưỡng | Full permissions |
| Manager | `manager01@eiu.edu.vn` | `Manager@123` | Khoa Điều dưỡng | Unit management |
| Staff | `staff01@eiu.edu.vn` | `Staff@123` | Khoa Điều dưỡng | Process requests |
| User | `lecturer01@eiu.edu.vn` | `User@123` | Khoa Điều dưỡng | Create requests |

---

## TEST SUITE 1: AUTHENTICATION (Đăng nhập)

### ✅ Test 1.1: Email/Password Login - Success

**Steps:**
1. Mở app: `https://yccv-job-requests.vercel.app` (hoặc localhost)
2. Auto redirect → `/login`
3. Nhập:
   - Email: `admin@eiu.edu.vn`
   - Password: `Admin@123`
4. Nhấn **"Đăng nhập"**

**Expected:**
- ✅ Redirect → `/dashboard`
- ✅ Thấy "Xin chào, Nguyễn Admin" (hoặc full_name)
- ✅ Menu hiển thị: Dashboard, Requests, Admin (admin only), Reports, Profile

### ✅ Test 1.2: Email/Password Login - Wrong Password

**Steps:**
1. Vào `/login`
2. Nhập:
   - Email: `admin@eiu.edu.vn`
   - Password: `WrongPassword123`
3. Nhấn **"Đăng nhập"**

**Expected:**
- ❌ Hiển thị error: "Email hoặc mật khẩu không đúng"
- ❌ Vẫn ở trang `/login`

### ✅ Test 1.3: Google OAuth - Whitelisted User

**Steps:**
1. Vào `/login`
2. Nhấn **"Đăng nhập với Google"**
3. Chọn Google account có email trong `users` table (e.g., `admin@eiu.edu.vn`)

**Expected:**
- ✅ Redirect Google consent screen
- ✅ After consent → redirect `/auth/callback`
- ✅ Redirect → `/dashboard`

### ✅ Test 1.4: Google OAuth - Non-Whitelisted User (Whitelist Block)

**Steps:**
1. Vào `/login`
2. Nhấn **"Đăng nhập với Google"**
3. Chọn account KHÔNG có trong `users` table (e.g., `random@gmail.com`)

**Expected:**
- ❌ Redirect về `/login?error=not_whitelisted`
- ❌ Hiển thị: "Tài khoản của bạn chưa được cấp quyền truy cập. Vui lòng liên hệ Admin."

### ✅ Test 1.5: Logout

**Steps:**
1. Đăng nhập as any user
2. Click avatar/menu → **"Đăng xuất"**

**Expected:**
- ✅ Redirect → `/login`
- ✅ Access `/dashboard` → auto redirect `/login`

---

## TEST SUITE 2: DASHBOARD

### ✅ Test 2.1: Dashboard Stats - Admin View

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào `/dashboard`

**Expected:**
- ✅ Thấy 4 stats cards: Total, Pending, Processing, Completed
- ✅ Stats hiển thị đúng số lượng (query tất cả requests)
- ✅ Thấy section "Recent Requests" với 5-10 requests gần nhất

### ✅ Test 2.2: Dashboard Stats - Manager View

**Steps:**
1. Đăng nhập as `manager01@eiu.edu.vn`
2. Vào `/dashboard`

**Expected:**
- ✅ Stats hiển thị chỉ requests của unit "Khoa Điều dưỡng"
- ✅ Recent requests chỉ hiển thị requests của unit

### ✅ Test 2.3: Dashboard Stats - User View

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/dashboard`

**Expected:**
- ✅ Stats hiển thị chỉ requests do user tạo
- ✅ Recent requests chỉ hiển thị requests của user

---

## TEST SUITE 3: CREATE REQUEST

### ✅ Test 3.1: Create Request - Save as Draft

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/requests/create`
3. Điền form:
   - Lý do yêu cầu: "Test request - Xin vật tư y tế"
   - Category: Chọn "Vật tư y tế"
   - Priority: NORMAL
   - Items:
     - Tên: "Găng tay y tế" | Số lượng: 100 | ĐVT: "Cái" | Deadline: +7 days
4. Nhấn **"Lưu nháp"**

**Expected:**
- ✅ Toast success: "Đã lưu phiếu nháp"
- ✅ Redirect → `/requests`
- ✅ Thấy request với status badge "DRAFT" (màu xám)

### ✅ Test 3.2: Create Request - Save and Submit

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/requests/create`
3. Điền form (same as 3.1)
4. Nhấn **"Gửi phiếu"**

**Expected:**
- ✅ Toast success: "Đã gửi phiếu yêu cầu"
- ✅ Redirect → `/requests/[id]` (detail page)
- ✅ Status = NEW (màu xanh dương)
- ✅ Không hiển thị nút "Edit Request" (vì không phải DRAFT)

### ✅ Test 3.3: Create Request - Validation Errors

**Steps:**
1. Vào `/requests/create`
2. Bỏ trống "Lý do yêu cầu"
3. Nhấn **"Lưu nháp"**

**Expected:**
- ❌ Form không submit
- ❌ Hiển thị error dưới field: "Lý do yêu cầu phải từ 10-1000 ký tự"

**Steps 2:**
1. Điền lý do
2. Không add items (để mảng items trống)
3. Nhấn **"Lưu nháp"**

**Expected:**
- ❌ Hiển thị error: "Phải có ít nhất 1 mục yêu cầu"

### ✅ Test 3.4: Create Request - Multiple Items

**Steps:**
1. Vào `/requests/create`
2. Điền form với 3 items:
   - Item 1: "Kim tiêm 5ml" | 50 | Cái | +7 days
   - Item 2: "Kim tiêm 10ml" | 30 | Cái | +7 days
   - Item 3: "Bông gòn y tế" | 5 | Kg | +14 days
3. Nhấn **"Gửi phiếu"**

**Expected:**
- ✅ Toast success
- ✅ Vào detail page → thấy 3 items trong bảng

---

## TEST SUITE 4: REQUEST LIST & FILTERS

### ✅ Test 4.1: View All Requests - Admin

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào `/requests`

**Expected:**
- ✅ Thấy TẤT CẢ requests trong system
- ✅ Columns: Request Number, Lý do, Category, Status, Priority, Creator, Created Date, Actions
- ✅ Pagination nếu > 10 requests

### ✅ Test 4.2: View Requests - User

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/requests`

**Expected:**
- ✅ Chỉ thấy requests do `lecturer01` tạo
- ❌ Không thấy requests của users khác

### ✅ Test 4.3: View Requests - Staff

**Steps:**
1. Đăng nhập as `staff01@eiu.edu.vn`
2. Vào `/requests`

**Expected:**
- ✅ Thấy requests:
  - Assigned cho `staff01` (assignee_id = staff01.id)
  - Status = NEW (unassigned)
- ❌ Không thấy requests assigned cho staff khác

### ✅ Test 4.4: Filter by Status

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào `/requests`
3. Click dropdown **"Filter by Status"**
4. Chọn **"NEW"**

**Expected:**
- ✅ Chỉ hiển thị requests có status = NEW
- ✅ URL update: `/requests?status=NEW`

### ✅ Test 4.5: Filter by Priority

**Steps:**
1. Vào `/requests`
2. Click dropdown **"Filter by Priority"**
3. Chọn **"URGENT"**

**Expected:**
- ✅ Chỉ hiển thị requests có priority = URGENT (màu đỏ)

### ✅ Test 4.6: Filter by Category

**Steps:**
1. Vào `/requests`
2. Click dropdown **"Filter by Category"**
3. Chọn **"Vật tư y tế"**

**Expected:**
- ✅ Chỉ hiển thị requests có category = "Vật tư y tế"

### ✅ Test 4.7: Clear Filters

**Steps:**
1. Apply filters (status=NEW, priority=URGENT)
2. Click **"Clear Filters"** button

**Expected:**
- ✅ Hiển thị lại tất cả requests
- ✅ URL reset về `/requests`

---

## TEST SUITE 5: REQUEST DETAIL & ACTIONS

### ✅ Test 5.1: View Request Detail

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào `/requests`
3. Click vào request bất kỳ

**Expected:**
- ✅ Hiển thị đầy đủ:
  - Request number, status badge, priority badge
  - Creator info (name, unit, email)
  - Category, created date
  - Lý do yêu cầu (reason)
  - Bảng items (name, quantity, unit, deadline)
  - Bảng comments (nếu có)
  - Activity log (status changes)

### ✅ Test 5.2: Edit Request - DRAFT Status

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Tạo request DRAFT (Test 3.1)
3. Vào detail page
4. Nhấn **"Edit Request"** button

**Expected:**
- ✅ Redirect → `/requests/[id]/edit`
- ✅ Form pre-filled với data hiện tại
- ✅ Có thể edit reason, items, category, priority
- ✅ Sau khi save → status vẫn là DRAFT

### ✅ Test 5.3: Submit Request - DRAFT → NEW (Creator)

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào request DRAFT
3. Nhấn **"Gửi phiếu"** button

**Expected:**
- ✅ Status chuyển từ DRAFT → NEW
- ✅ Toast success: "Đã gửi phiếu yêu cầu"
- ✅ Nút "Edit Request" biến mất (không edit được nữa)

### ✅ Test 5.4: Assign Request - NEW → ASSIGNED (Manager)

**Steps:**
1. Đăng nhập as `manager01@eiu.edu.vn`
2. Vào request NEW
3. Nhấn **"Assign Request"** button
4. Chọn staff: `staff01@eiu.edu.vn`
5. Nhấn **"Assign"**

**Expected:**
- ✅ Status chuyển NEW → ASSIGNED
- ✅ Assignee hiển thị: "Lê Chuyên Viên"
- ✅ Toast success
- ✅ Activity log ghi: "Manager đã assign cho Staff"

### ✅ Test 5.5: Start Processing - ASSIGNED → IN_PROGRESS (Staff)

**Steps:**
1. Đăng nhập as `staff01@eiu.edu.vn`
2. Vào request ASSIGNED cho mình
3. Nhấn **"Start Processing"**

**Expected:**
- ✅ Status chuyển ASSIGNED → IN_PROGRESS
- ✅ Toast success
- ✅ Activity log ghi: "Staff bắt đầu xử lý"

### ✅ Test 5.6: Mark as Done - IN_PROGRESS → DONE (Staff)

**Steps:**
1. Đăng nhập as `staff01@eiu.edu.vn`
2. Vào request IN_PROGRESS
3. Nhấn **"Mark as Done"**

**Expected:**
- ✅ Status chuyển IN_PROGRESS → DONE
- ✅ Badge màu xanh lá
- ✅ Không còn action buttons (final state)

### ✅ Test 5.7: Request More Info - ANY → NEED_INFO (Staff)

**Steps:**
1. Đăng nhập as `staff01@eiu.edu.vn`
2. Vào request ASSIGNED hoặc IN_PROGRESS
3. Nhấn **"Request More Info"**

**Expected:**
- ✅ Status chuyển → NEED_INFO
- ✅ Badge màu vàng
- ✅ Activity log ghi: "Staff yêu cầu bổ sung thông tin"

### ✅ Test 5.8: Provide Info - NEED_INFO → Previous Status (Creator)

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (creator)
2. Vào request NEED_INFO
3. Nhấn **"Provide Info"** button (hoặc tự động via Comment)

**Expected:**
- ✅ Status chuyển NEED_INFO → IN_PROGRESS (hoặc ASSIGNED)
- ✅ Toast success

### ✅ Test 5.9: Cancel Request - DRAFT/NEW → CANCELLED (Creator)

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào request DRAFT hoặc NEW
3. Nhấn **"Cancel Request"**
4. Confirm dialog

**Expected:**
- ✅ Status chuyển → CANCELLED
- ✅ Badge màu đỏ đậm
- ✅ Không còn action buttons

### ✅ Test 5.10: Re-open Request (Admin Only)

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào request DONE hoặc CANCELLED
3. Nhấn **"Re-open Request"**
4. Chọn new status: NEW

**Expected:**
- ✅ Status chuyển về NEW
- ✅ Toast success
- ✅ Activity log ghi: "Admin re-opened request"

### ✅ Test 5.11: Invalid State Transition (Security)

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (User role)
2. Vào request NEW
3. Inspect page, tìm action button "Assign Request"
4. Thử trigger action (via console/devtools)

**Expected:**
- ❌ Button không hiển thị trong UI
- ❌ Nếu force call API → Error 403 "Permission denied"

---

## TEST SUITE 6: COMMENTS

### ✅ Test 6.1: Add Public Comment

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào request detail
3. Scroll xuống "Comments" section
4. Nhập comment: "Test comment - Bổ sung thông tin"
5. Checkbox "Internal comment" = **UNCHECKED**
6. Nhấn **"Add Comment"**

**Expected:**
- ✅ Comment xuất hiện trong list
- ✅ Hiển thị: Avatar, Name, Timestamp, Content
- ✅ Badge "Public" (hoặc không có badge)

### ✅ Test 6.2: Add Internal Comment (Staff/Manager/Admin Only)

**Steps:**
1. Đăng nhập as `staff01@eiu.edu.vn`
2. Vào request detail
3. Nhập comment: "Internal note - Cần kiểm tra ngân sách"
4. Checkbox "Internal comment" = **CHECKED**
5. Nhấn **"Add Comment"**

**Expected:**
- ✅ Comment xuất hiện với badge "Internal" (màu cam)
- ✅ Chỉ Staff/Manager/Admin thấy được

### ✅ Test 6.3: View Internal Comments - User Role

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (User role)
2. Vào request có internal comments (từ Test 6.2)

**Expected:**
- ❌ KHÔNG thấy internal comments
- ✅ Chỉ thấy public comments

---

## TEST SUITE 7: ADMIN PAGES

### ✅ Test 7.1: Admin Users Page - Access Control

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (User role)
2. Thử access `/admin/users`

**Expected:**
- ❌ Redirect → `/unauthorized`
- ❌ Hoặc 403 error page

**Steps 2:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Access `/admin/users`

**Expected:**
- ✅ Hiển thị trang User Management
- ✅ List tất cả users với roles, units, status

### ✅ Test 7.2: Create User

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào `/admin/users`
3. Nhấn **"Create User"**
4. Điền form:
   - Email: `newuser@eiu.edu.vn`
   - Full Name: "Nguyễn Test User"
   - Phone: "0901234567"
   - Unit: Khoa Điều dưỡng
   - Roles: Check "User"
5. Nhấn **"Create"**

**Expected:**
- ✅ User mới xuất hiện trong list
- ✅ Toast success
- ✅ User có thể login (nếu có auth account)

### ✅ Test 7.3: Edit User Roles

**Steps:**
1. Vào `/admin/users`
2. Click **"Edit"** trên user bất kỳ
3. Thay đổi roles: Check thêm "Manager"
4. Nhấn **"Save"**

**Expected:**
- ✅ User roles update thành công
- ✅ Badges hiển thị: "User" + "Manager"

### ✅ Test 7.4: Toggle User Active Status

**Steps:**
1. Vào `/admin/users`
2. Click **"Deactivate"** button trên user active
3. Confirm action

**Expected:**
- ✅ User status chuyển → Inactive (màu đỏ)
- ✅ User không login được (test bằng logout + login lại)

**Steps 2:**
1. Click **"Activate"** button
2. Confirm

**Expected:**
- ✅ User status chuyển → Active (màu xanh)
- ✅ User login được lại

### ✅ Test 7.5: Admin Categories Page

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn` (hoặc `manager01@eiu.edu.vn`)
2. Vào `/admin/categories`

**Expected:**
- ✅ Hiển thị category tree với parent/child hierarchy
- ✅ Columns: Name, Code, Description, Unit, Active, Actions

### ✅ Test 7.6: Create Category

**Steps:**
1. Vào `/admin/categories`
2. Nhấn **"Create Category"**
3. Điền form:
   - Name: "Test Category"
   - Code: "TEST_CAT"
   - Description: "For testing"
   - Unit: Khoa Điều dưỡng
   - Parent: (None)
4. Nhấn **"Create"**

**Expected:**
- ✅ Category mới xuất hiện trong list
- ✅ Toast success

### ✅ Test 7.7: Create Sub-Category

**Steps:**
1. Vào `/admin/categories`
2. Nhấn **"Create Category"**
3. Điền form:
   - Name: "Test Sub-Category"
   - Code: "TEST_SUB"
   - Parent: Chọn "Test Category" (từ Test 7.6)
4. Nhấn **"Create"**

**Expected:**
- ✅ Sub-category xuất hiện nested dưới parent
- ✅ Indent hiển thị hierarchy

### ✅ Test 7.8: Delete Category

**Steps:**
1. Vào `/admin/categories`
2. Click **"Delete"** trên category KHÔNG có requests nào sử dụng
3. Confirm dialog

**Expected:**
- ✅ Category bị xóa khỏi list
- ✅ Toast success

**Steps 2:**
1. Thử delete category CÓ requests sử dụng
2. Confirm

**Expected:**
- ❌ Error: "Cannot delete category in use"
- ❌ Category vẫn còn trong list

---

## TEST SUITE 8: PROFILE PAGE

### ✅ Test 8.1: View Profile

**Steps:**
1. Đăng nhập as any user
2. Vào `/profile`

**Expected:**
- ✅ Hiển thị thông tin:
  - Full name
  - Email (readonly)
  - Phone
  - Unit (readonly)
  - Roles badges (readonly)
  - Created date

### ✅ Test 8.2: Edit Profile

**Steps:**
1. Vào `/profile`
2. Click **"Edit Profile"** button
3. Thay đổi:
   - Full Name: "New Name"
   - Phone: "0987654321"
4. Nhấn **"Save"**

**Expected:**
- ✅ Toast success
- ✅ Profile update với thông tin mới
- ✅ Email, Unit, Roles KHÔNG thay đổi (readonly)

---

## TEST SUITE 9: REPORTS PAGE

### ✅ Test 9.1: Reports - Admin View

**Steps:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Vào `/reports`

**Expected:**
- ✅ Hiển thị 4 stats cards: Total, Pending, Done, This Month
- ✅ Stats tính trên TẤT CẢ requests
- ✅ Section "Breakdown by Status" với bar chart style
- ✅ Section "Breakdown by Priority"

### ✅ Test 9.2: Reports - Manager View

**Steps:**
1. Đăng nhập as `manager01@eiu.edu.vn`
2. Vào `/reports`

**Expected:**
- ✅ Stats chỉ tính requests của unit "Khoa Điều dưỡng"
- ✅ Breakdown chỉ hiển thị data của unit

### ✅ Test 9.3: Reports - Access Control

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (User role)
2. Thử access `/reports`

**Expected:**
- ❌ Redirect → `/unauthorized`
- ❌ Hoặc 403 error page

---

## TEST SUITE 10: PERMISSIONS & SECURITY

### ✅ Test 10.1: Role-Based Menu Visibility

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn` (User role)
2. Kiểm tra menu

**Expected:**
- ✅ Thấy: Dashboard, Requests, Profile
- ❌ KHÔNG thấy: Admin, Reports

**Steps 2:**
1. Đăng nhập as `admin@eiu.edu.vn`
2. Kiểm tra menu

**Expected:**
- ✅ Thấy TẤT CẢ: Dashboard, Requests, Admin, Reports, Profile

### ✅ Test 10.2: Direct URL Access - Unauthorized

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Manual access URL: `/admin/users`

**Expected:**
- ❌ Redirect → `/unauthorized`

### ✅ Test 10.3: RLS Policies - User Cannot See Other's Requests

**Steps:**
1. Tạo request bằng `lecturer01@eiu.edu.vn`
2. Logout
3. Đăng nhập as `lecturer02@eiu.edu.vn` (User khác)
4. Vào `/requests`

**Expected:**
- ❌ KHÔNG thấy request của `lecturer01`
- ✅ Chỉ thấy requests của `lecturer02`

### ✅ Test 10.4: Action Buttons - Role-Based Visibility

**Steps:**
1. Đăng nhập as `lecturer01@eiu.edu.vn`
2. Vào request NEW (do mình tạo)

**Expected:**
- ❌ KHÔNG thấy button "Assign Request" (chỉ Manager/Admin)
- ✅ Thấy button "Cancel Request" (Creator can cancel)

**Steps 2:**
1. Đăng nhập as `manager01@eiu.edu.vn`
2. Vào cùng request NEW

**Expected:**
- ✅ Thấy button "Assign Request"
- ✅ Thấy button "Cancel Request" (Manager can cancel)

---

## TEST SUITE 11: RESPONSIVE DESIGN (Mobile)

### ✅ Test 11.1: Mobile Navigation

**Steps:**
1. Mở app trên mobile (hoặc DevTools responsive mode)
2. Đăng nhập

**Expected:**
- ✅ Menu chuyển sang hamburger icon
- ✅ Click hamburger → side drawer mở ra
- ✅ All menu items hiển thị đúng

### ✅ Test 11.2: Mobile Request List

**Steps:**
1. Vào `/requests` trên mobile

**Expected:**
- ✅ Table responsive (scroll horizontal hoặc card layout)
- ✅ Filters stack vertically
- ✅ Action buttons có kích thước phù hợp touch

### ✅ Test 11.3: Mobile Create Request Form

**Steps:**
1. Vào `/requests/create` trên mobile

**Expected:**
- ✅ Form fields stack vertically
- ✅ Inputs có kích thước đủ lớn cho touch
- ✅ Add/Remove item buttons dễ nhấn

---

## TEST SUITE 12: EDGE CASES

### ✅ Test 12.1: Empty States

**Steps:**
1. Đăng nhập as user MỚI (chưa có requests)
2. Vào `/dashboard`

**Expected:**
- ✅ Stats hiển thị 0
- ✅ Recent requests: "No requests yet" message

**Steps 2:**
1. Vào `/requests`

**Expected:**
- ✅ Empty state: "No requests found" với CTA "Create Request"

### ✅ Test 12.2: Very Long Text - Request Reason

**Steps:**
1. Vào `/requests/create`
2. Nhập lý do: 500+ characters
3. Submit

**Expected:**
- ✅ Lưu thành công
- ✅ Detail page hiển thị full text (không bị truncate)

### ✅ Test 12.3: Many Items - Request with 20+ Items

**Steps:**
1. Vào `/requests/create`
2. Add 20 items (click "Add Item" 20 lần)
3. Điền data cho tất cả items
4. Submit

**Expected:**
- ✅ Form handle được (không lag)
- ✅ Lưu thành công
- ✅ Detail page hiển thị tất cả 20 items (có pagination nếu cần)

### ✅ Test 12.4: Concurrent Status Changes

**Steps:**
1. Mở 2 browser tabs/windows
2. Tab 1: Đăng nhập as `staff01@eiu.edu.vn`
3. Tab 2: Đăng nhập as `admin@eiu.edu.vn`
4. Cả 2 tabs vào cùng 1 request IN_PROGRESS
5. Tab 1: Click "Mark as Done"
6. Tab 2: Click "Request More Info" (cùng lúc)

**Expected:**
- ✅ Chỉ 1 action thành công (race condition handled)
- ❌ Action kia fail với error "Invalid state transition"

---

## 🎯 TESTING COMPLETION CHECKLIST

| Test Suite | Total Tests | Passed | Failed | Notes |
|------------|-------------|--------|--------|-------|
| 1. Authentication | 5 | | | |
| 2. Dashboard | 3 | | | |
| 3. Create Request | 4 | | | |
| 4. Request List & Filters | 7 | | | |
| 5. Request Detail & Actions | 11 | | | |
| 6. Comments | 3 | | | |
| 7. Admin Pages | 8 | | | |
| 8. Profile | 2 | | | |
| 9. Reports | 3 | | | |
| 10. Permissions | 4 | | | |
| 11. Responsive | 3 | | | |
| 12. Edge Cases | 4 | | | |
| **TOTAL** | **57** | | | |

---

## 🐛 BUG REPORT TEMPLATE

Nếu phát hiện bug, ghi lại theo format:

```markdown
### Bug #[NUMBER]: [Short Description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Login as [role]
2. Navigate to [page]
3. Action: [what you did]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Logs**:
[Attach if available]

**Environment**:
- Browser: [Chrome 120, Safari 17, etc.]
- Device: [Desktop, iPhone 14, etc.]
- URL: [https://...]
```

---

## ✅ SIGN-OFF

Sau khi hoàn thành tất cả tests:

**Tested By**: _____________________  
**Date**: _____________________  
**Environment**: Production / Staging  
**Overall Status**: ✅ PASS / ❌ FAIL  

**Notes**:
- [ ] All critical tests passed
- [ ] All bugs logged in issue tracker
- [ ] App ready for production use

---

**Next Steps**: Nếu tất cả tests pass → App sẵn sàng cho end-users sử dụng! 🎉
