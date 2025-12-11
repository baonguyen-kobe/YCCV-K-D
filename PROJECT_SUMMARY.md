# 📊 PROJECT SUMMARY: Hệ thống Quản lý Yêu cầu Công việc (YCCV)

> **Khoa Điều dưỡng - Trường Đại học Quốc tế Đông Á (EIU)**  
> **Generated:** 2025-01-XX  
> **Scaffolding Phase:** ✅ COMPLETE  

---

## 🎯 1. Tổng quan Project

### 1.1 Mục tiêu
Xây dựng hệ thống web nội bộ để quản lý yêu cầu công việc với:
- 7 trạng thái workflow: `DRAFT → NEW → ASSIGNED → IN_PROGRESS ↔ NEED_INFO → DONE/CANCELLED`
- 4 vai trò người dùng: Admin, Manager, Staff, User (hỗ trợ multi-role)
- Quy mô: ~20 người dùng nội bộ

### 1.2 Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript strict, Tailwind CSS v4 |
| **UI Components** | shadcn/ui (14 components) |
| **Backend** | Supabase (PostgreSQL, Auth SSR, Storage) |
| **Email** | Resend + @react-email/components |
| **Forms** | react-hook-form + zod + @hookform/resolvers |
| **Toast** | sonner |
| **Cron** | Vercel Cron (daily reminders) |
| **Deploy** | Vercel |

### 1.3 Thống kê Project
```
📁 Total Files:     47 files (.ts, .tsx, .sql, .md)
📦 Total Size:      139.5 KB (source code only)
📂 Main Folders:    src/, supabase/
```

---

## 📁 2. Cấu trúc Project

```
yccv-app/
├── 📄 package.json              # Dependencies & scripts
├── 📄 .env.example              # Environment variables template
├── 📄 NOTES.md                  # Development notes & gaps
├── 📄 PROJECT_SUMMARY.md        # This file
│
├── 📂 supabase/
│   └── migrations/
│       └── 0001_init.sql        # Full DB schema (~450 lines)
│
└── 📂 src/
    ├── 📂 actions/              # Server Actions
    │   ├── admin.ts             # Admin operations (stub)
    │   ├── auth.ts              # Auth operations (stub)
    │   └── requests.ts          # Request CRUD (stub)
    │
    ├── 📂 app/
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Landing page
    │   ├── unauthorized/        # 403 page
    │   │
    │   ├── 📂 (auth)/           # Auth group (no sidebar)
    │   │   ├── layout.tsx
    │   │   └── login/page.tsx
    │   │
    │   ├── 📂 (dashboard)/      # Protected routes
    │   │   ├── layout.tsx       # Dashboard layout with sidebar
    │   │   ├── dashboard/       # Main dashboard
    │   │   ├── requests/        # List, Create, [id] Detail
    │   │   ├── profile/         # User profile
    │   │   ├── reports/         # Reports page
    │   │   └── admin/           # Admin-only pages
    │   │       ├── users/
    │   │       └── categories/
    │   │
    │   ├── 📂 api/
    │   │   └── cron/reminders/route.ts
    │   │
    │   └── 📂 auth/
    │       └── callback/route.ts
    │
    ├── 📂 components/
    │   └── ui/                  # 14 shadcn/ui components
    │
    ├── 📂 lib/
    │   ├── auth/index.ts        # Auth helpers (144 lines)
    │   ├── constants.ts         # App constants (138 lines)
    │   ├── permissions.ts       # State machine & permissions (435 lines)
    │   ├── utils.ts             # Utility functions (132 lines)
    │   ├── validations.ts       # Zod schemas (254 lines)
    │   └── supabase/
    │       ├── client.ts        # Browser Supabase client
    │       └── server.ts        # Server Supabase client
    │
    ├── 📂 types/
    │   └── database.types.ts    # TypeScript types (~250 lines)
    │
    └── middleware.ts            # Auth guard & route protection
```

---

## 🗄️ 3. Database Schema

### 3.1 Enums
```sql
request_status: DRAFT, NEW, ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED
request_priority: LOW, NORMAL, HIGH, URGENT
attachment_type: FILE, LINK
```

### 3.2 Tables (10)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `units` | Đơn vị/Phòng ban | name, code, is_active |
| `roles` | 4 vai trò cố định | name (admin/manager/staff/user) |
| `users` | Danh sách users (whitelist) | email, full_name, unit_id, is_active |
| `user_roles` | Multi-role mapping | user_id, role_id |
| `categories` | Danh mục phân cấp | name, parent_id, is_active |
| `requests` | Yêu cầu chính | title, status, priority, category_id, creator_id, assigned_to |
| `request_items` | Chi tiết từng mục | request_id, title, quantity, unit |
| `request_comments` | Bình luận | request_id, user_id, content, is_internal |
| `attachments` | File đính kèm | request_id, file_name, file_url, type |
| `request_logs` | Log thay đổi (auto) | request_id, action, old_status, new_status |
| `auth_logs` | Log đăng nhập | user_id, action, ip_address |

### 3.3 Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies defined for CRUD operations
- ✅ Triggers for auto-logging status changes
- ✅ Indexes on foreign keys & frequently queried columns

---

## 🔐 4. Permission System

### 4.1 State Machine
```
DRAFT ─────────────┐
                   ▼
                  NEW ────────────────────────────────┐
                   │                                   │
                   ▼                                   │
               ASSIGNED ──────────────────────────────┤
                   │                                   │
                   ▼                                   │
             IN_PROGRESS ◄──────► NEED_INFO           │
                   │                   │              │
                   ▼                   ▼              ▼
                 DONE              CANCELLED ◄───────┘
```

### 4.2 Core Permission Functions (20+)

```typescript
// Role checks
hasRole(user, 'admin')
hasAnyRole(user, ['admin', 'manager'])
isAdmin(user), isManager(user), isStaff(user)

// Request access
canViewRequest(user, request)
canEditRequest(user, request)
canDeleteRequest(user, request)

// Status transitions
canChangeStatus(user, request, newStatus)
getAvailableStatuses(user, request)

// Actions
canAssign(user, request)
canAddInternalComment(user)
canCancelRequest(user, request)
canReopenRequest(user, request)

// Admin features
canManageUsers(user)
canManageCategories(user)
canViewAllRequests(user)
```

---

## 📋 5. Zod Validation Schemas

| Schema | Purpose |
|--------|---------|
| `loginSchema` | Email + optional password |
| `createRequestSchema` | Full request with items |
| `updateRequestSchema` | Partial update |
| `changeStatusSchema` | Status transition + comment |
| `assignRequestSchema` | Assign to staff/user |
| `addCommentSchema` | Comment with internal flag |
| `addAttachmentSchema` | File or link attachment |
| `createUserSchema` | User creation (admin) |
| `updateUserSchema` | User update (admin) |
| `createCategorySchema` | Category with parent |
| `profileUpdateSchema` | Self profile update |

---

## 🛣️ 6. Routes & Access Control

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/auth/callback` | Public | OAuth callback |
| `/dashboard` | All authenticated | Main dashboard |
| `/requests` | All authenticated | Request list |
| `/requests/create` | All authenticated | Create new request |
| `/requests/[id]` | Permission-based | Request detail |
| `/profile` | All authenticated | User profile |
| `/admin/users` | Admin only | User management |
| `/admin/categories` | Admin only | Category management |
| `/reports` | Admin/Manager | Reports & analytics |
| `/api/cron/reminders` | Vercel Cron | Daily reminder job |

---

## ⚙️ 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Cron Secret
CRON_SECRET=
```

---

## 📊 8. Files by Size

### Core Logic Files (Largest → Smallest)
| File | Size | Lines | Purpose |
|------|------|-------|---------|
| `permissions.ts` | 14.9 KB | ~435 | State machine & all permission functions |
| `validations.ts` | 9.6 KB | ~254 | All Zod validation schemas |
| `database.types.ts` | 8.3 KB | ~250 | Full TypeScript types |
| `constants.ts` | 4.3 KB | ~138 | App constants & configs |
| `auth/index.ts` | 3.9 KB | ~144 | Auth helper functions |
| `utils.ts` | 3.7 KB | ~132 | Utility functions |
| `middleware.ts` | 2.7 KB | ~80 | Auth guard & routing |

### Database
| File | Size | Purpose |
|------|------|---------|
| `0001_init.sql` | ~15 KB | Full schema, RLS, triggers, seed |

---

## ✅ 9. Scaffolding Checklist

### Completed (5/5 STEPS)
- [x] **STEP 1:** Project initialization (Next.js, dependencies, .env.example)
- [x] **STEP 2:** Project structure (folders, placeholders, middleware, layouts)
- [x] **STEP 3:** Database schema (SQL migration, TypeScript types)
- [x] **STEP 4:** Permissions logic (permissions.ts, validations.ts, auth helpers)
- [x] **STEP 5:** Documentation (NOTES.md with gaps, assumptions, suggestions)

### Ready for Implementation
- [ ] Setup Supabase project & run migration
- [ ] Configure Google OAuth provider
- [ ] Implement login UI & auth flow
- [ ] Implement Create Request form
- [ ] Implement Request List with filters
- [ ] Implement Request Detail page
- [ ] Implement Status change actions
- [ ] Implement Comment system
- [ ] Implement File upload
- [ ] Implement Admin pages
- [ ] Implement Dashboard analytics
- [ ] Setup email templates
- [ ] Configure Vercel Cron

---

## 📝 10. Key Decisions & Assumptions

See `NOTES.md` for full details. Highlights:

1. **Auth:** Hybrid Google OAuth + local password (whitelist via `is_active`)
2. **Multi-role:** User can have multiple roles (union of permissions)
3. **State Machine:** Only valid transitions allowed (enforced in code + DB trigger)
4. **Soft Delete:** `is_active` flag instead of hard delete
5. **Snapshot Fields:** `category_snapshot`, `unit_snapshot` stored in requests
6. **Internal Comments:** Only visible to admin/manager/staff
7. **File Storage:** Supabase Storage with 10MB limit per file
8. **Reminder Logic:** Daily cron at 8:00 AM, only NEW/ASSIGNED/IN_PROGRESS

---

## 🔗 11. Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| PRD v7.0 | `d:\YCCV\Mo_ta.md` | Business requirements |
| Project Rules | `d:\YCCV\PROJECT_RULES.md.md` | Technical standards |
| Agent Contract | `d:\YCCV\AGENT_CONTRACT_SCAFFOLDING.md` | Implementation guide |
| Development Notes | `d:\YCCV\yccv-app\NOTES.md` | Gaps & suggestions |

---

## 🚀 12. Quick Start (After Scaffolding)

```bash
# 1. Create Supabase project at supabase.com
# 2. Copy .env.example to .env.local and fill values

# 3. Run database migration
npx supabase link --project-ref <your-project-ref>
npx supabase db push

# 4. Configure Google OAuth in Supabase Dashboard
# 5. Start development
npm run dev

# 6. Open http://localhost:3000
```

---

**Status:** 🟢 Scaffolding Complete - Ready for Feature Implementation
