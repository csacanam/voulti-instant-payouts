import type { Payout } from "./types"

export const DUMMY_PAYOUTS: Payout[] = [
  {
    id: "payout-001",
    recipientName: "Juan Pérez",
    email: "juan.perez@example.com", // Added email
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    currency: "COP",
    amount: 4200000,
    amountUSD: 1000, // Changed from amountUSDT to amountUSD
    date: "2025-01-10T14:30:00Z",
    status: "completed",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
  },
  {
    id: "payout-002",
    recipientName: "María García",
    email: "maria.garcia@example.com", // Added email
    walletAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    currency: "BRL",
    amount: 5500,
    amountUSD: 1000,
    date: "2025-01-09T10:15:00Z",
    status: "completed",
    txHash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g",
  },
  {
    id: "payout-003",
    recipientName: "Carlos López",
    email: "carlos.lopez@example.com", // Added email
    walletAddress: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    currency: "MXN",
    amount: 18500,
    amountUSD: 1000,
    date: "2025-01-08T16:45:00Z",
    status: "completed",
    txHash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h",
  },
  {
    id: "payout-004",
    recipientName: "Ana Martínez",
    email: "ana.martinez@example.com", // Added email
    walletAddress: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    currency: "COP",
    amount: 2100000,
    amountUSD: 500,
    date: "2025-01-07T09:20:00Z",
    status: "completed",
    txHash: "0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i",
  },
  {
    id: "payout-005",
    recipientName: "Roberto Silva",
    email: "roberto.silva@example.com", // Added email
    walletAddress: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    currency: "BRL",
    amount: 11000,
    amountUSD: 2000,
    date: "2025-01-06T13:00:00Z",
    status: "completed",
    txHash: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j",
  },
  {
    id: "payout-006",
    recipientName: "Laura Rodríguez",
    email: "laura.rodriguez@example.com", // Added email
    walletAddress: "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
    currency: "MXN",
    amount: 37000,
    amountUSD: 2000,
    date: "2025-01-05T11:30:00Z",
    status: "completed",
    txHash: "0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k",
  },
  {
    id: "payout-007",
    recipientName: "Diego Fernández",
    email: "diego.fernandez@example.com", // Added email
    walletAddress: "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
    currency: "COP",
    amount: 8400000,
    amountUSD: 2000,
    date: "2025-01-04T15:45:00Z",
    status: "completed",
    txHash: "0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l",
  },
]
