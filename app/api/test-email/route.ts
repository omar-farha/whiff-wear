import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Test email data
    const testOrderData = {
      orderId: "test-order-123",
      customerName: "Test Customer",
      customerEmail: "customer@test.com",
      customerPhone: "01234567890",
      orderDate: new Date().toISOString(),
      totalAmount: 299.99,
      paymentMethod: "cash_on_delivery",
      shippingAddress: {
        address: "123 Test Street",
        city: "Cairo",
        governorate: "Cairo",
        country: "Egypt",
        deliveryPrice: 25.0,
      },
      orderItems: [
        {
          product: { name: "Test T-Shirt" },
          quantity: 2,
          price: 99.99,
          size: "M",
          color: "Blue",
        },
        {
          product: { name: "Test Jeans" },
          quantity: 1,
          price: 149.99,
          size: "L",
          color: "Black",
        },
      ],
    }

    // Send test email
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-order-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testOrderData),
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      result,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: "Failed to send test email", details: error.message }, { status: 500 })
  }
}
