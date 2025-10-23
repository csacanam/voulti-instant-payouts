/**
 * Services Index
 * Central export point for all services
 */

export { authService } from "./auth.service"
export { payoutService } from "./payout.service"
export { squidService } from "./squid.service"
export { apiClient, ApiError } from "./api"
export { API_CONFIG, API_ENDPOINTS } from "./config"

// Export types
export type { CommerceData, Commerce, CommerceResponse } from "./auth.service"
export type { CreatePayoutData, Payout, PayoutResponse, PayoutsResponse } from "./payout.service"
export type {
  SquidPostHook,
  SquidPostHookCall,
  SquidRouteParams,
  SquidRouteResponse,
  SquidStatusParams,
  SquidStatusResponse,
} from "./squid.service"

