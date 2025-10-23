// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/PayoutVault.sol";

/**
 * @title PayoutVaultDeployment
 * @notice Script to deploy PayoutVault contract for any ERC20 token
 * @dev Deploy one vault per token you want to manage (e.g., cCOP, cREAL, mxnB, BRL1)
 * @dev Set TOKEN_ADDRESS env var to specify which ERC20 token to vault
 * 
 * @dev Examples:
 * 
 * Celo Mainnet (cCOP):
 * TOKEN_ADDRESS=0x8A567e2aE79CA692Bd748aB832081C45de4041eA \
 * forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
 *   --rpc-url https://forno.celo.org --broadcast --verify
 * 
 * Celo (cREAL):
 * TOKEN_ADDRESS=0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787 \
 * forge script script/PayoutVault.s.sol:PayoutVaultDeployment \
 *   --rpc-url https://forno.celo.org --broadcast --verify
 * 
 * Local testing (Anvil):
 * forge script script/PayoutVault.s.sol:PayoutVaultDeploymentWithMockToken \
 *   --rpc-url http://localhost:8545 --broadcast
 */
contract PayoutVaultDeployment is Script {
    function run() external {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("VAULT_OWNER");
        address token = vm.envAddress("TOKEN_ADDRESS");
        
        require(token != address(0), "TOKEN_ADDRESS not set");
        require(owner != address(0), "VAULT_OWNER not set");
        
        console.log("=== PayoutVault Deployment ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("Token Address:", token);
        console.log("Vault Owner:", owner);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PayoutVault for this specific token
        PayoutVault vault = new PayoutVault(token, owner);
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Complete ===");
        console.log("PayoutVault:", address(vault));
        console.log("Token:", address(vault.token()));
        console.log("Owner:", vault.owner());
        console.log("");
        console.log("Next Steps:");
        console.log("1. Save vault address for frontend integration");
        console.log("2. Test deposit functionality");
        console.log("3. Configure Squid post-hook with this vault address");
    }
}

/**
 * @title PayoutVaultDeploymentWithMockToken
 * @notice Script to deploy both a mock ERC20 token and PayoutVault for testing
 * @dev Useful for local development and testing
 * 
 * @dev Usage:
 * # Start Anvil in one terminal
 * anvil
 * 
 * # In another terminal
 * forge script script/PayoutVault.s.sol:PayoutVaultDeploymentWithMockToken \
 *   --rpc-url http://localhost:8545 --broadcast
 */
contract PayoutVaultDeploymentWithMockToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("VAULT_OWNER");
        
        console.log("=== Mock Token + PayoutVault Deployment ===");
        console.log("Network Chain ID:", block.chainid);
        console.log("Vault Owner:", owner);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock token for testing
        MockToken mockToken = new MockToken("Mock Token", "MTK", 18);
        console.log("Mock Token deployed at:", address(mockToken));
        
        // Deploy PayoutVault
        PayoutVault vault = new PayoutVault(address(mockToken), owner);
        console.log("PayoutVault deployed at:", address(vault));
        
        // Mint some tokens to owner for testing
        mockToken.mint(owner, 1000000 * 10**18); // 1M tokens
        console.log("Minted 1,000,000 tokens to owner");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Test Environment Ready ===");
        console.log("Mock Token:", address(mockToken));
        console.log("PayoutVault:", address(vault));
        console.log("Owner:", owner);
        console.log("Owner Balance:", mockToken.balanceOf(owner));
    }
}

/**
 * @title MockToken
 * @notice Simple ERC20 mock for testing
 */
contract MockToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}
