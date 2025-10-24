"use client"

import { useState, useEffect, useMemo } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { StatsCards } from "@/components/stats-cards"
import { PayoutsList } from "@/components/payouts-list"
import { CreatePayoutDialog } from "@/components/create-payout-dialog"
import { PayoutDetailDialog } from "@/components/payout-detail-dialog"
import { payoutService, type Payout as BackendPayout } from "@/services"
import type { Payout } from "@/lib/types"
import { useCommerce } from "@/components/providers/commerce-provider"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

// pyUSD on Arbitrum configuration
const PYUSD_ARBITRUM_ADDRESS = "0x46850aD61C2B7d64d08c9C754F45254596696984"
const ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc"
const ARBITRUM_CHAIN_ID = 42161

// Helper function to format date safely with date and time
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString)
      return "Invalid Date"
    }
    
    // Format as "Oct 23, 2025 at 7:57 PM"
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    
    return `${dateStr} at ${timeStr}`
  } catch (error) {
    console.warn("Error formatting date:", dateString, error)
    return "Invalid Date"
  }
}

// Helper function to convert backend payout to frontend payout
function convertBackendPayout(backendPayout: BackendPayout): Payout {
  // Map backend status to frontend status
  let status: "completed" | "pending" | "failed" = "pending"
  if (backendPayout.status === "Claimed") {
    status = "completed"
  } else if (backendPayout.status === "Funded" || backendPayout.status === "Pending") {
    status = "pending"
  } else {
    status = "failed"
  }

  return {
    id: backendPayout.id,
    recipientName: backendPayout.to_name,
    amountUSD: backendPayout.from_amount, // Amount paid by commerce in USD
    currency: backendPayout.to_currency,   // Currency received by recipient
    amount: backendPayout.to_amount,  // Amount received by recipient
    status: status,
    statusOriginal: backendPayout.status, // Keep original status for display
    date: formatDate(backendPayout.created_at),
    email: backendPayout.to_email,
    walletAddress: backendPayout.to_address || "",
    txHash: "",
  }
}

export default function PayoutsPage() {
  const { authenticated } = usePrivy()
  const { commerce } = useCommerce()
  const { toast } = useToast()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loadingPayouts, setLoadingPayouts] = useState(true)
  
  
  // Stabilize vault config to prevent infinite loops
  const vaultConfig = useMemo(() => {
    if (!commerce) return null
    
    return {
      address: PYUSD_ARBITRUM_ADDRESS,
      network: {
        name: "Arbitrum One",
        chainId: ARBITRUM_CHAIN_ID,
        rpcUrl: ARBITRUM_RPC_URL,
      },
      token: {
        address: PYUSD_ARBITRUM_ADDRESS,
        symbol: "PYUSD",
        decimals: 6,
      },
    }
  }, [commerce])

  // Get real pyUSD balance from Arbitrum
  const { balance: pyUsdBalance, loading: balanceLoading } = useTokenBalance(
    vaultConfig,
    commerce?.wallet
  )
  
  const balance = pyUsdBalance ? parseFloat(pyUsdBalance) : 0
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Fetch payouts from backend
  useEffect(() => {
    const fetchPayouts = async () => {
      if (!commerce?.commerce_id) {
        setLoadingPayouts(false)
        return
      }

      try {
        setLoadingPayouts(true)
        const backendPayouts = await payoutService.getPayouts(commerce.commerce_id)
        const convertedPayouts = backendPayouts.map(convertBackendPayout)
        setPayouts(convertedPayouts)
      } catch (err) {
        console.error("❌ Failed to fetch payouts:", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payout history",
        })
      } finally {
        setLoadingPayouts(false)
      }
    }

    fetchPayouts()
  }, [commerce?.commerce_id, toast])

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

  if (loadingPayouts && authenticated) {
    return (
      <div className="space-y-8">
        <StatsCards
          balance={balance}
          totalPaid={null}
          payoutCount={null}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Spinner className="w-8 h-8 mx-auto" />
            <p className="text-muted-foreground">Loading payout history...</p>
          </div>
        </div>
      </div>
    )
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


