export interface Payout {
  id: string
  recipientName: string
  email: string // Added email field
  walletAddress: string
  currency: string
  amount: number
  amountUSD: number // Changed from amountUSDT to amountUSD
  date: string
  status: "completed" | "pending" | "failed"
  txHash: string
}

export interface CSVRow {
  name: string
  email: string // Added email field
  walletAddress: string
  currency: string
  amount: number
}
