/**
 * Balance Item Component
 * Displays a single currency balance for a recipient
 */

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowDownToLine } from "lucide-react"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { CurrencyConfig } from "@/blockchain/currencies"

interface BalanceItemProps {
  currency: CurrencyConfig
  recipientAddress: string | null
  onWithdraw: (fiat: string) => void
  refreshKey?: number
}

export function BalanceItem({ currency, recipientAddress, onWithdraw, refreshKey }: BalanceItemProps) {
  const { balance, loading } = useTokenBalance(currency.vault, recipientAddress, refreshKey)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            {loading ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <>
                <span className="text-2xl font-bold">
                  {currency.symbol}{balance}
                </span>
                <span className="text-lg text-muted-foreground">
                  {currency.fiat}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available for withdrawal
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWithdraw(currency.fiat)}
          className="gap-2 cursor-pointer shrink-0"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span className="hidden sm:inline">Withdraw</span>
        </Button>
      </div>
    </Card>
  )
}

