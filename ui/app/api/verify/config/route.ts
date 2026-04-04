import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    smtp: {
      configured: !!process.env.SMTP_USER && !!process.env.SMTP_PASSWORD,
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || "587",
      user: process.env.SMTP_USER ? "✓ Set" : "✗ Missing",
      password: process.env.SMTP_PASSWORD ? "✓ Set" : "✗ Missing",
      from: process.env.SMTP_FROM ? "✓ Set" : "✗ Using SMTP_USER",
    },
    telegram: {
      configured: !!process.env.TELEGRAM_BOT_TOKEN,
      token: process.env.TELEGRAM_BOT_TOKEN ? "✓ Set" : "✗ Missing",
    },
    firebase: {
      configured: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing",
    },
  })
}
