import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import { supabase } from "@/lib/supabase";
import type { Product, Category } from "@/types";
import { hasSupabaseConfig } from "@/lib/supabase";

interface HeroSection {
  id: string;
  title: string;
  subtitle?: string;
  background_image_url?: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(4);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return data || [];
}

async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .limit(4);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

async function getActiveHeroSection(): Promise<HeroSection | null> {
  if (!hasSupabaseConfig)
    return {
      id: "default",
      title: "Premium Style, Exceptional Quality",
      subtitle:
        "Discover our latest collection of premium clothing and accessories",
      background_image_url: "/placeholder.svg?height=600&width=1200",
      primary_button_text: "Shop Now",
      primary_button_link: "/products",
      secondary_button_text: "Browse Categories",
      secondary_button_link: "/categories",
    };

  const { data, error } = await supabase
    .from("hero_sections")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching hero section:", error);
    return {
      id: "default",
      title: "Premium Style, Exceptional Quality",
      subtitle:
        "Discover our latest collection of premium clothing and accessories",
      background_image_url: "/placeholder.svg?height=600&width=1200",
      primary_button_text: "Shop Now",
      primary_button_link: "/products",
      secondary_button_text: "Browse Categories",
      secondary_button_link: "/categories",
    };
  }

  return data;
}

export default async function HomePage() {
  const [featuredProducts, categories, heroSection] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getActiveHeroSection(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section - Full viewport height minus navigation */}
      <section
        className="relative bg-gray-900 text-white"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="absolute inset-0">
          <Image
            src={
              heroSection?.background_image_url ||
              "/placeholder.svg?height=600&width=1200"
            }
            alt="Hero background"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {heroSection?.title || "Premium Style, Exceptional Quality"}
            </h1>
            {heroSection?.subtitle && (
              <p className="text-xl md:text-2xl mb-8 text-gray-300">
                {heroSection.subtitle}
              </p>
            )}
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href={heroSection?.primary_button_link || "/products"}>
                  {heroSection?.primary_button_text || "Shop Now"}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
                asChild
              >
                <Link
                  href={heroSection?.secondary_button_link || "/categories"}
                >
                  {heroSection?.secondary_button_text || "Browse Categories"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <Link href={`/categories/${category.slug}`}>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <Image
                        src={
                          category.image_url ||
                          "/placeholder.svg?height=300&width=300"
                        }
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-semibold text-xl group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 mt-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked favorites from our latest collection
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={
                            product.images[0] ||
                            "/placeholder.svg?height=300&width=300"
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            {product.price} EGP
                          </span>
                          {product.compare_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.compare_price} EGP
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No featured products available
              </p>
              <Button asChild>
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in Style</h2>
          <p className="text-lg text-gray-300 mb-8">
            Subscribe to our newsletter for the latest updates and exclusive
            offers
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button size="lg">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src={"/whiff-wear-logo.png"}
                alt=""
                width={100}
                height={100}
              />{" "}
              <p className="text-gray-600">
                Premium clothing and accessories for the modern lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/products">All Products</Link>
                </li>
                <li>
                  <Link href="/categories/t-shirts">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/categories/hoodies">Hoodies</Link>
                </li>
                <li>
                  <Link href="/categories/jeans">Jeans</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/shipping">Shipping Info</Link>
                </li>
                <li>
                  <Link href="/returns">Returns</Link>
                </li>
                <li>
                  <Link href="/size-guide">Size Guide</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/auth/login">Sign In</Link>
                </li>
                <li>
                  <Link href="/auth/register">Create Account</Link>
                </li>
                <li>
                  <Link href="/orders">Order History</Link>
                </li>
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>
              &copy; 2025{" "}
              <a
                href="https://websity1.vercel.app/"
                target="_blank"
                className="hover:text-blue-600"
              >
                Websity
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
