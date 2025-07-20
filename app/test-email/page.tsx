"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function TestEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const sendTestEmail = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const testOrderData = {
        orderId: `test-order-${Date.now()}`,
        customerName: "Ahmed Mohamed",
        customerEmail: "customer@example.com",
        customerPhone: "01234567890",
        orderDate: new Date().toISOString(),
        totalAmount: 575.25,
        paymentMethod: "cash_on_delivery",
        shippingAddress: {
          address: "123 Tahrir Square, Downtown",
          city: "Cairo",
          governorate: "Cairo",
          country: "Egypt",
          alternativePhone: "01987654321",
          deliveryPrice: 30.0,
          zipCode: "11511",
        },
        orderItems: [
          {
            product: { name: "Premium Cotton T-Shirt" },
            quantity: 2,
            price: 145.5,
            size: "L",
            color: "Navy Blue",
          },
          {
            product: { name: "Slim Fit Denim Jeans" },
            quantity: 1,
            price: 254.25,
            size: "32",
            color: "Dark Indigo",
          },
        ],
      }

      console.log("🚀 Sending test email with data:", testOrderData)

      const response = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOrderData),
      })

      const data = await response.json()
      console.log("📨 API Response:", data)
      setResult(data)

      if (data.success) {
        toast({
          title: "✅ Test Email Sent Successfully!",
          description: `Email sent to farha.omar2008@gmail.com with ID: ${data.emailId}`,
        })
      } else {
        toast({
          title: "❌ Email Test Failed",
          description: data.message || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Test email error:", error)
      setResult({
        success: false,
        message: "Network error occurred",
        error: error.message,
      })
      toast({
        title: "❌ Network Error",
        description: "Failed to send test email - check console for details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">📧 Email System Test</CardTitle>
            <p className="text-gray-600">Test the order notification email system with your Resend API key</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Configuration Status</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>
                  • <strong>Resend API Key:</strong> ✅ Configured (re_5FD9nMBt_...)
                </li>
                <li>
                  • <strong>Admin Email:</strong> farha.omar2008@gmail.com
                </li>
                <li>
                  • <strong>Email Service:</strong> Resend (api.resend.com)
                </li>
                <li>
                  • <strong>Sender Domain:</strong> onboarding@resend.dev (verified)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Test Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p>
                    <strong>Customer:</strong> Ahmed Mohamed
                  </p>
                  <p>
                    <strong>Phone:</strong> 01234567890
                  </p>
                  <p>
                    <strong>Items:</strong> 2 products
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Total:</strong> 575.25 EGP
                  </p>
                  <p>
                    <strong>Payment:</strong> Cash on Delivery
                  </p>
                  <p>
                    <strong>Location:</strong> Cairo, Egypt
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={sendTestEmail} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Test Email...
                </>
              ) : (
                "🚀 Send Test Email to farha.omar2008@gmail.com"
              )}
            </Button>

            {result && (
              <Card className={`${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{result.success ? "✅" : "❌"}</span>
                    <h3 className={`font-semibold text-lg ${result.success ? "text-green-900" : "text-red-900"}`}>
                      {result.success ? "Email Sent Successfully!" : "Email Failed to Send"}
                    </h3>
                  </div>

                  <p className={`text-sm mb-4 ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.message}
                  </p>

                  {result.success && result.emailId && (
                    <div className="bg-white p-3 rounded border border-green-200 mb-4">
                      <p className="text-sm font-mono text-green-700">
                        <strong>Resend Email ID:</strong> {result.emailId}
                      </p>
                      <p className="text-xs text-green-600 mt-1">You can track this email in your Resend dashboard</p>
                    </div>
                  )}

                  {result.orderDetails && (
                    <div className="bg-white p-3 rounded border border-gray-200 text-xs space-y-1">
                      <p>
                        <strong>Order ID:</strong> #{result.orderDetails.orderId}
                      </p>
                      <p>
                        <strong>Customer:</strong> {result.orderDetails.customerName}
                      </p>
                      <p>
                        <strong>Total:</strong> {result.orderDetails.totalAmount} EGP
                      </p>
                      <p>
                        <strong>Sent To:</strong> {result.orderDetails.adminEmail}
                      </p>
                    </div>
                  )}

                  {result.error && (
                    <div className="bg-red-100 border border-red-200 p-3 rounded text-xs text-red-800 mt-3">
                      <strong>Error Details:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(result.error, null, 2)}</pre>
                    </div>
                  )}

                  {result.debug && (
                    <div className="bg-gray-100 border border-gray-200 p-3 rounded text-xs text-gray-700 mt-3">
                      <strong>Debug Info:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(result.debug, null, 2)}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📧 Email Delivery Tips</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • Check your <strong>inbox</strong> and <strong>spam/junk</strong> folder
                </li>
                <li>• Gmail may take 1-2 minutes to deliver the email</li>
                <li>• Check your Resend dashboard for delivery status</li>
                <li>• The email comes from "StyleCo &lt;onboarding@resend.dev&gt;"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
