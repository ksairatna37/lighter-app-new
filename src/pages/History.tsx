import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Filter, Calendar ,FileText, Diff} from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

// Interface for point transaction data
interface PointsTransaction {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  tx_hash: string;
  type: string;
  user_id: string;
}

// Interface for transaction statistics
interface TransactionStats {
  totalBought: number;
  totalSold: number;
  totalTransactions: number;
  netChange: number;
}

const History = () => {
  const navigate = useNavigate();
  const { user, authenticated } = usePrivy();

  // Get user data from localStorage
  const storedData = localStorage.getItem(user?.id || '');
  const userdata = storedData ? JSON.parse(storedData) : null;
  const userId = userdata?.id;

  // State management
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PointsTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [stats, setStats] = useState<TransactionStats>({
    totalBought: 0,
    totalSold: 0,
    totalTransactions: 0,
    netChange: 0
  });

  // Fetch transaction history
  const fetchPointsHistory = async () => {
    if (!userId) {
      console.warn("User ID not found - cannot fetch points history");
      return;
    }

    setHistoryLoading(true);
    
    try {
      const limit = 100; // Fetch more for history page
      const response = await axios.get(`/api/points/history/${userId}?limit=${limit}`);
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        const transactions = response.data.data;
        setPointsHistory(transactions);
        setFilteredHistory(transactions);
        calculateStats(transactions);
      }
      
    } catch (error) {
      console.error("❌ Error fetching points history:", error);
      toast({
        title: "History Error",
        description: "Could not fetch transaction history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Calculate transaction statistics
  const calculateStats = (transactions: PointsTransaction[]) => {
    const bought = transactions
      .filter(tx => tx.type === 'buy_points')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const sold = transactions
      .filter(tx => tx.type === 'sell_points')
      .reduce((sum, tx) => sum + tx.amount, 0);

    setStats({
      totalBought: bought,
      totalSold: sold,
      totalTransactions: transactions.length,
      netChange: bought - sold
    });
  };

  // Filter transactions
  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);
    
    if (filter === 'all') {
      setFilteredHistory(pointsHistory);
    } else {
      const filtered = pointsHistory.filter(tx => tx.type === filter);
      setFilteredHistory(filtered);
    }
  };

  // Format transaction type
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

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { date: dateStr, time: timeStr };
  };

  // Get time ago
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

  // Get transaction sign and color
  const getTransactionDetails = (type: string) => {
    if (type === 'buy_points' || type === 'referral_reward' || type === 'unstake') {
      return { sign: '+', color: 'text-green-400', icon: <TrendingUp className="w-4 h-4" /> };
    }
    return { sign: '-', color: 'text-red-400', icon: <TrendingDown className="w-4 h-4" /> };
  };

  // Open transaction in explorer
  const openTransaction = (txHash: string) => {
    // Replace with your actual blockchain explorer URL
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  // Initial fetch
  useEffect(() => {
    if (authenticated && userId) {
      fetchPointsHistory();
    }
  }, [authenticated, userId]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'buy_points', label: 'Buys' },
    { value: 'sell_points', label: 'Sells' },
    { value: 'stake', label: 'Stakes' },
    { value: 'referral_reward', label: 'Rewards' }
  ];

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-8 h-8 text-background" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Transaction History</h1>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Total Bought */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs font-extralight text-muted-foreground">Total Bought</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            + ${stats.totalBought.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Of Points</p>
        </div>

        {/* Total Sold */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-xs font-extralight text-muted-foreground">Total Sold</p>
          </div>
          <p className="text-2xl font-bold text-red-400">
            - ${stats.totalSold.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Of Points</p>
        </div>

        {/* Net Change */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Diff className="w-4 h-4 text-golden-light" />
            <p className="text-xs font-extralight text-muted-foreground">Net Change</p>
          </div>
          <p className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.netChange >= 0 ? '+' : ''} ${stats.netChange.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Of Points</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-golden-light" />
            <p className="text-xs font-extralight text-muted-foreground">Total Txns</p>
          </div>
          <p className="text-2xl font-bold text-golden-light">
            {stats.totalTransactions}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Transactions</p>
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-golden-light" />
          <p className="text-sm font-thin text-muted-foreground">Filter by type:</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => applyFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === option.value
                  ? 'bg-golden-light text-black'
                  : 'bg-[#31302F] text-golden-light hover:bg-golden-light/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        className="space-y-3 "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {historyLoading ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RefreshCw className="w-8 h-8 text-golden-light" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-lg font-bold text-golden-light mb-2">No transactions found</p>
            <p className="text-sm text-muted-foreground">
              {selectedFilter !== 'all' 
                ? 'Try changing the filter or make your first transaction'
                : 'Make your first transaction to see it here'}
            </p>
          </div>
        ) : (
          filteredHistory.map((transaction, index) => {
            const { date, time } = formatDateTime(transaction.created_at);
            const { sign, color, icon } = getTransactionDetails(transaction.type);
            
            return (
              <motion.div
                key={transaction.id}
                className="bg-card border border-border rounded-2xl p-4 hover:border-golden-light/30 transition-colors "
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-3">
                  {/* Left Side - Transaction Info */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-[#31302F] ${color}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-golden-light mb-1">
                        {formatTransactionType(transaction.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date} • {time}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {getTimeAgo(transaction.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Amount */}
                  <div className="text-right">
                    <p className={`text-xl font-bold ${color}`}>
                      {sign}{transaction.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${
                        transaction.status === 'success' 
                          ? 'text-green-400' 
                          : transaction.status === 'pending'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {transaction.status === 'success' ? '✓ Success' : 
                         transaction.status === 'pending' ? '⋯ Pending' : 
                         '✗ Failed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Hash */}
                {transaction.tx_hash && (
                  <div className="bg-[#31302F] rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <p className="text-xs font-mono text-golden-light truncate">
                          {transaction.tx_hash}
                        </p>
                      </div>
                      <button
                        onClick={() => openTransaction(transaction.tx_hash)}
                        className="ml-3 p-2 rounded-lg bg-golden-light/10 hover:bg-golden-light/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-golden-light" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Load More Button (if needed) */}
      {filteredHistory.length >= 100 && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={fetchPointsHistory}
            className="w-full bg-card border border-border rounded-2xl p-4 text-golden-light hover:border-golden-light/30 transition-colors"
          >
            <span className="text-sm font-bold">Load More Transactions</span>
          </button>
        </motion.div>
      )}

      <BottomNavigation />
    </Container>
  );
};

export default History;
