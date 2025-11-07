"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BirthdayForm } from "./birthday-form"
import { Pencil, Trash2, Cake, Calendar, Globe, Mail } from "lucide-react"
import type { Birthday } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface BirthdayCardProps {
  birthday: Birthday
  onUpdate: (id: string, data: Omit<Birthday, "id" | "userId" | "createdAt">) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BirthdayCard({ birthday, onUpdate, onDelete }: BirthdayCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleUpdate = async (data: Omit<Birthday, "id" | "userId" | "createdAt">) => {
    await onUpdate(birthday.id, data)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(birthday.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    setIsSendingTest(true)
    try {
      console.log("[birthday-remainder] Sending test email for:", birthday.name)
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: birthday.name,
          company: birthday.company,
          birthdate: birthday.birthdate,
          userEmail: user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send test email")
      }

  console.log("[birthday-remainder] Test email sent successfully")

      toast({
        title: "Test email sent!",
        description: "Check your inbox to see the email template.",
      })
    } catch (error) {
  console.error("[birthday-remainder] Error sending test email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const getBirthdayMonth = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatMeetDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{birthday.name}</h3>
              <div className="mt-1 text-sm text-muted-foreground">
                <span>{birthday.company}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Cake className="h-4 w-4 text-primary" />
              <span className="font-medium">Birthday:</span>
              <span className="text-muted-foreground">{getBirthdayMonth(birthday.birthdate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Met:</span>
              <span className="text-muted-foreground">{formatMeetDate(birthday.meetDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium">Timezone:</span>
              <span className="text-muted-foreground">{birthday.timezone}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="gap-2 bg-transparent"
            >
              <Mail className="h-4 w-4" />
              {isSendingTest ? "Sending..." : "Test Email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Birthday</DialogTitle>
          </DialogHeader>
          <BirthdayForm initialData={birthday} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
