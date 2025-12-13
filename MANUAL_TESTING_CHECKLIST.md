# ✅ Manual Testing Checklist (Yêu Cầu Công Việc App)

**🎯 Bạn cần test: 57 cases**  
**⏰ Ước tính: 2-3 giờ**  
**📍 Production URL:** https://yccv-kdd.vercel.app

---

## 🔴 **ƯU TIÊN CAO - Test trước** (20 tests)

### 1. Đăng nhập & Phân quyền (9 tests)
- [ ] 1. Đăng nhập Google OAuth → redirect về /dashboard
- [ ] 2. Đăng nhập với email hợp lệ → thành công
- [ ] 3. Đăng nhập với email ngoài domain cho phép → bị chặn
- [ ] 4. Đăng xuất → redirect về /login
- [ ] 5. Truy cập /dashboard khi chưa login → redirect về /login
- [ ] 6. Login với role `admin` → có menu "Quản trị"
- [ ] 7. Login với role `manager` → xem được users (read-only)
- [ ] 8. Login với role `staff` → chỉ xem requests được assign
- [ ] 9. Login với role `user` → chỉ xem requests của mình

**Cách test:**
1. Mở https://yccv-kdd.vercel.app
2. Click "Đăng nhập với Google"
3. Test với 4 accounts khác nhau (admin, manager, staff, user)

---

### 2. Tạo & Submit Yêu Cầu (6 tests)
- [ ] 11. Tạo draft → status = DRAFT
- [ ] 12. Submit yêu cầu → status = NEW, email gửi cho managers
- [ ] 15. Thêm 3+ items với categories khác nhau → all saved
- [ ] 16. Chọn priority URGENT → hiển thị đúng
- [ ] 17. Submit 6 requests liên tục → request thứ 6 bị rate limit

**Cách test:**
1. Click "Tạo yêu cầu mới"
2. Điền form: lý do, items, priority
3. Click "Lưu nháp" → check status
4. Click "Submit" → check email inbox

---

### 3. Upload Files (3 tests)
- [ ] 27. Upload JPG < 5MB → success
- [ ] 28. Upload PDF < 5MB → success
- [ ] 31. Delete attachment → file removed

**Cách test:**
1. Tạo/edit request
2. Click upload area
3. Chọn file JPG, PDF
4. Verify preview hiển thị
5. Click delete icon

---

### 4. Comments (2 tests)
- [ ] 33. Add comment → hiển thị trong list
- [ ] 34. Staff add internal comment → chỉ staff/manager/admin thấy

**Cách test:**
1. Mở request detail
2. Type comment → submit
3. Login với role khác để verify visibility

---

## 🟡 **ƯU TIÊN VỪA - Test sau** (25 tests)

### 5. Edit & Status Transitions (9 tests)
- [ ] 18. Edit request DRAFT → changes saved
- [ ] 19. Try edit request NEW → disabled
- [ ] 21. Manager assign NEW → staff → email sent
- [ ] 22. Staff mark ASSIGNED → IN_PROGRESS
- [ ] 23. Staff mark → NEED_INFO (with note) → email creator
- [ ] 24. Staff mark → DONE → email creator
- [ ] 25. Creator cancel DRAFT → status CANCELLED
- [ ] 26. Try NEW → DONE directly → error

**Cách test:**
1. Login as manager → assign request
2. Login as staff → update status
3. Verify emails received
4. Try invalid transitions

---

### 6. Search & Filter (7 tests)
- [ ] 37. Search "laptop" → matching results
- [ ] 38. Search request ID "123" → request found
- [ ] 39. Filter by status NEW, ASSIGNED → correct results
- [ ] 40. Filter by priority URGENT → correct results
- [ ] 41. Filter by date range → correct results
- [ ] 42. Combine multiple filters → intersection
- [ ] 43. Click "Clear" → all filters reset

**Cách test:**
1. Vào trang danh sách yêu cầu
2. Use search box
3. Use filter dropdowns
4. Check results match filters

---

### 7. Dashboard (4 tests)
- [ ] 44. Dashboard load → widgets hiển thị
- [ ] 45. Admin dashboard → see all stats
- [ ] 47. User dashboard → chỉ thấy own requests
- [ ] 49. Click "Create Request" → navigate to form

---

### 8. Email Testing ⚠️ (2 tests - **Cần domain verified trước**)
- [ ] 55. Click link in email → opens request detail
- [ ] 56. Check email appearance → HTML clean, readable

**⚠️ Prerequisites:**
1. Domain `eiumedlabs.com` phải "Verified" trong Resend
2. Vercel đã redeploy (apply env vars)

**Cách test:**
1. Submit request → check email inbox
2. Click link → verify opens correct request
3. Check HTML formatting (fonts, colors, layout)

---

### 9. Admin - Users (7 tests)
- [ ] 61. View users list → all users shown
- [ ] 62. Search user by name → found
- [ ] 63. Filter by role admin → correct results
- [ ] 64. Edit user → change phone, unit → saved
- [ ] 65. Change user role → updated
- [ ] 66. Deactivate user → is_active = false
- [ ] 67. Pagination with 50+ users → works

**Cách test:**
1. Login as admin
2. Menu "Quản trị" → "Users"
3. Test search, filter, edit

---

### 10. Admin - Categories (7 tests)
- [ ] 68. View categories → tree structure
- [ ] 69. Create category "Hardware" → created
- [ ] 70. Create child "Laptop" under "Hardware" → hierarchy shown
- [ ] 71. Edit category name → updated
- [ ] 72. Deactivate category → hidden in forms
- [ ] 73. Delete unused category → removed
- [ ] 74. Try delete parent with children → error or cascade

**Cách test:**
1. Login as admin
2. Menu "Quản trị" → "Categories"
3. Test CRUD operations

---

## 🟢 **ƯU TIÊN THẤP - Test cuối** (12 tests)

### 11. Profile (6 tests)
- [ ] 75. View profile → user info shown
- [ ] 76. Edit name → updated everywhere
- [ ] 77. Edit phone → saved
- [ ] 78. Upload avatar < 2MB → shown in header
- [ ] 79. Delete avatar → default avatar
- [ ] 80. Upload avatar > 2MB → error

**Cách test:**
1. Click avatar → "Profile"
2. Edit fields
3. Upload/delete avatar

---

### 12. Mobile (5 tests) 📱
- [ ] 81. Login on phone → works
- [ ] 82. Hamburger menu → opens/closes
- [ ] 83. Request list on phone → table scrolls
- [ ] 84. Create request on phone → form usable
- [ ] 85. Filters on phone → work

**Cách test:**
1. Mở site trên iPhone/Android
2. Test navigation, forms, tables

---

### 13. Performance (5 tests) - **Dùng DevTools**
- [ ] 86. Initial load time < 3 seconds
- [ ] 87. Request list load (100+ requests) < 2 seconds
- [ ] 88. Search performance < 1 second
- [ ] 89. Upload 5MB image < 5 seconds
- [ ] 90. 10 concurrent users → no errors

**Cách test:**
1. Chrome DevTools → Network tab
2. Measure load times
3. Use Lighthouse audit

---

## 📊 **PROGRESS TRACKER**

| Ưu tiên | Tests | Completed |
|---------|-------|-----------|
| 🔴 Cao | 20 | __ / 20 |
| 🟡 Vừa | 25 | __ / 25 |
| 🟢 Thấp | 12 | __ / 12 |
| **TOTAL** | **57** | **__ / 57** |

---

## 🐛 **NẾU GẶP LỖI**

### Lỗi đăng nhập
- Check Supabase Dashboard → Authentication → Users
- Verify email domain allowed

### Lỗi email không gửi
- Check Resend Dashboard → Domain status = "Verified"
- Check Vercel env vars: RESEND_API_KEY, EMAIL_FROM

### Lỗi upload file
- Check file size < 5MB
- Check file type (JPG, PNG, PDF, DOC, XLS)

### Lỗi permission denied
- Check user role in Supabase
- Verify RLS policies enabled

---

## 📝 **REPORT BUGS**

Khi gặp lỗi, ghi lại:
1. **Test case number:** (ví dụ: #23)
2. **Steps to reproduce:** (các bước làm)
3. **Expected result:** (kết quả mong đợi)
4. **Actual result:** (kết quả thực tế)
5. **Screenshot:** (nếu có)

**Example:**
```
Test #23: Staff mark NEED_INFO
Steps: Login as staff → Open request → Click "Need Info" → Enter note
Expected: Email sent to creator
Actual: Email not sent, error in console
Screenshot: [attach]
```

---

## ✅ **WHEN ALL TESTS PASS**

1. Update `TESTING_PLAN.md` with ✅
2. Update `FEATURE_CHECKLIST.md` to 100%
3. Tag release `v1.2.2` in Git
4. Notify stakeholders
5. Monitor production for 24-48 hours

---

## 📞 **NEED HELP?**

- **Resend:** https://resend.com/emails
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard
- **Production:** https://yccv-kdd.vercel.app

---

*Tạo bởi: GitHub Copilot*  
*Ngày: 2024*
