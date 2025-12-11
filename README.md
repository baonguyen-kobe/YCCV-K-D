# Hệ thống Yêu cầu Công việc (YCCV)

Hệ thống quản lý yêu cầu công việc nội bộ cho Khoa Điều dưỡng - EIU.

## 📚 Tài liệu tham khảo

- **PRD**: `../Mo_ta.md` - Mô tả yêu cầu dự án (Source of Truth)
- **Project Rules**: `../PROJECT_RULES.md.md` - Luật chung cho project
- **Notes**: `NOTES.md` - Ghi chú, assumptions, gaps

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

