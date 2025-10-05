import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { create } from 'zustand';

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
  balance: '0',
  usdcBalance: '0',
  usdValue: '0',
  isLoading: false,
  setBalance: (balance) => set({ balance }),
  setUsdcBalance: (usdcBalance) => set({ usdcBalance }),
  setUsdValue: (usdValue) => set({ usdValue }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export function useWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setBalance, setUsdcBalance, setUsdValue, setIsLoading } = useWalletStore();
  
  const wallet = wallets[0];
  const address = wallet?.address;

  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 0;
    }
  };

  const fetchBalance = async () => {
    if (!address || !wallet) return;
    
    setIsLoading(true);
    try {
      const provider = await wallet.getEthereumProvider();
      
      // Fetch ETH balance
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string;
      
      const ethBalance = formatEther(BigInt(balance));
      const formattedEth = parseFloat(ethBalance).toFixed(4);
      setBalance(formattedEth);
      
      // Fetch USDC balance
      const usdcBalance = await provider.request({
        method: 'eth_call',
        params: [
          {
            to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            data: `0x70a08231000000000000000000000000${address.slice(2)}`,
          },
          'latest',
        ],
      }) as string;
      
      const usdcAmount = parseFloat(formatEther(BigInt(usdcBalance))) * 1e12; // USDC has 6 decimals
      setUsdcBalance(usdcAmount.toFixed(2));
      
      // Fetch ETH price and calculate USD value
      const ethPrice = await fetchEthPrice();
      const usdValue = parseFloat(formattedEth) * ethPrice;
      setUsdValue(usdValue.toFixed(2));
      
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && wallet) {
      fetchBalance();
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