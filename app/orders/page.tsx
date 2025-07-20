"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import Navigation from "@/components/navigation"
import type { Order, User } from "@/types"

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (!hasSupabaseConfig) {
      router.push("/auth/login")
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (userData) {
      setUser(userData)
      fetchOrders(userData.id)
    }
  }

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      processing: { variant: "default" as const, label: "Processing" },
      shipped: { variant: "outline" as const, label: "Shipped" },
      delivered: { variant: "default" as const, label: "Delivered" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-center text-gray-600">Please configure Supabase to view your orders.</p>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track your order history and status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders found</p>
                <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                  Start Shopping
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
