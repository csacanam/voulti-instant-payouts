/**
 * PayoutVault Addresses
 * 
 * Each vault is deployed per token per network.
 * Update these addresses after deploying vaults.
 */

export interface VaultConfig {
  address: string
  token: {
    address: string
    symbol: string
    decimals: number
  }
  network: {
    chainId: number
    name: string
  }
}

export const VAULTS: Record<string, Record<string, VaultConfig>> = {
  // Celo Mainnet (42220)
  celo: {
    cCOP: {
      address: "0x77e94a9BC69409150Ca3a407Da6383CC626e7CC8", // Deployed on Celo Mainnet
      token: {
        address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA", // cCOP token on Celo
        symbol: "cCOP",
        decimals: 18,
      },
      network: {
        chainId: 42220,
        name: "Celo",
      },
    },
    cREAL: {
      address: "0x60Eb87BDa27917889B1ED651b3008a9d5cD38833", // Deployed on Celo Mainnet
      token: {
        address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787", //cREAL token on Celo
        symbol: "cREAL",
        decimals: 18,
      },
      network: {
        chainId: 42220,
        name: "Celo",
      },
    },
  },

  // Arbitrum One (42161)
  arbitrum: {
    MXNB: {
      address: "0x77e94a9BC69409150Ca3a407Da6383CC626e7CC8", // Deployed on Arbitrum One
      token: {
        address: "0x60Eb87BDa27917889B1ED651b3008a9d5cD38833", // MXNB token on Arbitrum
        symbol: "MXNB",
        decimals: 18,
      },
      network: {
        chainId: 42161,
        name: "Arbitrum One",
      },
    },
  },


}

/**
 * Get vault configuration by network and token
 */
export function getVaultConfig(network: string, tokenSymbol: string): VaultConfig | null {
  return VAULTS[network]?.[tokenSymbol] || null
}

/**
 * Get vault address by chain ID and token symbol
 */
export function getVaultAddress(chainId: number, tokenSymbol: string): string | null {
  const network = Object.keys(VAULTS).find((net) => {
    const tokens = VAULTS[net]
    return Object.values(tokens).some((vault) => vault.network.chainId === chainId)
  })

  if (!network) return null

  const vault = VAULTS[network][tokenSymbol]
  return vault?.address || null
}

/**
 * Check if a vault exists for a specific chain and token
 */
export function vaultExists(chainId: number, tokenSymbol: string): boolean {
  const address = getVaultAddress(chainId, tokenSymbol)
  return address !== null && address !== "0x0000000000000000000000000000000000000000"
}

/**
 * Get all vaults for a specific network
 */
export function getVaultsByNetwork(network: string): VaultConfig[] {
  return Object.values(VAULTS[network] || {})
}

/**
 * Get all vaults for a specific chain ID
 */
export function getVaultsByChainId(chainId: number): VaultConfig[] {
  const allVaults: VaultConfig[] = []

  Object.values(VAULTS).forEach((networkVaults) => {
    Object.values(networkVaults).forEach((vault) => {
      if (vault.network.chainId === chainId) {
        allVaults.push(vault)
      }
    })
  })

  return allVaults
}

