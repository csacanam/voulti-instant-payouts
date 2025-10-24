/**
 * Currency Configuration
 * Maps fiat currencies to their respective stablecoin vaults
 */

import { VaultConfig, VAULTS } from "./vaults"

export interface CurrencyConfig {
  fiat: string // USD, COP, MXN, BRL
  symbol: string // $, etc
  vault: VaultConfig
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
    vault: {
      address: "0x46850aD61C2B7d64d08c9C754F45254596696984", // pyUSD on Arbitrum
      network: {
        name: "Arbitrum One",
        chainId: 42161,
      },
      token: {
        address: "0x46850aD61C2B7d64d08c9C754F45254596696984",
        symbol: "PYUSD",
        decimals: 6,
      },
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

