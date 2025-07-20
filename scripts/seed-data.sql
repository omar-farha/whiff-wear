-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('T-Shirts', 't-shirts', 'Comfortable and stylish t-shirts for everyday wear', '/placeholder.svg?height=300&width=300'),
('Hoodies', 'hoodies', 'Cozy hoodies perfect for any season', '/placeholder.svg?height=300&width=300'),
('Jeans', 'jeans', 'Premium denim jeans in various fits', '/placeholder.svg?height=300&width=300'),
('Accessories', 'accessories', 'Complete your look with our accessories', '/placeholder.svg?height=300&width=300');

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, compare_price, category_id, images, sizes, colors, stock_quantity, is_featured, is_active) VALUES
('Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'A timeless cotton t-shirt that goes with everything', 29.99, 39.99, (SELECT id FROM categories WHERE slug = 't-shirts'), ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Navy', 'Gray'], 100, true, true),
('Premium Hoodie', 'premium-hoodie', 'Ultra-soft premium hoodie with perfect fit', 79.99, 99.99, (SELECT id FROM categories WHERE slug = 'hoodies'), ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Gray', 'Navy'], 50, true, true),
('Slim Fit Jeans', 'slim-fit-jeans', 'Modern slim fit jeans with stretch comfort', 89.99, 119.99, (SELECT id FROM categories WHERE slug = 'jeans'), ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Dark Blue', 'Light Blue', 'Black'], 75, false, true),
('Baseball Cap', 'baseball-cap', 'Classic baseball cap with adjustable strap', 24.99, 29.99, (SELECT id FROM categories WHERE slug = 'accessories'), ARRAY['/placeholder.svg?height=400&width=400'], ARRAY['One Size'], ARRAY['Black', 'White', 'Navy'], 200, false, true);

-- Create an admin user (you'll need to sign up first, then update this)
-- UPDATE public.users SET is_admin = true WHERE email = 'admin@example.com';
