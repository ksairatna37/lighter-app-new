import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import buy from "@/assets/buy.png";
import sell from "@/assets/sell.png";
import { useWallet, useWalletStore } from "@/hooks/useWallet";

const Trade = () => {
  const [activeMode, setActiveMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { address, logout, refetchBalance } = useWallet();

  const { balance, usdcBalance, usdValue, isLoading } = useWalletStore();

  const usdlBalance = "995.00";
  const pointsBalance = "12.5";
  const availablePoints = "15.7";
  const buyPrice = "52.30";
  const sellPrice = "48.70";
  const tradeFee = 2; // 2%

  const calculateTransaction = () => {
    const inputAmount = parseFloat(amount) || 0;

    if (activeMode === 'buy') {
      const points = inputAmount / parseFloat(buyPrice);
      const fee = inputAmount * (tradeFee / 100);
      return {
        receive: points.toFixed(2),
        fee: fee.toFixed(2),
        total: (inputAmount + fee).toFixed(2),
        receiveLabel: 'points',
        totalLabel: 'USDL'
      };
    } else {
      const usdl = inputAmount * parseFloat(sellPrice);
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

  const calc = calculateTransaction();

  const setPercentage = (percentage: number) => {
    const max = activeMode === 'buy' ? parseFloat(usdlBalance) : parseFloat(availablePoints);
    setAmount(((max * percentage) / 100).toFixed(2));
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

    setIsTrading(true);

    setTimeout(() => {
      setIsTrading(false);
      toast({
        title: `⚡ ${activeMode === 'buy' ? 'Purchase' : 'Sale'} Successful!`,
        description: `${activeMode === 'buy' ? 'Bought' : 'Sold'} successfully`,
      });
      setAmount("");
    }, 2000);
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
          <h1 className="text-xl font-bold text-golden-light">Buy/Sell</h1>
          <p className="text-sm text-golden-light/80">with USDL</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Balance Card - Matching Farm component style */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-golden-light font-extralight opacity-60">Available</span>
          <span className="text-golden-light font-bold">${usdcBalance} USDC</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-golden-light font-extralight opacity-60">Total Points</span>
          <span className="text-golden-light font-bold">{pointsBalance}</span>
        </div>
      </motion.div>

      {/* Mode Toggle Buttons */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          onClick={() => setActiveMode('buy')}
          className={`h-14 text-lg font-semibold rounded-xm ${activeMode === 'buy'
            ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white hover:opacity-90'
            : 'bg-transparent border-2 border-golden-light/10 text-white/30 hover:bg-golden-light/10'
            }`}
        >
          {activeMode === 'buy' ? <img src={buy} alt="" className="h-8 invert w-auto" /> : <img src={sell} alt="" className="h-8 invert opacity-30 w-auto" />}
          BUY Points
        </Button>
        <Button
          onClick={() => setActiveMode('sell')}
          className={`h-14 text-lg font-semibold rounded-md ${activeMode === 'sell'
            ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white hover:opacity-90'
            : 'bg-transparent border-2 border-golden-light/10 text-white/30 hover:bg-golden-light/10'
            }`}
        >
          {activeMode === 'sell' ? <img src={sell} alt="" className="h-8 invert w-auto" /> : <img src={sell} alt="" className="h-8 invert opacity-30 w-auto" />}
          SELL Points
        </Button>
      </motion.div>

      {/* Transaction Card - Matching Farm component style */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-golden-light rounded-md flex items-center justify-center">

            {activeMode === 'buy' ? <img src={buy} alt="" className="h-12 w-auto" /> : <img src={sell} alt="" className="h-12 w-auto" />}
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

        {/* Amount Input Section - Matching Farm component style */}
        <label className="text-golden-light text-lg font-semibold mb-4 block">
          {activeMode === 'buy' ? 'Spend Amount:' : 'Sell Amount:'}
        </label>

        {/* Amount Input - Matching Farm component exact styling */}
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

        {/* Percentage Buttons - Matching Farm component style */}
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
          Available: {activeMode === 'buy' ? `${usdcBalance} USDC` : `${availablePoints} Points`}
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
      </motion.div>

      {/* Action Button - Matching Farm component style */}
      <Button
        onClick={handleTrade}
        disabled={!amount || parseFloat(amount) <= 0 || isTrading}
        className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-md text-white mb-6 disabled:opacity-50"
      >
        {isTrading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2 inline-block"
            >

            </motion.div>
            Processing...
          </>
        ) : (
          <>
            {activeMode === 'buy' ? <img src={buy} alt="" className="h-8 invert w-auto" /> : <img src={sell} alt="" className="h-8 invert w-auto" />}

            {activeMode === 'buy' ? 'BUY' : 'SELL'} Now
          </>
        )}
      </Button>

      {/* Projections Card - Show transaction preview when amount is entered */}
      {amount && parseFloat(amount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Transaction Preview:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Price per point</span>
              <span className="text-foreground font-semibold">${activeMode === 'buy' ? buyPrice : sellPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">You'll receive</span>
              <span className="text-foreground font-semibold">~{calc.receive} {calc.receiveLabel}</span>
            </div>
          </div>
        </motion.div>
      )}

      <BottomNavigation />
    </Container>
  );
};

export default Trade;