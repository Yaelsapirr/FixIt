-- ============================================================
--  FixIt — Migration v2
--  הרץ את הקובץ הזה ב-SQL Editor של Supabase
-- ============================================================

-- הוספת עמודות חדשות לטבלת users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email      TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS city       TEXT;

-- טבלת תקלות שמורות (bookmarks)
CREATE TABLE IF NOT EXISTS saved_repairs (
  user_id  UUID NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  guide_id TEXT NOT NULL REFERENCES repair_guides(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, guide_id)
);

ALTER TABLE saved_repairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user manage own saved"
  ON saved_repairs
  USING     (auth.uid() = user_id)
  WITH CHECK(auth.uid() = user_id);

-- עדכון הטריגר — שמירת שם פרטי/משפחה ממטא-דאטה של גוגל
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_name TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  INSERT INTO public.users (id, email, display_name, avatar_url, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(v_name, ''), NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NULLIF(SPLIT_PART(v_name, ' ', 1), ''),
    NULLIF(SPLIT_PART(v_name, ' ', 2), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
