"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Users, ShoppingCart, TrendingUp, Plus, ImageIcon, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types"
import Navigation from "@/components/navigation"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()

    // Set up real-time subscription for orders table
    const ordersSubscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          // Refetch stats when orders change
          fetchStats()
        },
      )
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (!userData?.is_admin) {
      router.push("/")
      return
    }

    setUser(userData)
    setIsLoading(false)
  }

  const fetchStats = async () => {
    try {
      const [productsResult, ordersResult, usersResult, revenueResult] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("id", { count: "exact" }),
        supabase.from("users").select("id", { count: "exact" }),
        // Only count revenue from delivered orders with paid status
        supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "delivered")
          .eq("payment_status", "paid"),
      ])

      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your ecommerce store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Delivered)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} EGP</div>
              <p className="text-xs text-muted-foreground">Updates automatically</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="space-y-8">
          {/* Inventory Management */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Products
                  </CardTitle>
                  <CardDescription>Manage your product catalog and inventory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/admin/products">View All Products</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/products/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Product
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Categories
                  </CardTitle>
                  <CardDescription>Organize products into categories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/admin/categories">View All Categories</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/categories/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Category
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order & Delivery Management */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order & Delivery Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Orders
                  </CardTitle>
                  <CardDescription>View and manage customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/admin/orders">Manage Orders</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Delivery Prices
                  </CardTitle>
                  <CardDescription>Set delivery prices for each governorate</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/admin/delivery-prices">Manage Delivery Prices</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Website Customization */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Customization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Hero Section
                  </CardTitle>
                  <CardDescription>Customize homepage hero banner</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/admin/hero">Edit Hero Section</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage customer accounts and administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
