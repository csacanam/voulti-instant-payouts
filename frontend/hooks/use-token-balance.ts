/**
 * Hook to get token balance for a recipient's wallet
 * Queries the ERC20 token balance directly from the user's wallet
 */

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { VaultConfig } from "@/blockchain/vaults"

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
]

interface UseTokenBalanceResult {
  balance: string // Formatted balance (e.g., "100.50")
  loading: boolean
  error: string | null
}

/**
 * Get the balance of ERC20 tokens in a recipient's wallet
 * 
 * @param vaultConfig - The vault configuration (contains token address, decimals, network)
 * @param recipientAddress - The recipient's wallet address
 * @param refreshKey - Optional key to trigger refresh (increment to refetch balance)
 * @returns Balance, loading state, and error
 */
export function useTokenBalance(
  vaultConfig: VaultConfig | null,
  recipientAddress: string | null,
  refreshKey?: number
): UseTokenBalanceResult {
  const [balance, setBalance] = useState<string>("0.00")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!vaultConfig || !recipientAddress) {
        setBalance("0.00")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get RPC URL for the network
        const rpcUrl = getRpcUrl(vaultConfig.network.chainId)
        if (!rpcUrl) {
          throw new Error(`No RPC URL for chain ${vaultConfig.network.chainId}`)
        }

        // Create provider
        const provider = new ethers.JsonRpcProvider(rpcUrl)

        // Create token contract instance (for the ERC20 token, not the vault)
        const tokenContract = new ethers.Contract(
          vaultConfig.token.address, // Token address (e.g., cCOP, MXNB)
          ERC20_ABI,
          provider
        )

        // Get balance of the recipient's wallet (not the vault)
        const balanceWei = await tokenContract.balanceOf(recipientAddress)
        
        // Format balance
        const balanceFormatted = ethers.formatUnits(balanceWei, vaultConfig.token.decimals)
        const balanceNumber = parseFloat(balanceFormatted)
        
        setBalance(balanceNumber.toFixed(2))
      } catch (err) {
        console.error("Failed to fetch vault balance:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch balance")
        setBalance("0.00")
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [vaultConfig, recipientAddress, refreshKey])

  return { balance, loading, error }
}

/**
 * Get RPC URL for a chain ID
 */
function getRpcUrl(chainId: number): string | null {
  const RPC_URLS: Record<number, string> = {
    42220: "https://forno.celo.org", // Celo Mainnet
    42161: "https://arb1.arbitrum.io/rpc", // Arbitrum One
  }

  return RPC_URLS[chainId] || null
}

