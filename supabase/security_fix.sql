-- Secure Storage: Restrict uploads to authenticated users
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatar." ON storage.objects;

CREATE POLICY "Authenticated users can upload avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Verify Services RLS (If table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
        ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own services" ON public.services;
        CREATE POLICY "Users can view own services" ON public.services
            FOR SELECT USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can insert own services" ON public.services;
        CREATE POLICY "Users can insert own services" ON public.services
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can update own services" ON public.services;
        CREATE POLICY "Users can update own services" ON public.services
            FOR UPDATE USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can delete own services" ON public.services;
        CREATE POLICY "Users can delete own services" ON public.services
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
