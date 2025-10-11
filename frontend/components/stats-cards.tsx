import { Card } from "@/components/ui/card"
import { Wallet, DollarSign, Receipt } from "lucide-react"

interface StatsCardsProps {
  balance: number
  totalPaid: number
  payoutCount: number
}

export function StatsCards({ balance, totalPaid, payoutCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </Card>

      {/* Total Paid Card */}
      <Card className="p-6 border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Total Paid</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-sm text-muted-foreground">All-time payouts</p>
          </div>
        </div>
      </Card>

      {/* Payout Count Card */}
      <Card className="p-6 border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="w-4 h-4" />
            <span className="text-sm font-medium">Total Payouts</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{payoutCount.toLocaleString("en-US")}</h2>
            <p className="text-sm text-muted-foreground">Completed transactions</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
