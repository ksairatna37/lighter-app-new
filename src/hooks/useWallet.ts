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



export function useWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();


  const wallet = wallets[0];
  const address = wallet?.address;





  return {
    ready,
    authenticated,
    user,
    wallet,
    address,
    login,
    logout,
  };
}
