"use client"

import { Button } from "@/components/ui/button"
import { Wallet, Plus } from "lucide-react"

interface DashboardHeaderProps {
  onCreatePayout: () => void
}

export function DashboardHeader({ onCreatePayout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Voulti</h1>
              <p className="text-sm text-muted-foreground">Instant Payouts</p>
            </div>
          </div>

          <Button onClick={onCreatePayout} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Payout
          </Button>
        </div>
      </div>
    </header>
  )
}
