import { Card } from "@/components/ui/card"
import { TrendingUp, Wallet } from "lucide-react"

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-bold tracking-tight">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Active</span>
        </div>
      </div>
    </Card>
  )
}
