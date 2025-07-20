// Simple email service configuration
// You can replace this with any email service like Resend, SendGrid, etc.

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(emailData: EmailData) {
  // For development/testing, we'll log the email
  console.log("📧 EMAIL NOTIFICATION:")
  console.log("To:", emailData.to)
  console.log("Subject:", emailData.subject)
  console.log("From:", emailData.from || "StyleCo <orders@styleco.com>")
  console.log("HTML Content Length:", emailData.html.length, "characters")

  // You can replace this with actual email service integration
  // Example with Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  return await resend.emails.send({
    from: emailData.from || 'StyleCo <orders@styleco.com>',
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
  })
  */

  // For now, return success
  return { success: true, message: "Email logged successfully" }
}

// Alternative: Use a webhook service like EmailJS
export async function sendEmailViaWebhook(emailData: EmailData) {
  try {
    // You can use services like EmailJS, Formspree, or similar
    const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailData.to,
        subject: emailData.subject,
        message: emailData.html,
        _replyto: emailData.to,
      }),
    })

    return { success: response.ok, response }
  } catch (error) {
    console.error("Webhook email error:", error)
    return { success: false, error }
  }
}
