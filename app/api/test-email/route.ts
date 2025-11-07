import { NextResponse } from "next/server"
import { sendBirthdayReminder } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { name, company, birthdate, userEmail } = await request.json()

    if (!name || !company || !birthdate || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Sending test email to:", userEmail, "for birthday:", name)

    // Send the test email
    await sendBirthdayReminder(userEmail, name, company, birthdate)

    console.log("[v0] Test email sent successfully")

    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (error) {
    console.error("[v0] Error sending test email:", error)
    return NextResponse.json(
      { error: "Failed to send test email", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
