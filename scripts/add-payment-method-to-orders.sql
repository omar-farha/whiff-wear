-- Add `payment_method` column to orders
-- Run this after the original setup-database.sql script
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash_on_delivery';
