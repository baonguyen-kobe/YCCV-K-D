"use server";

/**
 * Request Server Actions
 * Handle CRUD operations for job requests
 */

// TODO: Implement after DB schema is ready (STEP 3)

export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new request (DRAFT status)
 */
export async function createRequest(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Update request (only when DRAFT)
 */
export async function updateRequest(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Submit request (DRAFT -> NEW)
 */
export async function submitRequest(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Assign request to staff (NEW -> ASSIGNED)
 */
export async function assignRequest(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Update request status (following State Machine)
 */
export async function updateRequestStatus(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Cancel request
 */
export async function cancelRequest(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}

/**
 * Add comment to request
 */
export async function addComment(): Promise<ActionResult> {
  // TODO: Implement
  return { success: false, error: "Not implemented" };
}
