"use client"

import { useParams } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { useState, useEffect } from "react"
import { recipientService, type PublicPayoutResponse } from "@/services"
import { useRecipient } from "@/components/providers/recipient-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Building2, CheckCircle2, Clock, Loader2 } from "lucide-react"

export default function ClaimPayoutPage() {
  const params = useParams()
  const { authenticated, ready, login } = usePrivy()
  const { initialized } = useRecipient()
  const { toast } = useToast()
  const payoutId = params.payoutId as string

  const [payout, setPayout] = useState<PublicPayoutResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch payout details
  useEffect(() => {
    const fetchPayout = async () => {
      try {
        setLoading(true)
        const data = await recipientService.getPublicPayout(payoutId)
        setPayout(data)
      } catch (err) {
        console.error("Failed to fetch payout:", err)
        setError(err instanceof Error ? err.message : "Failed to load payout")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payout details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayout()
  }, [payoutId, toast])

  const handleClaim = async () => {
    if (!authenticated) {
      // Trigger Privy login (will auto-initialize via RecipientProvider)
      login()
      return
    }

    if (!initialized) {
      toast({
        variant: "destructive",
        title: "Not ready",
        description: "Please wait while we set up your account",
      })
      return
    }

    setClaiming(true)
    try {
      const result = await recipientService.claimPayout(payoutId)
      
      toast({
        title: "Success!",
        description: `${result.payout.amount} ${result.payout.currency} claimed successfully`,
      })

      // Refresh payout data
      const updatedPayout = await recipientService.getPublicPayout(payoutId)
      setPayout(updatedPayout)
    } catch (err) {
      console.error("Failed to claim payout:", err)
      toast({
        variant: "destructive",
        title: "Claim failed",
        description: err instanceof Error ? err.message : "Failed to claim payout",
      })
    } finally {
      setClaiming(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Funded":
        return <Badge className="bg-green-500">Ready to Claim</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500">Processing</Badge>
      case "Claimed":
        return <Badge className="bg-gray-500">Already Claimed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading payout details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !payout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Payout not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const canClaim = payout.status === "Funded" && !claiming
  const isClaimed = payout.status === "Claimed"

  return (
    <div className="min-h-screen bg-background p-4 pt-8">
      <div className="w-full max-w-md mx-auto">
        {/* Payout Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div>
              <CardTitle className="text-2xl font-bold">
                You have a payout
              </CardTitle>
              <CardDescription className="text-sm mt-2">
                Use the email address where you received this link
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-5xl font-bold text-foreground">
                ${payout.amount.toFixed(2)}
              </div>
              <div className="text-lg text-muted-foreground mt-1">
                {payout.currency}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">From</span>
                </div>
                <span className="font-medium">{payout.from_commerce.name}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Status</span>
                </div>
                {getStatusBadge(payout.status)}
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Sent</span>
                </div>
                <span className="text-sm">
                  {new Date(payout.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              onClick={handleClaim}
              disabled={!ready || !canClaim || isClaimed}
              size="lg"
              className="w-full cursor-pointer"
            >
              {claiming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!authenticated
                ? "Login to Claim"
                : claiming
                ? "Claiming..."
                : isClaimed
                ? "Already Claimed"
                : "Claim Payout"}
            </Button>

            {isClaimed && (
              <p className="text-sm text-center text-muted-foreground">
                This payout has already been claimed
              </p>
            )}

            {!initialized && authenticated && (
              <p className="text-sm text-center text-muted-foreground">
                Setting up your account...
              </p>
            )}
          </CardFooter>
        </Card>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By claiming this payout, you agree to receive the funds in your wallet.
          <br />
          Funds will be available immediately after claiming.
        </p>
      </div>
    </div>
  )
}

