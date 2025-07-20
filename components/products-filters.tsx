"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useState } from "react";
import { Filter, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function ProductsFilters({
  priceRange,
}: {
  priceRange: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentMin = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : priceRange.min;
  const currentMax = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : priceRange.max;
  const currentInStock = searchParams.get("inStock") === "true";
  const currentSortBy = searchParams.get("sortBy") || "newest";

  // Local state for form inputs
  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);
  const [inStock, setInStock] = useState(currentInStock);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Update URL with new filters
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice !== priceRange.min) {
      params.set("minPrice", minPrice.toString());
    } else {
      params.delete("minPrice");
    }

    if (maxPrice !== priceRange.max) {
      params.set("maxPrice", maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    if (inStock) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    if (sortBy !== "newest") {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    router.push(`${pathname}?${params.toString()}`);
    setIsMobileOpen(false);
  }, [
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    pathname,
    router,
    searchParams,
    priceRange,
  ]);

  // Reset to defaults
  const clearFilters = () => {
    router.push(pathname);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Filters (unchanged from original) */}
      <div className="hidden lg:block mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <div className="space-y-4">
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                value={[minPrice, maxPrice]}
                onValueChange={(value) => {
                  setMinPrice(value[0]);
                  setMaxPrice(value[1]);
                }}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{minPrice} EGP</span>
                <span>{maxPrice} EGP</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Availability</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStock}
                onCheckedChange={(checked) => setInStock(!!checked)}
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                In Stock Only
              </label>
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply/Clear Buttons */}
          <div className="flex flex-col gap-2 items-end justify-end">
            <Button onClick={applyFilters} className="w-full md:w-auto">
              Apply Filters
            </Button>
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-full md:w-auto"
            >
              Clear all
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button and Drawer */}
      <div className="lg:hidden mb-4">
        <Drawer open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80%]">
            <div className="mx-auto w-full max-w-sm p-4">
              <DrawerHeader className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerHeader>
              <div className="p-4 pb-0 space-y-6">
                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      min={priceRange.min}
                      max={priceRange.max}
                      step={10}
                      value={[minPrice, maxPrice]}
                      onValueChange={(value) => {
                        setMinPrice(value[0]);
                        setMaxPrice(value[1]);
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{minPrice} EGP</span>
                      <span>{maxPrice} EGP</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Availability</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock-mobile"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(!!checked)}
                    />
                    <label
                      htmlFor="inStock-mobile"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      In Stock Only
                    </label>
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Sort By</h3>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 pt-0 flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear all
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
