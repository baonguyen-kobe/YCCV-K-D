# Hệ thống Yêu cầu Công việc (YCCV)

Hệ thống quản lý yêu cầu vật tư/thiết bị với **Google OAuth + Email Whitelist**.

---

## ✨ Features

- 🔐 **Google OAuth Authentication** (không dùng email/password)
- 📧 **Email Whitelist** - Kiểm soát quyền truy cập
- 👥 **Role-based Permissions** (Admin, Manager, Staff, User)
- 📝 **Request Management** - Tạo, theo dõi, xử lý phiếu yêu cầu
- 💬 **Comments & Attachments** - Giao tiếp và đính kèm files
- 🔔 **Status Tracking** - Theo dõi trạng thái real-time
- 📊 **Admin Dashboard** - Quản lý users & categories

---

## 🚀 Quick Start (30 phút)

```bash
# 1. Setup Supabase - Run 3 SQL files
# 2. Configure Google OAuth
# 3. Test Local
npm install && npm run dev
```

**👉 Chi tiết**: [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md)

## 📚 Documentation

### Getting Started
- 🎯 **[ADMIN_QUICK_START.md](ADMIN_QUICK_START.md)** - Hướng dẫn nhanh (30 phút)
- 📖 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Chi tiết đầy đủ (45 phút)
- 📋 **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Danh sách tài liệu

### Management
- 👥 **[WHITELIST_SETUP.md](WHITELIST_SETUP.md)** - Quản lý whitelist users
- 🔑 **[OAUTH_ONLY_SETUP.md](OAUTH_ONLY_SETUP.md)** - Google OAuth chi tiết
- 🔧 **[RLS_FIX_QUICK.md](RLS_FIX_QUICK.md)** - Fix lỗi permissions

### Original Project Docs
- **PRD**: `../Mo_ta.md` - Mô tả yêu cầu dự án
- **Project Rules**: `../PROJECT_RULES.md` - Luật chung
- **Notes**: `NOTES.md` - Ghi chú, assumptions

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage)
- **Email**: Resend
- **Form**: react-hook-form + zod

## 🚀 Cách chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment

Copy `.env.example` sang `.env.local` và điền các giá trị:

```bash
cp .env.example .env.local
```

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📁 Cấu trúc thư mục

```
src/
├── actions/          # Server Actions (mutations)
├── app/
│   ├── (auth)/       # Auth routes (login)
│   ├── (dashboard)/  # Protected routes
│   ├── api/          # API routes (cron, webhooks)
│   └── auth/         # Auth callback
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Layout components
│   └── requests/     # Request-related components
├── lib/
│   ├── supabase/     # Supabase client helpers
│   ├── auth/         # Auth helpers
│   ├── permissions.ts
│   ├── utils.ts
│   └── constants.ts
└── types/            # TypeScript types

supabase/
└── migrations/       # SQL migrations
```

## 🗄 Database Migrations

```bash
# Apply migrations (requires Supabase CLI)
npx supabase db push
```

## 📝 Development Notes

Xem `NOTES.md` để biết:
- Assumptions đã đưa ra
- Gaps trong PRD
- Suggestions cho improvements

