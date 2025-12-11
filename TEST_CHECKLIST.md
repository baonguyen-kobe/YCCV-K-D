# 🧪 TEST CHECKLIST

Danh sách kiểm tra thủ công cho project YCCV.

---

## 📋 Pre-requisites

Trước khi test, đảm bảo:

- [ ] Đã setup Supabase project DEV
- [ ] Đã chạy migration `0001_init.sql`
- [ ] Đã tạo Auth users (theo MIGRATION_AND_SEED_GUIDE.md)
- [ ] Đã chạy seed data `seed_dev.sql`
- [ ] Đã copy `.env.example` → `.env.local` và điền credentials
- [ ] `npm run dev` đang chạy

---

## 🔹 1. Basic Navigation (No Auth)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1.1 | Mở `http://localhost:3000` | Trang landing hiển thị | ☐ |
| 1.2 | Mở `/login` | Trang login hiển thị | ☐ |
| 1.3 | Mở `/dashboard` (chưa login) | Redirect về `/login` | ☐ |
| 1.4 | Mở `/requests` (chưa login) | Redirect về `/login` | ☐ |
| 1.5 | Mở `/admin/users` (chưa login) | Redirect về `/login` | ☐ |

---

## 🔹 2. Authentication

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 2.1 | Login với `admin@eiu.edu.vn` / `Admin@123` | Redirect về `/dashboard` | ☐ |
| 2.2 | Login với `lecturer01@eiu.edu.vn` / `User@123` | Redirect về `/dashboard` | ☐ |
| 2.3 | Login với email không tồn tại | Hiện lỗi "Invalid credentials" | ☐ |
| 2.4 | Login với password sai | Hiện lỗi "Invalid credentials" | ☐ |
| 2.5 | Click Logout | Redirect về `/login`, session cleared | ☐ |

---

## 🔹 3. Dashboard (Authenticated)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 3.1 | Mở `/dashboard` sau login | Hiện trang Dashboard | ☐ |
| 3.2 | Navigation links hoạt động | Click "Yêu cầu" → `/requests` | ☐ |
| 3.3 | Hiển thị đúng tên user đăng nhập | Có tên/email ở header | ☐ |

---

## 🔹 4. Requests List

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 4.1 | Mở `/requests` | Hiện danh sách phiếu | ☐ |
| 4.2 | Click "Tạo yêu cầu" | Navigate đến `/requests/create` | ☐ |
| 4.3 | Click vào 1 phiếu | Navigate đến `/requests/[id]` | ☐ |

---

## 🔹 5. Request Detail

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 5.1 | Mở `/requests/[id]` của phiếu có quyền xem | Hiện chi tiết phiếu | ☐ |
| 5.2 | Click "Quay lại" | Navigate về `/requests` | ☐ |

---

## 🔹 6. Role-based Access

### As Admin (`admin@eiu.edu.vn`)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 6.1 | Mở `/admin/users` | Hiện trang quản lý users | ☐ |
| 6.2 | Mở `/admin/categories` | Hiện trang quản lý danh mục | ☐ |
| 6.3 | Mở `/reports` | Hiện trang báo cáo | ☐ |
| 6.4 | Xem được tất cả phiếu | Danh sách hiện tất cả statuses | ☐ |

### As Manager (`manager01@eiu.edu.vn`)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 6.5 | Mở `/admin/users` | Redirect về `/unauthorized` hoặc 403 | ☐ |
| 6.6 | Mở `/reports` | Hiện trang báo cáo | ☐ |
| 6.7 | Xem phiếu trong unit của mình | Chỉ thấy phiếu của Nursing unit | ☐ |

### As Staff (`staff01@eiu.edu.vn`)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 6.8 | Mở `/admin/users` | Redirect về `/unauthorized` hoặc 403 | ☐ |
| 6.9 | Xem danh sách phiếu | Chỉ thấy phiếu được assign cho mình | ☐ |

### As User (`lecturer01@eiu.edu.vn`)

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 6.10 | Mở `/admin/users` | Redirect về `/unauthorized` hoặc 403 | ☐ |
| 6.11 | Xem danh sách phiếu | Chỉ thấy phiếu mình tạo | ☐ |
| 6.12 | Có thể tạo phiếu mới | Form tạo phiếu hoạt động | ☐ |

---

## 🔹 7. Responsive Design

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 7.1 | Mở trên Desktop (1920x1080) | Layout đầy đủ, có sidebar | ☐ |
| 7.2 | Mở trên Tablet (768px) | Layout điều chỉnh hợp lý | ☐ |
| 7.3 | Mở trên Mobile (375px) | Layout mobile, có menu hamburger | ☐ |

---

## 🔹 8. Error Handling

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 8.1 | Mở `/requests/invalid-uuid` | Hiện 404 hoặc error page | ☐ |
| 8.2 | Mở URL không tồn tại `/xyz` | Hiện 404 page | ☐ |

---

## 📝 Notes

- Test cases đánh dấu ☐ = Chưa test
- Test cases đánh dấu ✅ = Passed
- Test cases đánh dấu ❌ = Failed (ghi note lý do)

---

## 🐛 Known Issues

> Ghi lại các issues phát hiện khi test

1. _(Chưa có)_

---

**Last Updated:** 2025-12-11
