/**
 * Squid Service
 * Handles cross-chain swaps and bridges using Squid Router
 */

import axios from "axios"
import { ethers } from "ethers"
import type { Payout } from "./payout.service"
import { getVaultAddress, PayoutVaultABI } from "@/blockchain"

const SQUID_API_BASE_URL = "https://v2.api.squidrouter.com/v2"
const INTEGRATOR_ID = process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "voulti-instant-payouts"

export interface SquidPostHookCall {
  callType: number // 1 = FULL_TOKEN_BALANCE
  target: string
  value: string
  callData: string
  payload: {
    tokenAddress: string
    inputPos: string
  }
  estimatedGas: string
  chainType: "evm"
}

export interface SquidPostHook {
  chainType: "evm"
  calls: SquidPostHookCall[]
  provider?: string
  description: string
  logoURI?: string
}

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
  postHook?: SquidPostHook
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
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("🔄 SQUID API - Getting Route")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("📋 Request Parameters:", JSON.stringify(params, null, 2))
      
      if (params.postHook) {
        console.log("🎯 POST-HOOK DETECTED:")
        console.log("  - chainType:", params.postHook.chainType)
        console.log("  - Number of calls:", params.postHook.calls?.length || 0)
        console.log("  - provider:", params.postHook.provider)
        console.log("  - description:", params.postHook.description)
        
        params.postHook.calls?.forEach((call, index) => {
          console.log(`  Call ${index + 1}:`)
          console.log(`    - callType: ${call.callType}`)
          console.log(`    - target: ${call.target}`)
          console.log(`    - tokenAddress: ${call.payload.tokenAddress}`)
          console.log(`    - inputPos: ${call.payload.inputPos}`)
          console.log(`    - estimatedGas: ${call.estimatedGas}`)
          console.log(`    - callData (first 66 chars): ${call.callData.substring(0, 66)}`)
        })
      } else {
        console.warn("⚠️ NO POST-HOOK in request!")
      }
      
      const result = await axios.post(`${SQUID_API_BASE_URL}/route`, params, {
        headers: {
          "x-integrator-id": INTEGRATOR_ID,
          "Content-Type": "application/json",
        },
      })
      const requestId = result.headers["x-request-id"] || result.data.requestId || "N/A"
      
      console.log("📋 Response headers:", result.headers)
      console.log("📋 Response data keys:", Object.keys(result.data))
      
      console.log("✅ Squid Route Response:")
      console.log("  - requestId:", requestId)
      console.log("  - routeFound:", !!result.data.route)
      console.log("  - toAddress:", params.toAddress)
      console.log("  - estimatedDuration:", result.data.route?.estimate?.estimatedRouteDuration, "seconds")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      
      return { data: result.data, requestId }
    } catch (error) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.error("❌ SQUID API ERROR")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      if (axios.isAxiosError(error) && error.response) {
        console.error("Status:", error.response.status, error.response.statusText)
        console.error("Response data:", JSON.stringify(error.response.data, null, 2))
        console.error("Response headers:", error.response.headers)
      }
      console.error("Request params sent:", JSON.stringify(params, null, 2))
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
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
   * Generate post-hook for PayoutVault deposit
   * @param payout - Payout data
   * @returns Squid post-hook configuration
   */
  createVaultPostHook(payout: Payout): SquidPostHook | null {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🏦 Creating Vault Post-Hook")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("Payout data:", {
      id: payout.id,
      to_chain: payout.to_chain,
      to_token_symbol: payout.to_token_symbol,
      to_token_address: payout.to_token_address,
      from_address: payout.from_address,
    })
    
    // Get vault address for the destination chain and token
    const vaultAddress = getVaultAddress(payout.to_chain, payout.to_token_symbol)
    
    console.log("Vault lookup:", {
      chainId: payout.to_chain,
      tokenSymbol: payout.to_token_symbol,
      vaultFound: !!vaultAddress,
      vaultAddress: vaultAddress || "NOT FOUND",
    })
    
    if (!vaultAddress) {
      console.error("❌ NO VAULT CONFIGURED!")
      console.error(`   Chain: ${payout.to_chain}, Token: ${payout.to_token_symbol}`)
      console.error("   Post-hook will NOT be created")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      return null
    }

    // Create interfaces for encoding
    const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"]
    const erc20Interface = new ethers.Interface(erc20Abi)
    const vaultInterface = new ethers.Interface(PayoutVaultABI)
    
    // Call 1: Approve vault to spend tokens
    // approve(address spender, uint256 amount)
    const approvalData = erc20Interface.encodeFunctionData("approve", [
      vaultAddress, // spender (vault)
      ethers.MaxUint256, // amount (max approval for simplicity)
    ])
    
    console.log("Call 1 - Encoding approve():")
    console.log("  - spender (vault):", vaultAddress)
    console.log("  - amount: MaxUint256")
    console.log("  - callData:", approvalData)
    
    // Call 2: Deposit into vault
    // deposit(address commerce, uint256 amount, string payoutId)
    // Note: amount will be replaced by Squid with FULL_TOKEN_BALANCE
    const depositArgs = [
      payout.from_address, // commerce address
      "0", // amount placeholder (Squid replaces with actual balance)
      payout.id, // payoutId
    ]
    
    console.log("Call 2 - Encoding deposit() with args:", depositArgs)
    
    const depositData = vaultInterface.encodeFunctionData("deposit", depositArgs)
    
    console.log("  - callData:", depositData)

    const postHook: SquidPostHook = {
      chainType: "evm",
      calls: [
        {
          callType: 1, // FULL_TOKEN_BALANCE
          target: payout.to_token_address, // Token contract
          value: "0",
          callData: approvalData,
          payload: {
            tokenAddress: payout.to_token_address,
            inputPos: "1", // Position of amount in approve function
          },
          estimatedGas: "50000",
          chainType: "evm",
        },
        {
          callType: 1, // FULL_TOKEN_BALANCE
          target: vaultAddress, // PayoutVault address
          value: "0",
          callData: depositData,
          payload: {
            tokenAddress: payout.to_token_address,
            inputPos: "1", // Position of amount in deposit function (0=commerce, 1=amount, 2=payoutId)
          },
          estimatedGas: "200000",
          chainType: "evm",
        },
      ],
      provider: "Voulti",
      description: `Deposit ${payout.to_token_symbol} to PayoutVault for payout ${payout.id}`,
    }
    
    console.log("✅ Post-hook created successfully with 2 calls:")
    console.log("  - Call 1: approve() token to vault")
    console.log("  - Call 2: deposit() into vault")
    console.log("  - Vault:", vaultAddress)
    console.log("  - Commerce:", payout.from_address)
    console.log("  - PayoutId:", payout.id)
    console.log("  - Token:", payout.to_token_address)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    return postHook
  },

  /**
   * Create Squid route parameters from payout data
   * @param payout - Payout data from backend
   * @param toAddress - Optional destination address (defaults to from_address)
   * @returns Squid route parameters
   */
  createRouteParams(payout: Payout, toAddress?: string): SquidRouteParams {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("⚙️ Creating Route Parameters")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    // Convert amount to smallest unit (wei) using token decimals
    // e.g., 1.5 USDT with 6 decimals = 1500000
    const fromAmountInWei = Math.floor(payout.from_amount * Math.pow(10, payout.from_token_decimals))
    
    console.log("💰 Amount conversion:", {
      original: payout.from_amount,
      decimals: payout.from_token_decimals,
      converted: fromAmountInWei.toString(),
    })
    
    // Generate post-hook for vault deposit
    const postHook = this.createVaultPostHook(payout)
    
    // IMPORTANT: When using post-hook, toAddress should be the merchant (from_address)
    // The merchant receives tokens, then post-hook:
    //   1. Approves vault to spend tokens
    //   2. Calls vault.deposit() which does transferFrom(merchant, vault, amount)
    const finalToAddress = toAddress || payout.from_address
    
    console.log("📍 Route destination decision:")
    console.log("  - postHook exists:", !!postHook)
    console.log("  - provided toAddress:", toAddress || "N/A")
    console.log("  - FINAL toAddress (merchant):", finalToAddress)
    console.log("  - Note: Merchant receives tokens, then post-hook approves + deposits to vault")
    
    const params: SquidRouteParams = {
      fromAddress: payout.from_address,
      fromChain: payout.from_chain.toString(),
      fromToken: payout.from_token_address,
      fromAmount: fromAmountInWei.toString(),
      toChain: payout.to_chain.toString(),
      toToken: payout.to_token_address,
      toAddress: finalToAddress,
      enableForecall: true,
      quoteOnly: false,
    }
    
    // Add post-hook if configured
    if (postHook) {
      console.log("✅ Post-hook WILL BE ADDED to params")
      params.postHook = postHook
    } else {
      console.warn("⚠️ Post-hook NOT added (vault not found or not configured)")
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    return params
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

