/**
 * Database Types
 * Manual type definitions based on schema in supabase/migrations/0001_init.sql
 * 
 * TODO: Replace with auto-generated types from Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
 */

// ============================================================
// ENUM TYPES
// ============================================================

export type RequestStatus = 
  | "DRAFT" 
  | "NEW" 
  | "ASSIGNED" 
  | "IN_PROGRESS" 
  | "NEED_INFO" 
  | "DONE" 
  | "CANCELLED";

export type Priority = 
  | "LOW" 
  | "NORMAL" 
  | "HIGH" 
  | "URGENT";

export type AttachmentType = 
  | "file" 
  | "external_url";

// ============================================================
// TABLE TYPES
// ============================================================

export interface Unit {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  unit_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface Category {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_id: string | null;
  unit_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  request_number: number;
  reason: string;
  priority: Priority;
  status: RequestStatus;
  unit_id: string | null;
  unit_name_snapshot: string | null;
  assignee_id: string | null;
  assigned_at: string | null;
  completion_note: string | null;
  completed_at: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  id: string;
  request_id: string;
  category_id: string | null;
  item_name: string;
  unit_count: string | null;
  quantity: number;
  required_at: string | null;
  link_ref: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  request_id: string | null;
  file_name: string;
  file_type: AttachmentType;
  file_size: number | null;
  file_url: string;
  mime_type: string | null;
  temp_token: string | null;
  is_attached: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestLog {
  id: string;
  request_id: string;
  user_id: string | null;
  action: string;
  old_status: RequestStatus | null;
  new_status: RequestStatus | null;
  meta_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AuthLog {
  id: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  logged_at: string;
}

// ============================================================
// JOINED/EXTENDED TYPES
// ============================================================

/**
 * User with roles populated
 */
export interface UserWithRoles extends User {
  roles: Role[];
  unit?: Unit | null;
}

/**
 * Request with related data
 */
export interface RequestWithDetails extends Request {
  creator?: User;
  assignee?: User | null;
  unit?: Unit | null;
  items?: RequestItem[];
  comments?: RequestComment[];
  attachments?: Attachment[];
  logs?: RequestLog[];
}

/**
 * Request item with category
 */
export interface RequestItemWithCategory extends RequestItem {
  category?: Category | null;
}

/**
 * Comment with user info
 */
export interface CommentWithUser extends RequestComment {
  user?: User;
}

/**
 * Log with user info
 */
export interface LogWithUser extends RequestLog {
  user?: User | null;
}

// ============================================================
// INPUT TYPES (for Server Actions)
// ============================================================

export interface CreateRequestInput {
  reason: string;
  priority?: Priority;
  items: CreateRequestItemInput[];
}

export interface CreateRequestItemInput {
  category_id?: string;
  item_name: string;
  unit_count?: string;
  quantity?: number;
  required_at?: string;
  link_ref?: string;
  notes?: string;
}

export interface UpdateRequestInput {
  id: string;
  reason?: string;
  priority?: Priority;
}

export interface AssignRequestInput {
  request_id: string;
  assignee_id: string;
  note?: string;
}

export interface ChangeStatusInput {
  request_id: string;
  new_status: RequestStatus;
  note?: string;
  completion_note?: string;
  cancel_reason?: string;
}

export interface AddCommentInput {
  request_id: string;
  content: string;
  is_internal?: boolean;
}

// ============================================================
// DATABASE SCHEMA TYPE (Supabase format)
// ============================================================

export type Database = {
  public: {
    Tables: {
      units: {
        Row: Unit;
        Insert: Omit<Unit, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Unit, "id" | "created_at">>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Role, "id" | "created_at">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, "id" | "assigned_at"> & { id?: string };
        Update: Partial<Omit<UserRole, "id" | "assigned_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      requests: {
        Row: Request;
        Insert: Omit<Request, "id" | "request_number" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Request, "id" | "request_number" | "created_at">>;
      };
      request_items: {
        Row: RequestItem;
        Insert: Omit<RequestItem, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<RequestItem, "id" | "created_at">>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Attachment, "id" | "created_at">>;
      };
      request_comments: {
        Row: RequestComment;
        Insert: Omit<RequestComment, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<RequestComment, "id" | "created_at">>;
      };
      request_logs: {
        Row: RequestLog;
        Insert: Omit<RequestLog, "id" | "created_at"> & { id?: string };
        Update: never; // Logs should not be updated
      };
      auth_logs: {
        Row: AuthLog;
        Insert: Omit<AuthLog, "id" | "logged_at"> & { id?: string };
        Update: never; // Auth logs should not be updated
      };
    };
    Views: {
      // TODO: Add views if needed
      [key: string]: never; // Placeholder to avoid empty object type error
    };
    Functions: {
      user_has_role: {
        Args: { user_uuid: string; role_name: string };
        Returns: boolean;
      };
      get_user_unit_id: {
        Args: { user_uuid: string };
        Returns: string | null;
      };
    };
    Enums: {
      request_status: RequestStatus;
      priority_level: Priority;
      attachment_type: AttachmentType;
    };
  };
};
