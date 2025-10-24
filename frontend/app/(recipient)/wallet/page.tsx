"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw, ArrowDownToLine } from "lucide-react"
import { useState, useEffect } from "react"
import { recipientService, type PendingPayout } from "@/services"
import { usePrivyToken } from "@/hooks/use-privy-token"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { RECIPIENT_CURRENCIES } from "@/blockchain/currencies"
import { BalanceItem } from "@/components/balance-item"

export default function RecipientWalletPage() {
  const { authenticated, ready, user, login } = usePrivy()
  const router = useRouter()
  const { token, loading: tokenLoading } = usePrivyToken()
  const { toast } = useToast()
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([])
  const [loadingPayouts, setLoadingPayouts] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [claimingPayoutId, setClaimingPayoutId] = useState<string | null>(null)
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0)
  
  // Get recipient wallet address
  const recipientAddress = user?.wallet?.address || null

  // Fetch pending payouts
  useEffect(() => {
    const fetchPayouts = async () => {
      if (!authenticated || !token || tokenLoading) {
        return
      }

      try {
        setLoadingPayouts(true)
        const response = await recipientService.getPendingPayouts(token)
        setPendingPayouts(response.payouts)
      } catch (err) {
        console.error("Failed to fetch pending payouts:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load pending payouts"
        
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: errorMessage.includes("Failed to fetch") 
            ? "Backend is not available. Please check that the backend is running on port 3000."
            : errorMessage,
        })
      } finally {
        setLoadingPayouts(false)
      }
    }

    fetchPayouts()
  }, [authenticated, token, tokenLoading, toast])

  // Loading state - waiting for Privy to initialize
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login prompt
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          {/* Logo and Slogan */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Voulti</h1>
            <p className="text-sm text-muted-foreground">Your Business, Unchained.</p>
          </div>

          {/* Main Message */}
          <div className="space-y-3 py-6">
            <h2 className="text-2xl font-semibold">You have a payment waiting</h2>
            <p className="text-muted-foreground">
              Sign in with your email to claim it
            </p>
          </div>

          {/* Login Button */}
          <Button 
            onClick={login} 
            size="lg" 
            className="w-full cursor-pointer"
          >
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  const handleRefresh = async () => {
    if (!token) return
    
    setIsRefreshing(true)
    try {
      const response = await recipientService.getPendingPayouts(token)
      setPendingPayouts(response.payouts)
      toast({
        title: "Refreshed",
        description: "Pending payouts updated",
      })
    } catch (err) {
      console.error("Failed to refresh:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh payouts",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClaim = async (payoutId: string) => {
    setClaimingPayoutId(payoutId)
    
    try {
      const result = await recipientService.claimPayout(payoutId)
      
      toast({
        title: "Success!",
        description: `${result.payout.amount} ${result.payout.currency} claimed successfully`,
      })

      // Refresh payouts list
      if (token) {
        const response = await recipientService.getPendingPayouts(token)
        setPendingPayouts(response.payouts)
      }

      // Trigger balance refresh by changing the key
      setBalanceRefreshKey(prev => prev + 1)
    } catch (err) {
      console.error("Failed to claim payout:", err)
      toast({
        variant: "destructive",
        title: "Claim failed",
        description: err instanceof Error ? err.message : "Failed to claim payout",
      })
    } finally {
      setClaimingPayoutId(null)
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Funded":
        return <Badge className="bg-green-500 text-white hover:bg-green-500">Ready</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">Processing</Badge>
      case "Claimed":
        return <Badge variant="outline">Claimed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const fundedPayouts = pendingPayouts.filter(p => p.status === "Funded")

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Pending Payouts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Pending Payouts</h2>
              <p className="text-sm text-muted-foreground">
                {loadingPayouts ? (
                  "Loading..."
                ) : (
                  `${fundedPayouts.length} payout${fundedPayouts.length !== 1 ? 's' : ''} ready to claim`
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loadingPayouts}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {loadingPayouts ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="w-8 h-8" />
            </div>
          ) : pendingPayouts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No pending payouts</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingPayouts.map((payout) => (
                <Card key={payout.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="text-2xl font-bold">
                          ${payout.amount.toFixed(2)} {payout.currency}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From {payout.from_commerce.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(payout.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleClaim(payout.id)}
                      disabled={payout.status !== "Funded" || claimingPayoutId === payout.id}
                      size="sm"
                      className="cursor-pointer shrink-0"
                    >
                      {claimingPayoutId === payout.id
                        ? "Processing..."
                        : payout.status === "Funded"
                        ? "Claim"
                        : payout.status}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Balances */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Balances</h2>
            <p className="text-sm text-muted-foreground">
              Available funds in your wallet
            </p>
          </div>

          <div className="space-y-3">
            {RECIPIENT_CURRENCIES.map((currency) => (
              <BalanceItem
                key={currency.fiat}
                currency={currency}
                recipientAddress={recipientAddress}
                refreshKey={balanceRefreshKey}
              />
            ))}
          </div>
        </section>

        {/* Help Text */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact support at{" "}
            <a href="mailto:support@voulti.com" className="text-primary hover:underline">
              support@voulti.com
            </a>
          </p>
      </div>
    </div>
  )
}

