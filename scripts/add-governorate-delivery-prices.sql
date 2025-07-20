-- Create governorate_delivery_prices table
CREATE TABLE IF NOT EXISTS public.governorate_delivery_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate VARCHAR(100) NOT NULL UNIQUE,
  delivery_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default Egyptian governorates with delivery prices
INSERT INTO public.governorate_delivery_prices (governorate, delivery_price) VALUES
('Cairo', 30.00),
('Alexandria', 40.00),
('Giza', 35.00),
('Qalyubia', 45.00),
('Port Said', 50.00),
('Suez', 55.00),
('Luxor', 60.00),
('Aswan', 65.00),
('Asyut', 55.00),
('Beheira', 45.00),
('Beni Suef', 50.00),
('Dakahlia', 45.00),
('Damietta', 50.00),
('Fayyum', 40.00),
('Gharbia', 45.00),
('Ismailia', 50.00),
('Kafr el-Sheikh', 45.00),
('Matrouh', 70.00),
('Minya', 55.00),
('Monufia', 40.00),
('New Valley', 80.00),
('North Sinai', 75.00),
('Qena', 60.00),
('Red Sea', 70.00),
('Sharqia', 45.00),
('Sohag', 60.00),
('South Sinai', 75.00);

-- RLS Policies for governorate delivery prices
CREATE POLICY "Public governorate prices are viewable by everyone" ON public.governorate_delivery_prices
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can do everything on governorate prices" ON public.governorate_delivery_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );
