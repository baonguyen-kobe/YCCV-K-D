-- ============================================================
-- Enhanced Search Function for Requests
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create function for full-text search across requests and items
CREATE OR REPLACE FUNCTION search_requests(
    p_search_query TEXT,
    p_user_id UUID,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_is_manager BOOLEAN DEFAULT FALSE,
    p_is_staff BOOLEAN DEFAULT FALSE,
    p_user_unit_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    request_number INTEGER,
    reason TEXT,
    priority priority_level,
    status request_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    assignee_id UUID,
    unit_id UUID,
    creator_name TEXT,
    creator_email TEXT,
    assignee_name TEXT,
    assignee_email TEXT,
    matched_items TEXT[],
    total_count BIGINT
) AS $$
DECLARE
    v_search_pattern TEXT;
    v_total BIGINT;
BEGIN
    -- Prepare search pattern
    v_search_pattern := '%' || LOWER(COALESCE(p_search_query, '')) || '%';
    
    -- Get total count first
    SELECT COUNT(DISTINCT r.id) INTO v_total
    FROM requests r
    LEFT JOIN request_items ri ON ri.request_id = r.id
    WHERE (
        -- Search in reason
        LOWER(r.reason) LIKE v_search_pattern
        OR
        -- Search in request_number (exact or partial)
        r.request_number::TEXT LIKE v_search_pattern
        OR
        -- Search in item names
        LOWER(ri.item_name) LIKE v_search_pattern
        OR
        -- Empty search returns all
        NULLIF(TRIM(p_search_query), '') IS NULL
    )
    -- Role-based access
    AND (
        p_is_admin = TRUE
        OR (p_is_manager = TRUE AND r.unit_id = p_user_unit_id)
        OR (p_is_staff = TRUE AND r.assignee_id = p_user_id)
        OR r.created_by = p_user_id
    )
    -- Status filter
    AND (p_status IS NULL OR r.status::TEXT = p_status)
    -- Priority filter
    AND (p_priority IS NULL OR r.priority::TEXT = p_priority);
    
    -- Return results with matched items
    RETURN QUERY
    SELECT 
        r.id,
        r.request_number,
        r.reason,
        r.priority,
        r.status,
        r.created_at,
        r.updated_at,
        r.created_by,
        r.assignee_id,
        r.unit_id,
        creator.full_name AS creator_name,
        creator.email AS creator_email,
        assignee.full_name AS assignee_name,
        assignee.email AS assignee_email,
        ARRAY_AGG(DISTINCT ri.item_name) FILTER (WHERE LOWER(ri.item_name) LIKE v_search_pattern) AS matched_items,
        v_total AS total_count
    FROM requests r
    LEFT JOIN users creator ON creator.id = r.created_by
    LEFT JOIN users assignee ON assignee.id = r.assignee_id
    LEFT JOIN request_items ri ON ri.request_id = r.id
    WHERE (
        LOWER(r.reason) LIKE v_search_pattern
        OR r.request_number::TEXT LIKE v_search_pattern
        OR LOWER(ri.item_name) LIKE v_search_pattern
        OR NULLIF(TRIM(p_search_query), '') IS NULL
    )
    AND (
        p_is_admin = TRUE
        OR (p_is_manager = TRUE AND r.unit_id = p_user_unit_id)
        OR (p_is_staff = TRUE AND r.assignee_id = p_user_id)
        OR r.created_by = p_user_id
    )
    AND (p_status IS NULL OR r.status::TEXT = p_status)
    AND (p_priority IS NULL OR r.priority::TEXT = p_priority)
    GROUP BY r.id, r.request_number, r.reason, r.priority, r.status, 
             r.created_at, r.updated_at, r.created_by, r.assignee_id, r.unit_id,
             creator.full_name, creator.email, assignee.full_name, assignee.email
    ORDER BY r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION search_requests IS 'Full-text search across requests and items with role-based access control. Returns matched item names.';

-- Test query (uncomment to test)
-- SELECT * FROM search_requests('găng tay', 'user-id-here', true, false, false, null, null, null, 20, 0);
