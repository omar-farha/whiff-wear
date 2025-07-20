-- Create hero_sections table for managing homepage hero content
CREATE TABLE IF NOT EXISTS public.hero_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(1000),
  background_image_url TEXT,
  primary_button_text VARCHAR(100) DEFAULT 'Shop Now',
  primary_button_link VARCHAR(200) DEFAULT '/products',
  secondary_button_text VARCHAR(100) DEFAULT 'Browse Categories',
  secondary_button_link VARCHAR(200) DEFAULT '/categories',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default hero section
INSERT INTO public.hero_sections (title, subtitle, background_image_url) VALUES
('Premium Style, Exceptional Quality', 'Discover our latest collection of premium clothing and accessories', '/placeholder.svg?height=600&width=1200');

-- RLS Policy for hero sections
CREATE POLICY "Public hero sections are viewable by everyone" ON public.hero_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can do everything on hero sections" ON public.hero_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );
