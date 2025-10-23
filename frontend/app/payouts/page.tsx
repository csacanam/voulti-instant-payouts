"use client"

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { StatsCards } from "@/components/stats-cards"
import { PayoutsList } from "@/components/payouts-list"
import { CreatePayoutDialog } from "@/components/create-payout-dialog"
import { PayoutDetailDialog } from "@/components/payout-detail-dialog"
import { DUMMY_PAYOUTS } from "@/lib/dummy-data"
import type { Payout } from "@/lib/types"
import { useCommerce } from "@/components/providers/commerce-provider"
import { useTokenBalance } from "@/hooks/use-token-balance"

// pyUSD on Arbitrum configuration
const PYUSD_ARBITRUM_ADDRESS = "0x46850aD61C2B7d64d08c9C754F45254596696984"
const ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc"
const ARBITRUM_CHAIN_ID = 42161

export default function PayoutsPage() {
  const { authenticated } = usePrivy()
  const { commerce } = useCommerce()
  const [payouts, setPayouts] = useState<Payout[]>(DUMMY_PAYOUTS)
  
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
  
  const balance = pyUsdBalance ?? 0
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const totalPaid = payouts.reduce((sum, p) => sum + p.amountUSD, 0)
  const payoutCount = payouts.length

  const handleCreatePayout = (newPayouts: Payout[], totalAmount: number) => {
    setPayouts([...newPayouts, ...payouts])
    setIsCreateDialogOpen(false)
    // Balance will auto-refresh from blockchain via useTokenBalance hook
  }

  const handlePayoutClick = (payout: Payout) => {
    setSelectedPayout(payout)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <StatsCards
        balance={authenticated ? balance : null}
        totalPaid={authenticated ? totalPaid : null}
        payoutCount={authenticated ? payoutCount : null}
      />
      <PayoutsList
        payouts={authenticated ? payouts : []}
        onPayoutClick={handlePayoutClick}
        onCreatePayout={() => setIsCreateDialogOpen(true)}
        isAuthenticated={authenticated}
      />

      {authenticated && (
        <>
          <CreatePayoutDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreatePayout={handleCreatePayout}
            currentBalance={balance}
          />

          <PayoutDetailDialog
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            payout={selectedPayout}
          />
        </>
      )}
    </div>
  )
}


