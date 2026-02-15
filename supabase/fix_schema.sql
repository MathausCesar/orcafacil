-- Add onboarded_at to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarded_at') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarded_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Verify services table columns (just in case, though we used description/default_price)
DO $$
BEGIN
    -- Ensure description exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'description') THEN
        ALTER TABLE public.services ADD COLUMN description TEXT;
    END IF;

    -- Ensure default_price exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'default_price') THEN
        ALTER TABLE public.services ADD COLUMN default_price DECIMAL(10, 2);
    END IF;
END $$;
