-- Triple A Book Club Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table (for monthly/bi-monthly reads)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  synopsis TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('fiction', 'non-fiction')),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions table (for book nominations)
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  synopsis TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('fiction', 'non-fiction')),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, suggestion_id)
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table (public display members, not auth users)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  social_links JSONB,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portal Status table (controls nomination/voting periods)
CREATE TABLE IF NOT EXISTS portal_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  category TEXT NOT NULL CHECK (category IN ('fiction', 'non-fiction')),
  nomination_open BOOLEAN DEFAULT false,
  voting_open BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year, category)
);

-- Site Content table (editable content from admin)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page, section)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_category_year_month ON books(category, year, month);
CREATE INDEX IF NOT EXISTS idx_suggestions_category_year_month ON suggestions(category, year, month);
CREATE INDEX IF NOT EXISTS idx_suggestions_user ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_suggestion ON votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(order_index);
CREATE INDEX IF NOT EXISTS idx_members_order ON members(order_index);
CREATE INDEX IF NOT EXISTS idx_portal_status_period ON portal_status(year, month, category);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update vote count on suggestions
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE suggestions SET vote_count = vote_count + 1 WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE suggestions SET vote_count = vote_count - 1 WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for vote count
DROP TRIGGER IF EXISTS trigger_update_vote_count ON votes;
CREATE TRIGGER trigger_update_vote_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_count();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_books_updated_at ON books;
CREATE TRIGGER trigger_books_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_suggestions_updated_at ON suggestions;
CREATE TRIGGER trigger_suggestions_updated_at
BEFORE UPDATE ON suggestions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_gallery_updated_at ON gallery;
CREATE TRIGGER trigger_gallery_updated_at
BEFORE UPDATE ON gallery
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_members_updated_at ON members;
CREATE TRIGGER trigger_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_portal_status_updated_at ON portal_status;
CREATE TRIGGER trigger_portal_status_updated_at
BEFORE UPDATE ON portal_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_site_content_updated_at
BEFORE UPDATE ON site_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Books policies
CREATE POLICY "Books are viewable by everyone"
ON books FOR SELECT
USING (true);

CREATE POLICY "Only super_admin can insert books"
ON books FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can update books"
ON books FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can delete books"
ON books FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Suggestions policies
CREATE POLICY "Suggestions are viewable by everyone"
ON suggestions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create suggestions"
ON suggestions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own suggestions"
ON suggestions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suggestions or super_admin can delete any"
ON suggestions FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
ON votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON votes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own votes"
ON votes FOR DELETE
USING (auth.uid() = user_id);

-- Gallery policies
CREATE POLICY "Gallery is viewable by everyone"
ON gallery FOR SELECT
USING (true);

CREATE POLICY "Only super_admin can insert gallery items"
ON gallery FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can update gallery items"
ON gallery FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can delete gallery items"
ON gallery FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Members policies
CREATE POLICY "Visible members are viewable by everyone"
ON members FOR SELECT
USING (is_visible = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Only super_admin can insert members"
ON members FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can update members"
ON members FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Only super_admin can delete members"
ON members FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Portal Status policies
CREATE POLICY "Portal status is viewable by everyone"
ON portal_status FOR SELECT
USING (true);

CREATE POLICY "Only super_admin can manage portal status"
ON portal_status FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Site Content policies
CREATE POLICY "Site content is viewable by everyone"
ON site_content FOR SELECT
USING (true);

CREATE POLICY "Only super_admin can manage site content"
ON site_content FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert sample portal status for current month
INSERT INTO portal_status (month, year, category, nomination_open, voting_open)
VALUES 
  (EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER, 'fiction', true, false),
  (EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER, 'non-fiction', true, false)
ON CONFLICT (month, year, category) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 
-- To make a user super_admin, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
--
-- To check portal status:
-- SELECT * FROM portal_status ORDER BY year DESC, month DESC;
--
-- To view all suggestions with vote counts:
-- SELECT s.*, p.full_name as suggested_by FROM suggestions s JOIN profiles p ON s.user_id = p.id ORDER BY vote_count DESC;
