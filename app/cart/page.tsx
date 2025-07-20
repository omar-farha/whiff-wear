"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import Navigation from "@/components/navigation";

export default function CartPage() {
  const { state, updateQuantity, removeItem } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some products to get started!
            </p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({state.itemCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 border-b last:border-b-0"
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      <Image
                        src={
                          item.product.images[0] ||
                          "/placeholder.svg?height=80&width=80"
                        }
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover w-20 h-20"
                        priority={index < 3} // Only prioritize first few images
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p className="text-lg font-semibold text-gray-900">
                          {item.product.price} EGP
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:items-end gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.size,
                              item.color
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.size,
                              item.color
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                          {(item.product.price * item.quantity).toFixed(2)} EGP
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeItem(item.product.id, item.size, item.color)
                          }
                          className="text-red-600 hover:text-red-700 p-1 h-auto"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">
                            Remove
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{state.total.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{(state.total * 0.08).toFixed(2)} EGP</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{(state.total * 1.08).toFixed(2)} EGP</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
