-- ============================================================
-- VERIFY RLS POLICIES - Không cần auth context
-- ============================================================

-- 1. Kiểm tra policy INSERT cho requests
SELECT 
    tablename,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'requests' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Kết quả mong muốn:
-- with_check PHẢI chứa: created_by = auth.uid()
-- VÍ DỤ: ((created_by = auth.uid()) AND (user_has_role(...) OR user_has_role(...)))

-- 2. Kiểm tra policy INSERT cho request_items  
SELECT 
    tablename,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'request_items' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 3. List ALL policies cho requests (để tìm conflicting policies)
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'requests'
ORDER BY cmd, policyname;

-- 4. Nếu thấy policy KHÔNG có created_by check, fix ngay:
/*
-- Drop policy cũ
DROP POLICY IF EXISTS "requests_insert" ON requests;

-- Tạo policy MỚI với created_by check
CREATE POLICY "requests_insert" ON requests 
FOR INSERT 
TO authenticated
WITH CHECK (
    created_by = auth.uid()
    AND (
        user_has_role(auth.uid(), 'admin'::text) 
        OR user_has_role(auth.uid(), 'manager'::text) 
        OR user_has_role(auth.uid(), 'user'::text)
    )
);

-- Verify
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'requests' AND cmd = 'INSERT';
*/
