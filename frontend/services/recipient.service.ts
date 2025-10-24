/**
 * Recipient Portal API Service
 * 
 * Handles API calls for the recipient portal (claim page, wallet dashboard)
 */

import { API_CONFIG } from "./config"

const API_BASE_URL = API_CONFIG.BASE_URL

export interface PublicPayoutResponse {
  id: string
  amount: number
  currency: string
  from_commerce: {
    id: string
    name: string
  }
  status: "Pending" | "Funded" | "Claimed"
  created_at: string
  recipient_email: string // Masked: u***@example.com
}

export interface InitializeResponse {
  success: boolean
  email: string
  wallet_address: string
  payouts_bound: number
}

export interface PendingPayout {
  id: string
  amount: number
  currency: string
  from_commerce: {
    id: string
    name: string
  }
  status: "Pending" | "Funded" | "Claimed"
  created_at: string
}

export interface PendingPayoutsResponse {
  payouts: PendingPayout[]
}

export interface ClaimResponse {
  success: boolean
  payout: {
    id: string
    amount: number
    currency: string
    status: "Claimed"
    claimed_at: string
    tx_hash: string
  }
}

class RecipientService {
  /**
   * Get public payout details (no auth required)
   */
  async getPublicPayout(payoutId: string): Promise<PublicPayoutResponse> {
    const url = `${API_BASE_URL}/payouts/${payoutId}/public`
    console.log("🔍 Fetching payout from:", url)
    
    const response = await fetch(url)
    console.log("📡 Response status:", response.status, response.statusText)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Payout not found")
      }
      if (response.status === 410) {
        throw new Error("Payout expired")
      }
      throw new Error(`Failed to fetch payout: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Payout data:", data)
    return data
  }

  /**
   * Initialize recipient - binds wallet to all Funded payouts for this email
   * Requires Privy authentication token
   */
  async initialize(privyToken: string): Promise<InitializeResponse> {
    const url = `${API_BASE_URL}/recipients/initialize`
    console.log("🔐 Initializing recipient at:", url)
    console.log("🎫 Token (first 20 chars):", privyToken.substring(0, 20) + "...")
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${privyToken}`,
        // No Content-Type needed - no body
      },
    })

    console.log("📡 Initialize response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Initialize error response:", errorText)
      
      if (response.status === 401) {
        throw new Error("Unauthorized - invalid or expired token")
      }
      throw new Error(`Failed to initialize recipient: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Initialize success:", data)
    return data
  }

  /**
   * Get pending payouts for authenticated recipient
   * Requires Privy authentication token
   */
  async getPendingPayouts(privyToken: string): Promise<PendingPayoutsResponse> {
    const url = `${API_BASE_URL}/recipients/payouts`
    console.log("📋 Fetching pending payouts from:", url)
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${privyToken}`,
      },
    })

    console.log("📡 Pending payouts response status:", response.status, response.statusText)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - invalid or expired token")
      }
      throw new Error(`Failed to fetch pending payouts: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Pending payouts:", data)
    return data
  }

  /**
   * Claim payout - executes withdrawFor on vault
   * No auth required (wallet already bound via initialize)
   */
  async claimPayout(payoutId: string): Promise<ClaimResponse> {
    const url = `${API_BASE_URL}/payouts/${payoutId}/claim`
    console.log("🎯 Claiming payout at:", url)
    
    const response = await fetch(url, {
      method: "POST",
      // No headers needed - no auth, no body
    })
    
    console.log("📡 Claim response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 404) {
        throw new Error("Payout not found")
      }
      if (response.status === 409) {
        throw new Error("Payout already claimed")
      }
      if (response.status === 422) {
        throw new Error(errorData.error || "Payout not ready to claim")
      }
      if (response.status === 500) {
        throw new Error("Transaction failed - please try again")
      }
      
      throw new Error(errorData.error || `Failed to claim payout: ${response.statusText}`)
    }

    return response.json()
  }
}

export const recipientService = new RecipientService()

