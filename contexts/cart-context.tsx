"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect } from "react"
import type { CartItem, Product } from "@/types"

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; size?: string; color?: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size?: string; color?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number; size?: string; color?: string } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, size, color } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color,
      )

      let newItems: CartItem[]
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        newItems = [...state.items, { product, quantity, size, color }]
      }

      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const { productId, size, color } = action.payload
      const newItems = state.items.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color === color),
      )
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity, size, color } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { productId, size, color } })
      }

      const newItems = state.items.map((item) =>
        item.product.id === productId && item.size === size && item.color === color ? { ...item, quantity } : item,
      )
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      return { items, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product, quantity: number, size?: string, color?: string) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity, size, color } })
  }

  const removeItem = (productId: string, size?: string, color?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size, color } })
  }

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, size, color } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
