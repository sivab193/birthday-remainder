"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cake, Mail, Globe, Shield } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Cake className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">Never Miss a Birthday Again</h1>

          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Keep track of important birthdays and receive timely email reminders. Perfect for maintaining professional
            relationships across timezones.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => router.push("/login")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto mt-16">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Cake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Track Birthdays</h3>
              <p className="text-sm text-muted-foreground">
                Store names, companies, dates, and more in one organized place
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Reminders</h3>
              <p className="text-sm text-muted-foreground">Get notified 5 minutes before midnight on each birthday</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Timezone Support</h3>
              <p className="text-sm text-muted-foreground">Track contacts across different timezones accurately</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Your data is protected with Firebase authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
