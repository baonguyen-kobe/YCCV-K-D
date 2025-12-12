/**
 * Permissions helper - Central place for permission checks
 * Based on PRD Role-Action Matrix & State Machine (Section 2.3 & 3.3.2)
 * 
 * This is the SINGLE SOURCE OF TRUTH for permission logic in the app.
 * All permission checks (UI + Server Actions) should use these helpers.
 */

import type { RequestStatus, Priority } from "@/types/database.types";

// ============================================================
// CONSTANTS - Request Status (State Machine)
// PRD Section 3.3.1
// ============================================================
export const REQUEST_STATUS: Record<string, RequestStatus> = {
  DRAFT: "DRAFT",
  NEW: "NEW",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  NEED_INFO: "NEED_INFO",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

// ============================================================
// CONSTANTS - Priority Levels
// PRD Section 3.2
// ============================================================
export const PRIORITY: Record<string, Priority> = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

// ============================================================
// CONSTANTS - Roles
// PRD Section 2.2
// ============================================================
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  USER: "user",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/**
 * Minimal user info needed for permission checks
 */
export interface UserForPermission {
  id: string;
  roles: string[];
  unitId: string | null;
}

/**
 * Minimal request info needed for permission checks
 */
export interface RequestForPermission {
  id: string;
  status: RequestStatus;
  created_by: string;
  assignee_id: string | null;
  unit_id: string | null;
}

// ============================================================
// STATE MACHINE - Valid Transitions
// Based on PRD Section 3.3.2
// ============================================================
export const STATE_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  DRAFT: ["NEW", "CANCELLED"],
  NEW: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "NEED_INFO", "CANCELLED"],
  IN_PROGRESS: ["NEED_INFO", "DONE", "CANCELLED"],
  NEED_INFO: ["IN_PROGRESS", "CANCELLED"],
  DONE: [], // Terminal state (only Admin can re-open)
  CANCELLED: [], // Terminal state (only Admin can re-open)
};

// ============================================================
// ADMIN RE-OPEN STATES
// States that Admin can re-open to from DONE/CANCELLED
// ============================================================
export const ADMIN_REOPEN_STATES: RequestStatus[] = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "NEED_INFO",
];

// ============================================================
// ROLE CHECK HELPERS
// ============================================================

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserForPermission, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Check if user is Admin
 */
export function isAdmin(user: UserForPermission): boolean {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Check if user is Manager
 */
export function isManager(user: UserForPermission): boolean {
  return hasRole(user, ROLES.MANAGER);
}

/**
 * Check if user is Staff
 */
export function isStaff(user: UserForPermission): boolean {
  return hasRole(user, ROLES.STAFF);
}

/**
 * Check if user is regular User (Giảng viên)
 */
export function isUser(user: UserForPermission): boolean {
  return hasRole(user, ROLES.USER);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserForPermission, roles: string[]): boolean {
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Check if user can perform internal operations (Admin/Manager/Staff)
 */
export function isInternalUser(user: UserForPermission): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]);
}

// ============================================================
// REQUEST PERMISSION HELPERS
// Based on PRD Section 2.3 (Role-Action Matrix)
// ============================================================

/**
 * Check if user can view a specific request
 * PRD Section 3.4.1
 */
export function canViewRequest(user: UserForPermission, request: RequestForPermission): boolean {
  // Admin can view all
  if (isAdmin(user)) return true;

  // Manager can view requests in their unit
  if (isManager(user) && request.unit_id === user.unitId) return true;

  // Staff can view requests assigned to them
  if (isStaff(user) && request.assignee_id === user.id) return true;

  // User can view their own requests
  if (request.created_by === user.id) return true;

  return false;
}

/**
 * Check if user can edit a request
 * Only allowed when status is DRAFT (except Admin)
 * PRD Section 2.3
 */
export function canEditRequest(user: UserForPermission, request: RequestForPermission): boolean {
  // Admin can always edit any request
  if (isAdmin(user)) return true;

  // Can only edit DRAFT requests for non-admin
  if (request.status !== REQUEST_STATUS.DRAFT) {
    return false;
  }

  // Manager can edit DRAFT requests in their unit
  if (isManager(user) && request.unit_id === user.unitId) return true;

  // Creator can edit their own DRAFT
  if (request.created_by === user.id) return true;

  return false;
}

/**
 * Check if user can create a new request
 * PRD Section 2.3: Admin, Manager, User can create; Staff cannot (unless also User)
 */
export function canCreateRequest(user: UserForPermission): boolean {
  const canCreate = hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]);
  
  // Always log for debugging
  console.log('[PERMISSIONS] canCreateRequest:', { 
    userId: user.id, 
    roles: user.roles, 
    canCreate,
    requiredRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
  });
  
  return canCreate;
}

/**
 * Check if user can submit a request (DRAFT -> NEW)
 */
export function canSubmitRequest(user: UserForPermission, request: RequestForPermission): boolean {
  if (request.status !== REQUEST_STATUS.DRAFT) return false;
  
  // Admin can submit any
  if (isAdmin(user)) return true;
  
  // Manager can submit in their unit
  if (isManager(user) && request.unit_id === user.unitId) return true;
  
  // Creator can submit own request
  if (request.created_by === user.id) return true;
  
  return false;
}

/**
 * Check if user can change status from one state to another
 * PRD Section 3.3.2 (State Machine & Permission)
 */
export function canChangeStatus(
  user: UserForPermission,
  request: RequestForPermission,
  fromStatus: RequestStatus,
  toStatus: RequestStatus
): boolean {
  // Admin can do anything, including re-open DONE/CANCELLED
  if (isAdmin(user)) return true;

  // Check if transition is valid in state machine
  const validTransitions = STATE_TRANSITIONS[fromStatus];
  if (!validTransitions.includes(toStatus)) return false;

  // Check role-specific permissions for each transition
  const transition = `${fromStatus}->${toStatus}`;
  
  switch (transition) {
    // DRAFT -> NEW (Submit)
    case "DRAFT->NEW":
      return request.created_by === user.id || isManager(user);

    // DRAFT -> CANCELLED (Delete draft)
    case "DRAFT->CANCELLED":
      return request.created_by === user.id || isManager(user);

    // NEW -> ASSIGNED (Assign to staff)
    case "NEW->ASSIGNED":
      return isManager(user);

    // NEW -> CANCELLED (Reject or withdraw)
    case "NEW->CANCELLED":
      return request.created_by === user.id || isManager(user);

    // ASSIGNED -> IN_PROGRESS (Start working)
    case "ASSIGNED->IN_PROGRESS":
      return request.assignee_id === user.id || isManager(user);

    // ASSIGNED -> NEED_INFO (Need more info)
    case "ASSIGNED->NEED_INFO":
      return request.assignee_id === user.id || isManager(user);

    // ASSIGNED -> CANCELLED (Cancel assignment)
    case "ASSIGNED->CANCELLED":
      return isManager(user);

    // IN_PROGRESS -> NEED_INFO (Encountered blocker)
    case "IN_PROGRESS->NEED_INFO":
      return request.assignee_id === user.id || isManager(user);

    // IN_PROGRESS -> DONE (Complete)
    case "IN_PROGRESS->DONE":
      return request.assignee_id === user.id || isManager(user);

    // IN_PROGRESS -> CANCELLED (Cancel mid-work)
    case "IN_PROGRESS->CANCELLED":
      return isManager(user);

    // NEED_INFO -> IN_PROGRESS (Resume after info received)
    case "NEED_INFO->IN_PROGRESS":
      return request.assignee_id === user.id || isManager(user);

    // NEED_INFO -> CANCELLED (Give up)
    case "NEED_INFO->CANCELLED":
      return isManager(user);

    default:
      return false;
  }
}

/**
 * Check if user can assign a request to staff
 * PRD Section 2.3
 */
export function canAssignRequest(user: UserForPermission, request: RequestForPermission): boolean {
  // Admin can always assign/re-assign
  if (isAdmin(user)) return true;

  // Only NEW requests can be assigned by Manager
  if (request.status !== REQUEST_STATUS.NEW) {
    return false;
  }

  // Manager can assign requests in their unit
  if (isManager(user) && request.unit_id === user.unitId) return true;

  return false;
}

/**
 * Check if user can re-assign a request (change assignee)
 */
export function canReassignRequest(user: UserForPermission, request: RequestForPermission): boolean {
  // Only Admin can re-assign after initial assignment
  if (isAdmin(user)) return true;

  // Manager can re-assign if request is ASSIGNED (not yet started)
  if (isManager(user) && request.status === REQUEST_STATUS.ASSIGNED) {
    return request.unit_id === user.unitId;
  }

  return false;
}

/**
 * Check if user can cancel a request
 * PRD Section 2.3 & 3.3.2
 */
export function canCancelRequest(user: UserForPermission, request: RequestForPermission): boolean {
  const { status, created_by } = request;

  // Can't cancel already terminal states (unless Admin)
  if (status === REQUEST_STATUS.DONE || status === REQUEST_STATUS.CANCELLED) {
    return isAdmin(user);
  }

  // Admin can cancel any
  if (isAdmin(user)) return true;

  // Manager can cancel any non-terminal
  if (isManager(user)) return true;

  // Creator can cancel if not yet processed (DRAFT, NEW only)
  if (created_by === user.id) {
    return status === REQUEST_STATUS.DRAFT || status === REQUEST_STATUS.NEW;
  }

  return false;
}

/**
 * Check if user can add comment to a request
 * PRD Section 3.5: Everyone can comment on any status, including DONE/CANCELLED
 */
export function canComment(user: UserForPermission, request: RequestForPermission): boolean {
  // Must be able to view the request first
  return canViewRequest(user, request);
}

/**
 * Check if user can create internal comments
 * Internal comments are only for Admin, Manager, Staff
 */
export function canCreateInternalComment(user: UserForPermission): boolean {
  return isInternalUser(user);
}

/**
 * Check if user can view internal comments
 * PRD Section 3.5: is_internal = true only for Admin/Manager/Staff
 */
export function canViewInternalComments(user: UserForPermission): boolean {
  return isInternalUser(user);
}

/**
 * Check if user can print a request (generate PDF)
 * PRD Section 2.3: Everyone who can view can print
 */
export function canPrintRequest(user: UserForPermission, request: RequestForPermission): boolean {
  return canViewRequest(user, request);
}

/**
 * Check if user can manage categories
 * PRD Section 2.3: Admin and Manager
 */
export function canManageCategories(user: UserForPermission): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

/**
 * Check if user can manage users
 * PRD Section 2.3: Admin only
 */
export function canManageUsers(user: UserForPermission): boolean {
  return isAdmin(user);
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdmin(user: UserForPermission): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

/**
 * Check if user can view reports
 * PRD: Manager sees unit reports, Admin sees all
 */
export function canViewReports(user: UserForPermission): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

// ============================================================
// STATUS HELPERS
// ============================================================

/**
 * Get list of valid next statuses for a request
 */
export function getValidNextStatuses(
  user: UserForPermission,
  request: RequestForPermission
): RequestStatus[] {
  const currentStatus = request.status;
  
  // For Admin, allow re-opening terminal states
  if (isAdmin(user)) {
    if (currentStatus === REQUEST_STATUS.DONE || currentStatus === REQUEST_STATUS.CANCELLED) {
      return ADMIN_REOPEN_STATES;
    }
    // Admin can do all valid transitions
    return STATE_TRANSITIONS[currentStatus];
  }

  // Get possible transitions from state machine
  const possibleTransitions = STATE_TRANSITIONS[currentStatus];

  // Filter to only transitions this user can perform
  return possibleTransitions.filter((toStatus) =>
    canChangeStatus(user, request, currentStatus, toStatus)
  );
}

/**
 * Check if a status is a terminal state
 */
export function isTerminalStatus(status: RequestStatus): boolean {
  return status === REQUEST_STATUS.DONE || status === REQUEST_STATUS.CANCELLED;
}

/**
 * Check if a status is active (being worked on)
 */
export function isActiveStatus(status: RequestStatus): boolean {
  return (
    status === REQUEST_STATUS.ASSIGNED ||
    status === REQUEST_STATUS.IN_PROGRESS ||
    status === REQUEST_STATUS.NEED_INFO
  );
}

/**
 * Check if a status is pending (waiting for action)
 */
export function isPendingStatus(status: RequestStatus): boolean {
  return status === REQUEST_STATUS.NEW || status === REQUEST_STATUS.NEED_INFO;
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validate status transition is allowed by state machine
 * (Does not check user permissions, only state machine rules)
 */
export function isValidTransition(fromStatus: RequestStatus, toStatus: RequestStatus): boolean {
  // Admin re-open case
  if (isTerminalStatus(fromStatus) && ADMIN_REOPEN_STATES.includes(toStatus)) {
    return true;
  }
  return STATE_TRANSITIONS[fromStatus].includes(toStatus);
}

/**
 * Get error message for invalid permission
 */
export function getPermissionError(
  action: string,
  user: UserForPermission,
  request?: RequestForPermission
): string {
  const baseMsg = `Bạn không có quyền ${action}`;
  
  if (!request) return baseMsg;
  
  if (isTerminalStatus(request.status)) {
    return `${baseMsg}. Phiếu đã ở trạng thái kết thúc.`;
  }
  
  return `${baseMsg} cho phiếu này.`;
}
