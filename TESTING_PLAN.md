# 🧪 TESTING PLAN - YCCV v1.2.2

**Last Updated:** Phase 5 Complete (94% features done)  
**Production URL:** https://yccv-kdd.vercel.app  
**Environment:** Vercel + Supabase

---

## 📋 PRE-TESTING CHECKLIST

### Environment Variables (Vercel Dashboard)
Verify these are set correctly:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | For cron jobs & admin |
| `RESEND_API_KEY` | ✅ | For email notifications |
| `EMAIL_FROM` | Optional | Sender email (default: noreply@yccv.app) |
| `CRON_SECRET` | ✅ | For cron job auth |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL for email links |

### Supabase Setup
- [ ] Run `0001_full_schema.sql` (initial schema)
- [ ] Run `0002_auto_fix_auth_rls.sql` (auth fixes)
- [ ] Run `0003_debug_auth_rls.sql` (diagnostics)
- [ ] Run `0004_storage_and_functions.sql` (storage buckets)
- [ ] Verify RLS is enabled on all tables
- [ ] Verify storage buckets exist (attachments, avatars)

---

## 🔐 PHASE 1: AUTHENTICATION TESTS

### 1.1 Google OAuth Login
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | First-time login (whitelisted) | Login with whitelisted Google account | Redirect to dashboard, user created with 'user' role | ⬜ |
| 2 | First-time login (not whitelisted) | Login with non-whitelisted account | Redirect to /unauthorized | ⬜ |
| 3 | Existing user login | Login again with existing account | Redirect to dashboard, auth_logs entry created | ⬜ |
| 4 | Logout | Click avatar → Sign out | Redirect to login page, session cleared | ⬜ |

### 1.2 Role-Based Access
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 5 | User role permissions | Login as 'user' role | Can create requests, view own requests only | ⬜ |
| 6 | Staff role permissions | Login as 'staff' role | Can view all requests, change status, assign self | ⬜ |
| 7 | Manager role permissions | Login as 'manager' role | Can view all, assign to others, manage categories | ⬜ |
| 8 | Admin role permissions | Login as 'admin' role | Full access including user management | ⬜ |
| 9 | Multi-role user | User with both 'admin' + 'user' roles | Should have combined permissions | ⬜ |
| 10 | Admin menu visibility | Login as non-admin | "Quản trị" menu hidden | ⬜ |

---

## 📝 PHASE 2: REQUEST MANAGEMENT TESTS

### 2.1 Create Request
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 11 | Create draft request | Fill form, add items, click Save | Request saved as DRAFT | ⬜ |
| 12 | Submit request | Create draft → Submit | Status changes to NEW | ⬜ |
| 13 | Validation - empty reason | Submit with empty reason | Error: "Vui lòng nhập lý do" | ⬜ |
| 14 | Validation - reason length | Enter > 500 chars | Truncated at 500, counter shows limit | ⬜ |
| 15 | Add multiple items | Add 3+ items with different categories | All items saved correctly | ⬜ |
| 16 | Priority selection | Select URGENT priority | Priority saved, displayed in list | ⬜ |
| 17 | Rate limiting | Submit 6 requests rapidly | Error after 5th: rate limit exceeded | ⬜ |

### 2.2 Edit Request
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 18 | Edit DRAFT request | Open DRAFT, modify, save | Changes saved | ⬜ |
| 19 | Edit non-DRAFT | Try to edit NEW/ASSIGNED request | Edit button disabled or error | ⬜ |
| 20 | Optimistic locking | Two users edit same request | Second user gets conflict error | ⬜ |

### 2.3 Status Transitions
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 21 | Assign request | Manager assigns NEW to staff | Status → ASSIGNED, email sent | ⬜ |
| 22 | Start work | Staff marks ASSIGNED → IN_PROGRESS | Status updated | ⬜ |
| 23 | Need info | Staff marks → NEED_INFO with note | Note required, email to creator | ⬜ |
| 24 | Complete request | Staff marks → DONE | Status DONE, email to creator | ⬜ |
| 25 | Cancel request | Creator cancels DRAFT | Status CANCELLED | ⬜ |
| 26 | Invalid transition | Try NEW → DONE directly | Error: invalid transition | ⬜ |

---

## 📎 PHASE 3: FILE ATTACHMENTS TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 27 | Upload image | Upload JPG < 5MB | File uploaded, preview shown | ⬜ |
| 28 | Upload document | Upload PDF < 5MB | File uploaded, download link | ⬜ |
| 29 | Upload oversized file | Upload file > 5MB | Error: file too large | ⬜ |
| 30 | Upload invalid type | Upload .exe file | Error: file type not allowed | ⬜ |
| 31 | Delete attachment | Click delete on attachment | File removed from storage | ⬜ |
| 32 | Max attachments | Upload 6th file | Error: max 5 files | ⬜ |

---

## 💬 PHASE 4: COMMENTS TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 33 | Add public comment | Type and submit comment | Comment visible to all | ⬜ |
| 34 | Add internal comment | Staff adds internal comment | Only staff/manager/admin see it | ⬜ |
| 35 | Comment on NEED_INFO | Creator replies to NEED_INFO | Email sent to assignee | ⬜ |
| 36 | Comment rate limit | Submit 6 comments rapidly | Rate limited | ⬜ |

---

## 🔍 PHASE 5: SEARCH & FILTER TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 37 | Search by reason | Search "laptop" | Matching requests shown | ⬜ |
| 38 | Search by request number | Search "123" | Request #123 shown | ⬜ |
| 39 | Filter by status | Select NEW, ASSIGNED | Only those statuses shown | ⬜ |
| 40 | Filter by priority | Select URGENT | Only URGENT requests shown | ⬜ |
| 41 | Filter by date range | Set date range | Only requests in range | ⬜ |
| 42 | Combined filters | Multiple filters at once | Intersection of all filters | ⬜ |
| 43 | Clear filters | Click reset | All filters cleared | ⬜ |

---

## 📊 PHASE 6: DASHBOARD TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 44 | Dashboard load | Navigate to /dashboard | Stats and widgets load | ⬜ |
| 45 | Admin dashboard | Login as admin | See all stats, all users | ⬜ |
| 46 | Staff dashboard | Login as staff | See assigned requests, pending tasks | ⬜ |
| 47 | User dashboard | Login as user | See own requests only | ⬜ |
| 48 | Recent requests | Check recent list | Shows latest 5 requests | ⬜ |
| 49 | Quick actions | Click "Create Request" | Navigates to create form | ⬜ |

---

## 📧 PHASE 7: EMAIL NOTIFICATION TESTS

### 7.1 Setup Required
- Configure Resend API key in Vercel
- Verify sender domain in Resend dashboard
- Test emails in Resend logs

| # | Test Case | Trigger | Expected Email | Status |
|---|-----------|---------|----------------|--------|
| 50 | NEW notification | Submit request | Email to staff/managers | ⬜ |
| 51 | ASSIGNED notification | Assign to staff | Email to assignee | ⬜ |
| 52 | NEED_INFO notification | Mark NEED_INFO | Email to creator | ⬜ |
| 53 | DONE notification | Mark DONE | Email to creator | ⬜ |
| 54 | CANCELLED notification | Cancel request | Email to creator | ⬜ |
| 55 | Reply notification | Creator comments on NEED_INFO | Email to assignee | ⬜ |
| 56 | Email links work | Click link in email | Opens correct request | ⬜ |

---

## ⏰ PHASE 8: CRON JOB TESTS

### 8.1 Setup Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 1 * * *"
  }]
}
```

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 57 | Manual cron trigger | Call `/api/cron/reminders` with Bearer token | Returns success JSON | ⬜ |
| 58 | Unauthorized access | Call without token | Returns 401 Unauthorized | ⬜ |
| 59 | Items due tomorrow | Create item with tomorrow deadline | Reminder email sent | ⬜ |
| 60 | Idempotency | Trigger cron twice same day | Second run skips already-sent | ⬜ |

---

## 👤 PHASE 9: USER MANAGEMENT TESTS (Admin)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 61 | View user list | Admin → User Management | All users listed | ⬜ |
| 62 | Create user | Add new whitelisted email | User can login | ⬜ |
| 63 | Edit user | Change user full_name | Name updated | ⬜ |
| 64 | Assign role | Add 'staff' role to user | User has new permissions | ⬜ |
| 65 | Remove role | Remove 'staff' role | Permissions revoked | ⬜ |
| 66 | Deactivate user | Toggle is_active off | User cannot login | ⬜ |
| 67 | Reactivate user | Toggle is_active on | User can login again | ⬜ |

---

## 📁 PHASE 10: CATEGORY MANAGEMENT TESTS (Admin)

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 68 | View categories | Admin → Categories | Tree view displayed | ⬜ |
| 69 | Create root category | Add "Hardware" | Category created | ⬜ |
| 70 | Create child category | Add "Laptop" under "Hardware" | Hierarchy shown | ⬜ |
| 71 | Edit category | Change name | Name updated | ⬜ |
| 72 | Deactivate category | Toggle is_active | Category hidden in forms | ⬜ |
| 73 | Delete category | Delete unused category | Category removed | ⬜ |
| 74 | Delete with children | Try delete parent with children | Error or cascade | ⬜ |

---

## 👤 PHASE 11: PROFILE TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 75 | View profile | Navigate to /profile | User info displayed | ⬜ |
| 76 | Edit name | Change full_name, save | Name updated everywhere | ⬜ |
| 77 | Edit phone | Change phone number | Phone saved | ⬜ |
| 78 | Upload avatar | Upload image < 2MB | Avatar displayed in header | ⬜ |
| 79 | Delete avatar | Remove current avatar | Default avatar shown | ⬜ |
| 80 | Invalid avatar | Upload > 2MB | Error: file too large | ⬜ |

---

## 📱 PHASE 12: MOBILE RESPONSIVENESS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 81 | Mobile login | Test on phone | Login works | ⬜ |
| 82 | Mobile navigation | Use hamburger menu | Menu opens/closes | ⬜ |
| 83 | Mobile request list | View requests on phone | Table scrolls horizontally | ⬜ |
| 84 | Mobile create form | Create request on phone | Form usable | ⬜ |
| 85 | Mobile filters | Use filters on phone | Filters work | ⬜ |

---

## ⚡ PHASE 13: PERFORMANCE TESTS

| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 86 | Initial load time | First visit to dashboard | < 3 seconds | ⬜ |
| 87 | Request list load | Load 100+ requests | < 2 seconds | ⬜ |
| 88 | Search performance | Search with many results | < 1 second | ⬜ |
| 89 | Image upload | Upload 5MB image | < 5 seconds | ⬜ |
| 90 | Concurrent users | 10 users simultaneously | No errors | ⬜ |

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Google Drive path with Vietnamese characters
**Description:** npm commands may fail due to special characters in path  
**Workaround:** Clone repo to path without special characters for local dev  
**Status:** Non-blocking for production (Vercel works fine)

### Issue 2: TypeScript errors in IDE
**Description:** Some imports may show errors in VS Code  
**Workaround:** Restart TS server, or ignore (production builds work)  
**Status:** Non-blocking

---

## 📈 TEST RESULTS SUMMARY

| Phase | Tests | Passed | Failed | Blocked |
|-------|-------|--------|--------|---------|
| 1. Authentication | 10 | ⬜ | ⬜ | ⬜ |
| 2. Request Management | 16 | ⬜ | ⬜ | ⬜ |
| 3. File Attachments | 6 | ⬜ | ⬜ | ⬜ |
| 4. Comments | 4 | ⬜ | ⬜ | ⬜ |
| 5. Search & Filter | 7 | ⬜ | ⬜ | ⬜ |
| 6. Dashboard | 6 | ⬜ | ⬜ | ⬜ |
| 7. Email Notifications | 7 | ⬜ | ⬜ | ⬜ |
| 8. Cron Job | 4 | ⬜ | ⬜ | ⬜ |
| 9. User Management | 7 | ⬜ | ⬜ | ⬜ |
| 10. Category Management | 7 | ⬜ | ⬜ | ⬜ |
| 11. Profile | 6 | ⬜ | ⬜ | ⬜ |
| 12. Mobile | 5 | ⬜ | ⬜ | ⬜ |
| 13. Performance | 5 | ⬜ | ⬜ | ⬜ |
| **TOTAL** | **90** | **0** | **0** | **0** |

---

## 🚀 POST-TESTING ACTIONS

### If All Tests Pass:
1. ✅ Update FEATURE_CHECKLIST to 100%
2. ✅ Tag release v1.2.2 in Git
3. ✅ Notify stakeholders
4. ✅ Monitor production for 24-48 hours

### If Tests Fail:
1. 📝 Document failures in this file
2. 🐛 Create issues for each failure
3. 🔧 Fix and re-test
4. 🔄 Repeat until all pass

---

## 📞 SUPPORT CONTACTS

- **Developer:** [Your Name]
- **Supabase:** https://supabase.com/dashboard
- **Vercel:** https://vercel.com/dashboard
- **Resend:** https://resend.com/emails

---

*Last tested: [DATE]*  
*Tested by: [NAME]*
