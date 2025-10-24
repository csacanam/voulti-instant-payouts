/**
 * Payout Service
 * Handles payout creation and retrieval
 */

import { apiClient } from "./api"
import { API_ENDPOINTS } from "./config"

export interface CreatePayoutData {
  commerce_id: string
  from_fiat: string
  to_fiat: string
  from_address: string
  to_name: string
  to_email: string
  to_amount: number
  to_address?: string
}

export interface Payout {
  id: string
  from_amount: number
  from_currency: string
  from_chain: number
  from_chain_name: string
  from_token_symbol: string
  from_token_address: string
  from_token_decimals: number
  from_address: string
  to_amount: number
  to_currency: string
  to_chain: number
  to_chain_name: string
  to_token_symbol: string
  to_token_address: string
  to_token_decimals: number
  to_name: string
  to_email: string
  to_address: string | null
  status: string
  created_at: string
  claimed_at: string | null
}

export interface PayoutResponse {
  success: boolean
  data: Payout
}

export interface PayoutsResponse {
  payouts: Payout[]
}

/**
 * Payout Service
 */
export const payoutService = {
  /**
   * Create a new payout
   * @param data - Payout creation data
   * @returns Created payout data
   */
  async createPayout(data: CreatePayoutData): Promise<Payout> {
    const endpoint = API_ENDPOINTS.PAYOUTS.CREATE_PAYOUT
    const response = await apiClient.post<PayoutResponse>(endpoint, data)
    return response.data
  },

  /**
   * Get all payouts for a commerce
   * @param commerceId - Commerce ID
   * @returns List of payouts
   */
  async getPayouts(commerceId: string): Promise<Payout[]> {
    const endpoint = `/commerces/${commerceId}/payouts`
    const response = await apiClient.get<PayoutsResponse>(endpoint)
    return response.payouts
  },
}
