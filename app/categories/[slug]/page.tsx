import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import type { Product, Category } from "@/types";
import { Filters } from "@/components/filters";

async function getCategory(slug: string): Promise<Category | null> {
  if (!hasSupabaseConfig) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data;
}

async function getCategoryProducts(
  categoryId: string,
  filters: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: "price-asc" | "price-desc" | "newest" | "popular";
  }
): Promise<Product[]> {
  if (!hasSupabaseConfig) return [];

  let query = supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true);

  // Price filter
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  // Stock filter
  if (filters.inStock) {
    query = query.gt("stock_quantity", 0);
  }

  // Sorting
  switch (filters.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
      query = query.order("views", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sortBy?: string;
  };
}) {
  const category = await getCategory(params.slug);

  // Parse filter values from searchParams
  const minPrice = searchParams.minPrice
    ? Number(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? Number(searchParams.maxPrice)
    : undefined;
  const inStock = searchParams.inStock === "true";
  const sortBy = searchParams.sortBy as
    | "price-asc"
    | "price-desc"
    | "newest"
    | "popular"
    | undefined;

  const filters = {
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  };

  const products = category
    ? await getCategoryProducts(category.id, filters)
    : [];

  // Calculate price range for slider
  const priceRange = products.reduce(
    (acc, product) => {
      return {
        min: Math.min(acc.min, product.price),
        max: Math.max(acc.max, product.price),
      };
    },
    { min: Infinity, max: -Infinity }
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Category Not Found
            </h1>
            <p className="text-gray-600">
              The category you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6">
            {category.image_url && (
              <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                <Image
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {products.length} products
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Client Component */}
        <Filters priceRange={priceRange} />

        {/* Updated Products Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square relative overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-100">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                    {product.compare_price &&
                      product.compare_price > product.price && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          Sale
                        </Badge>
                      )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-sm sm:text-xl font-bold text-gray-900">
                          {product.price} EGP
                        </span>
                        {product.compare_price &&
                          product.compare_price > product.price && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              {product.compare_price} EGP
                            </span>
                          )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
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

        {products.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Products Found
            </h2>
            <p className="text-gray-600">
              No products match your filter criteria.
            </p>
            <Link
              href={`/categories/${params.slug}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
