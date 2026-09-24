CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Agendas table
CREATE TABLE IF NOT EXISTS public.agendas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text NOT NULL DEFAULT 'blue',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Agenda items table
CREATE TABLE IF NOT EXISTS public.agenda_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agenda_id uuid NOT NULL REFERENCES public.agendas(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    start_time timestamptz,
    end_time timestamptz,
    completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agendas_user_id ON public.agendas(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_agenda_id ON public.agenda_items(agenda_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_start_time ON public.agenda_items(start_time);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;

-- Policies for users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'select_self') THEN
        CREATE POLICY select_self ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'insert_self') THEN
        CREATE POLICY insert_self ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'update_self') THEN
        CREATE POLICY update_self ON public.users
            FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'delete_self') THEN
        CREATE POLICY delete_self ON public.users
            FOR DELETE USING (auth.uid() = id);
    END IF;
END$$;

-- Policies for agendas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agendas' AND policyname = 'select_own') THEN
        CREATE POLICY select_own ON public.agendas
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agendas' AND policyname = 'insert_own') THEN
        CREATE POLICY insert_own ON public.agendas
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agendas' AND policyname = 'update_own') THEN
        CREATE POLICY update_own ON public.agendas
            FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agendas' AND policyname = 'delete_own') THEN
        CREATE POLICY delete_own ON public.agendas
            FOR DELETE USING (user_id = auth.uid());
    END IF;
END$$;

-- Policies for agenda_items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agenda_items' AND policyname = 'select_own') THEN
        CREATE POLICY select_own ON public.agenda_items
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.agendas
                    WHERE id = agenda_items.agenda_id AND user_id = auth.uid()
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agenda_items' AND policyname = 'insert_own') THEN
        CREATE POLICY insert_own ON public.agenda_items
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.agendas
                    WHERE id = agenda_items.agenda_id AND user_id = auth.uid()
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agenda_items' AND policyname = 'update_own') THEN
        CREATE POLICY update_own ON public.agenda_items
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.agendas
                    WHERE id = agenda_items.agenda_id AND user_id = auth.uid()
                )
            ) WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.agendas
                    WHERE id = agenda_items.agenda_id AND user_id = auth.uid()
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE schemaname = 'public' AND tablename = 'agenda_items' AND policyname = 'delete_own') THEN
        CREATE POLICY delete_own ON public.agenda_items
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.agendas
                    WHERE id = agenda_items.agenda_id AND user_id = auth.uid()
                )
            );
    END IF;
END$$;