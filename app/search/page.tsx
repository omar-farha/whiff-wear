"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import { supabase, hasSupabaseConfig } from "@/lib/supabase"
import type { Product } from "@/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (query) {
      searchProducts(query)
    } else {
      setIsLoading(false)
    }
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    if (!hasSupabaseConfig) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching products:", error)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results {query && `for "${query}"`}</h1>
          <p className="text-gray-600">{isLoading ? "Searching..." : `Found ${products.length} products`}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div>Loading...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.is_featured && <Badge className="absolute top-2 left-2">Featured</Badge>}
                        {product.compare_price && product.compare_price > product.price && (
                          <Badge variant="destructive" className="absolute top-2 right-2">
                            Sale
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">{product.price} EGP</span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-sm text-gray-500 line-through">{product.compare_price} EGP</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.stock_quantity > 0 ? (
                              <span className="text-green-600">In Stock</span>
                            ) : (
                              <span className="text-red-600">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Products Found</h2>
                <p className="text-gray-600 mb-8">
                  {query
                    ? `No products found for "${query}". Try a different search term.`
                    : "Enter a search term to find products."}
                </p>
                <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                  Browse All Products
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
