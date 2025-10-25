/**
 * Network Configuration
 * Centralized configuration for blockchain networks
 */

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
}

export const NETWORKS: Record<string, NetworkConfig> = {
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc"
  },
  celo: {
    chainId: 42220,
    name: "Celo",
    rpcUrl: "https://forno.celo.org"
  }
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | null {
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || null
}

/**
 * Get network configuration by name
 */
export function getNetworkByName(name: string): NetworkConfig | null {
  return NETWORKS[name] || null
}
