import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, Minus, Sparkles, Clock } from "lucide-react";
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
import apiClient from "@/lib/apiClient";

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

// Add this interface for general transactions
interface GeneralTransaction {
  id: string;
  user_id: string;
  type: string; // "deposit", "withdraw", "stake", "unstake", etc.
  tx_hash: string;
  status: string;
  amount: number;
  created_at: string;
}

// Your existing interface
interface PointsTransaction {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  tx_hash: string;
  type: string; // "buy_points", "sell_points", etc.
  user_id: string;
}

// Unified interface for display
interface UnifiedTransaction {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  tx_hash: string;
  type: string;
  user_id: string;
  source: 'points' | 'general';
  uniqueId?: string; // ✅ Add optional unique ID for React keys
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
      // Points transactions
      case 'buy_points':
        return 'Bought Points';
      case 'sell_points':
        return 'Sold Points';

      // General transactions
      case 'deposit':
        return 'Deposited';
      case 'withdraw':
        return 'Withdrawn';
      case 'stake':
        return 'Staked';
      case 'unstake':
        return 'Unstaked';
      case 'completed':
        return 'Completed';
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
    // Positive transactions (user receives)
    const positiveTypes = [
      'buy_points',
      'referral_reward',
      'unstake',
      'withdraw',
      'completed'
    ];

    // Negative transactions (user sends/spends)
    const negativeTypes = [
      'sell_points',
      'stake',
      'deposit'
    ];

    if (positiveTypes.includes(type)) {
      return '+';
    } else if (negativeTypes.includes(type)) {
      return '-';
    }

    return '';
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

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [isActiveBonus, setIsActiveBonus] = useState(true); // true = active bonus, false = waiting period
  // ... (keep all your other state variables)

  useEffect(() => {
    const ACTIVE_BONUS_DURATION = 3600; // 1 hour active bonus
    const WAITING_PERIOD_DURATION = 21600; // 6 hours waiting (21600 seconds)
    const TIMER_KEY = 'limited_bonus_timer_end';
    const TIMER_STATE_KEY = 'limited_bonus_is_active';

    // Get or create timer end time
    const storedEndTime = localStorage.getItem(TIMER_KEY);
    const storedIsActive = localStorage.getItem(TIMER_STATE_KEY);

    if (storedEndTime && storedIsActive !== null) {
      const endTime = parseInt(storedEndTime);
      const isActive = storedIsActive === 'true';
      setTimerEndTime(endTime);
      setIsActiveBonus(isActive);
    } else {
      // First time - start with active bonus
      const endTime = Date.now() + (ACTIVE_BONUS_DURATION * 1000);
      localStorage.setItem(TIMER_KEY, endTime.toString());
      localStorage.setItem(TIMER_STATE_KEY, 'true');
      setTimerEndTime(endTime);
      setIsActiveBonus(true);
    }
  }, []);

  // ✅ Update countdown every second with state transitions
  useEffect(() => {
    if (!timerEndTime) return;

    const ACTIVE_BONUS_DURATION = 3600; // 1 hour
    const WAITING_PERIOD_DURATION = 14400; // 4 hours

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((timerEndTime - now) / 1000));
      setTimeRemaining(remaining);

      // Timer expired - switch state
      if (remaining === 0) {
        if (isActiveBonus) {
          // Active bonus ended → Start waiting period
          const newEndTime = Date.now() + (WAITING_PERIOD_DURATION * 1000);
          localStorage.setItem('limited_bonus_timer_end', newEndTime.toString());
          localStorage.setItem('limited_bonus_is_active', 'false');
          setTimerEndTime(newEndTime);
          setIsActiveBonus(false);

          // Optional: Show toast notification
          toast({
            title: "⏰ Bonus Ended",
            description: "Next limited bonus starts in 6 hours!",
            variant: "default",
          });
        } else {
          // Waiting period ended → Start new active bonus
          const newEndTime = Date.now() + (ACTIVE_BONUS_DURATION * 1000);
          localStorage.setItem('limited_bonus_timer_end', newEndTime.toString());
          localStorage.setItem('limited_bonus_is_active', 'true');
          setTimerEndTime(newEndTime);
          setIsActiveBonus(true);

          // Optional: Show toast notification
          toast({
            title: "🎉 New Bonus Active!",
            description: "Limited bonus is now available for 1 hour!",
            variant: "default",
          });
        }
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timerEndTime, isActiveBonus]);

  // Format time display (HH:MM:SS or HH:MM for long durations)
  const formatTime = (s: number): string => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    // If more than 1 hour, show HH:MM format
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }

    // Less than 1 hour, show MM:SS format
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Check if timer is in last 10 minutes (for FOMO effect during active bonus)
  const isTimerCritical = isActiveBonus && timeRemaining > 0 && timeRemaining <= 600; // 10 minutes

  // Check if waiting period is ending soon (last 30 minutes)
  const isWaitingEndingSoon = !isActiveBonus && timeRemaining > 0 && timeRemaining <= 1800; // 30 minutes


  // Fetch user balance data from backend
  const fetchUserBalance = async () => {
    if (!userId || !user?.id) {
      console.warn("User ID or Privy ID not found");
      return;
    }

    setBalanceLoading(true);

    try {

      const response = await apiClient.post("/api/get_referal_code", {
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
      const response = await apiClient.get("/api/points/price");

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
      fetchAllTransactionHistory()
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

  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [generalTransactions, setGeneralTransactions] = useState<GeneralTransaction[]>([]);
  const [unifiedHistory, setUnifiedHistory] = useState<UnifiedTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);


  // Update the fetchPointsHistory function
  const fetchAllTransactionHistory = async () => {
    if (!userId) {
      console.warn("User ID not found - cannot fetch transaction history");
      return;
    }

    setHistoryLoading(true);

    try {
      const limit = 100;

      const [pointsResponse, transactionsResponse] = await Promise.all([
        apiClient.get(`/api/points/history/${userId}?limit=${limit}`),
        apiClient.get(`/api/transactions/${userId}?limit=${limit}`)
      ]);



      const pointsData: UnifiedTransaction[] = (pointsResponse.data?.data || []).map((tx: PointsTransaction) => ({
        ...tx,
        source: 'points' as const
      }));

      const transactionsData: UnifiedTransaction[] = (transactionsResponse.data?.data || []).map((tx: GeneralTransaction) => ({
        ...tx,
        source: 'general' as const
      }));

      // ✅ Deduplicate based on tx_hash (keep the first occurrence)
      const seenHashes = new Set<string>();
      const combined = [...pointsData, ...transactionsData].filter(tx => {
        if (seenHashes.has(tx.tx_hash)) {
          return false; // Skip duplicate
        }
        seenHashes.add(tx.tx_hash);
        return true;
      });

      // Sort by date (newest first)
      combined.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // ✅ Add unique IDs for React keys
      const withUniqueIds = combined.map((tx, index) => ({
        ...tx,
        uniqueId: `${tx.source}-${tx.id}-${index}` // Create unique ID for React key
      }));

      setPointsHistory(pointsResponse.data?.data || []);
      setGeneralTransactions(transactionsResponse.data?.data || []);
      setUnifiedHistory(withUniqueIds);


    } catch (error) {
      console.error("❌ Error fetching transaction history:", error);

    } finally {
      setHistoryLoading(false);
    }
  };



  // Updated useEffect
  useEffect(() => {
    if (authenticated && userId) {
      fetchUserBalance();
      fetchLighterPointPrice();
      fetchAllTransactionHistory(); // ✅ Call the unified function
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
        {/* Limited Bonus - Updated */}

        <motion.div
          className={`bg-card border rounded-2xl p-4 transition-all ${isActiveBonus
              ? 'border-golden-light/50 cursor-pointer hover:border-golden-light'
              : 'border-border opacity-75'
            }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => isActiveBonus && navigate("/farm")}
        >
          <div className="flex justify-between items-center mb-3">
            <p className={`text-xs ${isActiveBonus ? 'text-golden-light' : 'text-muted-foreground'}`}>
              {isActiveBonus ? '🔥 Limited Bonus' : '⏰ Next Bonus'}
            </p>
            {isActiveBonus && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-golden-light">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            )}
          </div>

          {/* Active Bonus Display */}
          {isActiveBonus ? (
            <>
              <p className="text-sm text-golden-light mb-1">Stake</p>
              <p className="text-3xl font-bold text-golden-light mb-2">$100+</p>
              <p className="text-xs text-muted-foreground mb-3">
                Get <span className="text-golden-light font-bold">2</span> free points
              </p>

              {/* Active Timer */}
              <div className="flex items-center gap-1">
                <img src={timer} alt="" className="h-5 w-5" />
                <motion.span
                  className={`text-xs font-bold ${isTimerCritical ? 'text-red-400' : 'text-[#A07715]'
                    }`}
                  animate={isTimerCritical ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {formatTime(timeRemaining)}
                </motion.span>
              </div>

              {/* FOMO Message when critical */}
              {isTimerCritical && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 font-bold mt-2 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Last {Math.floor(timeRemaining / 60)} min! Don't miss out!
                </motion.p>
              )}
            </>
          ) : (
            /* Waiting Period Display */
            <>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-8 h-8 text-golden-light/60" />
                <div>
                  <p className="text-sm text-golden-light/80 font-bold">Coming Soon</p>
                  <p className="text-xs text-muted-foreground">Stay tuned!</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                New <span className="text-golden-light font-bold">limited bonus</span> starting in:
              </p>

              {/* Waiting Timer */}
              <div className="flex items-center gap-1 mb-2">
                <img src={timer} alt="" className="h-5 w-5 opacity-60" />
                <motion.span
                  className={`text-sm font-bold ${isWaitingEndingSoon ? 'text-yellow-400' : 'text-golden-light/60'
                    }`}
                  animate={isWaitingEndingSoon ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {formatTime(timeRemaining)}
                </motion.span>
              </div>

              {/* Encouraging messages */}
              {isWaitingEndingSoon ? (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-yellow-400 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Almost ready! Prepare to stake!
                </motion.p>
              ) : timeRemaining > 18000 ? ( // More than 5 hours
                <p className="text-xs text-muted-foreground/80">
                  💡 Set a reminder to not miss it!
                </p>
              ) : (
                <p className="text-xs text-golden-light/60">
                  🔔 Get ready for the next bonus!
                </p>
              )}
            </>
          )}
        </motion.div>
        {/* Exchange Rate Alert */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-golden-light/30 transition-all"
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
          ) : unifiedHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            unifiedHistory.slice(0, 5).map((transaction) => (
              <div key={transaction.uniqueId || `${transaction.source}-${transaction.id}`} className="flex justify-between items-start">
                <div className="font-extralight text-xs opacity-60">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">
                      {formatTransactionType(transaction.type)}
                    </p>
                    {/* Optional: Badge to show source */}
                    <span className={`text-xs px-2 py-0.5 rounded ${transaction.source === 'points'
                      ? 'bg-golden-light/20 text-golden-light'
                      : 'bg-blue-500/20 text-blue-400'
                      }`}>
                      {transaction.source === 'points' ? 'Points' : 'Wallet'}
                    </span>
                  </div>
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
                    : 'text-[#A07715]'
                    }`}>
                    {getTransactionSign(transaction.type)} ${transaction.amount.toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {transaction.status === 'success' || transaction.status === 'completed' ? '✓' : '⋯'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {unifiedHistory.length > 5 && (
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