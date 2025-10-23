# PayoutVault Deployment Guide

Complete guide for deploying vaults and updating frontend configuration.

## Pre-Deployment Checklist

- [ ] Contracts compiled: `forge build`
- [ ] Tests passing: `forge test`
- [ ] Environment variables set in `.env`:
  - `PRIVATE_KEY` - Deployer wallet private key
  - `VAULT_OWNER` - Backend wallet address (will control withdrawFor)
  - `TOKEN_ADDRESS` - ERC20 token to vault
- [ ] RPC endpoint available for target network
- [ ] Gas funds available on deployer wallet

## Deployment Workflow

### 1. Compile Contracts

```bash
forge build
```

### 2. Deploy Vault

Choose your network and token:

#### Celo Mainnet - cCOP

```bash
PRIVATE_KEY=0x... \
VAULT_OWNER=0xYourBackendWallet \
TOKEN_ADDRESS=0x8A567e2aE79CA692Bd748aB832081C45de4041eA \
forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify
```

#### Celo Mainnet - cREAL

```bash
PRIVATE_KEY=0x... \
VAULT_OWNER=0xYourBackendWallet \
TOKEN_ADDRESS=0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787 \
forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify
```

#### Arbitrum One - mxnB

```bash
PRIVATE_KEY=0x... \
VAULT_OWNER=0xYourBackendWallet \
TOKEN_ADDRESS=0xYourMxnBTokenAddress \
forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
  --rpc-url https://arb1.arbitrum.io/rpc \
  --broadcast \
  --verify
```

#### Celo Alfajores (Testnet)

```bash
PRIVATE_KEY=0x... \
VAULT_OWNER=0xYourBackendWallet \
TOKEN_ADDRESS=0x8A567e2aE79CA692Bd748aB832081C45de4041eA \
forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify
```

### 3. Save Deployment Information

The script will output:

```
=== Deployment Complete ===
PayoutVault: 0xABC123...
Token: 0x8A567e...
Owner: 0xDEF456...
```

**SAVE THIS INFORMATION!** You'll need it for the next step.

### 4. Export ABIs to Frontend

After deployment, copy the ABIs to frontend:

```bash
./scripts/copy-abis.sh
```

Or from frontend directory:

```bash
cd ../frontend
npm run copy:abis
```

This copies `PayoutVault.json` ABI to `frontend/blockchain/abis/`.

### 5. Update Frontend Configuration

Open `frontend/blockchain/vaults.ts` and update the vault address:

```typescript
// Example: After deploying cCOP vault on Celo
export const VAULTS: Record<string, Record<string, VaultConfig>> = {
  celo: {
    cCOP: {
      address: "0xABC123...", // ← UPDATE WITH YOUR DEPLOYED ADDRESS
      token: {
        address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
        symbol: "cCOP",
        decimals: 18,
      },
      network: {
        chainId: 42220,
        name: "Celo",
      },
    },
  },
};
```

### 6. Verify Configuration

Test that the configuration is correct:

```typescript
import { vaultExists, getVaultAddress } from "@/blockchain";

// Should return true
console.log(vaultExists(42220, "cCOP"));

// Should return your deployed address
console.log(getVaultAddress(42220, "cCOP"));
```

### 7. Test Vault Functions

#### Test Deposit (simulate Squid)

```bash
# Approve vault to spend tokens
cast send $TOKEN_ADDRESS "approve(address,uint256)" $VAULT_ADDRESS 1000000 \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Deposit to vault
cast send $VAULT_ADDRESS "deposit(address,uint256,string)" \
  $COMMERCE_ADDRESS 1000000 "test-payout-1" \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

#### Test Withdraw (backend)

```bash
cast send $VAULT_ADDRESS "withdrawFor(address,uint256,string)" \
  $USER_WALLET 1000000 "test-payout-1" \
  --rpc-url $RPC_URL --private-key $BACKEND_PRIVATE_KEY
```

### 8. Update Backend Configuration

Update your backend with the new vault address:

```typescript
// backend/config/vaults.ts
export const VAULT_ADDRESSES = {
  celo: {
    cCOP: "0xABC123...", // Your deployed address
  },
};
```

### 9. Configure Squid Post-Hook

Now you can use the vault in Squid post-hooks. See `frontend/blockchain/README.md` for examples.

## Multi-Vault Deployment

To deploy multiple vaults:

```bash
# 1. Deploy cCOP vault on Celo
TOKEN_ADDRESS=0x8A567e... forge script ... --broadcast
# Save address: 0xVault1...

# 2. Deploy cREAL vault on Celo
TOKEN_ADDRESS=0xe8537a... forge script ... --broadcast
# Save address: 0xVault2...

# 3. Update frontend/blockchain/vaults.ts with both addresses
celo: {
  cCOP: { address: "0xVault1..." },
  cREAL: { address: "0xVault2..." },
}

# 4. Copy ABIs (only needed once)
./scripts/copy-abis.sh
```

## Troubleshooting

### Deployment Failed

**Error: Insufficient funds**

- Solution: Add gas funds to deployer wallet

**Error: Invalid token address**

- Solution: Verify `TOKEN_ADDRESS` is correct for the network

**Error: Owner is zero address**

- Solution: Set `VAULT_OWNER` environment variable

### Verification Failed

```bash
# Manual verification
forge verify-contract $VAULT_ADDRESS PayoutVault \
  --constructor-args $(cast abi-encode "constructor(address,address)" $TOKEN_ADDRESS $OWNER) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --chain-id $CHAIN_ID
```

### ABI Copy Failed

**Error: PayoutVault.json not found**

- Solution: Run `forge build` first

**Error: jq command not found**

- Solution: Install jq: `brew install jq` (macOS) or `apt install jq` (Linux)

## Deployment Tracking

Keep a record of deployed vaults:

| Network  | Token | Vault Address | Tx Hash | Date       | Owner |
| -------- | ----- | ------------- | ------- | ---------- | ----- |
| Celo     | cCOP  | 0x...         | 0x...   | 2025-01-23 | 0x... |
| Celo     | cREAL | 0x...         | 0x...   | 2025-01-23 | 0x... |
| Arbitrum | mxnB  | 0x...         | 0x...   | 2025-01-24 | 0x... |

## Security Checklist

After deployment:

- [ ] Verify contract on block explorer
- [ ] Test deposit function
- [ ] Test withdrawFor function with backend wallet
- [ ] Verify only owner can call withdrawFor
- [ ] Test double-claim prevention
- [ ] Update monitoring/alerts for the vault
- [ ] Document vault address in team wiki
- [ ] Back up deployment transaction hash

## Upgrading to New Version

If you need to deploy a new version:

1. Deploy new vault with updated code
2. Update frontend `vaults.ts` with new address
3. Update backend configuration
4. Migrate any remaining balances from old vault (if needed)
5. Update Squid post-hook to use new vault
6. **DO NOT** delete old vault until all payouts are claimed

## Reference Links

- [Foundry Book](https://book.getfoundry.sh/)
- [Frontend Blockchain Config](../frontend/blockchain/README.md)
- [Contract Documentation](./README.md)
- [Squid Router Docs](https://docs.squidrouter.com/)

## Support

For deployment issues:

- Check tests: `forge test -vvv`
- Review deployment script: `script/PayoutVault.s.sol`
- Verify network RPC is accessible
- Check gas prices and ensure sufficient funds
