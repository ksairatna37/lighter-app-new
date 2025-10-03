import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Zap, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Trade = () => {
  const [activeMode, setActiveMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const { toast } = useToast();

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
    <Container className="bg-background">
      {/* Custom Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="h-10 w-10 bg-accent-primary/20"
        >
          <span className="text-xl">←</span>
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-accent-primary">Buy/Sell</h1>
          <p className="text-sm text-accent-primary/80">with USDL</p>
        </div>
        
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Zap className="w-5 h-5 text-accent-primary fill-accent-primary" />
        </Button>
      </header>

      {/* Balance Card */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-accent-primary font-medium">Available</span>
          <span className="text-accent-primary text-xl font-bold">${usdlBalance} USDL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-accent-primary font-medium">Total Points</span>
          <span className="text-accent-primary text-xl font-bold">{pointsBalance}</span>
        </div>
      </div>

      {/* Mode Toggle Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          onClick={() => setActiveMode('buy')}
          className={`h-14 text-lg font-semibold ${
            activeMode === 'buy' 
              ? 'bg-accent-primary text-background hover:bg-accent-primary/90' 
              : 'bg-transparent border-2 border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10'
          }`}
        >
          <Zap className="w-5 h-5 mr-2" />
          BUY Points
        </Button>
        <Button
          onClick={() => setActiveMode('sell')}
          className={`h-14 text-lg font-semibold ${
            activeMode === 'sell' 
              ? 'bg-accent-primary text-background hover:bg-accent-primary/90' 
              : 'bg-transparent border-2 border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10'
          }`}
        >
          <Zap className="w-5 h-5 mr-2" />
          SELL Points
        </Button>
      </div>

      {/* Transaction Card */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <div className="font-semibold text-accent-primary text-lg">
              {activeMode === 'buy' ? 'BUY' : 'SELL'} Points
            </div>
            <div className="text-sm text-accent-primary/70">
              ${activeMode === 'buy' ? buyPrice : sellPrice}/point
            </div>
          </div>
        </div>

        {/* Spend Amount */}
        <div className="mb-4">
          <label className="text-accent-primary font-medium text-lg block mb-3">
            Spend Amount:
          </label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-14 bg-background/50 border-accent-primary/30 text-foreground text-lg pr-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  onClick={() => setAmount((parseFloat(amount || "0") + 1).toFixed(2))}
                  className="text-accent-primary hover:text-accent-primary/70"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAmount(Math.max(0, parseFloat(amount || "0") - 1).toFixed(2))}
                  className="text-accent-primary hover:text-accent-primary/70"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-accent-primary font-semibold">
                {activeMode === 'buy' ? 'USDL' : 'Points'}
              </span>
            </div>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[25, 50, 75, 100].map((percentage) => (
            <Button
              key={percentage}
              onClick={() => setPercentage(percentage)}
              className="bg-accent-primary/90 hover:bg-accent-primary text-background font-bold h-12"
            >
              {percentage === 100 ? 'MAX' : `${percentage}%`}
            </Button>
          ))}
        </div>

        <div className="text-sm text-accent-primary/70 mb-6">
          Available: {availablePoints} Points
        </div>

        {/* Transaction Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-accent-primary/70">You'll receive</span>
            <span className="text-accent-primary font-bold text-lg">
              ~{calc.receive} {calc.receiveLabel}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3">
            <span className="text-accent-primary/70">Trading fee (2%)</span>
            <span className="text-accent-primary font-bold">
              ${calc.fee} {activeMode === 'buy' ? 'USDL' : 'USDL'}
            </span>
          </div>

          <div className="border-t border-accent-primary/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-accent-primary/70">
                {activeMode === 'buy' ? 'Total cost' : 'Total sell'}
              </span>
              <span className="text-accent-primary font-bold text-lg">
                ${activeMode === 'buy' ? calc.total : calc.receive} {activeMode === 'buy' ? 'USDL' : 'USDL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleTrade}
        disabled={!amount || parseFloat(amount) <= 0 || isTrading}
        className="w-full h-14 bg-accent-primary hover:bg-accent-primary/90 text-background text-lg font-bold mb-24"
      >
        {isTrading ? (
          "Processing..."
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            {activeMode === 'buy' ? 'BUY' : 'SELL'} Now
          </>
        )}
      </Button>

      <BottomNavigation />
    </Container>
  );
};

export default Trade;