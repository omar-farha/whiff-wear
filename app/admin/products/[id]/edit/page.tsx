"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import type { Category, User } from "@/types"
import Navigation from "@/components/navigation"
import ImageUpload from "@/components/image-upload"

export default function EditProductPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_price: "",
    category_id: "",
    images: [""],
    sizes: [] as string[],
    colors: [] as string[],
    stock_quantity: "",
    is_featured: false,
    is_active: true,
  })
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchCategories()
    fetchProduct()
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
  }

  const fetchCategories = async () => {
    if (!hasSupabaseConfig) return
    const { data, error } = await supabase.from("categories").select("*")
    if (!error && data) {
      setCategories(data)
    }
  }

  const fetchProduct = async () => {
    if (!hasSupabaseConfig) return
    const { data, error } = await supabase.from("products").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching product:", error)
      router.push("/admin/products")
      return
    }

    if (data) {
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        price: data.price.toString(),
        compare_price: data.compare_price?.toString() || "",
        category_id: data.category_id || "",
        images: data.images && data.images.length > 0 ? data.images : [],
        sizes: data.sizes || [],
        colors: data.colors || [],
        stock_quantity: data.stock_quantity.toString(),
        is_featured: data.is_featured,
        is_active: data.is_active,
      })
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize],
      }))
      setNewSize("")
    }
  }

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }))
  }

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }))
      setNewColor("")
    }
  }

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }))
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const updateImage = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        compare_price: formData.compare_price ? Number.parseFloat(formData.compare_price) : null,
        category_id: formData.category_id || null,
        images: formData.images.filter((img) => img.trim() !== ""),
        sizes: formData.sizes,
        colors: formData.colors,
        stock_quantity: Number.parseInt(formData.stock_quantity),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      }

      const { error } = await supabase.from("products").update(productData).eq("id", params.id)

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
        router.push("/admin/products")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="compare_price">Compare Price</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, compare_price: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                maxImages={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Sizes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add size (e.g., S, M, L)"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <Badge key={size} variant="secondary" className="cursor-pointer" onClick={() => removeSize(size)}>
                      {size} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Colors</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add color (e.g., Red, Blue)"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" onClick={addColor}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <Badge
                      key={color}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeColor(color)}
                    >
                      {color} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: !!checked }))}
                />
                <Label htmlFor="is_featured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: !!checked }))}
                />
                <Label htmlFor="is_active">Active (visible to customers)</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
