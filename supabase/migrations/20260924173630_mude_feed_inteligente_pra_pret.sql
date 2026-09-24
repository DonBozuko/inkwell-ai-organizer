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

ALTER TABLE public.ui_preferences
    ADD CONSTRAINT ui_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ui_preferences_user_component
    ON public.ui_preferences (user_id, component);

ALTER TABLE public.ui_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "allow_user_access"
    ON public.ui_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
    INSERT INTO public.ui_preferences (user_id, component, theme_color)
    SELECT auth.uid(), 'smart_feed', 'black'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.ui_preferences
        WHERE user_id = auth.uid() AND component = 'smart_feed'
    );
END $$;