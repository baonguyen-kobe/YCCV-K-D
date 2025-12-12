/**
 * Mock data for demo mode
 * Used when Supabase is not configured
 */

import type {
  RequestStatus,
  Priority
} from "@/types/database.types";

// Alias for compatibility
type PriorityLevel = Priority;

// ============================================================
// MOCK USERS
// ============================================================

export const mockUsers = [
  {
    id: "00000000-0000-0000-0001-000000000001",
    email: "bao.nguyen@eiu.edu.vn",
    full_name: "Nguyễn Nhựt Bảo",
    phone: "0901000001",
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0001-000000000002",
    email: "vi.pham@eiu.edu.vn",
    full_name: "Phạm Thị Thúy Vi",
    phone: "0901000002",
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0001-000000000004",
    email: "staff01@eiu.edu.vn",
    full_name: "Lê Chuyên Viên",
    phone: "0901000004",
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0001-000000000006",
    email: "lecturer01@eiu.edu.vn",
    full_name: "Võ Giảng Viên",
    phone: "0901000006",
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

// ============================================================
// MOCK UNITS
// ============================================================

export const mockUnits = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Khoa Điều dưỡng",
    code: "NURSING",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Khoa Y Khoa",
    code: "MEDICINE",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

// ============================================================
// MOCK ROLES
// ============================================================

export const mockRoles = [
  { id: "role-admin", name: "admin", description: "Quản trị viên" },
  { id: "role-manager", name: "manager", description: "Quản lý vận hành" },
  { id: "role-staff", name: "staff", description: "Chuyên viên" },
  { id: "role-user", name: "user", description: "Người dùng" },
];

// ============================================================
// MOCK CATEGORIES
// ============================================================

export const mockCategories = [
  {
    id: "cat-medical",
    name: "Vật tư y tế",
    code: "MEDICAL_SUPPLIES",
    description: "Các loại vật tư y tế thông dụng",
    parent_id: null,
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-teaching",
    name: "Thiết bị giảng dạy",
    code: "TEACHING_EQUIPMENT",
    description: "Thiết bị phục vụ giảng dạy",
    parent_id: null,
    unit_id: "00000000-0000-0000-0000-000000000001",
    is_active: true,
    sort_order: 2,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-office",
    name: "Văn phòng phẩm",
    code: "OFFICE_SUPPLIES",
    description: "Văn phòng phẩm các loại",
    parent_id: null,
    unit_id: null,
    is_active: true,
    sort_order: 3,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

// ============================================================
// MOCK REQUESTS
// ============================================================

export const mockRequests: Array<{
  id: string;
  request_number: number;
  reason: string;
  priority: PriorityLevel;
  status: RequestStatus;
  unit_id: string;
  unit_name_snapshot: string;
  created_by: string;
  assignee_id: string | null;
  assigned_at: string | null;
  completion_note: string | null;
  completed_at: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  creator?: typeof mockUsers[0];
  assignee?: typeof mockUsers[0] | null;
  items?: typeof mockRequestItems;
}> = [
  {
    id: "req-001",
    request_number: 1,
    reason: "Xin bổ sung găng tay y tế cho phòng thực hành. Số lượng hiện tại không đủ cho sinh viên.",
    priority: "NORMAL",
    status: "DRAFT",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: null,
    assigned_at: null,
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    creator: mockUsers[3],
  },
  {
    id: "req-002",
    request_number: 2,
    reason: "Xin cấp kim tiêm thực hành cho sinh viên năm 2. Lớp ĐD2023 cần thực hành kỹ năng tiêm trong tuần tới.",
    priority: "HIGH",
    status: "NEW",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: null,
    assigned_at: null,
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    creator: mockUsers[3],
  },
  {
    id: "req-003",
    request_number: 3,
    reason: "Mannequin thực hành bị hỏng - cần thay gấp để kịp buổi thi thực hành ngày mai!",
    priority: "URGENT",
    status: "NEW",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: null,
    assigned_at: null,
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    creator: mockUsers[3],
  },
  {
    id: "req-004",
    request_number: 4,
    reason: "Xin vật tư băng gạc cho Lab Điều dưỡng. Chuẩn bị cho buổi thực hành tuần sau.",
    priority: "NORMAL",
    status: "ASSIGNED",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: "00000000-0000-0000-0001-000000000004",
    assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    creator: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "req-005",
    request_number: 5,
    reason: "Xin dụng cụ tiêm truyền cho buổi thực hành lâm sàng",
    priority: "NORMAL",
    status: "IN_PROGRESS",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: "00000000-0000-0000-0001-000000000004",
    assigned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    version: 3,
    creator: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "req-006",
    request_number: 6,
    reason: "Xin cấp băng keo y tế cho phòng thực hành",
    priority: "NORMAL",
    status: "DONE",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: "00000000-0000-0000-0001-000000000004",
    assigned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completion_note: "Đã bàn giao đủ 20 cuộn băng keo. GV đã ký nhận.",
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    version: 4,
    creator: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "req-007",
    request_number: 7,
    reason: "Xin thêm bông gòn y tế - cần xác nhận số lượng cụ thể",
    priority: "NORMAL",
    status: "NEED_INFO",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: "00000000-0000-0000-0001-000000000004",
    assigned_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    completion_note: null,
    completed_at: null,
    cancel_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    version: 3,
    creator: mockUsers[3],
    assignee: mockUsers[2],
  },
  {
    id: "req-008",
    request_number: 8,
    reason: "Yêu cầu đã bị hủy do trùng lặp",
    priority: "LOW",
    status: "CANCELLED",
    unit_id: "00000000-0000-0000-0000-000000000001",
    unit_name_snapshot: "Khoa Điều dưỡng",
    created_by: "00000000-0000-0000-0001-000000000006",
    assignee_id: null,
    assigned_at: null,
    completion_note: null,
    completed_at: null,
    cancel_reason: "Yêu cầu trùng với phiếu #006",
    cancelled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cancelled_by: "00000000-0000-0000-0001-000000000006",
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    creator: mockUsers[3],
  },
];

// ============================================================
// MOCK REQUEST ITEMS
// ============================================================

export const mockRequestItems = [
  {
    id: "item-001",
    request_id: "req-001",
    category_id: "cat-medical",
    item_name: "Găng tay y tế size S",
    unit_count: "Hộp",
    quantity: 10,
    required_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-002",
    request_id: "req-001",
    category_id: "cat-medical",
    item_name: "Găng tay y tế size M",
    unit_count: "Hộp",
    quantity: 15,
    required_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 2,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-003",
    request_id: "req-002",
    category_id: "cat-medical",
    item_name: "Kim tiêm 5ml",
    unit_count: "Cái",
    quantity: 100,
    required_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-004",
    request_id: "req-003",
    category_id: "cat-teaching",
    item_name: "Mannequin thực hành tiêm",
    unit_count: "Bộ",
    quantity: 1,
    required_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: "https://example.com/mannequin",
    notes: "Cần loại cao cấp có tĩnh mạch giả",
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-005",
    request_id: "req-004",
    category_id: "cat-medical",
    item_name: "Băng gạc vô trùng",
    unit_count: "Gói",
    quantity: 50,
    required_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-006",
    request_id: "req-005",
    category_id: "cat-medical",
    item_name: "Kim luồn 22G",
    unit_count: "Cái",
    quantity: 50,
    required_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-007",
    request_id: "req-005",
    category_id: "cat-medical",
    item_name: "Dây truyền dịch",
    unit_count: "Bộ",
    quantity: 30,
    required_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 2,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-008",
    request_id: "req-006",
    category_id: "cat-medical",
    item_name: "Băng keo y tế 2.5cm",
    unit_count: "Cuộn",
    quantity: 20,
    required_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: null,
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "item-009",
    request_id: "req-007",
    category_id: "cat-medical",
    item_name: "Bông gòn y tế",
    unit_count: "Gói",
    quantity: 0, // Pending info
    required_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    link_ref: null,
    notes: "Cần xác nhận số lượng cụ thể",
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

// ============================================================
// MOCK COMMENTS
// ============================================================

export const mockComments = [
  {
    id: "comment-001",
    request_id: "req-005",
    user_id: "00000000-0000-0000-0001-000000000004",
    content: "Đã tìm được hãng cung cấp. Kim luồn còn hàng, dây truyền cần chờ 3 ngày.",
    is_internal: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[2],
  },
  {
    id: "comment-002",
    request_id: "req-006",
    user_id: "00000000-0000-0000-0001-000000000004",
    content: "Đã bàn giao đủ số lượng. GV xác nhận nhận hàng.",
    is_internal: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[2],
  },
  {
    id: "comment-003",
    request_id: "req-007",
    user_id: "00000000-0000-0000-0001-000000000004",
    content: "Vui lòng xác nhận số lượng bông gòn cần dùng (đơn vị: gói 500g)",
    is_internal: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[2],
  },
  {
    id: "comment-004",
    request_id: "req-004",
    user_id: "00000000-0000-0000-0001-000000000002",
    content: "[Nội bộ] Đã liên hệ nhà cung cấp, dự kiến giao trong tuần",
    is_internal: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: mockUsers[1],
  },
];

// ============================================================
// MOCK USER ROLES
// ============================================================

export const mockUserRoles = [
  { user_id: "00000000-0000-0000-0001-000000000001", role_id: "role-admin", role_name: "admin" },
  { user_id: "00000000-0000-0000-0001-000000000002", role_id: "role-manager", role_name: "manager" },
  { user_id: "00000000-0000-0000-0001-000000000004", role_id: "role-staff", role_name: "staff" },
  { user_id: "00000000-0000-0000-0001-000000000006", role_id: "role-user", role_name: "user" },
];

// ============================================================
// HELPER: Get mock current user
// ============================================================

export function getMockCurrentUser() {
  return {
    ...mockUsers[0], // Admin user
    roles: ["admin"],
  };
}

// ============================================================
// HELPER: Get requests with relations
// ============================================================

export function getMockRequestsWithRelations() {
  return mockRequests.map((req) => ({
    ...req,
    creator: mockUsers.find((u) => u.id === req.created_by),
    assignee: req.assignee_id
      ? mockUsers.find((u) => u.id === req.assignee_id)
      : null,
    items: mockRequestItems.filter((i) => i.request_id === req.id),
  }));
}

// ============================================================
// HELPER: Get single request with full relations
// ============================================================

export function getMockRequestById(id: string) {
  const request = mockRequests.find((r) => r.id === id);
  if (!request) return null;

  return {
    ...request,
    creator: mockUsers.find((u) => u.id === request.created_by),
    assignee: request.assignee_id
      ? mockUsers.find((u) => u.id === request.assignee_id)
      : null,
    items: mockRequestItems.filter((i) => i.request_id === id),
    comments: mockComments.filter((c) => c.request_id === id),
  };
}

// ============================================================
// HELPER: Get user roles
// ============================================================

export function getMockUserRoles(userId: string): string[] {
  return mockUserRoles
    .filter((ur) => ur.user_id === userId)
    .map((ur) => ur.role_name);
}

// ============================================================
// STATS HELPERS
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMockStats(user?: any) {
  const newCount = mockRequests.filter((r) => r.status === "NEW").length;
  const inProgressCount = mockRequests.filter((r) => r.status === "IN_PROGRESS").length;
  const needInfoCount = mockRequests.filter((r) => r.status === "NEED_INFO").length;
  const doneThisMonth = mockRequests.filter((r) => r.status === "DONE").length;
  const overdueCount = 2; // Mock value
  const pendingAssignment = mockRequests.filter((r) => r.status === "NEW").length;
  
  // My requests (user-specific)
  const myRequestsCount = user 
    ? mockRequests.filter((r) => r.created_by === user.id && !["DONE", "CANCELLED"].includes(r.status)).length
    : 0;
  const myTasksCount = user 
    ? mockRequests.filter((r) => r.assignee_id === user.id && ["ASSIGNED", "IN_PROGRESS", "NEED_INFO"].includes(r.status)).length
    : 0;

  return { 
    newCount, 
    inProgressCount, 
    needInfoCount,
    doneThisMonth, 
    overdueCount,
    pendingAssignment,
    myRequestsCount,
    myTasksCount,
  };
}
