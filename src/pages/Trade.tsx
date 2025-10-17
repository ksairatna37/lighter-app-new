import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import buy from "@/assets/buy.png";
import sell from "@/assets/sell.png";
import { useWallet, useWalletStore } from "@/hooks/useWallet";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import BuySuccessModal from './BuySuccessModal';
import SellSuccessModal from './SellSuccessModal';
import apiClient from "@/lib/apiClient";

// Types for the trading responses
interface BuySuccessData {
  transaction_id: string;
  tx_hash: string;
  usdl_spent: string;
  points_received: string;
  exchange_rate: string;
  price_impact: string;
  new_usdl_balance: string;
  new_points_balance: string;
  timestamp: string;
}

interface SellSuccessData {
  transaction_id: string;
  tx_hash: string;
  points_sold: string;
  usdl_received: string;
  exchange_rate: string;
  price_impact: string;
  new_points_balance: string;
  new_usdl_balance: string;
  timestamp: string;
}

const Trade = () => {
  const [activeMode, setActiveMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState("");
  const [isTrading, setIsTrading] = useState(false);

  // Modal states
  const [showBuySuccessModal, setShowBuySuccessModal] = useState(false);
  const [showSellSuccessModal, setShowSellSuccessModal] = useState(false);
  const [buySuccessData, setBuySuccessData] = useState<BuySuccessData | null>(null);
  const [sellSuccessData, setSellSuccessData] = useState<SellSuccessData | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const { user, authenticated, getAccessToken } = usePrivy();
  const { balance, usdValue, isLoading } = useWalletStore();

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [usersupabase, setUsersupabase] = useState("");
  const [expected_points, setexpected_points] = useState("");
  const [expected_usdl, setexpected_usdl] = useState("");
  
  const stored = localStorage.getItem(user?.id);
  const localdata = stored ? JSON.parse(stored) : null;

  const buyPrice = localdata?.buyPrice;
  const sellPrice = localdata?.sellPrice;
  const address = localdata?.wallet_address;
  const tradeFee = 0; // 0%

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (stored) {
        const referralData = JSON.parse(stored);
        setUsersupabase(referralData.id);
        setUsdcBalance(referralData.usdl_balance || 0);
        setPointsBalance(referralData.points_balance || 0);
      }
    };

    fetchReferralCode();
  }, [address, user?.id]);

  // Switch mode and clear amount
  const switchMode = (newMode: 'buy' | 'sell') => {
    setActiveMode(newMode);
    setAmount("");
  };

  const calculateTransaction = () => {
    const inputAmount = parseFloat(amount) || 0;
    if (activeMode === 'buy') {
      const points = inputAmount / buyPrice;
      const fee = inputAmount * (tradeFee / 100);
      return {
        receive: points.toFixed(2),
        fee: fee.toFixed(2),
        total: (inputAmount + fee).toFixed(2),
        receiveLabel: 'points',
        totalLabel: 'USDL'
      };
    } else {
      const usdl = inputAmount * sellPrice;
      const fee = usdl * (tradeFee / 100);
      return {
        receive: (usdl - fee).toFixed(2),
        fee: fee.toFixed(2),
        total: inputAmount.toFixed(2),
        receiveLabel: 'USDL',
        totalLabel: 'points'
      };
    }
  };

  // Update expected_points only when needed
  useEffect(() => {
    if (activeMode === 'buy') {
      const inputAmount = parseFloat(amount) || 0;
      const points = inputAmount / buyPrice;
      setexpected_points(points > 0 ? points.toFixed(2) : "");
    } else if (activeMode === 'sell') {
      const inputAmount = parseFloat(amount) || 0;
      const usdl = inputAmount * sellPrice;
      const fee = usdl * (tradeFee / 100);
      setexpected_usdl(usdl > 0 ? (usdl - fee).toFixed(2) : "");
    } else {
      setexpected_points("");
    }
  }, [amount, activeMode, buyPrice, sellPrice]);

  const calc = calculateTransaction();

  const setPercentage = (percentage: number) => {
    const max = activeMode === 'buy' ? usdcBalance : pointsBalance;
    setAmount(((max * percentage) / 100).toFixed(2));
  };

  const handleBuy = async () => {
    if (!authenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Privy first",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!usersupabase) {
      toast({
        title: "User Data Missing",
        description: "Please complete registration first",
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);

    try {
      const requestData = {
        wallet_address: address,
        usdl_amount: amount,
        expected_points: expected_points,
      };

      const headers = {
        'X-Privy-User-Id': usersupabase,
        'X-Wallet-Address': address,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await apiClient.post('/api/points/buy', requestData, { headers });

      if (response.status === 200 && response.data?.success) {
        setBuySuccessData(response.data.data);
        setShowBuySuccessModal(true);
        setAmount("");

        if (window.Audio) {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApFn+DyvmMcBS2FzvLZiDYIG2m+7+WiTAwO');
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch (e) { /* empty */ }
        }
      } else {
        toast({
          title: 'Buy failed',
          description: response.data?.error?.message || response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Buy error details:', error);
      let errorMessage = 'Network or server error';
      let errorTitle = 'Buy Error';

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 400) {
          errorTitle = 'Invalid Request';
          errorMessage = data?.detail?.error?.message || data?.error?.message || data?.error || data?.message || 'Please check your input and try again';
        } else if (status === 401) {
          errorTitle = 'Authentication Failed';
          errorMessage = data?.error?.message || 'Wallet authentication failed. Please reconnect your wallet and try again.';
        } else if (status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Server is temporarily unavailable. Please try again later';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleSell = async () => {
    if (!authenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Privy first",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!usersupabase) {
      toast({
        title: "User Data Missing",
        description: "Please complete registration first",
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);

    try {
      const requestData = {
        wallet_address: address,
        points_amount: amount,
        expected_usdl: expected_usdl,
      };

      const headers = {
        'X-Privy-User-Id': usersupabase,
        'X-Wallet-Address': address,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await apiClient.post('/api/points/sell', requestData, { headers });

      if (response.status === 200 && response.data?.success) {
        setSellSuccessData(response.data.data);
        setShowSellSuccessModal(true);
        setAmount("");

        if (window.Audio) {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApFn+DyvmMcBS2FzvLZiDYIG2m+7+WiTAwO');
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch (e) { /* empty */ }
        }
      } else {
        toast({
          title: 'Sell failed',
          description: response.data?.error?.message || response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Sell error details:', error);
      let errorMessage = 'Network or server error';
      let errorTitle = 'Sell Error';

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 400) {
          errorTitle = 'Invalid Request';
          errorMessage = data?.detail?.error?.message || data?.error?.message || data?.error || data?.message || 'Please check your input and try again';
        } else if (status === 401) {
          errorTitle = 'Authentication Failed';
          errorMessage = data?.error?.message || 'Wallet authentication failed. Please reconnect your wallet and try again.';
        } else if (status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Server is temporarily unavailable. Please try again later';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (activeMode === "buy") {
      await handleBuy();
    } else if (activeMode === "sell") {
      await handleSell();
    }
  };

  // Modal handlers
  const handleCloseBuySuccessModal = () => {
    setShowBuySuccessModal(false);
    setBuySuccessData(null);
  };

  const handleCloseSellSuccessModal = () => {
    setShowSellSuccessModal(false);
    setSellSuccessData(null);
  };

  const handleBuyAgain = () => {
    setShowBuySuccessModal(false);
    setBuySuccessData(null);
    setActiveMode('buy');
    setTimeout(() => {
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const handleSellAgain = () => {
    setShowSellSuccessModal(false);
    setSellSuccessData(null);
    setActiveMode('sell');
    setTimeout(() => {
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  return (
    <>
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
            <h1 className="text-xl font-bold text-golden-light">Buy/Sell</h1>
            <p className="text-sm text-golden-light/80">with USDL</p>
          </div>

          <img src={logo} alt="" className="h-8 w-auto" />
        </header>

   

        {/* Mode Toggle Tabs - Enhanced UX */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-2 mb-4 relative z-10 grid grid-cols-2 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => switchMode('buy')}
            className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeMode === 'buy'
                ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white'
                : 'bg-transparent text-golden-light/60 hover:text-golden-light'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <img 
                src={buy} 
                alt="" 
                className={`h-5 w-auto ${activeMode === 'buy' ? 'invert' : 'invert opacity-60'}`}
              />
              Buy Points
            </div>
          </button>
          <button
            onClick={() => switchMode('sell')}
            className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeMode === 'sell'
                ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white'
                : 'bg-transparent text-golden-light/60 hover:text-golden-light'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <img 
                src={sell} 
                alt="" 
                className={`h-5 w-auto ${activeMode === 'sell' ? 'invert' : 'invert opacity-60'}`}
              />
              Sell Points
            </div>
          </button>
        </motion.div>

             {/* Balance Card */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-golden-light font-extralight opacity-60">Available</span>
            <span className="text-golden-light font-bold">{usdcBalance.toFixed(2)} USDL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-golden-light font-extralight opacity-60">Total Points</span>
            <span className="text-golden-light font-bold">{pointsBalance.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Animated Content Based on Mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, x: activeMode === 'buy' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeMode === 'buy' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Transaction Card */}
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-golden-light rounded-md flex items-center justify-center">
                  {activeMode === 'buy' ? (
                    <img src={buy} alt="" className="h-12 w-auto" />
                  ) : (
                    <img src={sell} alt="" className="h-12 w-auto" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-golden-light text-lg">
                    {activeMode === 'buy' ? 'BUY' : 'SELL'} Points
                  </div>
                  <div className="text-sm text-golden-light font-extralight opacity-60">
                    ${activeMode === 'buy' ? buyPrice : sellPrice}/point
                  </div>
                </div>
              </div>

              {/* Amount Input Section */}
              <label className="text-golden-light text-lg font-semibold mb-4 block">
                {activeMode === 'buy' ? 'Buy Amount:' : 'Sell Amount:'}
              </label>

              {/* Amount Input */}
              <div className="border-2 text-golden-light rounded-sm px-4 py-2 mb-4 flex items-center justify-between">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none text-golden-light text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => setAmount((parseFloat(amount || "0") + 1).toFixed(2))}
                      className="text-golden-light hover:text-golden-light/70"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAmount(Math.max(0, parseFloat(amount || "0") - 1).toFixed(2))}
                      className="text-golden-light hover:text-golden-light/70"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-golden-light text-md font-semibold ml-2">
                    {activeMode === 'buy' ? 'USDL' : 'Points'}
                  </span>
                </div>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <Button
                  onClick={() => setPercentage(25)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  25%
                </Button>
                <Button
                  onClick={() => setPercentage(50)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  50%
                </Button>
                <Button
                  onClick={() => setPercentage(75)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  75%
                </Button>
                <Button
                  onClick={() => setPercentage(100)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  MAX
                </Button>
              </div>

              <div className="text-sm text-golden-light font-extralight opacity-60 mb-6">
                Available: {activeMode === 'buy' ? `${usdcBalance.toFixed(2)} USDL` : `${pointsBalance.toFixed(2)} Points`}
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-golden-light font-extralight opacity-60">You'll receive</span>
                  <span className="text-foreground font-semibold">
                    ~{calc.receive} {calc.receiveLabel}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3">
                  <span className="text-golden-light font-extralight opacity-60">Trading fee</span>
                  <span className="text-foreground font-semibold">
                    ${calc.fee} USDL
                  </span>
                </div>

                <div className="border-t border-golden-light/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-golden-light font-extralight opacity-60">
                      {activeMode === 'buy' ? 'Total cost' : "You'll receive"}
                    </span>
                    <span className="text-foreground font-semibold">
                      ${activeMode === 'buy' ? calc.total : calc.receive} USDL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleTrade}
              disabled={!amount || parseFloat(amount) <= 0 || isTrading || !authenticated || !address || !usersupabase}
              className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl mb-6 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isTrading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  {activeMode === 'buy' ? (
                    <img src={buy} alt="" className="h-5 invert w-auto" />
                  ) : (
                    <img src={sell} alt="" className="h-5 invert w-auto" />
                  )}
                  {activeMode === 'buy' ? 'BUY' : 'SELL'} Now
                </>
              )}
            </Button>

            {/* Transaction Preview */}
            {amount && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10"
              >
                <h3 className="text-golden-light text-lg font-semibold mb-4">Transaction Preview:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-golden-light font-extralight opacity-60">Price per point</span>
                    <span className="text-foreground font-semibold">${activeMode === 'buy' ? buyPrice : sellPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-golden-light font-extralight opacity-60">
                      {activeMode === 'buy' ? 'Points to receive' : 'USDL to receive'}
                    </span>
                    <span className={`font-semibold ${activeMode === 'buy' ? 'text-green-400' : 'text-green-400'}`}>
                      ~{calc.receive} {calc.receiveLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-golden-light font-extralight opacity-60">Total amount</span>
                    <span className="text-foreground font-semibold">
                      {activeMode === 'buy' ? `${amount} USDL` : `${amount} Points`}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <BottomNavigation />
      </Container>

      {/* Success Modals */}
      <BuySuccessModal
        isOpen={showBuySuccessModal}
        onClose={handleCloseBuySuccessModal}
        data={buySuccessData}
        onBuyAgain={handleBuyAgain}
      />

      <SellSuccessModal
        isOpen={showSellSuccessModal}
        onClose={handleCloseSellSuccessModal}
        data={sellSuccessData}
        onSellAgain={handleSellAgain}
      />
    </>
  );
};

export default Trade;
