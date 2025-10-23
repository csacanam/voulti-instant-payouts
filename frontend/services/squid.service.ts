/**
 * Squid Service
 * Handles cross-chain swaps and bridges using Squid Router
 */

import axios from "axios"
import type { Payout } from "./payout.service"

const SQUID_API_BASE_URL = "https://v2.api.squidrouter.com/v2"
const INTEGRATOR_ID = process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "voulti-instant-payouts"

export interface SquidRouteParams {
  fromAddress: string
  fromChain: string
  fromToken: string
  fromAmount: string
  toChain: string
  toToken: string
  toAddress: string
  enableForecall?: boolean
  quoteOnly?: boolean
}

export interface SquidRouteResponse {
  route: {
    transactionRequest: {
      target: string
      data: string
      value: string
      gasPrice: string
      gasLimit: string
    }
    estimate: {
      fromAmount: string
      toAmount: string
      exchangeRate: string
      estimatedRouteDuration: number
      actions: any[]
    }
  }
}

export interface SquidStatusParams {
  transactionId: string
  requestId: string
  fromChainId: string
  toChainId: string
}

export interface SquidStatusResponse {
  squidTransactionStatus: "success" | "partial_success" | "needs_gas" | "not_found" | "pending"
  fromChain: any
  toChain: any
  axelarTransactionUrl?: string
}

/**
 * Squid Service
 */
export const squidService = {
  /**
   * Get optimal route for cross-chain swap
   * @param params - Route parameters
   * @returns Route data and request ID
   */
  async getRoute(params: SquidRouteParams): Promise<{ data: SquidRouteResponse; requestId: string }> {
    try {
      console.log("🔵 Squid getRoute - Request:", JSON.stringify(params, null, 2))
      
      const result = await axios.post(`${SQUID_API_BASE_URL}/route`, params, {
        headers: {
          "x-integrator-id": INTEGRATOR_ID,
          "Content-Type": "application/json",
        },
      })
      const requestId = result.headers["x-request-id"]
      
      console.log("✅ Squid getRoute - Success:", {
        requestId,
        routeFound: !!result.data.route,
      })
      
      return { data: result.data, requestId }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("❌ Squid API error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        })
      }
      console.error("❌ Error with parameters:", JSON.stringify(params, null, 2))
      throw error
    }
  },

  /**
   * Get transaction status
   * @param params - Status parameters
   * @returns Transaction status
   */
  async getStatus(params: SquidStatusParams): Promise<SquidStatusResponse> {
    try {
      const result = await axios.get(`${SQUID_API_BASE_URL}/status`, {
        params: {
          transactionId: params.transactionId,
          requestId: params.requestId,
          fromChainId: params.fromChainId,
          toChainId: params.toChainId,
        },
        headers: {
          "x-integrator-id": INTEGRATOR_ID,
        },
      })
      return result.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Squid status API error:", error.response.data)
      }
      throw error
    }
  },

  /**
   * Poll transaction status until completion
   * @param txHash - Transaction hash
   * @param requestId - Request ID from route call
   * @param fromChainId - Source chain ID
   * @param toChainId - Destination chain ID
   * @returns Final status
   */
  async pollStatus(
    txHash: string,
    requestId: string,
    fromChainId: string,
    toChainId: string
  ): Promise<SquidStatusResponse> {
    const statusParams: SquidStatusParams = {
      transactionId: txHash,
      requestId,
      fromChainId,
      toChainId,
    }

    const completedStatuses = ["success", "partial_success", "needs_gas", "not_found"]
    const maxRetries = 10
    let retryCount = 0
    let status: SquidStatusResponse | undefined

    do {
      try {
        status = await this.getStatus(statusParams)
        console.log(`Squid transaction status: ${status.squidTransactionStatus}`)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          retryCount++
          if (retryCount >= maxRetries) {
            console.error("Max retries reached. Transaction not found.")
            throw new Error("Transaction not found after max retries")
          }
          console.log("Transaction not found. Retrying...")
          await new Promise((resolve) => setTimeout(resolve, 5000))
          continue
        } else {
          throw error
        }
      }

      if (status && !completedStatuses.includes(status.squidTransactionStatus)) {
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } while (!status || !completedStatuses.includes(status.squidTransactionStatus))

    return status
  },

  /**
   * Create Squid route parameters from payout data
   * @param payout - Payout data from backend
   * @param toAddress - Optional destination address (defaults to from_address)
   * @returns Squid route parameters
   */
  createRouteParams(payout: Payout, toAddress?: string): SquidRouteParams {
    // Convert amount to smallest unit (wei) using token decimals
    // e.g., 1.5 USDT with 6 decimals = 1500000
    const fromAmountInWei = Math.floor(payout.from_amount * Math.pow(10, payout.from_token_decimals))
    
    console.log("💰 Amount conversion:", {
      original: payout.from_amount,
      decimals: payout.from_token_decimals,
      converted: fromAmountInWei.toString(),
    })
    
    return {
      fromAddress: payout.from_address,
      fromChain: payout.from_chain.toString(),
      fromToken: payout.from_token_address,
      fromAmount: fromAmountInWei.toString(),
      toChain: payout.to_chain.toString(),
      toToken: payout.to_token_address,
      toAddress: toAddress || payout.from_address, // Use from_address as default for testing
      enableForecall: true,
      quoteOnly: false,
    }
  },

  /**
   * Get explorer URL based on route type
   * @param txHash - Transaction hash
   * @param route - Route data
   * @returns Explorer URL
   */
  getExplorerUrl(txHash: string, route: any): string {
    const hasRfqAction = route.estimate?.actions?.some((action: any) => action.type === "rfq")
    return hasRfqAction
      ? `https://coralscan.squidrouter.com/tx/${txHash}`
      : `https://axelarscan.io/gmp/${txHash}`
  },
}

