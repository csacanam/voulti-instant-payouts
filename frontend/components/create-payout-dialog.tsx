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

interface CreatePayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePayout: (payouts: Payout[], totalAmount: number) => void
  currentBalance: number
}

type Step = "upload" | "validation" | "confirmation"

export function CreatePayoutDialog({ open, onOpenChange, onCreatePayout, currentBalance }: CreatePayoutDialogProps) {
  const { commerce } = useCommerce()
  const [payoutType, setPayoutType] = useState<"single" | "bulk">("single")
  const [step, setStep] = useState<Step>("upload")
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validationErrors, setValidationErrors] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    setLoading(true)
    setError(null)

    try {
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

      // Convert to frontend format for display
      const newPayout: Payout = {
        id: createdPayout.id,
        recipientName: createdPayout.to_name,
        email: createdPayout.to_email,
        walletAddress: createdPayout.to_address || "",
        currency: createdPayout.to_currency,
        amount: createdPayout.to_amount,
        amountUSD: createdPayout.from_amount,
        date: createdPayout.created_at,
        status: createdPayout.status.toLowerCase(),
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      }

      onCreatePayout([newPayout], newPayout.amountUSD)
      handleClose()
    } catch (err) {
      console.error("Failed to create payout:", err)
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : "Failed to create payout")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("upload")
    setCsvData([])
    setValidationErrors([])
    setPayoutType("single")
    setError(null)
    setLoading(false)
    onOpenChange(false)
  }

  const totalUSD = csvData.reduce((sum, row) => sum + row.amount / getExchangeRate(row.currency), 0)
  const hasEnoughBalance = totalUSD <= currentBalance

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">Create New Payout</DialogTitle>
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
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <SinglePayoutForm currentBalance={currentBalance} onSubmit={handleSinglePayout} />
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
    USD: 1,
    COP: 4200,
  }
  return rates[currency] || 1
}
