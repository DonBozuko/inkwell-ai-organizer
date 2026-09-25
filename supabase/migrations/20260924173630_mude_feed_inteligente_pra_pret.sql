CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
    INSERT INTO public.app_settings (key, value)
    VALUES ('smart_feed_theme', 'black')
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();
END $$;

CREATE TABLE IF NOT EXISTS public.ui_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    component TEXT NOT NULL,
    theme_color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, component)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ui_preferences_user_id_fkey'
        AND table_name = 'ui_preferences'
    ) THEN
        ALTER TABLE public.ui_preferences
            ADD CONSTRAINT ui_preferences_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ui_preferences_user_component
    ON public.ui_preferences (user_id, component);

ALTER TABLE public.ui_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'ui_preferences' 
        AND policyname = 'allow_user_access'
    ) THEN
        CREATE POLICY "allow_user_access"
            ON public.ui_preferences
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;