-- ============================================================
--  FixIt — Supabase Database Schema
--  הרץ את הקובץ הזה ב-SQL Editor של Supabase
--  סדר: 1-tables  2-RLS  3-seed data
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- קטגוריות תיקון
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  emoji TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE
);

-- מדריכי תיקון
CREATE TABLE repair_guides (
  id            TEXT PRIMARY KEY,          -- e.g. 'faucet-drip'
  category_id   INT  REFERENCES categories(id),
  title         TEXT NOT NULL,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  time_estimate TEXT NOT NULL,             -- e.g. '20 דקות'
  safety_note   TEXT,
  tools         TEXT[],                    -- מערך כלים
  icon          TEXT                       -- emoji
);

-- שלבי המדריך
CREATE TABLE guide_steps (
  id          SERIAL PRIMARY KEY,
  guide_id    TEXT NOT NULL REFERENCES repair_guides(id) ON DELETE CASCADE,
  step_order  INT  NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL
);

-- טכנאים
CREATE TABLE technicians (
  id           SERIAL PRIMARY KEY,
  category_id  INT REFERENCES categories(id),
  name         TEXT NOT NULL,
  initials     TEXT NOT NULL,
  specialty    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  stars        NUMERIC(2,1) NOT NULL CHECK (stars BETWEEN 1 AND 5),
  availability TEXT NOT NULL CHECK (availability IN ('now', 'tomorrow'))
);

-- חנויות ציוד
CREATE TABLE stores (
  id          SERIAL PRIMARY KEY,
  name        TEXT    NOT NULL,
  address     TEXT    NOT NULL,
  hours       TEXT    NOT NULL,
  latitude    NUMERIC(9,6),
  longitude   NUMERIC(9,6),
  waze_link   TEXT
);

-- פרופיל משתמש — מרחיב את auth.users של Supabase
CREATE TABLE users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   TEXT,
  avatar_url     TEXT,
  total_savings  NUMERIC(10,2) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- היסטוריית תיקונים
CREATE TABLE repair_history (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guide_id     TEXT NOT NULL REFERENCES repair_guides(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  savings      NUMERIC(10,2) DEFAULT 250
);


-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- טבלאות ציבוריות — קריאה חופשית לכולם
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_steps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories"    ON categories    FOR SELECT USING (true);
CREATE POLICY "public read repair_guides" ON repair_guides FOR SELECT USING (true);
CREATE POLICY "public read guide_steps"   ON guide_steps   FOR SELECT USING (true);
CREATE POLICY "public read technicians"   ON technicians   FOR SELECT USING (true);
CREATE POLICY "public read stores"        ON stores        FOR SELECT USING (true);

-- טבלת משתמשים — כל משתמש רואה ומעדכן רק את עצמו
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user select own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "user insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- היסטוריה — כל משתמש רואה רק את שלו
ALTER TABLE repair_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user select own history"
  ON repair_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user insert own history"
  ON repair_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 3. TRIGGER — יצירת פרופיל אוטומטית בהרשמה
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO users (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 4. SEED DATA
-- ============================================================

-- קטגוריות
INSERT INTO categories (name, emoji, slug) VALUES
  ('אינסטלציה',          '🔧', 'plumbing'),
  ('חשמל',               '⚡', 'electric'),
  ('חלונות ודלתות',      '🪟', 'windows-doors'),
  ('ריצוף וטיח',         '🏠', 'flooring'),
  ('מיזוג ותרמוסטט',    '❄️', 'ac'),
  ('כלי עבודה כלליים',  '🛠️', 'general');

-- מדריכי תיקון
INSERT INTO repair_guides (id, category_id, title, difficulty, time_estimate, safety_note, tools, icon) VALUES
  (
    'faucet-drip',
    1,
    'ברז מטפטף — תיקון בסיסי',
    'easy',
    '20 דקות',
    '⚠️ לפני שמתחילים — כבה את ברז הראשי מתחת לכיור או בכניסה לדירה',
    ARRAY['מפתח ברגים שטוח', 'אטם טפלון', 'מפתח אנגלי', 'דלי קטן'],
    '🔧'
  ),
  (
    'outlet-dead',
    2,
    'שקע חשמל לא עובד — בדיקה ואיפוס',
    'medium',
    '30 דקות',
    '⚠️ לפני שמתחילים — כבה את המפסק הראשי בלוח החשמל',
    ARRAY['מברג שטוח', 'בודק מתח', 'כפפות בידוד', 'לפיד'],
    '⚡'
  ),
  (
    'door-stuck',
    3,
    'דלת לא נסגרת — כיוול צירים',
    'easy',
    '15 דקות',
    '⚠️ ודא שהדלת לא תיסגר עליך בזמן העבודה — אבטח אותה פתוחה',
    ARRAY['מברג פיליפס', 'טריז עץ', 'עיפרון'],
    '🪟'
  ),
  (
    'ac-filter',
    5,
    'מיזוג לא מקרר — ניקוי פילטר',
    'advanced',
    '45 דקות',
    '⚠️ כבה את המיזוג ונתק מהחשמל לפני פירוק הפילטר',
    ARRAY['מברג שטוח', 'שואב אבק', 'מים וסבון עדין', 'מגבת'],
    '❄️'
  );

-- שלבים — ברז מטפטף
INSERT INTO guide_steps (guide_id, step_order, title, description) VALUES
  ('faucet-drip', 1, 'סגור את הברז הראשי',  'מצא את ברז הניתוק מתחת לכיור וסובב אותו עם כיוון השעון עד שייסגר לחלוטין.'),
  ('faucet-drip', 2, 'פרק את הברז',          'הסר את הבורג המרכזי מראש הברז בעזרת מפתח ברגים, ומשוך בעדינות את הידית.'),
  ('faucet-drip', 3, 'החלף את האטם',         'זהה את האטם הגומי בתחתית — אם הוא בלוי, החלף אותו באטם חדש מאותו גודל.'),
  ('faucet-drip', 4, 'הרכב והדק',            'הרכב את הברז בסדר הפוך, הדק את הבורג היטב ופתח את הברז הראשי לאט לאט לבדיקה.');

-- שלבים — שקע חשמל
INSERT INTO guide_steps (guide_id, step_order, title, description) VALUES
  ('outlet-dead', 1, 'כבה את המפסק בלוח',    'עבור ללוח החשמל ובדוק איזה מפסק שולט באזור השקע — הורד אותו למצב OFF.'),
  ('outlet-dead', 2, 'בדוק שקעי GFCI',        'חפש שקע עם כפתורי RESET ו-TEST (לרוב בחדר האמבטיה) — לחץ על RESET.'),
  ('outlet-dead', 3, 'פרק ובדוק את השקע',     'הסר את כיסוי השקע, ובדוק עם בודק המתח שאין מתח לפני שנוגעים בחוטים.'),
  ('outlet-dead', 4, 'החלף אם נדרש',          'אם השקע פגום — החלף בשקע חדש מאותו סוג, חבר חוטים לפי צבע והרכב.');

-- שלבים — דלת תקועה
INSERT INTO guide_steps (guide_id, step_order, title, description) VALUES
  ('door-stuck', 1, 'אבחן את הבעיה',         'בדוק אם הדלת נגעת במשקוף מלמעלה, מהצד או בתחתית — זה יקבע היכן לכוון.'),
  ('door-stuck', 2, 'הדק את הברגים בצירים',  'לרוב הבעיה היא ברגים רופפים — הדק את כל הברגים בצירים בעזרת מברג.'),
  ('door-stuck', 3, 'כוון את המיקום',         'אם הדלת עדיין תקועה, שחרר את הבורגים בציר הבעייתי, הכנס טריז עץ וחזור לחגרם.');

-- שלבים — פילטר מיזוג
INSERT INTO guide_steps (guide_id, step_order, title, description) VALUES
  ('ac-filter', 1, 'כבה ונתק מחשמל',         'כבה את המיזוג בשלט ולאחר מכן נתק את התקע מהשקע לבטיחות מלאה.'),
  ('ac-filter', 2, 'פתח את כיסוי המיזוג',    'הרם את המכסה הקדמי (לרוב צובט בקצוות) — אתה אמור לראות את הפילטר.'),
  ('ac-filter', 3, 'הוצא ונקה את הפילטר',    'משוך את הפילטר בעדינות, שאב ממנו אבק ואחר כך שטוף במים חמים עם מעט סבון.'),
  ('ac-filter', 4, 'ייבש והחזר',              'הנח את הפילטר לייבוש מלא (לפחות שעה), לאחר מכן החזר לתוך המיזוג וסגור.');

-- טכנאים
INSERT INTO technicians (category_id, name, initials, specialty, phone, stars, availability) VALUES
  (1, 'מיכאל כהן',  'מכ', 'אינסטלטור מוסמך',    '0501234567', 5.0, 'now'),
  (2, 'יוסי לוי',   'יל', 'חשמלאי מוסמך',        '0527654321', 4.0, 'tomorrow'),
  (6, 'דני מזרחי',  'דמ', 'איש תחזוקה כללי',     '0541112233', 4.0, 'now');

-- חנויות
INSERT INTO stores (name, address, hours, latitude, longitude, waze_link) VALUES
  (
    'פריקט חיפה',
    'רחוב הנמל 14, חיפה',
    'א׳–ה׳ 08:00–19:00 | ו׳ 08:00–14:00',
    32.819300, 34.998800,
    'https://waze.com/ul?ll=32.8193,34.9988&navigate=yes'
  ),
  (
    'בית אל-על חומרי בניין',
    'שד׳ מוריה 82, חיפה',
    'א׳–ה׳ 07:30–18:30 | ו׳ 07:30–13:00',
    32.806400, 34.987700,
    'https://waze.com/ul?ll=32.8064,34.9877&navigate=yes'
  ),
  (
    'סנטר שיפוצים',
    'רחוב חסן שוקרי 5, חיפה',
    'א׳–ה׳ 09:00–20:00 | ו׳ 09:00–14:00',
    32.814100, 34.994200,
    'https://waze.com/ul?ll=32.8141,34.9942&navigate=yes'
  );
