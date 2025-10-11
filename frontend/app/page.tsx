"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { PayoutsList } from "@/components/payouts-list"
import { CreatePayoutDialog } from "@/components/create-payout-dialog"
import { PayoutDetailDialog } from "@/components/payout-detail-dialog"
import { DUMMY_PAYOUTS } from "@/lib/dummy-data"
import type { Payout } from "@/lib/types"

export default function Home() {
  const [payouts, setPayouts] = useState<Payout[]>(DUMMY_PAYOUTS)
  const [balance, setBalance] = useState(50000)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const totalPaid = payouts.reduce((sum, p) => sum + p.amountUSD, 0)
  const payoutCount = payouts.length

  const handleCreatePayout = (newPayouts: Payout[], totalAmount: number) => {
    setPayouts([...newPayouts, ...payouts])
    setBalance(balance - totalAmount)
    setIsCreateDialogOpen(false)
  }

  const handlePayoutClick = (payout: Payout) => {
    setSelectedPayout(payout)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onCreatePayout={() => setIsCreateDialogOpen(true)} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <StatsCards balance={balance} totalPaid={totalPaid} payoutCount={payoutCount} />
          <PayoutsList payouts={payouts} onPayoutClick={handlePayoutClick} />
        </div>
      </main>

      <CreatePayoutDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePayout={handleCreatePayout}
        currentBalance={balance}
      />

      <PayoutDetailDialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} payout={selectedPayout} />
    </div>
  )
}
