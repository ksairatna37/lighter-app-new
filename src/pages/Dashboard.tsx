import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, HandCoins, Wallet, Clock, TrendingUp, TrendingDown, ArrowRight, RefreshCw, Minus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import logo from "@/assets/logo.png";
import deposit from "@/assets/deposit.png";
import withdraw from "@/assets/withdraw.png";
import farm from "@/assets/farm.png";
import refercardbg from "@/assets/refercardbg.png";
import copy from "@/assets/Copy.png";
import timer from "@/assets/timer.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';



// Lighter Point Price Data Interface
interface LighterPointData {
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
  priceHistory: { timestamp: Date; price: number }[];
}

// Suggested Action Interface
interface SuggestedAction {
  action: 'BUY' | 'SELL' | 'HOLD' | 'STAKE' | 'FARM';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  icon: React.ReactNode;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, authenticated } = usePrivy();
  const { address, logout, refetchBalance } = useWallet();
  const { balance, usdcBalance, usdValue, isLoading } = useWalletStore();


  // State for USDL balance
  const [usdlBalance, setUsdlBalance] = useState<string>("0.00");
  const [usdlLoading, setUsdlLoading] = useState<boolean>(true);
  const [stakedBalance, setStakedBalance] = useState<string>("99.00");
  const [pointValue, setPointValue] = useState<string>("156");




  // State for Lighter Point price data
  const [lighterPointData, setLighterPointData] = useState<LighterPointData>({
    currentPrice: 52.50,
    previousPrice: 48.40,
    priceChange: 4.10,
    priceChangePercent: 8.47,
    volume24h: 125000,
    marketCap: 2500000,
    lastUpdated: new Date(),
    priceHistory: []
  });
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [suggestedAction, setSuggestedAction] = useState<SuggestedAction>({
    action: 'HOLD',
    confidence: 'MEDIUM',
    reason: 'Price trending up! Consider holding',
    icon: <TrendingUp className="w-3 h-3" />,
    color: 'text-green-400'
  });


  // Function to fetch real-time Lighter Point price data
  const fetchLighterPointPrice = async () => {
    console.log("fetch lighter point price");

    setPriceLoading(true);
    try {
      // Method 1: Using CoinGecko API (replace with actual Lighter Point ID)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=lighter-point&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {

        const data = await response.json();
        console.log(data);
        const lighterData = data['lighter-point'];

        if (lighterData) {
          const newPriceData: LighterPointData = {
            currentPrice: lighterData.usd,
            previousPrice: lighterData.usd / (1 + (lighterData.usd_24h_change / 100)),
            priceChange: lighterData.usd * (lighterData.usd_24h_change / 100),
            priceChangePercent: lighterData.usd_24h_change,
            volume24h: lighterData.usd_24h_vol || 0,
            marketCap: lighterData.usd_market_cap || 0,
            lastUpdated: new Date(),
            priceHistory: lighterPointData.priceHistory
          };

          setLighterPointData(newPriceData);
          generateSuggestedAction(newPriceData);
          return;
        }

      }

      // Method 2: Fallback to custom API or contract call
      await fetchPriceFromContract();

    } catch (error) {
      console.error("Error fetching Lighter Point price:", error);
      // Use mock data with realistic fluctuation
      await generateMockRealTimeData();
    } finally {
      setPriceLoading(false);
    }
  };

  // Alternative method: Fetch price from smart contract or custom API
  const fetchPriceFromContract = async () => {
    console.log("fetch price from contract");
    try {
      // This would call your price oracle or DEX contract
      // Example using Uniswap V3 pool or Chainlink price feed

      // For now, we'll simulate a realistic price update
      const basePrice = 52.50;
      const volatility = 0.15; // 15% volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = basePrice * (1 + randomChange);

      const priceChange = newPrice - lighterPointData.currentPrice;
      const priceChangePercent = (priceChange / lighterPointData.currentPrice) * 100;

      const updatedData: LighterPointData = {
        ...lighterPointData,
        previousPrice: lighterPointData.currentPrice,
        currentPrice: newPrice,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
        lastUpdated: new Date(),
        priceHistory: [
          ...lighterPointData.priceHistory.slice(-23), // Keep last 23 entries
          { timestamp: new Date(), price: newPrice }
        ]
      };

      setLighterPointData(updatedData);
      generateSuggestedAction(updatedData);

    } catch (error) {
      console.error("Error fetching price from contract:", error);
      await generateMockRealTimeData();
    }
  };

  // Generate mock real-time data for demonstration
  const generateMockRealTimeData = async () => {
    const basePrice = lighterPointData.currentPrice;
    const volatility = 0.08; // 8% volatility for realistic movement
    const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
    const randomChange = (Math.random() * volatility + 0.01) * trend;
    const newPrice = basePrice * (1 + randomChange);

    const priceChange = newPrice - basePrice;
    const priceChangePercent = (priceChange / basePrice) * 100;

    const mockData: LighterPointData = {
      ...lighterPointData,
      previousPrice: basePrice,
      currentPrice: newPrice,
      priceChange: priceChange,
      priceChangePercent: priceChangePercent,
      volume24h: Math.floor(Math.random() * 200000) + 100000,
      lastUpdated: new Date(),
      priceHistory: [
        ...lighterPointData.priceHistory.slice(-23),
        { timestamp: new Date(), price: newPrice }
      ]
    };

    setLighterPointData(mockData);
    generateSuggestedAction(mockData);
    console.log("mock 1");

  };

  // Strategy to generate suggested actions based on price data and market conditions
  const generateSuggestedAction = (priceData: LighterPointData) => {
    const { priceChangePercent, currentPrice, priceHistory, volume24h } = priceData;

    // Calculate technical indicators
    const isUptrend = priceChangePercent > 0;
    const isStrongMove = Math.abs(priceChangePercent) > 5;
    const isVolatile = Math.abs(priceChangePercent) > 10;
    const isHighVolume = volume24h > 150000;

    // Calculate moving average trend (if we have enough history)
    let movingAverageTrend = 'neutral';
    if (priceHistory.length >= 5) {
      const recentPrices = priceHistory.slice(-5).map(h => h.price);
      const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const olderPrices = priceHistory.slice(-10, -5).map(h => h.price);
      const avgOlder = olderPrices.length > 0 ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length : avgRecent;

      if (avgRecent > avgOlder * 1.02) movingAverageTrend = 'up';
      else if (avgRecent < avgOlder * 0.98) movingAverageTrend = 'down';
    }

    let action: SuggestedAction;

    // Decision logic based on multiple factors
    if (isVolatile && priceChangePercent < -10) {
      // High volatility drop - potential buying opportunity
      action = {
        action: 'BUY',
        confidence: 'HIGH',
        reason: 'Strong dip detected! Potential buying opportunity',
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (isVolatile && priceChangePercent > 15) {
      // High volatility spike - consider taking profits
      action = {
        action: 'SELL',
        confidence: 'MEDIUM',
        reason: 'Price spike detected! Consider taking profits',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-red-400'
      };
    } else if (isUptrend && isStrongMove && isHighVolume) {
      // Strong uptrend with high volume - hold or buy more
      action = {
        action: 'BUY',
        confidence: 'HIGH',
        reason: 'Strong uptrend with high volume! Consider buying',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (isUptrend && movingAverageTrend === 'up') {
      // Consistent uptrend - hold position
      action = {
        action: 'HOLD',
        confidence: 'HIGH',
        reason: 'Price trending up! Consider holding',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (!isUptrend && isStrongMove) {
      // Downtrend - consider farming/staking instead
      action = {
        action: 'FARM',
        confidence: 'MEDIUM',
        reason: 'Price declining. Consider farming for yield',
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-yellow-400'
      };
    } else if (Math.abs(priceChangePercent) < 2) {
      // Low volatility - staking opportunity
      action = {
        action: 'STAKE',
        confidence: 'MEDIUM',
        reason: 'Price stable. Good time for staking rewards',
        icon: <Minus className="w-3 h-3" />,
        color: 'text-blue-400'
      };
    } else {
      // Default hold strategy
      action = {
        action: 'HOLD',
        confidence: 'LOW',
        reason: 'Mixed signals. Monitor closely',
        icon: <Minus className="w-3 h-3" />,
        color: 'text-gray-400'
      };
    }

    setSuggestedAction(action);
  };

  const handleAction = () => {
    if (suggestedAction.action === "BUY" || suggestedAction.action === "SELL") {
      navigate("/trade");
    } else if (suggestedAction.action === "FARM" || suggestedAction.action === "STAKE") {
      navigate("/farm");
    }
    // You do not need anything here for "HOLD" because button will be hidden
  };

  // Mock functions for other balances
  const fetchStakedBalance = async () => {
    try {
      setStakedBalance("99.00");
    } catch (error) {
      console.error("Error fetching staked balance:", error);
    }
  };

  const fetchPointValue = async () => {
    try {
      setPointValue("156");
    } catch (error) {
      console.error("Error fetching point value:", error);
    }
  };

  // Auto-refresh price data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (authenticated) {
        fetchLighterPointPrice();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [authenticated, lighterPointData.currentPrice]);

  // Effect to fetch balances when component mounts or user changes
  useEffect(() => {
    if (authenticated && (user?.wallet?.address || address)) {
      setUsdlLoading(true);
      fetchStakedBalance();
      fetchPointValue();
      fetchLighterPointPrice();
    }
  }, [authenticated, user?.wallet?.address, address]);

  // Refresh function for manual refresh
  const handleRefreshBalances = async () => {
    setUsdlLoading(true);
    await Promise.all([
      fetchStakedBalance(),
      fetchPointValue(),
      fetchLighterPointPrice(),
      refetchBalance?.()
    ]);
  };

  // Format price change display
  const formatPriceChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    return {
      change: `${sign}$${Math.abs(change).toFixed(2)}`,
      percent: `${sign}${percent.toFixed(2)}%`,
      color: isPositive ? 'text-green-400' : 'text-red-400'
    };
  };

  const { change, percent, color } = formatPriceChange(
    lighterPointData.priceChange,
    lighterPointData.priceChangePercent
  );

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Main Balance Card */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 mb-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-thin text-golden-light">
              Hello, <span className="font-medium">User!</span>
            </h1>
            {user?.wallet?.address && (
              <p className="text-xs text-muted-foreground font-extralight mt-1">
                {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshBalances}
              className="p-2 rounded-full bg-golden-light/10 hover:bg-golden-light/20 transition-colors"
              disabled={priceLoading}
            >
              <motion.div
                animate={(priceLoading) ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: (priceLoading) ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-golden-light" />
              </motion.div>
            </button>
            <img src={logo} alt="" className="h-8 w-auto" />
          </div>
        </div>

        {/* Balance */}
        <div className="text-center mb-6">
          <p className="text-xs font-extralight text-muted-foreground mb-2">Your Total Balance</p>
          <p className="text-5xl font-bold text-golden-light mb-6">
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.span>
            ) : (
              `${parseFloat(balance).toFixed(4)} ETH`
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="bg-[#31302F] rounded-xl p-6 mb-6 grid grid-cols-3 divide-x divide-border/[#D4B679]">
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">

              ${usdcBalance}

            </p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">USDC</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">${stakedBalance}</p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Staked</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">${pointValue}</p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Point Value</p>
          </div>
        </div>

        {/* Points */}
        <div className="flex justify-between items-center px-2">
          <p className="text-sm font-thin text-muted-foreground">Your Current total lighter points are</p>
          <p className="text-2xl font-bold text-golden-light">12.5</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 mb-4 grid grid-cols-3 gap-4 divide-x divide-border/[#D4B679]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-2 group">
          <img src={deposit} alt="" className="h-8 w-8 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Deposit</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <img src={withdraw} alt="" className="h-8 w-8 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Withdraw</span>
        </button>
        <button onClick={() => navigate("/farm")} className="flex flex-col items-center gap-2 group">
          <img src={farm} alt="" className="h-8 w-8 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Farm</span>
        </button>
      </motion.div>

      {/* Refer a Friend */}
      <motion.div
        className="relative rounded-2xl px-6 py-4 mb-4 overflow-hidden cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/referrals")}
      >
        <div
          className="absolute inset-0 opacity-100"
          style={{ backgroundImage: `url(${refercardbg})`, backgroundSize: "cover" }}
        />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-end">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-golden-light">
              <ArrowRight className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-6">
            <div>
              <h3 className="text-2xl font-bold text-golden-light mb-0">
                Refer a friend
              </h3>
              <p className="text-xs font-extralight text-muted-foreground">
                Earn <span className="font-bold text-golden-light">10%</span> for each* referral
              </p>
            </div>
            <div className="inline-flex items-end gap-1 border border-dashed 
                      border-golden-light/60 rounded-lg px-1.5 py-1.5 bg-black/40">
              <img src={copy} alt="" className="h-4 w-4" />
              <span className="text-golden-light text-xs font-bold">G7215SDF</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Column Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Limited Bonus */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-muted-foreground">Limited Bonus</p>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-golden-light">
              <ArrowRight className="w-4 h-4 text-black" />
            </div>
          </div>
          <p className="text-sm text-golden-light mb-1">Stake</p>
          <p className="text-3xl font-bold text-golden-light mb-2">$100+</p>
          <p className="text-xs text-muted-foreground mb-3">
            Get <span className="text-golden-light font-bold">2</span> free points
          </p>
          <div className="flex items-center gap-1 text-golden-light">
            <img src={timer} alt="" className="h-5 w-5" />
            <span className="text-xs text-[#A07715] font-bold">00:59:36</span>
          </div>
        </motion.div>

        {/* Point Price Alert - Enhanced with Real-time Data */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Point price alert!</p>
              {priceLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-3 h-3 text-golden-light" />
                </motion.div>
              )}
            </div>
            {suggestedAction.action !== "HOLD" && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-golden-light">
                <button onClick={handleAction} className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-golden-light mb-1">
            ${lighterPointData.currentPrice.toFixed(2)}
          </p>

          <div className={`flex items-center gap-1 mb-3 ${color}`}>
            {suggestedAction.icon}
            <span className="text-xs font-bold">{percent}</span>
            <span className="text-xs">({change})</span>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">Suggested action:</p>
              <span className={`text-xs font-bold ${suggestedAction.color}`}>
                {suggestedAction.action}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{suggestedAction.reason}</p>
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
            Vol:<span className="font-bold text-[#A07715]">${(lighterPointData.volume24h / 1000).toFixed(0)}K</span>
            Updated<span className="font-bold text-[#A07715]">{lighterPointData.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-golden-light mb-4">Recent Activity:</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="font-extralight text-xs opacity-60">
              <p className="text-sm text-foreground">@user123 joined</p>
              <p className="text-xs text-muted-foreground">(2h ago)</p>
            </div>
            <span className="text-golden-light font-bold">+0.5 pt</span>
          </div>
          <div className="flex justify-between items-start">
            <div className="font-extralight text-xs opacity-60">
              <p className="text-sm text-foreground">@trader deposited</p>
              <p className="text-xs text-muted-foreground">(10h ago)</p>
            </div>
            <span className="text-golden-light font-bold">+1.0 pt</span>
          </div>
          <div className="flex justify-between items-start">
            <div className="font-extralight text-xs opacity-60">
              <p className="text-sm text-foreground">@farmer staked</p>
              <p className="text-xs text-muted-foreground">(2d ago)</p>
            </div>
            <span className="text-golden-light font-bold">+0.5 pt</span>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Dashboard;