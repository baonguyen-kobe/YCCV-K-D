-- Fix script - add all missing null checks in requests.ts
-- Lines that need fixing: 250, 347, 446, 511, 611, 727, 787, 869, 955, 1013, 1083, 1164

-- Quick solution: Replace pattern
-- FROM: const supabase = await createClient();
-- TO:   const supabase = await createClient();
--       if (!supabase) return { success: false, error: "Lỗi kết nối database" };
