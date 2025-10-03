import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, RefreshCw, Copy, CheckCircle, Lock, Heart, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import moneyBag from "@/assets/money-bag.png";

const Deposit = () => {
  const [depositAddress] = useState("0x742d35Cc6bF4532A003C46F8");
  const [walletAddress] = useState("0x3e7...054f");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3576); // 00:59:36 in seconds
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const amounts = [
    { value: 100, points: 0.5 },
    { value: 125, points: 0.7 },
    { value: 150, points: 1 },
    { value: 200, points: 1.3 },
  ];

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast({
        title: "Address Copied!",
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

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-golden-light rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-background" />
        </button>
        <h1 className="text-xl font-medium text-golden-light">Quick Start</h1>
        <Zap className="w-8 h-8 text-golden-light" />
      </div>

      {/* Promo Card */}
      <motion.div 
        className="bg-golden-light rounded-3xl p-6 mb-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-background mb-2">
            Make your first<br />deposit and earn
          </h2>
          <p className="text-background font-medium mb-4">Upto 1 lighter point</p>
          
          {/* Carousel dots */}
          <div className="flex gap-1 mb-4">
            <div className="w-2 h-2 bg-background rounded-full"></div>
            <div className="w-2 h-2 bg-background/30 rounded-full"></div>
            <div className="w-2 h-2 bg-background/30 rounded-full"></div>
          </div>

          <div className="flex items-center gap-2 text-background">
            <Clock className="w-5 h-5" />
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <img 
          src={moneyBag} 
          alt="Money Bag" 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 object-contain"
        />
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-golden-light text-sm mb-2">Wallet Balance:</p>
        <div className="flex items-center gap-3 mb-4">
          <p className="text-4xl font-bold text-golden-light">$1,245.50</p>
          <button className="text-golden-light hover:opacity-80">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{walletAddress}</span>
          <button className="text-golden-light">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Choose Amount */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-golden-light font-medium">Choose Amount:</h3>
          <button className="w-6 h-6 rounded-full bg-golden-light/20 flex items-center justify-center">
            <Info className="w-4 h-4 text-golden-light" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {amounts.map((amount) => (
            <button
              key={amount.value}
              onClick={() => setSelectedAmount(amount.value)}
              className={`bg-golden-light rounded-2xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-105 ${
                selectedAmount === amount.value ? 'ring-2 ring-golden-dark' : ''
              }`}
            >
              <span className="text-xl font-bold text-background">${amount.value}</span>
              <span className="text-xs text-background/70 mt-1">(~{amount.points}pt)</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-4 mb-4 grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <CheckCircle className="w-5 h-5 text-golden-light" />
          <span className="text-xs text-muted-foreground">Instant Point Credit</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Lock className="w-5 h-5 text-golden-light" />
          <span className="text-xs text-muted-foreground">Secured by Privy</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Heart className="w-5 h-5 text-golden-light" />
          <span className="text-xs text-muted-foreground">2,847 farmers trust us</span>
        </div>
      </motion.div>

      {/* Deposit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4"
      >
        <Button
          onClick={() => {
            if (selectedAmount) {
              // Calculate points earned based on selected amount
              const pointsEarned = amounts.find(a => a.value === selectedAmount)?.points || 0;
              navigate("/deposit/success", {
                state: {
                  amount: selectedAmount,
                  pointsEarned: pointsEarned,
                  pointsValue: (pointsEarned * 35).toFixed(2),
                  newBalance: 1245.50 - selectedAmount,
                  transactionHash: "SDFSDF5484SD",
                  orderId: "SDFSDF5484SD",
                  date: new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })
                }
              });
            }
          }}
          className="w-full h-14 bg-gradient-to-r from-golden-dark to-golden-light text-background font-bold text-lg hover:opacity-90"
          disabled={!selectedAmount}
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} />
            <path d="M9 12l2 2 4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Deposit
        </Button>
      </motion.div>

      {/* Address Section */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-center text-muted-foreground text-sm mb-3">
          Almost there! Send only USDC to complete
        </p>
        <div 
          className="bg-background/50 rounded-xl p-4 cursor-pointer hover:bg-background/70 transition-colors"
          onClick={handleCopyAddress}
        >
          <p className="text-golden-light font-mono text-center text-sm break-all">
            {depositAddress}
          </p>
        </div>
      </motion.div>

      {/* Waiting Status */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-8 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-center text-golden-light mb-4">Waiting for your deposit</p>
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-golden-light/20 border-t-golden-light rounded-full"
          />
        </div>
      </motion.div>

      {/* Need Help */}
      <div className="text-center mb-4">
        <button className="text-golden-light hover:underline">
          Need help ?
        </button>
      </div>

      <BottomNavigation />
    </Container>
  );
};

export default Deposit;
