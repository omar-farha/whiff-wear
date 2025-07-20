export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compare_price?: number
  category_id: string
  category?: Category
  images: string[]
  sizes: string[]
  colors: string[]
  stock_quantity: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  shipping_address: any
  billing_address: any
  payment_status: "pending" | "paid" | "failed"
  payment_method?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
  size?: string
  color?: string
  created_at: string
}

export interface HeroSection {
  id: string
  title: string
  subtitle?: string
  background_image_url?: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GovernorateDeliveryPrice {
  id: string
  governorate: string
  delivery_price: number
  is_active: boolean
  created_at: string
  updated_at: string
}
