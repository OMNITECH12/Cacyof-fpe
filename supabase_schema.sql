-- SUPABASE SCHEMA FOR CACYOF FPE PORTAL
-- This script contains IF NOT EXISTS guards for all tables and columns.
-- You can safely run this in your Supabase SQL Editor as many times as needed!

-- 0. Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'member', -- 'member' or 'admin'
  academic_level TEXT, -- ND1, ND2, HND1, HND2
  student_status TEXT, -- 'FYB', 'Fresher', 'Staylite', 'Alumni'
  church_role TEXT DEFAULT 'member', -- 'member', 'worker', 'executive'
  church_position TEXT, -- Position or Office held inside church
  academic_session TEXT, -- e.g. '2024/2025' or '2025/2026'
  department TEXT,
  hobbies TEXT,
  mentor_name TEXT,
  career_path TEXT,
  entrepreneurship_path TEXT,
  marital_status TEXT,
  favorite_quote TEXT,
  favorite_food TEXT,
  avatar_url TEXT,
  contact_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bulletproof script to add fields to profiles in case the table already existed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS church_role TEXT DEFAULT 'member';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS church_position TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_session TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_status TEXT; -- Ensures Alumni support if previous column was dropped or missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- 2. Posts Table (Blog)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'read', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'General', -- 'General', 'Fresher', 'Staylite', 'FYB', 'Alumni'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bulletproof script to add fields to notifications in case table already existed
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- 5. Leaders Table (Executive Council)
CREATE TABLE IF NOT EXISTS leaders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

-- Note: Policies will fail to create if policies with the exact name already exist.
-- To ensure safe execution, we drop older policies if they exist before rebuilding.

DO $$
BEGIN
    -- DROP EXISTING POLICIES TO PREVENT "ALREADY EXISTS" ERRORS
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Everyone can view published posts" ON posts;
    DROP POLICY IF EXISTS "Admins can manage posts" ON posts;
    DROP POLICY IF EXISTS "Members can insert quotes" ON quotes;
    DROP POLICY IF EXISTS "Everyone can view Approved quotes" ON quotes;
    DROP POLICY IF EXISTS "Admins can manage quotes" ON quotes;
    DROP POLICY IF EXISTS "Everyone can view notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
    DROP POLICY IF EXISTS "Everyone can view leaders" ON leaders;
    DROP POLICY IF EXISTS "Admins can manage leaders" ON leaders;
END
$$;

-- Profiles: Users can read all profiles, but only insert/update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Everyone can read published posts, only admins can manage
CREATE POLICY "Everyone can view published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quotes: Members can insert, Admins can view/manage
CREATE POLICY "Members can insert quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Everyone can view Approved quotes" ON quotes FOR SELECT USING (status = 'read' OR status = 'approved' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage quotes" ON quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: Everyone can view, only admins can manage
CREATE POLICY "Everyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Leaders: Everyone can view, only admins can manage
CREATE POLICY "Everyone can view leaders" ON leaders FOR SELECT USING (true);
CREATE POLICY "Admins can manage leaders" ON leaders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTE: SUPABASE STORAGE BUCKET SETUP
-- 1. Create a PUBLIC bucket named 'avatars' in your Supabase project (from storage dashboard).
-- 2. Alternatively, you can run the following SQL script to set up the bucket and select/insert policies if you have superuser privileges:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
