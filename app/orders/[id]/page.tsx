"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import Navigation from "@/components/navigation"
import type { Order, OrderItem, User } from "@/types"

export default function OrderDetailPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
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
      fetchOrder(params.id as string, userData.id)
    }
  }

  const fetchOrder = async (orderId: string, userId: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", userId)
        .single()

      if (orderError) {
        console.error("Error fetching order:", orderError)
        router.push("/orders")
        return
      }

      setOrder(orderData)

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("order_id", orderId)

      if (itemsError) {
        console.error("Error fetching order items:", itemsError)
      } else {
        setOrderItems(itemsData || [])
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
          <p className="text-center text-gray-600">Please configure Supabase to view order details.</p>
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600">The order you're looking for doesn't exist.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.svg?height=80&width=80"}
                        alt={item.product?.name || "Product"}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">{item.product?.name}</h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} EGP
                      </p>
                      <p className="text-sm text-gray-500">{item.price} EGP each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  {getStatusBadge(order.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Status</p>
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Method</p>
                  <p className="text-sm text-gray-600">
                    {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Credit Card"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{order.total_amount.toFixed(2)} EGP</span>
                </div>
              </CardContent>
            </Card>

            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping_address.fullName}</p>
                    <p>{order.shipping_address.phone}</p>
                    {order.shipping_address.alternativePhone && <p>Alt: {order.shipping_address.alternativePhone}</p>}
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.governorate}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.zipCode && <p>Postal Code: {order.shipping_address.zipCode}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
