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
    vault: VAULTS.celo.cREAL,
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

