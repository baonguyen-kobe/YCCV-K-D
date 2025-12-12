# 📋 YCCV - Hệ thống Quản lý Yêu cầu Công việc

Hệ thống quản lý yêu cầu công việc cho Khoa Điều dưỡng - EIU.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## 🎯 Overview

YCCV (Yêu Cầu Công Việc) là hệ thống quản lý quy trình yêu cầu công việc nội bộ, hỗ trợ:
- ✅ Tạo và theo dõi yêu cầu công việc
- ✅ Phân quyền theo vai trò (Admin, Manager, Staff, User)
- ✅ Google OAuth authentication với whitelist
- ✅ Real-time notifications
- ✅ Comments và attachments
- ✅ Status tracking và workflow management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm hoặc yarn
- Supabase account (production) hoặc demo mode (development)

### Installation
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/yccv-app.git
cd yccv-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local với Supabase credentials

# Run migrations (nếu dùng Supabase)
# Xem DEPLOYMENT.md để biết chi tiết

# Start development server
npm run dev
```

### Demo Mode (No Supabase)
```bash
# Tạo .env.local với demo config
echo "NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key" >> .env.local

# Run app
npm run dev

# Navigate to http://localhost:3000
# Click "Vào Demo" button
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Auth pages (login)
│   │   ├── (dashboard)/       # Main app pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── admin/             # Admin features
│   │   ├── requests/          # Request management
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   │   ├── auth/              # Auth helpers
│   │   ├── supabase/          # Supabase clients
│   │   ├── demo-mode.ts       # Demo mode utilities
│   │   └── permissions.ts     # RBAC logic
│   ├── data/                  # Mock data for demo
│   ├── types/                 # TypeScript types
│   └── actions/               # Server actions
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── scripts/                   # Utility scripts
```

---

## 🔑 Features

### Authentication & Authorization
- Google OAuth with email whitelist
- Role-based access control (RBAC)
- 4 roles: Admin, Manager, Staff, User
- Row-level security (RLS) policies

### Request Management
- Create/Edit/Delete requests
- Status workflow: NEW → IN_PROGRESS → COMPLETED → CLOSED
- Priority levels: LOW, NORMAL, HIGH, URGENT
- Attachments support
- Comments and activity log
- Assignment to staff members

### Dashboard & Reports
- Overview statistics
- Role-based data filtering
- Recent requests feed
- Overdue alerts

### Admin Features
- User management
- Role assignments
- Category management
- Unit (department) management

---

## 🗄️ Database Schema

Xem [DATA_SCHEMA.md](DATA_SCHEMA.md) để biết chi tiết ERD và table structures.

**Key Tables:**
- `users` - User profiles and whitelist
- `roles` - Role definitions
- `user_roles` - Role assignments
- `requests` - Work requests
- `request_items` - Request line items
- `comments` - Comments on requests
- `units` - Departments/Units
- `categories` - Request categories

---

## 🚢 Deployment

### Quick Deploy to Vercel + Supabase

Xem [DEPLOYMENT.md](DEPLOYMENT.md) để có hướng dẫn đầy đủ.

**Summary:**
1. Push code to GitHub
2. Create Supabase project and run migrations
3. Setup Google OAuth credentials
4. Deploy to Vercel với environment variables
5. Add whitelisted users

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_GOOGLE_OAUTH_ID=your-google-client-id
```

---

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [DATA_SCHEMA.md](DATA_SCHEMA.md) - Database schema
- [ROADMAP.md](ROADMAP.md) - Development roadmap
- [CHANGELOG_1.2.3.md](CHANGELOG_1.2.3.md) - Version history
- [MASTER_PROMPT.md](MASTER_PROMPT.md) - AI automation prompt

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + Google OAuth
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **Validation:** Zod
- **Deployment:** Vercel
- **Icons:** Lucide React

---

## 🧪 Testing

```bash
# Run type check
npm run type-check

# Run lint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 📈 Roadmap

Xem [ROADMAP.md](ROADMAP.md) để biết kế hoạch phát triển.

**Completed (~85%):**
- ✅ Core request management
- ✅ RBAC and permissions
- ✅ Google OAuth + whitelist
- ✅ Demo mode
- ✅ Database schema with RLS
- ✅ Comments system

**In Progress:**
- 🔄 Email notifications
- 🔄 File upload/attachments
- 🔄 Advanced reporting

**Planned:**
- 📅 PDF export
- 📅 Mobile responsive improvements
- 📅 Audit log
- 📅 Activity timeline

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

---

## 📝 License

Internal use only - EIU Nursing Department

---

## 👥 Team

- **Developer:** [Your Name]
- **Organization:** EIU - Khoa Điều dưỡng
- **Contact:** [Your Email]

---

## 🐛 Issues & Support

- **GitHub Issues:** [Create Issue](https://github.com/YOUR_USERNAME/yccv-app/issues)
- **Email:** your-email@eiu.edu.vn
- **Documentation:** See `DEPLOYMENT.md` for deployment issues

---

## 🎉 Acknowledgments

- Next.js team for amazing framework
- Supabase for backend infrastructure
- shadcn/ui for beautiful components
- Vercel for deployment platform

---

**Version:** 1.2.2  
**Last Updated:** December 2025  
**Status:** ✅ Production Ready
