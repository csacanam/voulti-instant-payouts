/**
 * useTokenBalance Hook
 * Fetches ERC20 token balance for a wallet address
 */

import { useState, useEffect } from "react"
import { ethers } from "ethers"

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]

export interface TokenBalanceConfig {
  tokenAddress: string
  walletAddress: string
  chainId: number
  rpcUrl: string
}

export function useTokenBalance(config: TokenBalanceConfig | null) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🔍 Fetching balance with config:", {
          tokenAddress: config.tokenAddress,
          walletAddress: config.walletAddress,
          chainId: config.chainId,
          rpcUrl: config.rpcUrl,
        })

        // Use ethers v6 syntax
        const provider = new ethers.JsonRpcProvider(config.rpcUrl)
        const contract = new ethers.Contract(config.tokenAddress, ERC20_ABI, provider)

        const [balanceRaw, decimals, symbol] = await Promise.all([
          contract.balanceOf(config.walletAddress),
          contract.decimals(),
          contract.symbol(),
        ])

        console.log("📊 Balance fetched:", {
          symbol,
          balanceRaw: balanceRaw.toString(),
          decimals: Number(decimals),
        })

        const balanceFormatted = parseFloat(ethers.formatUnits(balanceRaw, decimals))
        console.log("✅ Formatted balance:", balanceFormatted)
        
        setBalance(balanceFormatted)
      } catch (err) {
        console.error("❌ Error fetching token balance:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch balance")
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [config?.tokenAddress, config?.walletAddress, config?.chainId, config?.rpcUrl])

  return { balance, loading, error }
}

