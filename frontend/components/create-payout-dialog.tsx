"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadStep } from "@/components/create-payout/upload-step"
import { ValidationStep } from "@/components/create-payout/validation-step"
import { ConfirmationStep } from "@/components/create-payout/confirmation-step"
import { SinglePayoutForm } from "@/components/create-payout/single-payout-form"
import type { Payout, CSVRow } from "@/lib/types"

interface CreatePayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePayout: (payouts: Payout[], totalAmount: number) => void
  currentBalance: number
}

type Step = "upload" | "validation" | "confirmation"

export function CreatePayoutDialog({ open, onOpenChange, onCreatePayout, currentBalance }: CreatePayoutDialogProps) {
  const [payoutType, setPayoutType] = useState<"single" | "bulk">("single")
  const [step, setStep] = useState<Step>("upload")
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [validationErrors, setValidationErrors] = useState<number[]>([])

  const handleUpload = (data: CSVRow[], errors: number[]) => {
    setCsvData(data)
    setValidationErrors(errors)
    setStep(errors.length > 0 ? "validation" : "confirmation")
  }

  const handleConfirm = () => {
    const newPayouts: Payout[] = csvData.map((row, index) => ({
      id: `payout-${Date.now()}-${index}`,
      recipientName: row.name,
      email: row.email,
      walletAddress: row.walletAddress,
      currency: row.currency,
      amount: row.amount,
      amountUSD: row.amount / getExchangeRate(row.currency),
      date: new Date().toISOString(),
      status: "completed",
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    }))

    const totalUSD = newPayouts.reduce((sum, p) => sum + p.amountUSD, 0)
    onCreatePayout(newPayouts, totalUSD)
    handleClose()
  }

  const handleSinglePayout = (data: CSVRow) => {
    const newPayout: Payout = {
      id: `payout-${Date.now()}`,
      recipientName: data.name,
      email: data.email,
      walletAddress: data.walletAddress,
      currency: data.currency,
      amount: data.amount,
      amountUSD: data.amount / getExchangeRate(data.currency),
      date: new Date().toISOString(),
      status: "completed",
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    }

    onCreatePayout([newPayout], newPayout.amountUSD)
    handleClose()
  }

  const handleClose = () => {
    setStep("upload")
    setCsvData([])
    setValidationErrors([])
    setPayoutType("single")
    onOpenChange(false)
  }

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
              <TabsTrigger value="bulk">Bulk Payout</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4">
              <SinglePayoutForm currentBalance={currentBalance} onSubmit={handleSinglePayout} />
            </TabsContent>

            <TabsContent value="bulk" className="mt-4">
              {step === "upload" && <UploadStep onUpload={handleUpload} />}

              {step === "validation" && (
                <ValidationStep csvData={csvData} errors={validationErrors} onBack={() => setStep("upload")} />
              )}

              {step === "confirmation" && (
                <ConfirmationStep
                  csvData={csvData}
                  currentBalance={currentBalance}
                  onConfirm={handleConfirm}
                  onBack={() => setStep("upload")}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
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
