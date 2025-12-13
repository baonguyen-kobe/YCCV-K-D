# 📋 TỔNG HỢP TOÀN BỘ TRƯỜNG NHẬP LIỆU & ĐỊNH DẠNG DỮ LIỆU

**Phiên bản:** 1.2.2  
**Cập nhật:** 13 Tháng 12, 2025

---

## 📖 MỤC LỤC
1. [Form Tạo/Chỉnh Sửa Yêu Cầu](#1-form-tạochỉnh-sửa-yêu-cầu)
2. [Form Hồ Sơ Người Dùng](#2-form-hồ-sơ-người-dùng)
3. [Form Tạo/Edit Tài Khoản (Admin)](#3-formtạoedit-tài-khoản-admin)
4. [Form Bình Luận/Ghi Chú](#4-form-bình-luậnghi-chú)
5. [Form Đính Kèm File](#5-form-đính-kèm-file)
6. [Form Thay Đổi Trạng Thái](#6-form-thay-đổi-trạng-thái)

---

## 1️⃣ FORM TẠO/CHỈNH SỬA YÊU CẦU

**URL:** `/requests/create` hoặc `/requests/[id]/edit`  
**Component:** `src/components/requests/request-form.tsx`

### A. TRƯỜNG CHÍNH

#### 🔸 Lý do Yêu Cầu
```
Nhập liệu: Textarea
Bắt buộc: ✅ Yes
Min: 1 ký tự
Max: 1000 ký tự
Placeholder: "Mô tả chi tiết lý do và mục đích của yêu cầu này..."
```

**Validation Rules:**
- ✅ Không được để trống (min 1)
- ✅ Tối đa 1000 ký tự (MAX_REASON_LENGTH = 500 theo constants, nhưng document yêu cầu max 1000)
- ✅ Sử dụng `MAX_REASON_LENGTH` từ constants

**Ví dụ hợp lệ:**
- ✅ "A" (1 ký tự)
- ✅ "Cần mua 10 cái bàn chải tay để vệ sinh..." (dài)
- ✅ "Yêu cầu này rất quan trọng cho hoạt động..." (1000 ký tự)

**Ví dụ không hợp lệ:**
- ❌ "" (trống) → "Lý do yêu cầu không được để trống"
- ❌ "Lorem ipsum... [501 ký tự]" → "Lý do tối đa 1000 ký tự"

---

#### 🔸 Mức Ưu Tiên (Priority)
```
Nhập liệu: Radio Button (4 lựa chọn)
Bắt buộc: ✅ Yes
Default: "Bình thường"
```

**Lựa chọn:**
| Giá trị | Label | Mô tả | Màu |
|--------|-------|-------|-----|
| LOW | Thấp | Không gấp, có thể xử lý sau | Xám |
| NORMAL | Bình thường | Thời gian xử lý tiêu chuẩn | Xanh |
| HIGH | Cao | Cần xử lý sớm trong vòng 1-2 ngày | Cam |
| URGENT | Khẩn cấp | Cần xử lý ngay trong ngày | Đỏ |

**Validation Rules:**
- ✅ Bắt buộc chọn một trong 4 (enum)
- ✅ Default = "NORMAL"

---

### B. CHI TIẾT HẠNG MỤC (ITEMS) - LẶP LẠI

#### 🔸 Nội dung yêu cầu công việc
```
Nhập liệu: Text Input
Bắt buộc: ✅ Yes
Min: 1 ký tự
Max: 500 ký tự
Placeholder: "Ví dụ: Găng tay y tế size M"
```

**Validation Rules:**
- ✅ Không được để trống
- ✅ Tối đa 500 ký tự
- ❌ Không cho phép HTML/Script

**Ví dụ hợp lệ:**
- ✅ "A" (1 ký tự)
- ✅ "Bàn chải tay loại size M"
- ✅ "Máy photocopy FujiXerox - Model A3"

**Ví dụ không hợp lệ:**
- ❌ "" (trống)
- ❌ "<script>alert('xss')</script>" (nên trim)

---

#### 🔸 Danh Mục
```
Nhập liệu: Dropdown Select
Bắt buộc: ✅ Yes
Default: "-- Chọn danh mục --"
Options: [Lấy từ database]
```

**Validation Rules:**
- ✅ Tùy chọn, có thể để trống
- ✅ Khi chọn, phải là UUID hợp lệ (FK to categories table)
- ✅ Nếu không chọn, cảnh báo để bắt buộc chọn

**Ví dụ:**
- ✅ "c6a7b8c9-d1e2-f3a4-b5c6-d7e8f9a0b1c2" (UUID)

---

#### 🔸 Số Lượng
```
Nhập liệu: Number Input
Bắt buộc: ✅ Yes
Min: 0.01
Max: 9999
Step: 0.01
Type: number (HTML5)
```

**Validation Rules:**
- ✅ Bắt buộc nhập
- ✅ Phải ≥ 0.01
- ✅ Phải ≤ 9999
- ✅ Cho phép số thập phân (decimal)
- ✅ Form sẽ convert string → number (valueAsNumber)
- ✅ Schema sẽ coerce string → number (z.coerce.number())

**Ví dụ hợp lệ:**
- ✅ "1" → 1
- ✅ "1.5" → 1.5
- ✅ "10" → 10
- ✅ "0.5" → 0.5

**Ví dụ không hợp lệ:**
- ❌ "0" → "Số lượng phải lớn hơn 0"
- ❌ "-5" → "Số lượng phải lớn hơn 0"
- ❌ "abc" → "Invalid input: expected number, received string"
- ❌ "" (trống) → "Số lượng bắt buộc"

---

#### 🔸 Đơn Vị Tính
```
Nhập liệu: Text Input
Bắt buộc: ❌ No (Optional)
Max: 50 ký tự
Placeholder: "Cái, Hộp, Bộ..."
```

**Validation Rules:**
- ✅ Tùy chọn, có thể để trống
- ✅ Tối đa 50 ký tự
- ✅ Không validate format

**Ví dụ:**
- ✅ "cái" (đơn vị)
- ✅ "chiếc"
- ✅ "bộ"
- ✅ "hộp"
- ✅ "cuốn"
- ✅ "" (để trống OK)

---

#### 🔸 Ngày Cần
```
Nhập liệu: Date Input (HTML5)
Bắt buộc: ✅ Yes
Format: dd/mm/yyyy (hiển thị)
Value: YYYY-MM-DD (lưu)
Min: Hôm nay
Max: Không giới hạn
```

**Validation Rules:**
- ✅ Bắt buộc
- ✅ Nếu chọn, phải là datetime hợp lệ
- ✅ Không cho phép chọn ngày trong quá khứ
- ✅ Không thể để trống

**Ví dụ hợp lệ:**
- ✅ "2025-12-14" (ngày mai)
- ✅ "2025-12-31" (ngày trong tương lai)

**Ví dụ không hợp lệ:**
- ❌ "2025-12-12" (hôm qua, nếu hôm nay là 13-12-2025)
- ❌ "invalid-date"

---

#### 🔸 Link Tham Khảo
```
Nhập liệu: URL Input
Bắt buộc: ❌ No (Optional)
Type: url (HTML5)
Placeholder: "https://..."
```

**Validation Rules:**
- ✅ Tùy chọn, có thể để trống
- ✅ Nếu nhập, phải là URL hợp lệ (RFC 3986)
- ✅ Hỗ trợ: HTTP, HTTPS, Google Drive, Dropbox, etc.

**Ví dụ hợp lệ:**
- ✅ "https://docs.google.com/document/d/1ABC123/edit"
- ✅ "https://drive.google.com/file/d/1ABC123/view"
- ✅ "https://dropbox.com/s/abcd1234/file.pdf"
- ✅ "" (không nhập)

**Ví dụ không hợp lệ:**
- ❌ "không phải URL"
- ❌ "ftp://..." (chỉ HTTP/HTTPS)
- ❌ "http://" (không đủ)

---

#### 🔸 Ghi Chú
```
Nhập liệu: Text Input
Bắt buộc: ❌ No (Optional)
Max: 1000 ký tự
Placeholder: "Thông tin bổ sung về mục này..."
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Tối đa 1000 ký tự

**Ví dụ:**
- ✅ "Loại size M, màu xanh"
- ✅ "Cần gấp, mua ngay"
- ✅ "" (không ghi chú)

---

### C. ARRAY ITEMS VALIDATION

```
Số lượng hạng mục tối thiểu: 1
Số lượng hạng mục tối đa: 5
```

**Validation:**
- ❌ Phải có ít nhất 1 hạng mục → "Phải có ít nhất một mục yêu cầu"
- ✅ Có thể có tối đa 5 hạng mục
- ✅ Nút "Thêm mục" cho phép thêm hạng mục
- ✅ Nút "X" cho phép xóa hạng mục (nếu > 1)

---

## 2️⃣ FORM HỒ SƠ NGƯỜI DÙNG

**URL:** `/profile`  
**Component:** `src/components/profile/profile-form.tsx`

### A. TRƯỜNG NHẬP LIỆU

#### 🔸 Avatar (Không upload được, kiểm tra lại)
```
Nhập liệu: Image Upload
Bắt buộc: ❌ No (Optional)
Max Size: 5MB
Format: JPG, PNG, GIF, WebP
Hiển thị: Avatar 64x64px
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Kích thước max 5MB
- ✅ Loại: image/*

---

#### 🔸 Email
```
Hiển thị: Read-only
Bắt buộc: ✅ Yes (readonly)
Max: 255 ký tự
Format: email@domain.com
```

**Validation Rules:**
- ✅ Read-only, không thể sửa
- ✅ Email được xác thực khi đăng ký
- ✅ Không có option "Đổi email"

---

#### 🔸 Họ và Tên
```
Nhập liệu: Text Input
Bắt buộc: ✅ Yes (readonly)
Min: 1 ký tự
Max: 255 ký tự
```

**Validation Rules:**
- ✅ Có thể chỉnh thể sửa
- ✅ Nếu nhập, min 1 ký tự
- ✅ Max 255 ký tự
- ✅ Tên lấy theo thông tin đăng email đăng nhập từ tài khoản gmail nội bộ

**Ví dụ:**
- ✅ "Nguyễn Văn A"

---

#### 🔸 Số Điện Thoại
```
Nhập liệu: Text Input
Bắt buộc: ❌ No (Optional)
Max: 20 ký tự
Format: [0-9+\s\-\(\)]*
Placeholder: "(Chưa cập nhật)"
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Chỉ cho phép: số, dấu cách, dấu +, dấu -, ngoặc
- ✅ Max 20 ký tự

**Ví dụ hợp lệ:**
- ✅ "0912345678"
- ✅ "+84912345678"
- ✅ "+84 912 345 678" (với dấu cách)
- ✅ "(+84) 912-345-678" (với ngoặc và dấu gạch)
- ✅ "" (không nhập)

**Ví dụ không hợp lệ:**
- ❌ "0912345@678" (có @)
- ❌ "Call me now!" (có chữ)

---

#### 🔸 Phòng Ban (Unit)
```
Hiển thị: Read-only
Bắt buộc: ✅ Yes
Format: unit.name (text)
```

**Validation Rules:**
- ✅ Read-only, không thể sửa
- ✅ Chỉ dùng khi tạo user (admin)

---

#### 🔸 Vai Trò (Roles)
```
Hiển thị: Badge list (read-only)
Bắt buộc: ✅ Yes (for display)
Format: role.display_name
```

**Ví dụ:**
- ✅ Hiển thị: "Admin" / "Manager" / "Staff"
- ✅ Có thể có nhiều vai trò

---

#### 🔸 Ngày tạo tài khoản
```
Hiển thị: Badge list (read-only)
Bắt buộc: ✅ Yes (for display)
Format: dd/mm/yyyy
```
**Validation Rules:**
- ✅ Read-only, không thể sửa
- ✅ Lấy ngày khi được admin tạo tài khoản

---

## 3️⃣ FORM/TẠO/EDIT TÀI KHOẢN (ADMIN)

**URL:** `/admin/users`  
**API:** `src/actions/admin.ts`

### A. TRƯỜNG NHẬP LIỆU

#### 🔸 Email
```
Nhập liệu: Text Input
Bắt buộc: ✅ Yes
Max: 255 ký tự
Format: email@domain.com
Type: email (HTML5)
```

**Validation Rules:**
- ✅ Bắt buộc
- ✅ Phải là email hợp lệ (RFC 5322)
- ✅ Max 255 ký tự
- ✅ Unique (không trùng trong system)

**Ví dụ hợp lệ:**
- ✅ "user@example.com"
- ✅ "john.doe@company.com"
- ✅ "admin+test@domain.co.uk"

**Ví dụ không hợp lệ:**
- ❌ "user" → "Email không hợp lệ"
- ❌ "user@" → "Email không hợp lệ"
- ❌ "user@domain" → "Email không hợp lệ"
- ❌ "" (trống) → "Email không hợp lệ"

---

#### 🔸 Họ và Tên
```
Nhập liệu: Text Input
Bắt buộc: ✅ Yes
Min: 1 ký tự
Max: 255 ký tự
Placeholder: "Nguyễn Văn A"
```

**Validation Rules:**
- ✅ Bắt buộc
- ✅ Min 1 ký tự
- ✅ Max 255 ký tự

---

#### 🔸 Số Điện Thoại
```
Nhập liệu: Text Input
Bắt buộc: ❌ No (Optional)
Max: 20 ký tự
Format: [0-9+\s\-\(\)]*
```

**Validation Rules:** (Như hồ sơ người dùng)
- ✅ Tùy chọn
- ✅ Format: [0-9+\s\-\(\)]*
- ✅ Max 20 ký tự

---

#### 🔸 Phòng Ban (Unit)
```
Nhập liệu: Dropdown Select
Bắt buộc: ✅ Yes
Options: [Từ database - units table]
Default: "-- Chọn phòng ban --"
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Nếu chọn, phải là UUID hợp lệ (FK to units)

---

#### 🔸 Vai Trò (Roles)
```
Nhập liệu: Checkbox list hoặc Multi-select
Bắt buộc: ✅ Yes
Options: [Admin, Manager, Staff, ...]
Min: 1 vai trò
```

**Validation Rules:**
- ✅ Bắt buộc chọn ít nhất 1
- ✅ Có thể chọn nhiều vai trò
- ✅ Mỗi role phải là UUID hợp lệ

**Ví dụ:**
- ✅ [Admin]
- ✅ [Manager, Staff]
- ✅ [Admin, Manager, Staff]
- ❌ [] (chưa chọn) → "Cần chọn ít nhất 1 vai trò"

---

#### 🔸 Mật Khẩu
```
Nhập liệu: Password Input
Bắt buộc: ❌ No (Optional, nếu dùng OAuth)
Min: 8 ký tự
Max: 100 ký tự
Yêu cầu:
  - Chữ thường (a-z)
  - Chữ hoa (A-Z)
  - Chữ số (0-9)
  - Ký tự đặc biệt (@$!%*?&)
```

**Validation Rules:**
- ✅ Tùy chọn (nếu dùng Google OAuth)
- ✅ Nếu nhập, phải ≥ 8 ký tự
- ✅ Phải có chữ thường: [a-z]
- ✅ Phải có chữ hoa: [A-Z]
- ✅ Phải có chữ số: [0-9]
- ✅ Phải có ký tự đặc biệt: @$!%*?&

**Ví dụ hợp lệ:**
- ✅ "MyPass123!" (8 ký tự, đủ yêu cầu)
- ✅ "Admin@2024"
- ✅ "Secure$Pass99"

**Ví dụ không hợp lệ:**
- ❌ "12345678" → "Mật khẩu phải có chữ thường"
- ❌ "abcdefgh" → "Mật khẩu phải có chữ hoa"
- ❌ "Abcdefgh" → "Mật khẩu phải có chữ số"
- ❌ "Abcd1234" → "Mật khẩu phải có ký tự đặc biệt"
- ❌ "Pass1!" (6 ký tự) → "Mật khẩu tối thiểu 8 ký tự"

---

## 4️⃣ FORM BÌNH LUẬN/GHI CHÚ

**Component:** Inline comment form  
**Schema:** `addCommentSchema`

### A. TRƯỜNG NHẬP LIỆU

#### 🔸 Nội Dung Bình Luận
```
Nhập liệu: Textarea
Bắt buộc: ✅ Yes
Min: 1 ký tự
Max: 1000 ký tự
Rows: 3
Placeholder: "Nhập bình luận của bạn..."
```

**Validation Rules:**
- ✅ Bắt buộc
- ✅ Min 1 ký tự
- ✅ Max 1000 ký tự (MAX_COMMENT_LENGTH)

---

#### 🔸 Bình Luận Nội Bộ (is_internal)
```
Nhập liệu: Checkbox
Bắt buộc: ❌ No (Optional)
Default: false
Label: "Chỉ hiển thị cho staff"
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Boolean: true/false
- ✅ Default = false (public)
- ✅ Nếu checked = true (internal, chỉ staff thấy)

---

## 5️⃣ FORM ĐÍNH KÈM FILE

**Schema:** `attachmentSchema`

### A. TRƯỜNG NHẬP LIỆU (Chưa thấy trên giao diện người dùng)

#### 🔸 Tên File
```
Nhập liệu: Text Input (hoặc auto từ upload)
Bắt buộc: ✅ Yes
Min: 1 ký tự
Max: 255 ký tự
Extension: [pdf, doc, docx, xls, xlsx, jpg, jpeg, png, gif, webp]
```

**Validation Rules:**
- ✅ Bắt buộc
- ✅ Min 1 ký tự
- ✅ Max 255 ký tự
- ✅ Extension phải nằm trong whitelist
- ✅ Case-insensitive (.PDF = .pdf)

**Ví dụ hợp lệ:**
- ✅ "document.pdf"
- ✅ "Report.DOCX"
- ✅ "Photo.jpg"

**Ví dụ không hợp lệ:**
- ❌ "script.exe" → "Định dạng file không được phép"
- ❌ "malware.bat" → "Định dạng file không được phép"
- ❌ "" (trống) → "Tên file không được để trống"

---

#### 🔸 Loại File
```
Nhập liệu: Radio / Dropdown
Bắt buộc: ✅ Yes
Options:
  - "file" (Upload file)
  - "external_url" (Link bên ngoài)
```

**Validation Rules:**
- ✅ Bắt buộc chọn một trong 2
- ✅ "file": Upload từ máy
- ✅ "external_url": Paste URL (Google Drive, Dropbox, etc.)

---

#### 🔸 File Size (Nếu upload)
```
Loại: Number (bytes)
Bắt buộc: ❌ No (auto detect)
Max: 5242880 bytes (5MB)
```

**Validation Rules:**
- ✅ Auto calculate khi upload
- ✅ Max 5MB (5242880 bytes)
- ❌ > 5MB → "File quá lớn (tối đa 5MB)"

---

#### 🔸 MIME Type
```
Loại: String
Bắt buộc: ✅ Yes (nếu upload)
Whitelist:
  - Image: image/jpeg, image/png, image/gif, image/webp
  - PDF: application/pdf
  - Word: application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - Excel: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Validation Rules:**
- ✅ Auto-detect từ file
- ✅ Phải nằm trong whitelist ALLOWED_FILE_TYPES
- ❌ application/x-msdownload (.exe) → "Loại file MIME không được phép"
- ❌ application/x-sh (.sh) → "Loại file MIME không được phép"

---

#### 🔸 URL File (Nếu external_url)
```
Nhập liệu: URL Input
Bắt buộc: ✅ Yes (nếu type = external_url)
Format: https://...
Type: url (HTML5)
Placeholder: "https://drive.google.com/..."
```

**Validation Rules:**
- ✅ Bắt buộc nếu type = "external_url"
- ✅ Phải là URL hợp lệ (RFC 3986)
- ✅ Hỗ trợ: Google Drive, Dropbox, OneDrive, etc.

**Ví dụ hợp lệ:**
- ✅ "https://docs.google.com/document/d/1ABC/edit"
- ✅ "https://drive.google.com/file/d/1ABC/view"
- ✅ "https://dropbox.com/s/abcd1234/file.pdf"

---

#### 🔸 Max Attachments Per Request
```
Số tệp tối đa: 5 file
```

**Validation Rules:**
- ✅ Có thể attach tối đa 5 file
- ❌ > 5 file → "Tối đa 5 file đính kèm"

---

## 6️⃣ FORM THAY ĐỔI TRẠNG THÁI

**Schema:** `changeStatusSchema`

### A. TRƯỜNG NHẬP LIỆU

#### 🔸 Trạng Thái Mới
```
Nhập liệu: Dropdown Select hoặc Radio
Bắt buộc: ✅ Yes
Options: [DRAFT, NEW, ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED]
```

**Validation Rules:**
- ✅ Bắt buộc chọn
- ✅ Phải là enum hợp lệ
- ⏳ Nên validate state machine (chuyển tiếp hợp lệ)

---

#### 🔸 Ghi Chú
```
Nhập liệu: Textarea
Bắt buộc: ❌ No (Optional)
Max: 500 ký tự
Placeholder: "Ghi chú cho việc thay đổi trạng thái..."
```

**Validation Rules:**
- ✅ Tùy chọn
- ✅ Max 500 ký tự

---

#### 🔸 Ghi Chú Hoàn Thành (Nếu status = DONE)
```
Nhập liệu: Textarea
Bắt buộc: ❌ No (Optional)
Max: 500 ký tự
Placeholder: "Mô tả công việc đã hoàn thành..."
```

**Validation Rules:**
- ✅ Tùy chọn (nhưng nên required khi status = DONE)
- ✅ Max 500 ký tự

---

#### 🔸 Lý Do Hủy (Nếu status = CANCELLED)
```
Nhập liệu: Textarea
Bắt buộc: ✅ Yes (khi status = CANCELLED)
Min: 1 ký tự
Max: 500 ký tự
Placeholder: "Lý do hủy yêu cầu..."
```

**Validation Rules:**
- ✅ **Bắt buộc** nếu new_status = "CANCELLED"
- ✅ Min 1 ký tự
- ✅ Max 500 ký tự
- ❌ "" (trống khi CANCELLED) → "Lý do hủy bắt buộc"

---

## 📊 BẢNG TÓNG HỢP VALIDATION

| Trường | Form | Type | Bắt buộc | Min | Max | Validation |
|--------|------|------|----------|-----|-----|------------|
| Lý do yêu cầu | Request | Text | ✅ | 1 | 1000 | MAX_REASON_LENGTH |
| Độ ưu tiên | Request | Enum | ✅ | - | - | LOW, NORMAL, HIGH, URGENT |
| Tên vật phẩm | Request Items | Text | ✅ | 1 | 500 | Text input |
| Danh mục | Request Items | UUID | ❌ | - | - | FK categories |
| Số lượng | Request Items | Number | ✅ | 0.01 | 9999 | z.coerce.number() |
| Đơn vị tính | Request Items | Text | ❌ | - | 50 | Text input |
| Ngày cần | Request Items | Date | ❌ | - | - | DateTime, min: today |
| Link tham khảo | Request Items | URL | ❌ | - | - | RFC 3986 |
| Ghi chú mục | Request Items | Text | ❌ | - | 1000 | Text input |
| Email | Profile/User | Email | ✅ | - | 255 | RFC 5322 |
| Họ tên | Profile/User | Text | ❌ | 1 | 255 | Text input |
| Số điện thoại | Profile/User | Text | ❌ | - | 20 | [0-9+\s\-\(\)]* |
| Phòng ban | Profile/User | Text | ✅ | - | - | Read-only FK units |
| Vai trò | Profile/User | Badge[] | ✅ | - | - | Read-only from user_roles |
| Mật khẩu | User Create | Password | ❌ | 8 | 100 | [a-z][A-Z][0-9][@$!%*?&] |
| Vai trò (assign) | User Create | UUID[] | ✅ | 1 | - | Multi-select FK roles |
| Nội dung bình luận | Comment | Text | ✅ | 1 | 1000 | MAX_COMMENT_LENGTH |
| Nội bộ | Comment | Boolean | ❌ | - | - | Checkbox, default false |
| Tên file | Attachment | Text | ✅ | 1 | 255 | Valid extension |
| File size | Attachment | Number | ✅ | - | 5242880 | MAX_FILE_SIZE_BYTES |
| MIME type | Attachment | String | ✅ | - | - | ALLOWED_FILE_TYPES |
| URL file | Attachment | URL | ✅ | - | - | RFC 3986 (external_url) |
| Loại file | Attachment | Enum | ✅ | - | - | file, external_url |
| Max attachments | Attachment | Number | - | - | 5 | MAX_ATTACHMENTS_PER_REQUEST |
| Trạng thái mới | Status | Enum | ✅ | - | - | DRAFT, NEW, ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED |
| Ghi chú trạng thái | Status | Text | ❌ | - | 500 | MAX_COMPLETION_NOTE_LENGTH |
| Lý do hủy | Status | Text | ⚠️ * | 1 | 500 | MAX_CANCEL_REASON_LENGTH (cond.) |

**\* Conditional:** Bắt buộc khi new_status = "CANCELLED"

---

## 🔐 ADMIN MANAGEMENT PAGES

**URL Pattern:** `/admin/[section]`  
**Component Location:** `src/components/admin/[component].tsx`  
**Action Location:** `src/actions/admin.ts`

### Danh Sách Admin Pages (Tổng quát)

| Trang | URL | Component | Chức năng | Trạng thái |
|-------|-----|-----------|----------|-----------|
| Quản lý Người dùng | `/admin/users` | `user-management.tsx` | CRUD Users, assign roles | ✅ Implemented |
| Quản lý Danh mục | `/admin/categories` | `category-management.tsx` | CRUD Categories | ✅ Implemented |
| Quản lý Phòng ban | `/admin/units` | `unit-management.tsx` | CRUD Units | ❌ **TODO** |
| Quản lý Vai trò | `/admin/roles` | `role-management.tsx` | CRUD Roles, assign permissions | ❌ **TODO** |
| Quản lý Mức độ ưu tiên | `/admin/priorities` | `priority-config.tsx` | View/Edit priority display config | ❌ **TODO** |
| Quản lý Trạng thái | `/admin/statuses` | `status-config.tsx` | View/Edit status display config | ❌ **TODO** |
| Cơ sở dữ liệu | `/admin/database` | `database-management.tsx` | Backup, RLS policy, seed data | ❌ **Future** |

---

### 1️⃣ QUẢN LÝ NGƯỜI DÙNG (`/admin/users`)

**Component:** `src/components/admin/user-management.tsx`

**Chức năng:**
- ✅ Danh sách người dùng (paginated)
- ✅ Tạo người dùng mới
- ✅ Chỉnh sửa thông tin người dùng
- ✅ Xóa người dùng (soft delete via is_active)
- ✅ Phân công vai trò (assign roles)
- ✅ Kích hoạt/vô hiệu hóa tài khoản

**Form Fields:**
- Email ✅
- Họ tên ✅
- Số điện thoại ❌ (optional)
- Phòng ban ✅
- Vai trò (multi-select) ✅
- Mật khẩu ❌ (optional, nếu không dùng OAuth)
- Status (is_active) ✅

---

### 2️⃣ QUẢN LÝ DANH MỤC (`/admin/categories`)

**Component:** `src/components/admin/category-management.tsx`

**Chức năng:**
- ✅ Danh sách danh mục (tree view hoặc list)
- ✅ Tạo danh mục mới
- ✅ Chỉnh sửa danh mục
- ✅ Xóa danh mục
- ✅ Sắp xếp thứ tự (sort_order)
- ✅ Phân bộ theo phòng ban (unit_id)

**Form Fields:**
- Tên danh mục
- Mã danh mục (code)
- Mô tả (description)
- Danh mục cha (parent_id) - optional
- Phòng ban (unit_id) - optional
- Trạng thái (is_active)
- Thứ tự sắp xếp (sort_order)

---

### 3️⃣ QUẢN LÝ PHÒNG BAN (`/admin/units`) - **CẦN THÊM**

**Component:** `src/components/admin/unit-management.tsx` (New)

**Database Table:** `units`

**Chức năng:**
- CRUD Units (Khoa/Phòng ban)
- Danh sách hoạt động/không hoạt động
- Chỉnh sửa tên, mã code, mô tả
- Kích hoạt/vô hiệu hóa

**Form Fields:**
```
- Tên phòng ban (name)
  * Bắt buộc: ✅ Yes
  * Max: 255 ký tự
  * Ví dụ: "Ban Nhân Sự", "Khoa Kế Toán"

- Mã phòng ban (code)
  * Bắt buộc: ❌ No
  * Max: 50 ký tự
  * Ví dụ: "HR", "ACC"

- Mô tả (description)
  * Bắt buộc: ❌ No
  * Max: 500 ký tự

- Trạng thái (is_active)
  * Bắt buộc: ✅ Yes
  * Default: true
  * Checkbox
```

**Validation Rules:**
- ✅ Tên bắt buộc, min 1, max 255
- ✅ Code tùy chọn, max 50 (unique nếu có)
- ✅ Mô tả tùy chọn, max 500
- ✅ is_active boolean, default true

---

### 4️⃣ QUẢN LÝ VAI TRÒ (`/admin/roles`) - **CẦN THÊM**

**Component:** `src/components/admin/role-management.tsx` (New)

**Database Table:** `roles`

**Chức năng:**
- Danh sách vai trò có sẵn
- Xem chi tiết vai trò
- Chỉnh sửa tên, mô tả vai trò
- Xem người dùng có vai trò này

**Form Fields:**
```
- Tên vai trò (name)
  * Bắt buộc: ✅ Yes
  * Max: 100 ký tự
  * Ví dụ: "admin", "manager", "staff"

- Tên hiển thị (display_name)
  * Bắt buộc: ✅ Yes
  * Max: 100 ký tự
  * Ví dụ: "Quản trị viên", "Quản lý", "Nhân viên"

- Mô tả (description)
  * Bắt buộc: ❌ No
  * Max: 500 ký tự
  * Ví dụ: "Quản lý toàn bộ hệ thống, có quyền thực hiện tất cả thao tác"
```

**Validation Rules:**
- ✅ Name bắt buộc, min 1, max 100, unique, lowercase
- ✅ Display name bắt buộc, min 1, max 100
- ✅ Description tùy chọn, max 500
- ❌ Các vai trò mặc định (admin, manager, staff) không thể xóa

**Roles Có Sẵn:**
| Name | Display Name | Mô tả |
|------|--------------|-------|
| admin | Quản trị viên | Quyền đầy đủ |
| manager | Quản lý | Xem và phê duyệt yêu cầu |
| staff | Nhân viên | Chỉ tạo yêu cầu |

---

### 5️⃣ CẤU HÌNH MỨC ĐỘ ƯU TIÊN (`/admin/priorities`) - **CẦN THÊM**

**Component:** `src/components/admin/priority-config.tsx` (New)

**Chức năng:**
- Xem danh sách mức độ ưu tiên (read-only hoặc editable)
- Chỉnh sửa tên hiển thị, màu sắc, mô tả
- Xem số lượng request có mức độ này

**Priority Enum:**
```
- LOW (Thấp) - Màu Xám
- NORMAL (Bình thường) - Màu Xanh [DEFAULT]
- HIGH (Cao) - Màu Cam
- URGENT (Khẩn cấp) - Màu Đỏ
```

**Form Fields (Editable):**
```
- Tên ưu tiên (name) - Read-only
  * Ví dụ: "LOW", "NORMAL", "HIGH", "URGENT"

- Tên hiển thị (label)
  * Bắt buộc: ✅ Yes
  * Max: 100 ký tự
  * Ví dụ: "Thấp", "Bình thường", "Cao", "Khẩn cấp"

- Mô tả (description)
  * Bắt buộc: ❌ No
  * Max: 500 ký tự
  * Ví dụ: "Không gấp, có thể xử lý sau"

- Màu sắc (color)
  * Bắt buộc: ✅ Yes
  * Options: slate, blue, orange, red
  * Hiển thị: Color picker hoặc Select

- CSS Classes (bgClass, textClass)
  * Bắt buộc: ✅ Yes (auto-generate từ color)
  * Ví dụ: "bg-slate-100", "text-slate-700"

- Số lượng request
  * Hiển thị: Read-only badge/count
  * Ví dụ: "12 yêu cầu"
```

**Validation Rules:**
- ✅ Tên ưu tiên read-only
- ✅ Label bắt buộc, min 1, max 100
- ✅ Description tùy chọn, max 500
- ✅ Color bắt buộc, enum (slate, blue, orange, red)
- ✅ CSS classes auto-generate hoặc editable

---

### 6️⃣ CẤU HÌNH TRẠNG THÁI (`/admin/statuses`) - **CẦN THÊM**

**Component:** `src/components/admin/status-config.tsx` (New)

**Chức năng:**
- Xem danh sách trạng thái (read-only hoặc editable)
- Chỉnh sửa tên hiển thị, màu sắc, mô tả
- Xem quy tắc chuyển tiếp trạng thái (state machine)
- Xem số lượng request có trạng thái này

**Status Enum:**
```
- DRAFT (Nháp)
- NEW (Mới)
- ASSIGNED (Đã phân công)
- IN_PROGRESS (Đang xử lý)
- NEED_INFO (Cần thông tin)
- DONE (Hoàn thành)
- CANCELLED (Đã hủy)
```

**Form Fields (Editable):**
```
- Tên trạng thái (name) - Read-only
  * Ví dụ: "DRAFT", "NEW", "ASSIGNED"

- Tên hiển thị (label)
  * Bắt buộc: ✅ Yes
  * Max: 100 ký tự
  * Ví dụ: "Nháp", "Mới", "Đã phân công"

- Mô tả (description)
  * Bắt buộc: ❌ No
  * Max: 500 ký tự

- Màu sắc (color)
  * Bắt buộc: ✅ Yes
  * Options: gray, blue, yellow, purple, orange, green, red
  * Hiển thị: Color picker hoặc Select

- CSS Classes (bgClass, textClass)
  * Bắt buộc: ✅ Yes (auto-generate)

- Quy tắc chuyển tiếp (can_transition_to)
  * Hiển thị: Read-only list
  * Ví dụ: DRAFT → [NEW, CANCELLED]
  * Ví dụ: NEW → [ASSIGNED, CANCELLED, NEED_INFO]

- Số lượng request
  * Hiển thị: Read-only badge/count
  * Ví dụ: "5 yêu cầu"
```

**Validation Rules:**
- ✅ Tên trạng thái read-only
- ✅ Label bắt buộc, min 1, max 100
- ✅ Description tùy chọn, max 500
- ✅ Color bắt buộc, enum
- ✅ CSS classes auto-generate hoặc editable
- ✅ State machine transitions read-only (defined in code)

**State Machine (Quy Tắc Chuyển Tiếp):**
```
DRAFT → [NEW, CANCELLED]
NEW → [ASSIGNED, NEED_INFO, CANCELLED]
ASSIGNED → [IN_PROGRESS, NEED_INFO, CANCELLED]
IN_PROGRESS → [NEED_INFO, DONE, CANCELLED]
NEED_INFO → [ASSIGNED, IN_PROGRESS, CANCELLED]
DONE → [CANCELLED] (có thể reopen?)
CANCELLED → [] (no transitions, final state)
```

---

## 🎯 KIỂM DANH SÁCH TEST

### Request Form
- [ ] Lý do: 0 ký tự → ❌ Reject
- [ ] Lý do: 1 ký tự → ✅ Accept
- [ ] Lý do: 1000 ký tự → ✅ Accept
- [ ] Lý do: 1001 ký tự → ❌ Reject
- [ ] Số lượng: "0" → ❌ Reject
- [ ] Số lượng: "0.01" → ✅ Accept
- [ ] Số lượng: "1.5" → ✅ Accept
- [ ] Số lượng: "9999" → ✅ Accept
- [ ] Số lượng: "10000" → ❌ Reject
- [ ] Số lượng: "abc" → ❌ Reject (type error)
- [ ] Items count: 0 → ❌ Reject
- [ ] Items count: 1 → ✅ Accept
- [ ] Items count: 5 → ✅ Accept
- [ ] Items count: 6 → ❌ Reject

### User Form
- [ ] Email: "user@domain.com" → ✅ Accept
- [ ] Email: "invalid" → ❌ Reject
- [ ] Password: "Weak123" → ❌ Reject (no special char)
- [ ] Password: "Strong@123" → ✅ Accept
- [ ] Phone: "+84 912 345 678" → ✅ Accept
- [ ] Phone: "0912@#$" → ❌ Reject
- [ ] Roles: [] (empty) → ❌ Reject
- [ ] Roles: [admin, manager] → ✅ Accept

### File Upload
- [ ] File: "document.pdf" (5MB) → ✅ Accept
- [ ] File: "document.pdf" (5.1MB) → ❌ Reject
- [ ] File: "script.exe" → ❌ Reject
- [ ] Files: 5 files → ✅ Accept
- [ ] Files: 6 files → ❌ Reject

### Admin Pages
- [ ] Units: Create new unit → ✅ 
- [ ] Units: Edit unit name → ✅
- [ ] Units: Deactivate unit → ✅
- [ ] Roles: View roles list → ✅
- [ ] Roles: Cannot delete built-in roles → ✅
- [ ] Priorities: Edit label/color → ✅
### Admin Pages
- [ ] Units: Create new unit → ✅ 
- [ ] Units: Edit unit name → ✅
- [ ] Units: Deactivate unit → ✅
- [ ] Roles: View roles list → ✅
- [ ] Roles: Cannot delete built-in roles → ✅
- [ ] Priorities: Edit label/color → ✅
- [ ] Statuses: View state machine → ✅

---

**✅ Tất cả trường nhập liệu đã được kiểm tra và update (v1.2.2)**  
**✅ Bảng Validation đã được cập nhật theo dữ liệu thực tế**  
**✅ Admin Management Pages đã được tổng hợp (2 implemented + 4 TODO)**  
**📝 Last Updated:** 2025-12-13

### 📌 Ghi Chú Quan Trọng

1. **Lý do Yêu Cầu:** Constants.ts định nghĩa `MAX_REASON_LENGTH = 500`, nhưng document chỉ định max 1000. Cần kiểm tra lại requirement hoặc update constants.

2. **Admin Management:** Hiện tại chỉ implement 2 trang (Users, Categories). **Cần thêm 4 trang mới:**
   - `/admin/units` - Quản lý Phòng ban/Khoa (CRUD)
   - `/admin/roles` - Quản lý Vai trò (View/Edit)
   - `/admin/priorities` - Cấu hình Mức độ ưu tiên (View/Edit)
   - `/admin/statuses` - Cấu hình Trạng thái (View/Edit)

3. **State Machine:** Quy tắc chuyển tiếp trạng thái cần implement trong backend validation để đảm bảo data integrity.

4. **Priority/Status Config:** Các cấu hình này hiện lưu trong code (constants.ts). Nên xem xét:
   - Đưa vào database để admin có thể chỉnh sửa real-time (không cần redeploy)
   - Hoặc giữ trong code nhưng cung cấp giao diện read-only để admin xem

5. **Số Lượng Item:** Max 5 items per request (không phải 50)
