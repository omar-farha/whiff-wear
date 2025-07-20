"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import Navigation from "@/components/navigation"
import type { User } from "@/types"

interface GovernorateDeliveryPrice {
  id: string
  governorate: string
  delivery_price: number
  is_active: boolean
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [governorates, setGovernorates] = useState<GovernorateDeliveryPrice[]>([])
  const [deliveryPrice, setDeliveryPrice] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    alternativePhone: "",
    address: "",
    city: "",
    governorate: "",
    zipCode: "",
    country: "Egypt",
    paymentMethod: "cash_on_delivery",
  })
  const { state, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchGovernorates()
  }, [])

  const checkAuth = async () => {
    if (!hasSupabaseConfig) return

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()
      if (userData) {
        setUser(userData)
        setFormData((prev) => ({
          ...prev,
          email: userData.email,
          fullName: userData.full_name || "",
        }))
      }
    }
  }

  const fetchGovernorates = async () => {
    if (!hasSupabaseConfig) return

    const { data, error } = await supabase
      .from("governorate_delivery_prices")
      .select("*")
      .eq("is_active", true)
      .order("governorate", { ascending: true })

    if (!error && data) {
      setGovernorates(data)
    }
  }

  const handleGovernorateChange = (governorate: string) => {
    setFormData((prev) => ({ ...prev, governorate }))
    const selectedGov = governorates.find((gov) => gov.governorate === governorate)
    setDeliveryPrice(selectedGov?.delivery_price || 0)
  }

  const handlePhoneChange = (value: string, field: "phone" | "alternativePhone") => {
    // Remove any non-digit characters
    const digitsOnly = value.replace(/\D/g, "")
    // Limit to 11 digits
    const limitedDigits = digitsOnly.slice(0, 11)
    setFormData((prev) => ({ ...prev, [field]: limitedDigits }))
  }

  const subtotal = state.total
  const tax = subtotal * 0.08
  const total = subtotal + deliveryPrice + tax

  const sendOrderNotificationEmail = async (order: any, orderItems: any[]) => {
    try {
      const emailData = {
        orderId: order.id,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        orderDate: order.created_at,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          alternativePhone: formData.alternativePhone,
          address: formData.address,
          city: formData.city,
          governorate: formData.governorate,
          zipCode: formData.zipCode,
          country: formData.country,
          deliveryPrice: deliveryPrice,
        },
        orderItems: orderItems.map((item) => ({
          product: state.items.find((cartItem) => cartItem.product.id === item.product_id)?.product,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
      }

      const response = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        console.log("Order notification email sent successfully")
      } else {
        console.error("Failed to send order notification email")
      }
    } catch (error) {
      console.error("Error sending order notification email:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate phone numbers
    if (formData.phone.length !== 11) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 11 digits",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.alternativePhone && formData.alternativePhone.length !== 11) {
      toast({
        title: "Invalid Alternative Phone Number",
        description: "Alternative phone number must be exactly 11 digits",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.governorate) {
      toast({
        title: "Please select a governorate",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!hasSupabaseConfig) {
      toast({
        title: "Demo Mode",
        description: "Order placed successfully! (Demo mode - no real payment processed)",
      })
      clearCart()
      router.push("/")
      return
    }

    try {
      const orderData = {
        user_id: user?.id || null,
        status: "pending",
        total_amount: total,
        shipping_address: {
          fullName: formData.fullName,
          phone: formData.phone,
          alternativePhone: formData.alternativePhone,
          address: formData.address,
          city: formData.city,
          governorate: formData.governorate,
          zipCode: formData.zipCode,
          country: formData.country,
          deliveryPrice: deliveryPrice,
        },
        billing_address: {
          fullName: formData.fullName,
          phone: formData.phone,
          alternativePhone: formData.alternativePhone,
          address: formData.address,
          city: formData.city,
          governorate: formData.governorate,
          zipCode: formData.zipCode,
          country: formData.country,
          deliveryPrice: deliveryPrice,
        },
        payment_status: formData.paymentMethod === "cash_on_delivery" ? "pending" : "paid",
        payment_method: formData.paymentMethod,
      }

      const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

      if (orderError) {
        throw orderError
      }

      // Create order items
      const orderItems = state.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      // Send email notification to admin users
      await sendOrderNotificationEmail(order, orderItems)

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed. Admin has been notified.`,
      })

      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to checkout!</p>
            <Button asChild>
              <a href="/products">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number * (11 digits)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01012345678"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value, "phone")}
                      maxLength={11}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.phone.length}/11 digits</p>
                  </div>
                  <div>
                    <Label htmlFor="alternativePhone">Alternative Phone Number (11 digits)</Label>
                    <Input
                      id="alternativePhone"
                      type="tel"
                      placeholder="01112345678"
                      value={formData.alternativePhone}
                      onChange={(e) => handlePhoneChange(e.target.value, "alternativePhone")}
                      maxLength={11}
                    />
                    {formData.alternativePhone && (
                      <p className="text-xs text-gray-500 mt-1">{formData.alternativePhone.length}/11 digits</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address, building number, apartment"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="governorate">Governorate *</Label>
                      <Select value={formData.governorate} onValueChange={handleGovernorateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select governorate" />
                        </SelectTrigger>
                        <SelectContent>
                          {governorates.map((gov) => (
                            <SelectItem key={gov.id} value={gov.governorate}>
                              {gov.governorate} - {gov.delivery_price.toFixed(2)} EGP
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.governorate && (
                        <p className="text-xs text-green-600 mt-1">Delivery: {deliveryPrice.toFixed(2)} EGP</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cash_on_delivery"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === "cash_on_delivery"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="cash_on_delivery" className="flex items-center cursor-pointer">
                        <span className="ml-2">Cash on Delivery</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="credit_card"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === "credit_card"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                        <span className="ml-2">Credit Card</span>
                      </Label>
                    </div>
                  </div>

                  {formData.paymentMethod === "credit_card" && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Credit Card Information</p>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input id="expiryDate" placeholder="MM/YY" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" maxLength={4} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "cash_on_delivery" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💰 You will pay in cash when your order is delivered to your address.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : `Place Order - ${total.toFixed(2)} EGP`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg?height=60&width=60"}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                      <div className="text-sm text-gray-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <div>Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {(item.product.price * item.quantity).toFixed(2)} EGP
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery ({formData.governorate || "Select governorate"})</span>
                    <span>{deliveryPrice.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{tax.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
