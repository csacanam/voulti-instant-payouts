/**
 * Currency Configuration
 * Maps fiat currencies to their respective stablecoin vaults
 */

import { VaultConfig, VAULTS } from "./vaults"
import { NETWORKS } from "./networks"

export interface CurrencyConfig {
  fiat: string // USD, COP, MXN, BRL
  symbol: string // $, etc
  vault?: VaultConfig // Optional for merchant currencies
  token?: {
    address: string
    symbol: string
    decimals: number
    network: {
      chainId: number
      name: string
      rpcUrl: string
    }
  }
}

/**
 * All supported currencies for recipient balances
 */
export const RECIPIENT_CURRENCIES: CurrencyConfig[] = [
  {
    fiat: "COP",
    symbol: "$",
    vault: VAULTS.celo.cCOP,
  },
  {
    fiat: "MXN",
    symbol: "$",
    vault: VAULTS.arbitrum.MXNB,
  },
  {
    fiat: "BRL",
    symbol: "R$",
    vault: VAULTS.celo.BRLA,
  },
]

/**
 * All supported currencies for merchant balances
 */
export const MERCHANT_CURRENCIES: CurrencyConfig[] = [
  {
    fiat: "USD",
    symbol: "$",
    token: {
      address: "0x46850aD61C2B7d64d08c9C754F45254596696984", // PYUSD on Arbitrum
      symbol: "PYUSD",
      decimals: 6,
      network: NETWORKS.arbitrum,
    },
  },
]

/**
 * Get currency config by fiat code
 */
export function getCurrencyConfig(fiat: string): CurrencyConfig | null {
  return RECIPIENT_CURRENCIES.find((c) => c.fiat === fiat) || null
}

/**
 * Get all supported fiat currencies
 */
export function getSupportedCurrencies(): string[] {
  return RECIPIENT_CURRENCIES.map((c) => c.fiat)
}

