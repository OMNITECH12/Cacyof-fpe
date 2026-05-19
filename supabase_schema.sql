-- SUPABASE SCHEMA FOR CACYOF FPE PORTAL

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'member', -- 'member' or 'admin'
  academic_level TEXT,
  department TEXT,
  hobbies TEXT,
  mentor_name TEXT,
  career_path TEXT,
  entrepreneurship_path TEXT,
  marital_status TEXT,
  favorite_quote TEXT,
  favorite_food TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Posts Table (Blog)
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Quotes Table
CREATE TABLE quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'read', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- NOTE: SUPABASE STORAGE BUCKET SETUP
-- You MUST create a PUBLIC bucket named 'avatars' in your Supabase project's Storage section
-- for profile pictures and leader images to work.

-- 5. Leaders Table (Executive Council)
CREATE TABLE leaders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- SECURITY RULES (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

-- ... (Previous policies)
-- Notifications: Everyone can view, only admins can manage
CREATE POLICY "Everyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage notifications" ON notifications ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Leaders: Everyone can view, only admins can manage
CREATE POLICY "Everyone can view leaders" ON leaders FOR SELECT USING (true);
CREATE POLICY "Admins can manage leaders" ON leaders ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
