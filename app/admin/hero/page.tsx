"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import type { User } from "@/types"
import Navigation from "@/components/navigation"
import ImageUpload from "@/components/image-upload"

interface HeroSection {
  id: string
  title: string
  subtitle?: string
  background_image_url?: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  is_active: boolean
}

export default function AdminHeroPage() {
  const [user, setUser] = useState<User | null>(null)
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    background_image_url: "",
    primary_button_text: "Shop Now",
    primary_button_link: "/products",
    secondary_button_text: "Browse Categories",
    secondary_button_link: "/categories",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchHeroSection()
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

  const fetchHeroSection = async () => {
    if (!hasSupabaseConfig) return

    const { data, error } = await supabase.from("hero_sections").select("*").eq("is_active", true).single()

    if (data) {
      setHeroSection(data)
      setFormData({
        title: data.title,
        subtitle: data.subtitle || "",
        background_image_url: data.background_image_url || "",
        primary_button_text: data.primary_button_text,
        primary_button_link: data.primary_button_link,
        secondary_button_text: data.secondary_button_text,
        secondary_button_link: data.secondary_button_link,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (heroSection) {
        // Update existing hero section
        const { error } = await supabase
          .from("hero_sections")
          .update({
            title: formData.title,
            subtitle: formData.subtitle,
            background_image_url: formData.background_image_url,
            primary_button_text: formData.primary_button_text,
            primary_button_link: formData.primary_button_link,
            secondary_button_text: formData.secondary_button_text,
            secondary_button_link: formData.secondary_button_link,
            updated_at: new Date().toISOString(),
          })
          .eq("id", heroSection.id)

        if (error) throw error
      } else {
        // Create new hero section
        const { error } = await supabase.from("hero_sections").insert([
          {
            ...formData,
            is_active: true,
          },
        ])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Hero section updated successfully!",
      })

      fetchHeroSection()
    } catch (error) {
      console.error("Error updating hero section:", error)
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
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
          <h1 className="text-3xl font-bold text-gray-900">Hero Section Management</h1>
          <p className="text-gray-600">Customize the homepage hero section</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Section Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Main Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Premium Style, Exceptional Quality"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Discover our latest collection of premium clothing and accessories"
                  rows={3}
                />
              </div>

              <div>
                <Label>Background Image</Label>
                <ImageUpload
                  images={formData.background_image_url ? [formData.background_image_url] : []}
                  onImagesChange={(images) =>
                    setFormData((prev) => ({ ...prev, background_image_url: images[0] || "" }))
                  }
                  maxImages={1}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_button_text">Primary Button Text</Label>
                  <Input
                    id="primary_button_text"
                    value={formData.primary_button_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_button_text: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="primary_button_link">Primary Button Link</Label>
                  <Input
                    id="primary_button_link"
                    value={formData.primary_button_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_button_link: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondary_button_text">Secondary Button Text</Label>
                  <Input
                    id="secondary_button_text"
                    value={formData.secondary_button_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondary_button_text: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_button_link">Secondary Button Link</Label>
                  <Input
                    id="secondary_button_link"
                    value={formData.secondary_button_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondary_button_link: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Hero Section"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                  Back to Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
