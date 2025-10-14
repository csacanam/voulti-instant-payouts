"use client"

import { usePrivy } from "@privy-io/react-auth"
import { QuickActions } from "@/components/quick-actions"
import { HomeMetrics } from "@/components/home-metrics"
import { RecentActivity } from "@/components/recent-activity"
import { DUMMY_TRANSACTIONS } from "@/lib/dummy-data"
import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function Home() {
  const { authenticated } = usePrivy()

  // Datos de ejemplo
  const balance = 50000
  const totalReceived30d = 45000
  const totalPayouts30d = 12000

  if (!authenticated) {
    return (
      <div className="space-y-8">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Lock className="w-12 h-12" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-sm">Please login to view your dashboard</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <QuickActions />
      <HomeMetrics
        balance={balance}
        totalReceived30d={totalReceived30d}
        totalPayouts30d={totalPayouts30d}
      />
      <RecentActivity transactions={DUMMY_TRANSACTIONS} />
    </div>
  )
}
