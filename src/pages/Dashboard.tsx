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
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Simplified Lighter Point Data Interface
interface LighterPointData {
  current_price: string;
  buy_price: string;
  sell_price: string;
  price_change_24h: string;
  price_change_7d: string;
  volume_24h: string;
  market_cap: string;
  last_updated: string;
}

// Suggested Action Interface
interface SuggestedAction {
  action: 'BUY' | 'SELL' | 'HOLD' | 'STAKE' | 'FARM';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  icon: React.ReactNode;
  color: string;
}

const Dashboard = ({ initialTime = 3600, mode = "countdown" }) => {
  const navigate = useNavigate();
  const { user, authenticated } = usePrivy();
  const { address, logout, refetchBalance } = useWallet();
  const { balance, usdcBalance, usdValue, isLoading } = useWalletStore();

  const [usdlLoading, setUsdlLoading] = useState<boolean>(true);
  const [referralCode, setReferralCode] = useState<string>("");
  const [usersupabase, setUsersupabase] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [usdlBalance, setUsdlBalance] = useState<string>("0");
  const [pointsBalance, setPointsBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0.00");
  const [totalPoints, setTotalPoints] = useState<string>("0");

  const [seconds, setSeconds] = useState(initialTime);

  // Simplified state for Lighter Point price data
  const [lighterPointData, setLighterPointData] = useState<LighterPointData>({
    current_price: '0.00',
    buy_price: '0.00',
    sell_price: '0.00',
    price_change_24h: '+0.0%',
    price_change_7d: '+0.0%',
    volume_24h: '0.00',
    market_cap: '0.00',
    last_updated: new Date().toISOString()
  });

  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [suggestedAction, setSuggestedAction] = useState<SuggestedAction>({
    action: 'HOLD',
    confidence: 'MEDIUM',
    reason: 'Loading market data...',
    icon: <Minus className="w-3 h-3" />,
    color: 'text-gray-400'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev =>
        mode === "countdown" ? Math.max(prev - 1, 0) : prev + 1
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  const formatTime = s => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const secs = String(s % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Calculate total balance in USD (USDL + Staked + Point Value)
  const usdlUsdValue = parseFloat(usdlBalance);
  const stakedUsdValue = parseFloat(stakedBalance);
  const pointUsdValue = parseFloat(pointsBalance);
  const totalUsdValue = usdlUsdValue + stakedUsdValue + pointUsdValue;

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!address) {
        toast({
          title: "Wallet Required",
          description: "Wallet address not found.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await axios.post("/api/get_referal_code", {
          wallet_address: address,
        });

        const data = response.data;

        if (data) {
          console.log("Referral data from server:", data);
          setReferralCode(data.referral_code);
          setUsersupabase(data.id);
          setWalletAddress(data.wallet_address);
          setUsdlBalance((data.usdl_balance).toFixed(2));
          setPointsBalance((data.points_balance).toFixed(2));
          setStakedBalance((data.staked_amount).toFixed(2));
          setTotalPoints((data.total_points).toFixed(2));
          const totalbalance = (parseFloat(data.usdl_balance) + parseFloat(data.points_balance) + parseFloat(data.staked_amount)).toFixed(2);

          const localdata = {
            referral_code: data.referral_code,
            id: data.id,
            wallet_address: data.wallet_address,
            usdl_balance: ((data.usdl_balance).toFixed(2)),
            points_balance: (data.points_balance).toFixed(2),
            staked_amount: ((data.staked_amount).toFixed(2)),
            total_points: ((data.total_points).toFixed(2)),
            total_usd_balance: totalbalance
          };

          localStorage.setItem(address, JSON.stringify(localdata));
          console.log("Referral code and balances fetched and stored:", localdata);
        } else {
          toast({
            title: "Referral Not Found",
            description: "No referral code found for this wallet.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching referral code:", error);
        toast({
          title: "Server Error",
          description: "Could not fetch referral code. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchReferralCode();
  }, [address]);

  // SIMPLIFIED: Single function to fetch Lighter Point price data from your API
  const fetchLighterPointPrice = async () => {
    console.log("🚀 Fetching lighter point price from API...");
    setPriceLoading(true);

    try {
      const response = await axios.get("/api/points/price");

      console.log("✅ API Response:", response.data);

      if (response.data?.success && response.data?.data) {
        const priceData = response.data.data;

        const data = response.data.data;

        const buyPrice = Number(parseFloat(data.buy_price).toFixed(2));
        const sellPrice = Number(parseFloat(data.sell_price).toFixed(2));

        // Store as string (required by localStorage)
        localStorage.setItem("buy price", buyPrice.toString());
        localStorage.setItem("sell price", sellPrice.toString());
        setLighterPointData(priceData);
        generateSuggestedAction(priceData);
        console.log("📊 Price data updated:", priceData);
      } else {
        console.error("❌ Invalid API response structure:", response.data);
        toast({
          title: "Price Data Error",
          description: "Failed to fetch current price data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Lighter Point price:", error);
      toast({
        title: "Connection Error",
        description: "Could not fetch price data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPriceLoading(false);
    }
  };

  // UPDATED: Strategy to generate suggested actions based on your API price data
  const generateSuggestedAction = (priceData: LighterPointData) => {
    const { price_change_24h, price_change_7d, volume_24h, current_price } = priceData;

    // Parse percentage changes (remove % and + signs)
    const change24h = parseFloat(price_change_24h.replace(/[%+]/g, ''));
    const change7d = parseFloat(price_change_7d.replace(/[%+]/g, ''));
    const volume = parseFloat(volume_24h);
    const currentPrice = parseFloat(current_price);

    // Calculate indicators
    const isUptrend24h = change24h > 0;
    const isUptrend7d = change7d > 0;
    const isStrongMove24h = Math.abs(change24h) > 5;
    const isVolatile = Math.abs(change24h) > 10;
    const isHighVolume = volume > 100000;

    let action: SuggestedAction;

    // Decision logic based on your API data
    if (isVolatile && change24h < -10) {
      // High volatility drop - potential buying opportunity
      action = {
        action: 'BUY',
        confidence: 'HIGH',
        reason: 'Strong dip detected! Potential buying opportunity',
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (isVolatile && change24h > 15) {
      // High volatility spike - consider taking profits
      action = {
        action: 'SELL',
        confidence: 'MEDIUM',
        reason: 'Price spike detected! Consider taking profits',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-red-400'
      };
    } else if (isUptrend24h && isStrongMove24h && isHighVolume) {
      // Strong uptrend with high volume
      action = {
        action: 'BUY',
        confidence: 'HIGH',
        reason: 'Strong uptrend with high volume! Consider buying',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (isUptrend24h && isUptrend7d) {
      // Consistent uptrend over both periods
      action = {
        action: 'HOLD',
        confidence: 'HIGH',
        reason: 'Price trending up! Consider holding',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (!isUptrend24h && isStrongMove24h) {
      // Downtrend - consider farming/staking instead
      action = {
        action: 'FARM',
        confidence: 'MEDIUM',
        reason: 'Price declining. Consider farming for yield',
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-yellow-400'
      };
    } else if (Math.abs(change24h) < 2) {
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
  };

  // Auto-refresh price data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (authenticated) {
        fetchLighterPointPrice();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [authenticated]);

  // Effect to fetch price data when component mounts
  useEffect(() => {
    if (authenticated && address) {
      fetchLighterPointPrice();
    }
  }, [authenticated, address]);

  // Refresh function for manual refresh
  const handleRefreshBalances = async () => {
    setUsdlLoading(true);
    await Promise.all([
      fetchLighterPointPrice(),
      refetchBalance?.()
    ]);
  };

  // Format price change display from your API response
  const formatPriceChange = (changeStr: string) => {
    const isPositive = changeStr.startsWith('+');
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    return { changeStr, color };
  };

  const { changeStr: change, color } = formatPriceChange(lighterPointData.price_change_24h);

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
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
            {walletAddress && (
              <p className="text-xs text-muted-foreground font-extralight mt-1">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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
          <p className="text-5xl font-bold text-golden-light mb-2">
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.span>
            ) : (
              `$${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="bg-[#31302F] rounded-xl p-6 mb-6 grid grid-cols-3 divide-x divide-border/[#D4B679]">
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">${usdlBalance}</p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">USDL</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">${stakedBalance}</p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Staked</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">${pointsBalance}</p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Point Value</p>
          </div>
        </div>

        {/* Points */}
        <div className="flex justify-between items-center px-2">
          <p className="text-sm font-thin text-muted-foreground">Your Current total lighter points are</p>
          <p className="text-2xl font-bold text-golden-light">{totalPoints}</p>
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
        <button
          className="flex flex-col items-center gap-2 group opacity-50 cursor-not-allowed"
          disabled
        >
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
              <span className="text-golden-light text-xs font-bold">{referralCode}</span>
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
            <span className="text-xs text-[#A07715] font-bold">{formatTime(seconds)}</span>
          </div>
        </motion.div>

        {/* Point Price Alert - SIMPLIFIED using your API data */}
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
            ${parseFloat(lighterPointData.current_price).toFixed(2)}
          </p>

          <div className={`flex items-center gap-1 mb-3 ${color}`}>
            {suggestedAction.icon}
            <span className="text-xs font-bold">{change}</span>
            <span className="text-xs">({lighterPointData.price_change_7d} 7d)</span>
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
            <span>Vol: <span className="font-bold text-[#A07715]">${(parseFloat(lighterPointData.volume_24h) / 1000).toFixed(0)}K</span></span>
            <span>Updated: <span className="font-bold text-[#A07715]">{new Date(lighterPointData.last_updated).toLocaleTimeString()}</span></span>
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