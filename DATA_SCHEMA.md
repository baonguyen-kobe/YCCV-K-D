# DATA SCHEMA - YCCV Database

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     units       │       │      roles      │       │   categories    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │       │ name            │
│ code            │       │ display_name    │       │ code            │
│ description     │       │ description     │       │ description     │
│ is_active       │       │ created_at      │       │ parent_id (FK)──┼──┐
│ created_at      │       └─────────────────┘       │ unit_id (FK)────┼──┼──┐
│ updated_at      │              │                  │ is_active       │  │  │
└────────┬────────┘              │                  │ sort_order      │  │  │
         │                       │                  │ created_at      │  │  │
         │                       │                  │ updated_at      │  │  │
         │                       │                  └─────────────────┘  │  │
         │                       │                         ▲             │  │
         │         ┌─────────────┴─────────────┐           │ (self-ref)  │  │
         │         │                           │           └─────────────┘  │
         │         ▼                           ▼                            │
         │  ┌─────────────────┐       ┌─────────────────┐                   │
         │  │   user_roles    │       │     users       │                   │
         │  ├─────────────────┤       ├─────────────────┤                   │
         │  │ id (PK)         │       │ id (PK/FK)──────┼──► auth.users     │
         │  │ user_id (FK)────┼──────►│ email           │                   │
         │  │ role_id (FK)────┼──┐    │ full_name       │                   │
         │  │ assigned_at     │  │    │ avatar_url      │◄──────────────────┘
         │  │ assigned_by(FK) │  │    │ phone           │
         │  └─────────────────┘  │    │ unit_id (FK)────┼──┐
         │                       │    │ is_active       │  │
         │                       │    │ created_at      │  │
         │                       │    │ updated_at      │  │
         │                       │    └────────┬────────┘  │
         │                       │             │           │
         └─────────────────────────────────────┼───────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              requests                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ id (PK)              │ assignee_id (FK) ──► users     │ version          │
│ request_number       │ assigned_at                    │ created_at       │
│ reason               │ completion_note                │ updated_at       │
│ priority (ENUM)      │ completed_at                   │                  │
│ status (ENUM)        │ cancel_reason                  │                  │
│ unit_id (FK) ──► units│ cancelled_at                  │                  │
│ unit_name_snapshot   │ cancelled_by (FK) ──► users   │                  │
│ created_by (FK) ──► users                            │                  │
└──────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ request_items   │  │request_comments │  │  request_logs   │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ request_id (FK) │  │ request_id (FK) │  │ request_id (FK) │
│ category_id(FK) │  │ user_id (FK)    │  │ user_id (FK)    │
│ item_name       │  │ content         │  │ action          │
│ unit_count      │  │ is_internal     │  │ old_status      │
│ quantity        │  │ created_at      │  │ new_status      │
│ required_at     │  │ updated_at      │  │ meta_data       │
│ link_ref        │  └─────────────────┘  │ created_at      │
│ notes           │                        └─────────────────┘
│ sort_order      │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  attachments    │  │   rate_limits   │  │   cron_logs     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ request_id (FK) │  │ user_id (FK)    │  │ job_name        │
│ file_name       │  │ action          │  │ job_date        │
│ file_type(ENUM) │  │ window_start    │  │ request_id      │
│ file_size       │  │ count           │  │ email_recipient │
│ file_url        │  └─────────────────┘  │ email_type      │
│ mime_type       │                        │ status          │
│ temp_token      │  ┌─────────────────┐  │ metadata        │
│ is_attached     │  │   auth_logs     │  │ created_at      │
│ uploaded_by(FK) │  ├─────────────────┤  └─────────────────┘
│ created_at      │  │ id (PK)         │
└─────────────────┘  │ user_id (FK)    │
                     │ email           │
                     │ ip_address      │
                     │ user_agent      │
                     │ success         │
                     │ failure_reason  │
                     │ logged_at       │
                     └─────────────────┘
```

## ENUM Types

```sql
-- Request Status (7 states)
CREATE TYPE request_status AS ENUM (
  'DRAFT',        -- Nháp, chưa gửi
  'NEW',          -- Mới gửi, chờ tiếp nhận
  'ASSIGNED',     -- Đã phân công
  'IN_PROGRESS',  -- Đang xử lý
  'NEED_INFO',    -- Cần thêm thông tin
  'DONE',         -- Hoàn thành
  'CANCELLED'     -- Đã hủy
);

-- Priority Levels
CREATE TYPE priority_level AS ENUM (
  'LOW',          -- Thấp
  'NORMAL',       -- Bình thường
  'HIGH',         -- Cao
  'URGENT'        -- Khẩn cấp
);

-- Attachment Type
CREATE TYPE attachment_type AS ENUM (
  'file',         -- File upload (< 5MB)
  'external_url'  -- External link (Google Drive, etc.)
);
```

## State Machine (Request Status Transitions)

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────────┐    │
│  DRAFT  │───►│   NEW   │───►│ ASSIGNED │───►│ IN_PROGRESS │────┤
└────┬────┘    └────┬────┘    └────┬─────┘    └──────┬──────┘    │
     │              │              │                  │           │
     │              │              │                  ▼           │
     │              │              │           ┌───────────┐      │
     │              │              │           │ NEED_INFO │──────┤
     │              │              │           └───────────┘      │
     │              │              │                              │
     ▼              ▼              ▼                              ▼
┌─────────────────────────────────────────────────────────┐  ┌────────┐
│                     CANCELLED                            │  │  DONE  │
└─────────────────────────────────────────────────────────┘  └────────┘

Legend:
  DRAFT → NEW          : User gửi phiếu
  NEW → ASSIGNED       : Manager phân công
  ASSIGNED → IN_PROGRESS : Staff bắt đầu xử lý
  IN_PROGRESS ↔ NEED_INFO : Cần/Đã có thêm thông tin
  IN_PROGRESS → DONE   : Hoàn thành
  * → CANCELLED        : Hủy phiếu (tùy quyền)
  DONE/CANCELLED → *   : Re-open (Admin only)
```

## Core Tables Summary

| Table | Records | Description |
|-------|---------|-------------|
| `units` | ~5 | Đơn vị/Khoa (Điều dưỡng, Y Khoa, ...) |
| `roles` | 4 | admin, manager, staff, user |
| `users` | ~20 | Người dùng (whitelist) |
| `user_roles` | ~25 | Mapping user ↔ roles (multi-role) |
| `categories` | ~10 | Danh mục/Nhóm việc (hierarchical) |
| `requests` | ~100+ | Phiếu yêu cầu công việc |
| `request_items` | ~200+ | Chi tiết hạng mục trong phiếu |
| `request_comments` | ~300+ | Trao đổi/comment |
| `request_logs` | ~500+ | Activity log tự động |
| `attachments` | ~50+ | File đính kèm |
| `rate_limits` | dynamic | Rate limiting per user/action |
| `cron_logs` | daily | Cron job idempotency |
| `auth_logs` | ~100+ | Login history |

## Key Relationships

1. **User → Unit**: Mỗi user thuộc 1 unit (FK)
2. **User ↔ Roles**: Many-to-many qua `user_roles`
3. **Request → User**: `created_by`, `assignee_id`, `cancelled_by`
4. **Request → Unit**: Snapshot unit tại thời điểm tạo
5. **Request → Items**: 1-to-many (cascade delete)
6. **Request → Comments**: 1-to-many
7. **Request → Logs**: 1-to-many (auto-created by trigger)
8. **Category → Parent**: Self-referencing (hierarchical)
9. **Category → Unit**: Optional (global vs unit-specific)

## RPC Functions

| Function | Purpose |
|----------|---------|
| `check_and_increment_rate_limit` | Rate limiting (5 req/min/user) |
| `update_request_with_locking` | Optimistic locking update |
| `create_request_atomic` | Create request + items atomically |
| `update_request_atomic` | Update request + items atomically |
| `user_has_role` | Check if user has specific role |
| `get_user_unit_id` | Get user's unit_id |

## Indexes

```sql
-- Requests
idx_requests_status
idx_requests_priority
idx_requests_created_by
idx_requests_assignee_id
idx_requests_unit_id
idx_requests_created_at
idx_requests_version

-- Request Items
idx_request_items_request_id
idx_request_items_required_at
idx_request_items_item_name (GIN - full text)

-- Comments
idx_request_comments_request_id
idx_request_comments_created_at
idx_request_comments_content (GIN - full text)

-- Rate Limits
idx_rate_limits_user_action

-- Users
idx_users_email
idx_users_unit_id
```

## Constraints

```sql
-- Data integrity
CHECK (quantity > 0)                    -- request_items
CHECK (LENGTH(TRIM(reason)) > 0)        -- requests
CHECK (LENGTH(TRIM(item_name)) > 0)     -- request_items

-- Unique
UNIQUE (user_id, role_id)               -- user_roles
UNIQUE (user_id, action, window_start)  -- rate_limits
UNIQUE (job_name, job_date, request_id, email_recipient, email_type) -- cron_logs
```
