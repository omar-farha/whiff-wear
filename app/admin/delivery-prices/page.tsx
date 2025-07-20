"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import type { User } from "@/types"
import Navigation from "@/components/navigation"

interface GovernorateDeliveryPrice {
  id: string
  governorate: string
  delivery_price: number
  is_active: boolean
}

export default function AdminDeliveryPricesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [deliveryPrices, setDeliveryPrices] = useState<GovernorateDeliveryPrice[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

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

    if (!userData?.is_admin) {
      router.push("/")
      return
    }

    setUser(userData)
    fetchDeliveryPrices()
  }

  const fetchDeliveryPrices = async () => {
    try {
      const { data, error } = await supabase
        .from("governorate_delivery_prices")
        .select("*")
        .order("governorate", { ascending: true })

      if (error) {
        console.error("Error fetching delivery prices:", error)
        toast({
          title: "Error",
          description: "Failed to fetch delivery prices",
          variant: "destructive",
        })
      } else {
        setDeliveryPrices(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id: string, currentPrice: number) => {
    setEditingId(id)
    setEditPrice(currentPrice.toString())
  }

  const handleSave = async (id: string) => {
    try {
      const price = Number.parseFloat(editPrice)
      if (isNaN(price) || price < 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("governorate_delivery_prices")
        .update({ delivery_price: price })
        .eq("id", id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update delivery price",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Delivery price updated successfully",
        })
        setEditingId(null)
        setEditPrice("")
        fetchDeliveryPrices()
      }
    } catch (error) {
      console.error("Error updating price:", error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditPrice("")
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("governorate_delivery_prices")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Governorate ${!currentStatus ? "activated" : "deactivated"}`,
        })
        fetchDeliveryPrices()
      }
    } catch (error) {
      console.error("Error updating status:", error)
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

  if (!hasSupabaseConfig || !user?.is_admin) {
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
          <h1 className="text-3xl font-bold text-gray-900">Delivery Prices Management</h1>
          <p className="text-gray-600">Set delivery prices for each governorate</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Governorate Delivery Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Governorate</TableHead>
                    <TableHead>Delivery Price (EGP)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPrices.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.governorate}</p>
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-gray-500">EGP</span>
                          </div>
                        ) : (
                          <p className="font-medium">{item.delivery_price.toFixed(2)} EGP</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {editingId === item.id ? (
                            <>
                              <Button size="sm" onClick={() => handleSave(item.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item.id, item.delivery_price)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {deliveryPrices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No delivery prices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
