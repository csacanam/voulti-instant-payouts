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
      address: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
      token: {
        address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
        symbol: "cCOP",
        decimals: 18,
      },
      network: {
        chainId: 42220,
        name: "Celo",
      },
    },
    cREAL: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
      token: {
        address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
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
    mxnB: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
      token: {
        address: "0x0000000000000000000000000000000000000000", // TODO: Add mxnB address
        symbol: "mxnB",
        decimals: 18, // TODO: Verify decimals
      },
      network: {
        chainId: 42161,
        name: "Arbitrum One",
      },
    },
  },

  // Polygon (137)
  polygon: {
    BRL1: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
      token: {
        address: "0x0000000000000000000000000000000000000000", // TODO: Add BRL1 address
        symbol: "BRL1",
        decimals: 18, // TODO: Verify decimals
      },
      network: {
        chainId: 137,
        name: "Polygon",
      },
    },
  },

  // Celo Alfajores Testnet (44787) - For testing
  celoTestnet: {
    cCOP: {
      address: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
      token: {
        address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA", // Same as mainnet
        symbol: "cCOP",
        decimals: 18,
      },
      network: {
        chainId: 44787,
        name: "Celo Alfajores",
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

