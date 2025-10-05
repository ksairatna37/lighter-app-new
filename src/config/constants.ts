// Privy Configuration
export const PRIVY_APP_ID = "cmg1ysrm0005xl70cpgxa39o6";

// Contract Addresses
export const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Network Configuration
export const CHAIN_ID = 8453;
export const CHAIN_NAME = "Base";
export const RPC_URL = "https://base-mainnet.infura.io/v3/3b60e88027de49bba4bd65af373611df";

// Block Explorer
export const BLOCK_EXPLORER_URL = "https://basescan.org";

// Base Chain Configuration
export const BASE_CHAIN = {
  id: CHAIN_ID,
  name: CHAIN_NAME,
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: BLOCK_EXPLORER_URL,
    },
  },
} as const;