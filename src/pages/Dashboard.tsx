import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
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

// Interface for point price data from API
interface LighterPointData {
  exchange_rate: string;
  last_updated: string;
  points_to_usdl_rate: string;
  usdl_to_points_rate: string;
}

// Interface for suggested trading actions
interface SuggestedAction {
  action: 'BUY' | 'SELL' | 'HOLD' | 'STAKE' | 'FARM';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  icon: React.ReactNode;
  color: string;
}

// Interface for user balance data from backend
interface UserBalanceData {
  id: string;
  usdl_balance: number;
  points_balance: number;
  staked_amount: number;
  total_portfolio_value: number;
  points_usd_value: number;
  wallet_address: string
}

interface PointsTransaction {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  tx_hash: string;
  type: string;
  user_id: string;
}

const Dashboard = ({ initialTime = 3600, mode = "countdown" }) => {
  const navigate = useNavigate();
  const { user, authenticated } = usePrivy();

  // Get user data from localStorage
  const storedData = localStorage.getItem(user?.id);
  const userdata = storedData ? JSON.parse(storedData) : null;
  const userId = userdata?.id;
  const referralCode = userdata?.referral_code;

  // Timer state for countdown
  const [seconds, setSeconds] = useState(initialTime);

  // Loading states
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);

  // User balance data from backend
  const [balanceData, setBalanceData] = useState<UserBalanceData>({
    id: '',
    usdl_balance: 0,
    points_balance: 0,
    staked_amount: 0,
    total_portfolio_value: 0,
    points_usd_value: 0,
    wallet_address: ''
  });

  // Point price data from API
  const [lighterPointData, setLighterPointData] = useState<LighterPointData>({
    exchange_rate: '0.00',
    last_updated: new Date().toISOString(),
    points_to_usdl_rate: '',
    usdl_to_points_rate: ''
  });

  // Suggested action based on market conditions
  const [suggestedAction, setSuggestedAction] = useState<SuggestedAction>({
    action: 'HOLD',
    confidence: 'MEDIUM',
    reason: 'Loading market data...',
    icon: <Minus className="w-3 h-3" />,
    color: 'text-gray-400'
  });

  // Helper function to format transaction type
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case 'buy_points':
        return 'Bought Points';
      case 'sell_points':
        return 'Sold Points';
      case 'stake':
        return 'Staked';
      case 'unstake':
        return 'Unstaked';
      case 'referral_reward':
        return 'Referral Reward';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  // Helper function to determine if transaction is positive or negative
  const getTransactionSign = (type: string): string => {
    if (type === 'buy_points' || type === 'referral_reward' || type === 'unstake') {
      return '+';
    }
    return '-';
  };

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev =>
        mode === "countdown" ? Math.max(prev - 1, 0) : prev + 1
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // Format time display (HH:MM:SS)
  const formatTime = (s: number): string => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const secs = String(s % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Fetch user balance data from backend
  const fetchUserBalance = async () => {
    if (!userId || !user?.id) {
      console.warn("User ID or Privy ID not found");
      return;
    }

    setBalanceLoading(true);

    try {

      const response = await axios.post("/api/get_referal_code", {
        id: userId,
        privy_id: user.id
      });


      // NEW: Handle the updated API response structure
      if (response.data && response.data.success !== false) {
        const data = response.data;

        // Update balance data state
        setBalanceData({
          id: data.id || userId,
          usdl_balance: parseFloat(data.usdl_balance) || 0,
          points_balance: parseFloat(data.points_balance) || 0,
          staked_amount: parseFloat(data.staked_amount) || 0,
          total_portfolio_value: parseFloat(data.total_portfolio_value) || 0,
          points_usd_value: parseFloat(data.points_usd_value) || 0,
          wallet_address: data.wallet_address || userdata.wallet_address
        });

        // Update localStorage with fresh data
        const updatedUserData = {
          ...userdata,
          usdl_balance: data.usdl_balance,
          points_balance: data.points_balance,
          staked_amount: data.staked_amount,
          total_portfolio_value: data.total_portfolio_value,
          points_usd_value: data.points_usd_value
        };
        localStorage.setItem(user.id, JSON.stringify(updatedUserData));


      } else {
        throw new Error(response.data?.error || "Failed to fetch balance data");
      }

    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      toast({
        title: "Balance Error",
        description: "Could not fetch balance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch point price data from API
  const fetchLighterPointPrice = async () => {
    setPriceLoading(true);

    try {
      const response = await axios.get("/api/points/price");

      if (response.data && response.data.data) {
        const priceData = {
          exchange_rate: response.data.data.exchange_rate || '0',
          last_updated: response.data.data.last_updated || new Date().toISOString(),
          points_to_usdl_rate: response.data.data.points_to_usdl_rate || '',
          usdl_to_points_rate: response.data.data.usdl_to_points_rate || '',
        };
        const buyPrice = parseFloat(response.data.data.exchange_rate);
        const sellPrice = (1 / buyPrice).toFixed(2); // optional, if you need inverse

        const updatedUserData = {
          ...userdata,          // keep existing data (id, privy_id, balances, etc.)
          buyPrice,
          sellPrice         // add or update these new fields
        };
        localStorage.setItem(user.id, JSON.stringify(updatedUserData));


        setLighterPointData(priceData);
        generateSuggestedAction(priceData);
      } else {
        throw new Error("Invalid price data response");
      }

    } catch (error) {
      console.error("❌ Error fetching point price:", error);
      toast({
        title: "Price Data Error",
        description: "Could not fetch current price data.",
        variant: "destructive",
      });
    } finally {
      setPriceLoading(false);
    }
  };

  // Generate trading suggestions based on exchange rate
  const generateSuggestedAction = (priceData: LighterPointData) => {
    const currentRate = parseFloat(priceData.exchange_rate);
    let action: SuggestedAction;

    if (currentRate > 4.0) {
      action = {
        action: 'SELL',
        confidence: 'MEDIUM',
        reason: 'High exchange rate! Good time to convert points',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (currentRate < 3.5) {
      action = {
        action: 'BUY',
        confidence: 'MEDIUM',
        reason: 'Low exchange rate! Good opportunity to acquire points',
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-green-400'
      };
    } else if (currentRate >= 3.5 && currentRate <= 4.0) {
      action = {
        action: 'FARM',
        confidence: 'HIGH',
        reason: 'Stable rate. Great time for farming rewards',
        icon: <Minus className="w-3 h-3" />,
        color: 'text-yellow-400'
      };
    } else {
      action = {
        action: 'HOLD',
        confidence: 'MEDIUM',
        reason: 'Exchange rate stable. Monitor for changes',
        icon: <Minus className="w-3 h-3" />,
        color: 'text-gray-400'
      };
    }

    setSuggestedAction(action);
  };

  // Handle suggested action button click
  const handleAction = () => {
    if (suggestedAction.action === "BUY" || suggestedAction.action === "SELL") {
      navigate("/trade");
    } else if (suggestedAction.action === "FARM" || suggestedAction.action === "STAKE") {
      navigate("/farm");
    }
  };

  // Manual refresh function
  const handleRefreshAll = async () => {
    await Promise.all([
      fetchUserBalance(),
      fetchLighterPointPrice(),
      fetchPointsHistory()
    ]);
  };

  // Format exchange rate for display
  const formatExchangeRate = (rate: string) => {
    const numRate = parseFloat(rate);
    const color = numRate > 4.0 ? 'text-green-400' : numRate < 3.5 ? 'text-red-400' : 'text-yellow-400';
    return { rate: numRate.toFixed(3), color };
  };

  // Auto-refresh price data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (authenticated) {
        fetchLighterPointPrice();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [authenticated]);

  // Initial data fetch when component mounts
  // Add this state near other states
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Update the fetchPointsHistory function
  const fetchPointsHistory = async () => {
    if (!userId) {
      console.warn("User ID not found - cannot fetch points history");
      return;
    }

    console.log("📜 Fetching points history for user:", userId);
    setHistoryLoading(true);

    try {
      const limit = 10;
      const response = await axios.get(`/api/points/history/${userId}?limit=${limit}`);

      console.log("✅ Points history fetched successfully:");
      console.log("📊 Transaction data:", response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log(`📝 Total transactions: ${response.data.data.length}`);
        setPointsHistory(response.data.data);
      }

    } catch (error) {
      console.error("❌ Error fetching points history:", error);

      if (axios.isAxiosError(error)) {
        console.error("Error details:", {
          status: error.response?.status,
          message: error.response?.data?.error || error.message
        });
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  // Updated useEffect
  useEffect(() => {
    if (authenticated && userId) {
      fetchUserBalance();
      fetchLighterPointPrice();
      fetchPointsHistory(); // 👈 Added new function call
    }
  }, [authenticated, userId]);

  // Formatted exchange rate for display
  const { rate: formattedRate, color } = formatExchangeRate(lighterPointData.exchange_rate);

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
            {userdata?.wallet_address && (
              <p className="text-xs text-muted-foreground font-extralight mt-1">
                {userdata.wallet_address.slice(0, 6)}...{userdata.wallet_address.slice(-4)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              className="p-2 rounded-full bg-golden-light/10 hover:bg-golden-light/20 transition-colors"
              disabled={balanceLoading || priceLoading}
            >
              <motion.div
                animate={(balanceLoading || priceLoading) ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: (balanceLoading || priceLoading) ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-golden-light" />
              </motion.div>
            </button>
            <img src={logo} alt="" className="h-8 w-auto" />
          </div>
        </div>

        {/* Total Balance Display */}
        <div className="text-center mb-6">
          <p className="text-xs font-extralight text-muted-foreground mb-2">Your Total Portfolio Value</p>
          <p className="text-5xl font-bold text-golden-light mb-2">
            {balanceLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.span>
            ) : (
              `$${balanceData.total_portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </p>
        </div>

        {/* Balance Breakdown Grid */}
        <div className="bg-[#31302F] rounded-xl p-6 mb-6 grid grid-cols-3 divide-x divide-border/[#D4B679]">
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">
              ${balanceLoading ? "..." : balanceData.usdl_balance.toFixed(2)}
            </p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">USDL</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">
              ${balanceLoading ? "..." : balanceData.staked_amount.toFixed(2)}
            </p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Staked</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">
              ${balanceLoading ? "..." : balanceData.points_usd_value.toFixed(2)}
            </p>
            <p className="text-xs font-extralight text-muted-foreground mt-1">Point Value</p>
          </div>
        </div>

        {/* Points Balance */}
        <div className="flex justify-between items-center px-2">
          <p className="text-sm font-thin text-muted-foreground">Your Current Lighter Points</p>
          <p className="text-2xl font-bold text-golden-light">
            {balanceLoading ? "..." : balanceData.points_balance.toFixed(1)}
          </p>
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
              <span className="text-golden-light text-xs font-bold">{referralCode || "..."}</span>
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

        {/* Exchange Rate Alert */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Exchange rate alert!</p>
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
            {priceLoading ? "..." : formattedRate}
          </p>

          <div className={`flex items-center gap-1 mb-3 ${color}`}>
            {suggestedAction.icon}
            <span className="text-xs font-bold">Exchange Rate</span>
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

          {/* Conversion Rates */}
          <div className="space-y-1 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
            {lighterPointData.points_to_usdl_rate && (
              <div className="text-[#A07715] font-bold">{lighterPointData.points_to_usdl_rate}</div>
            )}
            {lighterPointData.usdl_to_points_rate && (
              <div className="text-[#A07715] font-bold">{lighterPointData.usdl_to_points_rate}</div>
            )}
            <div className="text-right">
              <span>Updated: <span className="font-bold text-[#A07715]">
                {new Date(lighterPointData.last_updated).toLocaleTimeString()}
              </span></span>
            </div>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-golden-light">Recent Activity:</h3>
          {historyLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4 text-golden-light" />
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          {historyLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : pointsHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            pointsHistory.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-start">
                <div className="font-extralight text-xs opacity-60">
                  <p className="text-sm text-foreground">
                    {formatTransactionType(transaction.type)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(transaction.created_at)}
                  </p>
                  {transaction.tx_hash && (
                    <p className="text-xs font-bold text-muted-foreground/50 mt-1">
                      Tx: {transaction.tx_hash.slice(0, 6)}...{transaction.tx_hash.slice(-4)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-bold ${getTransactionSign(transaction.type) === '+'
                    ? 'text-green-400'
                    : 'text-red-400'
                    }`}>
                     {getTransactionSign(transaction.type)} ${transaction.amount.toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {transaction.status === 'success' ? '✓' : '⋯'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {pointsHistory.length > 5 && (
          <button
            onClick={() => navigate("/history")}
            className="w-full mt-4 text-center text-sm text-golden-light hover:text-golden-light/80 transition-colors"
          >
            View all transactions →
          </button>
        )}
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Dashboard;