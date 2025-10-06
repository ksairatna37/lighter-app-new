import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { create } from "zustand";

interface WalletStore {
  balance: string;
  usdcBalance: string;
  usdValue: string;
  isLoading: boolean;
  setBalance: (balance: string) => void;
  setUsdcBalance: (balance: string) => void;
  setUsdValue: (usdValue: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  balance: "0",
  usdcBalance: "0",
  usdValue: "0",
  isLoading: false,
  setBalance: (balance) => set({ balance }),
  setUsdcBalance: (usdcBalance) => set({ usdcBalance }),
  setUsdValue: (usdValue) => set({ usdValue }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

export function useWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setBalance, setUsdcBalance, setUsdValue, setIsLoading } =
    useWalletStore();

  const wallet = wallets[0];
  const address = wallet?.address;

  // Debug logging
  console.log("Wallet Debug:", {
    ready,
    authenticated,
    walletsCount: wallets.length,
    hasWallet: !!wallet,
    address,
    walletType: wallet?.walletClientType,
  });

  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return 0;
    }
  };

  const fetchBalance = async () => {
    if (!address || !wallet) return;

    setIsLoading(true);
    try {
      const provider = await wallet.getEthereumProvider();

      // Switch to Base network first
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2105" }], // Base mainnet (8453 in hex)
        });
      } catch (switchError: unknown) {
        // If chain doesn't exist, add it
        if (
          typeof switchError === "object" &&
          switchError !== null &&
          "code" in switchError &&
          (switchError as { code: number }).code === 4902
        ) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        }
      }

      // Fetch ETH balance
      const balance = (await provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })) as string;

      const ethBalance = formatEther(BigInt(balance || "0x0"));
      const formattedEth = parseFloat(ethBalance).toFixed(4);
      setBalance(formattedEth);

      // Fetch USDC balance using proper ABI encoding
      const usdcBalanceHex = (await provider.request({
        method: "eth_call",
        params: [
          {
            to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            data: `0x70a08231000000000000000000000000${address
              .slice(2)
              .toLowerCase()}`,
          },
          "latest",
        ],
      })) as string;

      console.log("USDC Balance Response:", usdcBalanceHex);

      // Handle empty response
      const usdcBalanceBigInt = BigInt(usdcBalanceHex || "0x0");
      // USDC has 6 decimals, so divide by 1e6
      const usdcAmount = Number(usdcBalanceBigInt) / 1e6;
      setUsdcBalance(usdcAmount.toFixed(2));

      // Fetch ETH price and calculate USD value
      const ethPrice = await fetchEthPrice();
      const totalUsdValue = parseFloat(formattedEth) * ethPrice + usdcAmount;
      setUsdValue(totalUsdValue.toFixed(2));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && wallet && address) {
      console.log("Fetching balance for address:", address);
      fetchBalance();
    } else if (authenticated && !wallet) {
      console.log(
        "User authenticated but no wallet found yet. Waiting for wallet creation..."
      );
    }
  }, [authenticated, wallet, address]);

  return {
    ready,
    authenticated,
    user,
    wallet,
    address,
    login,
    logout,
    refetchBalance: fetchBalance,
  };
}
