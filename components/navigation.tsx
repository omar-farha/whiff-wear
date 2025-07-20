"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, UserIcon, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/cart-context";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import type { Category, Product } from "@/types";
import Image from "next/image";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { state } = useCart();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim() || !hasSupabaseConfig) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(5);

        if (!error && data) {
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    if (!hasSupabaseConfig) return;

    const { data } = await supabase.from("categories").select("*").limit(6);
    if (data) {
      setCategories(data);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={"/whiff-wear-logo.png"}
              alt=""
              width={100}
              height={100}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-gray-900"
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-gray-700 hover:text-gray-900"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Search Bar with Dropdown */}
          <div
            className="hidden md:flex items-center max-w-sm relative"
            ref={searchRef}
          >
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                  onFocus={() => searchQuery && setShowSearchDropdown(true)}
                />
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <img
                          src={
                            product.images[0] ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {product.price} EGP
                          </p>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={handleViewAllResults}
                      className="p-3 text-center text-blue-600 hover:bg-blue-50 cursor-pointer border-t"
                    >
                      View all results for "{searchQuery}"
                    </div>
                  </>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-gray-500">
                    No products found for "{searchQuery}"
                    <div
                      onClick={handleViewAllResults}
                      className="mt-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Search all products
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  {userProfile.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/auth/login">
                  <UserIcon className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Shopping Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {state.itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>
              <Link
                href="/products"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
