"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { UploadStep } from "@/components/create-payout/upload-step"
import { ValidationStep } from "@/components/create-payout/validation-step"
import { ConfirmationStep } from "@/components/create-payout/confirmation-step"
import { SinglePayoutForm } from "@/components/create-payout/single-payout-form"
import { CheckCircle2 } from "lucide-react"
import type { Payout, CSVRow } from "@/lib/types"
import { payoutService, ApiError, type CreatePayoutData } from "@/services"
import { useCommerce } from "@/components/providers/commerce-provider"
import { useSquidSwap } from "@/hooks/use-squid-swap"
import { useToast } from "@/hooks/use-toast"

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

interface CreatePayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePayout: (payouts: Payout[], totalAmount: number) => void
  currentBalance: number
}

type Step = "upload" | "validation" | "confirmation"

export function CreatePayoutDialog({ open, onOpenChange, onCreatePayout, currentBalance }: CreatePayoutDialogProps) {
  const { commerce } = useCommerce()
  const { executeSwap, swapStatus, setSwapStatus } = useSquidSwap()
  const { toast } = useToast()
  const [payoutType, setPayoutType] = useState<"single" | "bulk">("single")
  const [step, setStep] = useState<Step>("upload")
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validationErrors, setValidationErrors] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpload = (data: CSVRow[], errors: number[]) => {
    setCsvData(data)
    setValidationErrors(errors)
    setStep(errors.length > 0 ? "validation" : "confirmation")
  }

  const handleConfirm = async () => {
    if (!commerce) {
      setError("Commerce not found")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payouts via API
      const payoutPromises = csvData.map((row) => {
        const payoutData: CreatePayoutData = {
          commerce_id: commerce.commerce_id,
          from_fiat: "USD",
          to_fiat: row.currency,
          from_address: commerce.wallet,
          to_name: row.name,
          to_email: row.email,
          to_amount: row.amount,
        }
        return payoutService.createPayout(payoutData)
      })

      const createdPayouts = await Promise.all(payoutPromises)

      // Convert to frontend format for display
      const newPayouts: Payout[] = createdPayouts.map((payout) => ({
        id: payout.id,
        recipientName: payout.to_name,
        email: payout.to_email,
        walletAddress: payout.to_address || "",
        currency: payout.to_currency,
        amount: payout.to_amount,
        amountUSD: payout.from_amount,
        date: payout.created_at,
        status: payout.status.toLowerCase(),
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      }))

      const totalUSD = newPayouts.reduce((sum, p) => sum + p.amountUSD, 0)
      onCreatePayout(newPayouts, totalUSD)
      handleClose()
    } catch (err) {
      console.error("Failed to create payouts:", err)
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : "Failed to create payouts")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSinglePayout = async (data: CSVRow) => {
    if (!commerce) {
      setError("Commerce not found")
      return
    }

    setIsProcessing(true)
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create payout in database
      console.log("Step 1: Creating payout in database...")
      const payoutData: CreatePayoutData = {
        commerce_id: commerce.commerce_id,
        from_fiat: "USD",
        to_fiat: data.currency,
        from_address: commerce.wallet,
        to_name: data.name,
        to_email: data.email,
        to_amount: data.amount,
      }

      const createdPayout = await payoutService.createPayout(payoutData)
      console.log("✅ Payout created in database:", createdPayout.id)

      // Step 2: Execute Squid swap with created payout
      console.log("Step 2: Executing Squid swap...")
      const swapResult = await executeSwap(createdPayout)

      if (swapResult.status === "error") {
        setIsProcessing(false)
        toast({
          title: "Payment Failed",
          description: swapResult.message || "The payment could not be processed. Please try again.",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Squid swap completed:", swapResult.txHash)

      // Convert to frontend format for display
      const newPayout: Payout = {
        id: createdPayout.id,
        recipientName: createdPayout.to_name,
        email: createdPayout.to_email,
        walletAddress: createdPayout.to_address || "",
        currency: createdPayout.to_currency,
        amount: createdPayout.to_amount,
        amountUSD: createdPayout.from_amount,
        date: formatDate(createdPayout.created_at),
        status: "completed", // Update status after successful swap
        txHash: swapResult.txHash || `0x${Math.random().toString(16).substring(2, 66)}`,
      }

      onCreatePayout([newPayout], newPayout.amountUSD)
      
      // Show success toast
      toast({
        title: "Payout Created Successfully! 🎉",
        description: `${data.amount} ${data.currency} sent to ${data.name}`,
        variant: "default",
      })
      
      // Close dialog after success
      handleClose()
    } catch (err) {
      console.error("Failed to create payout:", err)
      setIsProcessing(false)
      
      let errorMessage = "Failed to create payout"
      if (err instanceof ApiError) {
        errorMessage = `Error ${err.status}: ${err.message}`
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      toast({
        title: "Payout Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Don't allow closing while processing
    if (isProcessing) {
      return
    }
    
    // Reset all state
    setStep("upload")
    setCsvData([])
    setValidationErrors([])
    setPayoutType("single")
    setError(null)
    setLoading(false)
    setIsProcessing(false)
    setSwapStatus({ status: "idle", message: "" })
    onOpenChange(false)
  }

  // Reset state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    } else {
      // Clean up all state when opening
      setStep("upload")
      setCsvData([])
      setValidationErrors([])
      setPayoutType("single")
      setError(null)
      setLoading(false)
      setIsProcessing(false)
      setSwapStatus({ status: "idle", message: "" })
    }
    onOpenChange(open)
  }

  const totalUSD = csvData.reduce((sum, row) => sum + row.amount / getExchangeRate(row.currency), 0)
  const hasEnoughBalance = totalUSD <= currentBalance

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col" onInteractOutside={(e) => {
        // Prevent closing when processing
        if (isProcessing) {
          e.preventDefault()
        }
      }}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">
            {isProcessing ? "Processing Payout..." : "Create New Payout"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={payoutType} onValueChange={(v) => setPayoutType(v as "single" | "bulk")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Payout</TabsTrigger>
              <TabsTrigger value="bulk" disabled>
                Bulk Payout
                <span className="ml-2 text-xs">(Coming Soon)</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4">
              {swapStatus.status !== "idle" && (
                <div className="mb-4 p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    {swapStatus.status === "approving" && (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="text-sm font-medium">Step 1/3: Preparing payment...</p>
                          <p className="text-xs text-muted-foreground">Please confirm in your wallet</p>
                        </div>
                      </>
                    )}
                    {swapStatus.status === "swapping" && (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="text-sm font-medium">Step 2/3: Processing payment...</p>
                          <p className="text-xs text-muted-foreground">Please confirm the transaction in your wallet</p>
                        </div>
                      </>
                    )}
                    {swapStatus.status === "polling" && (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="text-sm font-medium">Step 3/3: Finalizing payment...</p>
                          <p className="text-xs text-muted-foreground">Almost done, this may take a minute</p>
                          {swapStatus.explorerUrl && (
                            <a 
                              href={swapStatus.explorerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline cursor-pointer"
                            >
                              View transaction details →
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <SinglePayoutForm 
                currentBalance={currentBalance} 
                onSubmit={handleSinglePayout}
                disabled={isProcessing}
              />
            </TabsContent>

            <TabsContent value="bulk" className="mt-4">
              {/* Bulk payout disabled for now */}
            </TabsContent>
          </Tabs>
        </div>

        {payoutType === "bulk" && (step === "validation" || step === "confirmation") && (
          <div className="flex-shrink-0 flex gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("upload")}
              className="flex-1"
              size="lg"
            >
              Back
            </Button>
            {step === "confirmation" && (
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!hasEnoughBalance}
                className="flex-1 gap-2"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm & Execute Payouts
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function getExchangeRate(currency: string): number {
  const rates: Record<string, number> = {
    COP: 4200,
    BRL: 5.5,
    MXN: 18.5,
  }
  return rates[currency] || 1
}
