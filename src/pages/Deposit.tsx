import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Copy, CheckCircle, Lock, Heart, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import moneyBag from "@/assets/money-bag.png";
import timer from "@/assets/timer.png";
import watermark from "@/assets/watermark.png";
import copy from "@/assets/Copy.png";
import refresh from "@/assets/refresh.png";
import deposit from "@/assets/deposit.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { ethers } from "ethers";

const Deposit = () => {
  const [depositAddress] = useState("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3576); // 00:59:36 in seconds
  const [currentPromo, setCurrentPromo] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, authenticated } = usePrivy();
  const { address } = useWallet(); // Get actual wallet address
  const USDC_ABI = [
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "type": "function"
    }
  ];
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/3b60e88027de49bba4bd65af373611df"); // Or Alchemy/etc.
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

  // Loading states
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  // USDC balance from backend
  const [usdcBalance, setusdcBalance] = useState(0);
  // User data from API response
  type UserData = {
    id: string;
    wallet_address: string;
    usdl_balance?: string | number;
    // add other expected fields here as needed
    [key: string]: unknown;
  };
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user balance function
// Fetch user balance function
const fetchUserBalance = async () => {
  if (!user?.id) {
    console.warn("User ID not found - cannot fetch balance");
    return;
  }

  setBalanceLoading(true);

  try {
    const response = await axios.post('/api/check_user_exist', {
      privy_id: user.id
    });


    // Handle the API response
    if (response.data && response.data.exists === 'yes') {
      const data = response.data;
      const userInfo = data.user;

      // Store user data in component state
      setUserData(userInfo);

      // Now get on-chain balance using the userInfo directly (not userData state)
      try {
        const balance = await usdc.balanceOf(userInfo.wallet_address); // Use userInfo, not userData
        const newBalance = parseFloat(balance) || 0;
        console.log(balance);
  
        setusdcBalance(newBalance);
      } catch (blockchainError) {
        console.error("❌ Error fetching on-chain balance:", blockchainError);
        // Continue with backend balance even if blockchain call fails
      }


    } else if (response.data && response.data.exists === 'no') {
      console.warn("⚠️ User does not exist in backend");
      toast({
        title: "User Not Found",
        description: "Please complete registration first.",
        variant: "destructive",
      });
    } else {
      throw new Error(response.data?.error || "Unexpected response format");
    }

  } catch (error) {
    console.error("❌ Error fetching balance:", error);

    // More specific error handling
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        toast({
          title: "User Not Found",
          description: "Please complete registration first.",
          variant: "destructive",
        });
      } else if (error.response?.status >= 500) {
        toast({
          title: "Server Error",
          description: "Backend server is temporarily unavailable.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Balance Error",
          description: error.response?.data?.error || "Could not fetch balance data.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  } finally {
    setBalanceLoading(false);
  }
};


  // Handle deposit submission
  const handleDeposit = async () => {
    if (!selectedAmount || !userData?.id) {
      toast({
        title: "Missing Information",
        description: "Please select an amount and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setDepositLoading(true);

    try {
      const response = await axios.post('/api/deposit',
        {
          id: userData.id,
          amount: selectedAmount
        },
        {
          headers: {
            'X-Privy-User-Id': user.id,
            'X-Wallet-Address': userData.wallet_address,
            'Content-Type': 'application/json'
          }
        }
      );


      if (response.data.success) {
        // Calculate points earned based on selected amount
        const pointsEarned = amounts.find(a => a.value === selectedAmount)?.points || 0;

        toast({
          title: "🎉 Deposit Successful!",
          description: `You've earned ${pointsEarned} Lighter Points!`,
          duration: 3000,
        });

        // Navigate to success page with actual response data
        navigate("/deposit/success", {
          state: {
            amount: selectedAmount,
            pointsEarned: response.data.points_earned || pointsEarned,
            pointsValue: response.data.points_value || (pointsEarned * 4.005).toFixed(2),
            newBalance: response.data.new_balance || (usdcBalance + selectedAmount),
            transactionHash: response.data.transaction_hash || `0x${Math.random().toString(16).substr(2, 8)}`,
            orderId: response.data.order_id || `ORDER_${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }
        });

        // Refresh balance after successful deposit
        setTimeout(() => {
          fetchUserBalance();
        }, 1000);

      } else {
        throw new Error(response.data.error || "Deposit failed");
      }

    } catch (error) {
      console.error("❌ Deposit error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error ||
          error.response?.data?.message ||
          "Deposit failed. Please try again.";

        toast({
          title: "Deposit Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Deposit Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setDepositLoading(false);
    }
  };

  // Load balance when component mounts
  useEffect(() => {
    if (authenticated && user?.id) {
      fetchUserBalance();
    }
  }, [authenticated, user?.id]);

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle refresh with better logging
  const handleRefresh = async () => {

    try {
      await fetchUserBalance();
      toast({
        title: "🎯 Refreshed!",
        description: "Balance updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not update balance",
        variant: "destructive",
      });
    }
  };

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Promo carousel effect
  useEffect(() => {
    const promoTimer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(promoTimer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Promo carousel data
  const promos = [
    {
      title: "Make your first\ndeposit and earn",
      subtitle: "Up to 1 lighter point",
      image: moneyBag
    },
    {
      title: "Refer friends\nand multiply",
      subtitle: "Earn 10% of their points",
      image: moneyBag
    },
    {
      title: "Farm daily\nfor bonus points",
      subtitle: "Compound your earnings",
      image: moneyBag
    }
  ];

  // Amount options with points
  const amounts = [
    { value: 100, points: 24.9 },
    { value: 250, points: 62.3 },
    { value: 500, points: 124.7 },
    { value: 1000, points: 249.4 },
  ];

  // Auto scroll to bottom when amount is selected
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    
    // Smooth scroll to bottom after a short delay to ensure state is updated
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  // Copy deposit address to clipboard
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast({
        title: "🎯 Address Copied!",
        description: "Deposit address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy address",
        variant: "destructive",
      });
    }
  };

  // Copy wallet address to clipboard
  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(userData?.wallet_address || address || '');
      toast({
        title: "🎯 Wallet Copied!",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy wallet address",
        variant: "destructive",
      });
    }
  };

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
      {/* Header - Matching Farm component style */}
      <header className="flex items-center justify-between py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-8 h-8 text-background" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Quick Start</h1>
          <p className="text-sm text-golden-light/80">deposit & earn</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Promo Card - Updated with golden theme and carousel */}
      <motion.div
        className="bg-gradient-to-r from-[#7D5A02] to-[#A07715] rounded-2xl p-6 mb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10">
          <motion.div
            key={currentPromo}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {promos[currentPromo].title.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < promos[currentPromo].title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-white/90 font-medium mb-4">{promos[currentPromo].subtitle}</p>
          </motion.div>

          {/* Carousel dots */}
          <div className="flex gap-1 mb-4">
            {promos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentPromo ? 'bg-white' : 'bg-white/30'
                  }`}
              ></div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white">
            <img
              src={timer}
              alt=""
              className="h-5 w-5"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <motion.img
          key={`image-${currentPromo}`}
          src={promos[currentPromo].image}
          alt="Promo"
          className="absolute right-4 top-1/4 -translate-y-1/2 w-32 h-32 object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.div>

      {/* Wallet Balance Card - Matching card style */}
      <motion.div
        className="border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          backgroundImage: `url(${watermark})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <p className="text-golden-light text-md font-bold mb-2">Wallet Balance:</p>
        <div className="flex items-end gap-3 mb-4">
          <p className="text-4xl font-bold text-golden-light">
            {balanceLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.span>
            ) : (
              `$${usdcBalance.toFixed(2)} USDC`
            )}
          </p>
          <button
            onClick={handleRefresh}
            disabled={balanceLoading}
            className="text-golden-light hover:opacity-80 mb-1 mr-6 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mt-10">
          <span className="text-sm font-extralight">
            {userData?.wallet_address && formatAddress(userData.wallet_address)}
          </span>
          <button className="text-golden-light" onClick={handleCopyWallet}>
            <img src={copy} alt="" className="h-4 w-auto" />
          </button>
        </div>
      </motion.div>

      {/* Choose Amount - Matching card style */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-golden-light text-lg font-semibold">Choose Amount:</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-golden-light/20 text-golden-light hover:bg-golden-light/30"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {amounts.map((amount) => (
            <button
              key={amount.value}
              onClick={() => handleAmountSelect(amount.value)}
              className={`bg-[#D4B679]/90 hover:bg-[#D4B679] rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 ${selectedAmount === amount.value ? 'ring-2 ring-golden-light scale-105' : ''
                }`}
            >
              <span className="text-xl font-bold text-background">${amount.value}</span>
              <span className="text-xs text-background/70 mt-1">(~{amount.points}pt)</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Trust Badges - Matching card style */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-golden-light" />
            </div>
            <span className="text-xs text-golden-light font-extralight opacity-60">Instant Point Credit</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-golden-light" />
            </div>
            <span className="text-xs text-golden-light font-extralight opacity-60">Secured by Privy</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-golden-light" />
            </div>
            <span className="text-xs text-golden-light font-extralight opacity-60">2,847 farmers trust us</span>
          </div>
        </div>
      </motion.div>

      {/* Address Section - Matching card style */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-golden-light text-lg font-semibold mb-4">Deposit Address:</h3>
        <p className="text-center text-golden-light font-extralight opacity-60 text-sm mb-4">
          Send only USDC to this address
        </p>
        <div
          className="border-2 border-dashed border-golden-light/30 rounded-xl p-4 cursor-pointer hover:border-golden-light/50 transition-colors"
          onClick={handleCopyAddress}
        >
          <div className="flex items-center justify-center gap-3">
            <Copy className="w-5 h-5 text-golden-light" />
            <span className="text-golden-light font-mono text-xs break-all">
              {depositAddress}
            </span>
          </div>
        </div>
        <p className="text-sm text-golden-light font-extralight opacity-60 text-center mt-3">
          Tap to copy address
        </p>
      </motion.div>

      {/* Deposit Button - Updated to call handleDeposit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Button
          onClick={handleDeposit}
          className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-md text-white disabled:opacity-50"
          disabled={!selectedAmount || depositLoading}
        >
          {depositLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
            />
          ) : (
            <img src={deposit} alt="" className="h-6 mt-0.5 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          )}
          {depositLoading ? "Processing..." : `Deposit $${selectedAmount || 0}`}
        </Button>
      </motion.div>

      {/* Waiting Status - Show only when amount selected but not loading */}
      {selectedAmount && !depositLoading && (
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4 text-center">Ready to deposit</h3>
          <p className="text-center text-golden-light font-extralight opacity-60 mb-4">
            Click the deposit button to earn ${selectedAmount} worth of USDC and get {amounts.find(a => a.value === selectedAmount)?.points || 0} points
          </p>
          <div className="text-center">
            <p className="text-sm text-foreground">
              You'll earn <span className="font-semibold text-golden-light">
                {amounts.find(a => a.value === selectedAmount)?.points || 0} points
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Need Help - Matching golden theme */}
      <div className="text-center mb-6">
        <button className="text-golden-light hover:text-golden-light/80 font-medium transition-colors">
          Need help?
        </button>
      </div>

      <BottomNavigation />
    </Container>
  );
};

export default Deposit;
