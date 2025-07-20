"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import Navigation from "@/components/navigation"
import type { User } from "@/types"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
  })
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

    if (userData) {
      setUser(userData)
      setFormData({
        fullName: userData.full_name || "",
        email: userData.email,
        avatarUrl: userData.avatar_url || "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

      // Refresh user data
      checkAuth()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-center text-gray-600">Please configure Supabase to access your profile.</p>
        </div>
      </div>
    )
  }

  if (!user) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={formData.email} disabled className="bg-gray-100" />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Type</p>
                  <p className="text-sm text-gray-600">{user.is_admin ? "Administrator" : "Customer"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                {user.is_admin && (
                  <Button asChild className="w-full">
                    <a href="/admin">Access Admin Panel</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
