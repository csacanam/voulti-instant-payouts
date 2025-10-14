"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Card } from "@/components/ui/card"
import { Lock, QrCode } from "lucide-react"

export default function ReceivePage() {
  const { authenticated } = usePrivy()

  if (!authenticated) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Lock className="w-12 h-12" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-sm">Please login to create payment links</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <QrCode className="w-16 h-16" />
        <div>
          <h3 className="text-2xl font-semibold mb-2 text-foreground">Create Payment Links</h3>
          <p className="text-sm">This feature is coming soon...</p>
        </div>
      </div>
    </Card>
  )
}

