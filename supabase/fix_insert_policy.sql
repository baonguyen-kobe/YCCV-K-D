-- ============================================================
-- FIX RLS POLICY INSERT - Thêm created_by check
-- ============================================================
-- Vấn đề: Policy INSERT không kiểm tra created_by = auth.uid()
-- Giải pháp: Add điều kiện này vào WITH CHECK

-- 1. Drop policy cũ
DROP POLICY IF EXISTS "requests_insert" ON requests;

-- 2. Tạo policy mới với created_by check
CREATE POLICY "requests_insert" ON requests 
FOR INSERT 
TO authenticated
WITH CHECK (
    -- User phải là người tạo request
    created_by = auth.uid()
    AND 
    -- User phải có ít nhất 1 trong các role sau
    (
        user_has_role(auth.uid(), 'admin'::text) 
        OR user_has_role(auth.uid(), 'manager'::text) 
        OR user_has_role(auth.uid(), 'user'::text)
    )
);

-- 3. Verify policy đã đúng
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'requests' AND cmd = 'INSERT';

-- Kết quả mong muốn:
-- with_check: ((created_by = auth.uid()) AND ...)
