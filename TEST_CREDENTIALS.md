# 🔐 Test Account Credentials

> ⚠️ **IMPORTANT:** Chỉ dùng cho DEV environment!

---

## 📋 Test Accounts (Seed Data)

Sau khi setup Supabase và chạy `seed_dev.sql`, bạn có thể dùng những tài khoản sau để test:

### 1️⃣ Admin Account
```
Email:    admin@eiu.edu.vn
Password: Admin@123
Role:     Quản trị viên (Admin)
```
**Có thể:**
- Xem toàn bộ phiếu
- Quản lý users
- Quản lý danh mục
- Xem báo cáo

---

### 2️⃣ Manager Accounts

#### Manager 1 (Khoa Điều dưỡng)
```
Email:    manager01@eiu.edu.vn
Password: Manager@123
Role:     Quản lý vận hành
Unit:     Khoa Điều dưỡng
```

#### Manager 2 (Khoa Y Khoa)
```
Email:    manager02@eiu.edu.vn
Password: Manager@123
Role:     Quản lý vận hành
Unit:     Khoa Y Khoa
```

**Có thể:**
- Xem phiếu trong unit của mình
- Tiếp nhận yêu cầu (NEW)
- Giao phiếu cho Staff
- Duyệt phiếu

---

### 3️⃣ Staff Accounts

#### Staff 1 (Xử lý vật tư)
```
Email:    staff01@eiu.edu.vn
Password: Staff@123
Role:     Chuyên viên
```

#### Staff 2 (Xử lý thiết bị)
```
Email:    staff02@eiu.edu.vn
Password: Staff@123
Role:     Chuyên viên
```

**Có thể:**
- Xem phiếu được assign cho mình
- Cập nhật trạng thái (ASSIGNED → IN_PROGRESS → DONE)
- Thêm comment
- Đính kèm file

---

### 4️⃣ Lecturer/User Accounts

#### Lecturer 1 (GV)
```
Email:    lecturer01@eiu.edu.vn
Password: User@123
Role:     Giảng viên (User)
```

#### Lecturer 2 (GV)
```
Email:    lecturer02@eiu.edu.vn
Password: User@123
Role:     Giảng viên (User)
```

#### Lecturer 3 (Trợ giảng)
```
Email:    lecturer03@eiu.edu.vn
Password: User@123
Role:     Giảng viên (User)
```

**Có thể:**
- Tạo phiếu yêu cầu
- Xem phiếu mình tạo
- Thêm comment công khai
- Đính kèm file

---

### 5️⃣ Multi-role Account (Test)
```
Email:    multiuser@eiu.edu.vn
Password: Multi@123
Roles:    Manager + Staff (có thể test cả 2 quyền)
```

---

## 🧪 Test Scenarios

### Scenario 1: Tạo & Theo dõi Phiếu
1. Login với `lecturer01@eiu.edu.vn`
2. Tạo phiếu yêu cầu mới
3. Đợi Manager tiếp nhận
4. Đợi Staff xử lý

### Scenario 2: Quản lý Phiếu (Manager)
1. Login với `manager01@eiu.edu.vn`
2. Xem danh sách phiếu NEW
3. Giao phiếu cho Staff
4. Duyệt kết quả

### Scenario 3: Xử lý Phiếu (Staff)
1. Login với `staff01@eiu.edu.vn`
2. Xem phiếu được assign
3. Cập nhật status (ASSIGNED → IN_PROGRESS → DONE)
4. Thêm comment, đính kèm file

### Scenario 4: Admin Dashboard
1. Login với `admin@eiu.edu.vn`
2. Xem tất cả phiếu (tất cả status)
3. Quản lý users & danh mục
4. Xem báo cáo

---

## ⚙️ Cách Setup để Test Đầy Đủ

1. **Tạo Supabase Project:**
   - Vào https://supabase.com
   - Tạo project mới `yccv-dev`
   - Copy credentials vào `.env.local`

2. **Chạy Migration:**
   - SQL Editor → Paste `0001_init.sql` → Run

3. **Tạo Auth Users:**
   - SQL Editor → Paste script từ `MIGRATION_AND_SEED_GUIDE.md` Section 4 → Run

4. **Chạy Seed Data:**
   - SQL Editor → Paste `seed_dev.sql` → Run

5. **Test Login:**
   - Mở http://localhost:3000/login
   - Dùng các credentials ở trên

---

## 🔒 Security Notes

- ⚠️ Passwords này chỉ cho DEV
- ❌ Không bao giờ push credentials vào Git
- ✅ Production sẽ dùng strong passwords + OAuth

---

**Last Updated:** 2025-12-11
