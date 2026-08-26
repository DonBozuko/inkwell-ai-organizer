CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  text text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'insights',
  tags text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'Conteúdo capturado',
  attachment_kind text,
  attachment_name text,
  attachment_mime text,
  attachment_size bigint,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notes_attachment_kind_check CHECK (attachment_kind IS NULL OR attachment_kind IN ('image', 'file'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notes" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX notes_user_created_idx ON public.notes (user_id, created_at DESC);
CREATE INDEX notes_user_category_idx ON public.notes (user_id, category);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL,
  label text NOT NULL,
  hint text NOT NULL DEFAULT 'Pasta personalizada',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own categories" ON public.categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own categories" ON public.categories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX categories_user_idx ON public.categories (user_id);

CREATE POLICY "Users read own note attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'note-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own note attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'note-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own note attachments" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'note-attachments' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'note-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own note attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'note-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);