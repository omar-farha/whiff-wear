"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EmailSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📧 Email Setup Guide</h1>
          <p className="text-gray-600">Set up email notifications for your StyleCo store</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Setup with Resend (Recommended)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Why Resend?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Free tier: 3,000 emails/month</li>
                  <li>• Easy setup (5 minutes)</li>
                  <li>• Reliable delivery</li>
                  <li>• Great for small businesses</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step-by-Step Setup:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Create Account:</strong> Go to{" "}
                    <a href="https://resend.com" target="_blank" className="text-blue-600 underline" rel="noreferrer">
                      resend.com
                    </a>{" "}
                    and sign up (free)
                  </li>
                  <li>
                    <strong>Verify Email:</strong> Check your email and verify your account
                  </li>
                  <li>
                    <strong>Get API Key:</strong> In the dashboard, go to "API Keys" and create a new key
                  </li>
                  <li>
                    <strong>Copy the Key:</strong> It looks like{" "}
                    <code className="bg-gray-100 px-1 rounded">re_...</code>
                  </li>
                  <li>
                    <strong>Add to Environment:</strong> Add this to your{" "}
                    <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
                  </li>
                </ol>

                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                  RESEND_API_KEY=re_your_api_key_here
                </div>

                <ol className="list-decimal list-inside space-y-2 text-sm" start={6}>
                  <li>
                    <strong>Restart App:</strong> Stop and restart your development server
                  </li>
                  <li>
                    <strong>Test:</strong> Use the test email page to verify it works
                  </li>
                </ol>
              </div>

              <Button asChild className="w-full">
                <a href="https://resend.com" target="_blank" rel="noreferrer">
                  🚀 Sign Up for Resend (Free)
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 Test Your Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Once you've added your Resend API key, test the email system:</p>
              <Button asChild>
                <a href="/test-email">📧 Test Email System</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 Alternative Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Other Email Services:</h3>
                <ul className="text-sm space-y-1">
                  <li>
                    • <strong>SendGrid:</strong> Popular choice, free tier available
                  </li>
                  <li>
                    • <strong>Mailgun:</strong> Good for developers
                  </li>
                  <li>
                    • <strong>Amazon SES:</strong> Very cheap for high volume
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Without an email service, order notifications will only be logged to the
                  console. You'll still see them in your development tools, but won't receive actual emails.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
