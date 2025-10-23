/**
 * Blockchain Module
 * 
 * Central export point for all blockchain-related configurations,
 * ABIs, and vault addresses.
 */

// Export vault configurations and helpers
export {
  VAULTS,
  getVaultConfig,
  getVaultAddress,
  vaultExists,
  getVaultsByNetwork,
  getVaultsByChainId,
  type VaultConfig,
} from "./vaults"

// Export ABIs
import PayoutVaultABI from "./abis/PayoutVault.json"

export const ABIs = {
  PayoutVault: PayoutVaultABI,
}

// Re-export for convenience
export { PayoutVaultABI }

