/**
 * useSquidSwap Hook
 * Handles Squid cross-chain swaps with Privy wallet integration
 */

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers"
import { squidService } from "@/services/squid.service"
import type { Payout } from "@/services"

export interface SwapStatus {
  status: "idle" | "approving" | "swapping" | "polling" | "success" | "error"
  message: string
  txHash?: string
  explorerUrl?: string
}

export function useSquidSwap() {
  const { user, sendTransaction } = usePrivy()
  const [swapStatus, setSwapStatus] = useState<SwapStatus>({
    status: "idle",
    message: "",
  })

  /**
   * Approve token spending
   */
  const approveToken = async (
    tokenAddress: string,
    spender: string,
    amount: string,
    chainId: number
  ): Promise<string> => {
    if (!user?.wallet) {
      throw new Error("Wallet not connected")
    }

    setSwapStatus({ status: "approving", message: "Approving token spending..." })

    const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"]
    const iface = new ethers.Interface(erc20Abi)
    const data = iface.encodeFunctionData("approve", [spender, amount])

    try {
      const tx = await sendTransaction({
        to: tokenAddress,
        data,
        value: "0",
        chainId: `eip155:${chainId}`,
      })

      console.log("Approval transaction:", tx.transactionHash)
      return tx.transactionHash
    } catch (error) {
      console.error("Approval failed:", error)
      throw error
    }
  }

  /**
   * Execute Squid swap
   */
  const executeSwap = async (payout: Payout, toAddress?: string): Promise<SwapStatus> => {
    try {
      if (!user?.wallet) {
        throw new Error("Wallet not connected")
      }

      // Step 1: Get route from Squid
      setSwapStatus({ status: "idle", message: "Getting optimal route..." })
      const routeParams = squidService.createRouteParams(payout, toAddress)
      console.log("Squid route parameters:", routeParams)

      const { data: routeData, requestId } = await squidService.getRoute(routeParams)
      const route = routeData.route
      console.log("Calculated route:", route)
      console.log("Request ID:", requestId)

      const transactionRequest = route.transactionRequest

      // Step 2: Approve token spending
      await approveToken(
        payout.from_token_address,
        transactionRequest.target,
        payout.from_amount.toString(),
        payout.from_chain
      )

      // Step 3: Execute swap transaction
      setSwapStatus({ status: "swapping", message: "Executing swap..." })
      const tx = await sendTransaction({
        to: transactionRequest.target,
        data: transactionRequest.data,
        value: transactionRequest.value,
        chainId: `eip155:${payout.from_chain}`,
      })

      console.log("Swap transaction hash:", tx.transactionHash)
      const explorerUrl = squidService.getExplorerUrl(tx.transactionHash, route)
      console.log("Explorer URL:", explorerUrl)

      // Step 4: Poll status
      setSwapStatus({
        status: "polling",
        message: "Waiting for cross-chain transfer...",
        txHash: tx.transactionHash,
        explorerUrl,
      })

      const finalStatus = await squidService.pollStatus(
        tx.transactionHash,
        requestId,
        payout.from_chain.toString(),
        payout.to_chain.toString()
      )

      // Step 5: Complete
      const successStatus: SwapStatus = {
        status: "success",
        message: `Swap completed successfully! Status: ${finalStatus.squidTransactionStatus}`,
        txHash: tx.transactionHash,
        explorerUrl,
      }

      setSwapStatus(successStatus)
      return successStatus
    } catch (error) {
      console.error("Swap failed:", error)
      const errorStatus: SwapStatus = {
        status: "error",
        message: error instanceof Error ? error.message : "Swap failed",
      }
      setSwapStatus(errorStatus)
      return errorStatus
    }
  }

  return {
    executeSwap,
    swapStatus,
    setSwapStatus,
  }
}

