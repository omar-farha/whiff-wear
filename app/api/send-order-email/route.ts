import { type NextRequest, NextResponse } from "next/server"

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  orderDate: string
  totalAmount: number
  paymentMethod: string
  shippingAddress: any
  orderItems: any[]
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderEmailData = await request.json()

    // Your admin email
    const adminEmail = "farha.omar2008@gmail.com"
    const resendApiKey = "re_5FD9nMBt_Gy431LLB7sVMhK4jyfHNVuPW"

    console.log("📧 Processing order email notification...")
    console.log("Order ID:", orderData.orderId.slice(0, 8))
    console.log("Admin Email:", adminEmail)
    console.log("Resend API Key:", resendApiKey ? "✅ Present" : "❌ Missing")

    // Prepare email content
    const emailSubject = `🛍️ New Order #${orderData.orderId.slice(0, 8)} - StyleCo`
    const emailHtml = generateOrderEmailHTML(orderData)

    // Send email using Resend
    try {
      console.log("🚀 Sending email via Resend...")

      const emailPayload = {
        from: "StyleCo <onboarding@resend.dev>", // Using Resend's verified domain
        to: [adminEmail],
        subject: emailSubject,
        html: emailHtml,
      }

      console.log("📤 Email payload:", {
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject,
        htmlLength: emailPayload.html.length,
      })

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })

      const responseText = await response.text()
      console.log("📨 Resend Response Status:", response.status)
      console.log("📨 Resend Response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse Resend response:", parseError)
        result = { error: "Invalid response format", raw: responseText }
      }

      if (response.ok && result.id) {
        console.log("✅ Email sent successfully!")
        console.log("📧 Email ID:", result.id)

        return NextResponse.json({
          success: true,
          message: "Order notification email sent successfully to farha.omar2008@gmail.com",
          emailId: result.id,
          orderDetails: {
            orderId: orderData.orderId.slice(0, 8),
            customerName: orderData.customerName,
            totalAmount: orderData.totalAmount,
            adminEmail: adminEmail,
          },
        })
      } else {
        console.error("❌ Resend API Error:")
        console.error("Status:", response.status)
        console.error("Response:", result)

        // Common Resend error handling
        let errorMessage = "Unknown error"
        if (result.message) {
          errorMessage = result.message
        } else if (result.error) {
          errorMessage = result.error
        } else if (response.status === 401) {
          errorMessage = "Invalid API key"
        } else if (response.status === 422) {
          errorMessage = "Invalid email format or missing required fields"
        }

        return NextResponse.json({
          success: false,
          message: `Failed to send email: ${errorMessage}`,
          error: result,
          debug: {
            status: response.status,
            apiKey: resendApiKey.substring(0, 10) + "...",
            adminEmail: adminEmail,
          },
        })
      }
    } catch (emailError) {
      console.error("❌ Network error sending email:", emailError)

      return NextResponse.json({
        success: false,
        message: "Network error while sending email",
        error: emailError.message,
        debug: {
          apiKey: resendApiKey.substring(0, 10) + "...",
          adminEmail: adminEmail,
        },
      })
    }
  } catch (error) {
    console.error("❌ Error processing order email:", error)
    return NextResponse.json(
      {
        error: "Failed to process order notification",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function generateOrderEmailHTML(orderData: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification - StyleCo</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px;
        }
        .alert-banner {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .alert-banner h2 {
          color: #92400e;
          font-size: 20px;
          margin-bottom: 8px;
        }
        .alert-banner p {
          color: #78350f;
          font-size: 16px;
          font-weight: 600;
        }
        .total-highlight {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
        }
        .info-section { 
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px; 
          margin: 25px 0;
        }
        .info-section h3 {
          color: #1e293b;
          font-size: 18px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          background: white;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 15px;
          color: #1e293b;
          font-weight: 600;
        }
        .customer-section {
          background: #eff6ff;
          border: 2px solid #bfdbfe;
        }
        .address-section {
          background: #f0f9ff;
          border: 2px solid #7dd3fc;
        }
        .address-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 12px;
          border-left: 4px solid #0ea5e9;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 25px 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
          background: #1e293b;
          color: white;
          font-weight: 600;
          padding: 16px 12px;
          text-align: left;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .items-table td { 
          border-top: 1px solid #e2e8f0;
          padding: 16px 12px;
          font-size: 14px;
        }
        .items-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .contact-banner {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: center;
        }
        .contact-banner h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .contact-banner p {
          font-size: 16px;
          font-weight: 600;
        }
        .footer { 
          background: #1f2937; 
          color: #d1d5db; 
          padding: 30px; 
          text-align: center; 
        }
        .footer h4 {
          color: white;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .footer p {
          font-size: 14px;
          margin: 4px 0;
        }
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .header h1 {
            font-size: 24px;
          }
          .total-highlight {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🛍️ New Order Alert!</h1>
          <p>StyleCo - You have received a new customer order</p>
        </div>
        
        <div class="content">
          <div class="alert-banner">
            <h2>⚡ Immediate Action Required</h2>
            <p>Order #${orderData.orderId.slice(0, 8)} is waiting for your confirmation</p>
          </div>

          <div class="total-highlight">
            💰 Order Total: ${orderData.totalAmount.toFixed(2)} EGP
          </div>

          <div class="info-section">
            <h3>📋 Order Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Order ID</div>
                <div class="info-value">#${orderData.orderId.slice(0, 8)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Order Date</div>
                <div class="info-value">${new Date(orderData.orderDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${orderData.paymentMethod === "cash_on_delivery" ? "💰 Cash on Delivery" : "💳 Credit Card"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Items Count</div>
                <div class="info-value">${orderData.orderItems.length} items</div>
              </div>
            </div>
          </div>

          <div class="info-section customer-section">
            <h3>👤 Customer Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${orderData.customerName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">${orderData.customerEmail}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${orderData.customerPhone}</div>
              </div>
              ${
                orderData.shippingAddress?.alternativePhone
                  ? `
              <div class="info-item">
                <div class="info-label">Alternative Phone</div>
                <div class="info-value">${orderData.shippingAddress.alternativePhone}</div>
              </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="info-section address-section">
            <h3>📍 Delivery Address</h3>
            <div class="address-box">
              <p style="margin: 0; font-weight: 700; font-size: 16px; color: #1e293b;">${orderData.shippingAddress?.address || "N/A"}</p>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">${orderData.shippingAddress?.city || "N/A"}, ${orderData.shippingAddress?.governorate || "N/A"}</p>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${orderData.shippingAddress?.country || "N/A"}</p>
              ${orderData.shippingAddress?.zipCode ? `<p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Postal Code: ${orderData.shippingAddress.zipCode}</p>` : ""}
              ${orderData.shippingAddress?.deliveryPrice ? `<p style="margin: 12px 0 0 0; color: #059669; font-weight: 700; font-size: 15px;">🚚 Delivery Fee: ${orderData.shippingAddress.deliveryPrice.toFixed(2)} EGP</p>` : ""}
            </div>
          </div>

          <h3 style="color: #1e293b; font-size: 20px; margin: 30px 0 20px 0;">🛒 Ordered Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Details</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.orderItems
                .map(
                  (item) => `
                <tr>
                  <td style="font-weight: 600; color: #1e293b;">${item.product?.name || "Product"}</td>
                  <td style="color: #64748b; font-size: 13px;">
                    ${item.size ? `<div>Size: <strong>${item.size}</strong></div>` : ""}
                    ${item.color ? `<div>Color: <strong>${item.color}</strong></div>` : ""}
                  </td>
                  <td style="text-align: center; font-weight: 600; color: #1e293b;">${item.quantity}</td>
                  <td style="font-weight: 500;">${item.price.toFixed(2)} EGP</td>
                  <td style="font-weight: 700; color: #059669;">${(item.price * item.quantity).toFixed(2)} EGP</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="contact-banner">
            <h3>📞 Next Steps</h3>
            <p>Contact customer at <strong>${orderData.customerPhone}</strong> to confirm order details</p>
          </div>
        </div>

        <div class="footer">
          <h4>StyleCo Admin Notification System</h4>
          <p>Order notification generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p style="margin-top: 12px; font-size: 12px; opacity: 0.8;">
            This is an automated email notification for order management.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
