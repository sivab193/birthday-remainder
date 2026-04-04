import { NextResponse } from "next/server"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import nodemailer from "nodemailer"

let transporter: any = null

function initTransporter() {
  if (transporter) return transporter
  
  const smtpPort = parseInt(process.env.SMTP_PORT || "587")
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
  return transporter
}

const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || ""

export async function POST(request: Request) {
  try {
    const { userId, channel, identifier } = await request.json()

    if (!userId || !channel || !identifier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in Firestore with a 15-minute expiration
    const expiresAt = Date.now() + 15 * 60 * 1000
    await setDoc(doc(db, "verifications", `${userId}_${channel}`), {
      code,
      identifier,
      expiresAt,
    })

    // Send the code via the requested channel
    if (channel === "email") {
      if (!SMTP_FROM || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error("Email SMTP not fully configured:", {
          SMTP_FROM: !!SMTP_FROM,
          SMTP_USER: !!process.env.SMTP_USER,
          SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
          SMTP_HOST: process.env.SMTP_HOST,
          SMTP_PORT: process.env.SMTP_PORT,
        })
        return NextResponse.json({ error: "Email SMTP not configured. Contact admin to set SMTP_USER, SMTP_PASSWORD, and SMTP_FROM environment variables." }, { status: 500 })
      }
      try {
        const mailTransporter = initTransporter()
        await mailTransporter.sendMail({
          from: SMTP_FROM,
          to: identifier,
          subject: "Event Reminder Verification Code",
          html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>`,
        })
        console.log(`Email sent to ${identifier}`)
      } catch (emailError) {
        console.error("Email sending failed:", emailError)
        return NextResponse.json({ error: `Failed to send email: ${emailError instanceof Error ? emailError.message : "Unknown error"}` }, { status: 500 })
      }
    } else if (channel === "telegram") {
      // Basic HTTP request to Telegram API to send the code
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) {
        console.error("Telegram bot token not configured")
        return NextResponse.json({ error: "Telegram bot not configured. Contact admin to set TELEGRAM_BOT_TOKEN environment variable." }, { status: 500 })
      }
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
      try {
        const res = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: identifier,
            text: `Your Event Reminder verification code is: ${code}\nThis code will expire in 15 minutes.`,
          }),
        })
        const telegramResponse = await res.json()
        
        if (!res.ok || !telegramResponse.ok) {
          const errorMsg = telegramResponse.description || res.statusText || "Unknown error"
          console.error("Telegram API Error:", {
            status: res.status,
            ok: telegramResponse.ok,
            description: telegramResponse.description,
            error_code: telegramResponse.error_code,
            chatId: identifier,
          })
          
          // Provide specific error messages for common issues
          let userFriendlyMsg = `Telegram API error: ${errorMsg}`
          if (telegramResponse.error_code === 400) {
            userFriendlyMsg = "Bot cannot send messages to this chat. Please start a conversation with the bot first by clicking the 'Start chat with Event Reminder Bot' link above, then try again."
          } else if (telegramResponse.error_code === 403) {
            userFriendlyMsg = "Bot is blocked by this user. Please unblock the bot and start a new conversation."
          }
          
          return NextResponse.json({ 
            error: userFriendlyMsg
          }, { status: 400 })
        }
        console.log(`Telegram message sent to chat_id ${identifier}`)
      } catch (err) {
        console.error("Telegram request failed:", err)
        return NextResponse.json({ error: `Telegram connection error: ${err instanceof Error ? err.message : "Unknown error"}` }, { status: 500 })
      }
    } else if (channel === "discord") {
      // Ensure the identifier is a valid discord webhook URL
      if (!identifier.startsWith("https://discord.com/api/webhooks/")) {
        return NextResponse.json({ error: "Invalid Discord Webhook URL" }, { status: 400 })
      }
      const res = await fetch(identifier, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Your Event Reminder verification code is: **${code}**\nThis code will expire in 15 minutes.`,
        }),
      })
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to send Discord message via webhook" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Unsupported channel" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Code sent successfully" })
  } catch (error) {
    console.error("Verification Send Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      channel,
      userId,
    })
    return NextResponse.json({ success: false, error: `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}` }, { status: 500 })
  }
}
