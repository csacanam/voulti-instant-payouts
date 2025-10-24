"use client"

// TEMPORARY: Redirect to /payouts during development
// To restore Home page, see docs/TEMPORARY_CONFIG.md

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/payouts")
  }, [router])

  return null
}

// ORIGINAL HOME PAGE CODE - COMMENTED OUT TEMPORARILY
// Uncomment this and remove the redirect above to restore Home page
/*
import { usePrivy } from "@privy-io/react-auth"
import { QuickActions } from "@/components/quick-actions"
import { HomeMetrics } from "@/components/home-metrics"
import { RecentActivity } from "@/components/recent-activity"
import { DUMMY_TRANSACTIONS } from "@/lib/dummy-data"
import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { useCommerce } from "@/components/providers/commerce-provider"
import { useTokenBalance } from "@/hooks/use-token-balance"

// pyUSD on Arbitrum configuration
const PYUSD_ARBITRUM_ADDRESS = "0x46850aD61C2B7d64d08c9C754F45254596696984"
const ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc"
const ARBITRUM_CHAIN_ID = 42161

export default function Home() {
  const { authenticated } = usePrivy()
  const { commerce } = useCommerce()

  // Get real pyUSD balance from Arbitrum
  const { balance: pyUsdBalance, loading: balanceLoading } = useTokenBalance(
    commerce
      ? {
          tokenAddress: PYUSD_ARBITRUM_ADDRESS,
          walletAddress: commerce.wallet,
          chainId: ARBITRUM_CHAIN_ID,
          rpcUrl: ARBITRUM_RPC_URL,
        }
      : null
  )

  // Use real balance or fallback to 0
  const balance = pyUsdBalance ? parseFloat(pyUsdBalance) : 0
  const totalReceived30d = 45000 // TODO: Get from backend
  const totalPayouts30d = 12000 // TODO: Get from backend

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
*/
