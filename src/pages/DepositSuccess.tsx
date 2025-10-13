import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Share2, ExternalLink, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import moneyBag from "@/assets/money-bag.png";
import share from "@/assets/Share.png";

const DepositSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from navigation state or use defaults
  const depositData = location.state || {
    amount: 25,
    pointsEarned: 0.87,
    pointsValue: 30.45,
    newBalance: 9,
    transactionHash: "SDFSDF5484SD",
    orderId: "SDFSDF5484SD",
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  };

  // Celebration animation state
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Hide celebration animation after 3 seconds
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareText = `🎉 I just earned ${depositData.pointsEarned} Lighter Points worth $${depositData.pointsValue} on LighterFarm! 🚀`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lighter Farm Achievement",
          text: shareText,
          url: window.location.origin
        });
        
        toast({
          title: "🎯 Shared!",
          description: "Achievement shared successfully",
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log("Share cancelled or failed:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "🎯 Copied!",
          description: "Achievement copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share achievement",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewTransaction = () => {
    // Open transaction in explorer (you can customize this URL)
    const explorerUrl = `https://basescan.org/tx/${depositData.transactionHash}`;
    window.open(explorerUrl, '_blank');
    
    toast({
      title: "🔍 Opening Explorer",
      description: "Transaction details will open in new tab",
    });
  };

  const handleContinueHome = () => {
    navigate("/dashboard");
  };

  const handleViewFarm = () => {
    navigate("/farm");
  };

  return (
    <Container className="bg-background min-h-screen pb-24 flex flex-col px-4">
      {/* Celebration Overlay */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-golden-light mb-2">Success!</h2>
            <p className="text-golden-light">Deposit completed successfully</p>
          </motion.div>
        </motion.div>
      )}

      {/* Header - Matching other components */}
      <header className="flex items-center justify-center py-6 relative">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Deposit Complete</h1>
          <p className="text-sm text-golden-light/80">transaction successful</p>
        </div>
        <img src={logo} alt="" className="h-8 w-auto absolute right-0" />
      </header>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Success Icon and Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="mb-6 relative"
        >
          <div className="w-32 h-32 bg-gradient-to-r from-[#7D5A02] to-[#A07715] rounded-full flex items-center justify-center relative">
            <CheckCircle className="w-16 h-16 text-white" />
            
            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-4 border-golden-light"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full border-2 border-golden-light"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-golden-light mb-3">
            Congratulations!
          </h2>
          <p className="text-lg text-golden-light mb-2">
            You've successfully earned
          </p>
          <p className="text-4xl font-bold text-golden-light mb-2">
            {depositData.pointsEarned} Lighter Points
          </p>
          <p className="text-sm text-golden-light font-extralight opacity-60">
            Worth approximately ${depositData.pointsValue}
          </p>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 gap-4 w-full mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-golden-light mb-1">
              ${depositData.amount}
            </div>
            <div className="text-xs text-golden-light font-extralight opacity-60">
              Deposited
            </div>
          </div>
          <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-golden-light mb-1">
              ${depositData.newBalance.toFixed(2)}
            </div>
            <div className="text-xs text-golden-light font-extralight opacity-60">
              New Balance
            </div>
          </div>
        </motion.div>

        {/* Transaction Details Card - Collapsible/Expandable */}
        <motion.div 
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-golden-light text-lg font-semibold">Transaction Details</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-semibold text-sm">Confirmed</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Transaction Hash</span>
              <button 
                onClick={handleViewTransaction}
                className="flex items-center gap-2 text-foreground font-semibold hover:text-golden-light transition-colors"
              >
                <span className="font-mono text-sm">{depositData.transactionHash.slice(0, 8)}...</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Date & Time</span>
              <span className="text-foreground font-semibold text-sm">{depositData.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Network</span>
              <span className="text-foreground font-semibold text-sm">Base Mainnet</span>
            </div>
          </div>
        </motion.div>

        {/* Achievement Card */}
        <motion.div 
          className="bg-gradient-to-r from-[#7D5A02]/20 to-[#A07715]/20 border border-golden-light/30 rounded-2xl p-4 mb-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="text-golden-light font-semibold mb-1">Achievement Unlocked!</h4>
            <p className="text-xs text-golden-light font-extralight opacity-80">
              You're now actively farming on Lighter Farm
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-golden-light font-bold">+{depositData.pointsEarned}</div>
                <div className="text-golden-light/60">Points</div>
              </div>
              <div className="w-px h-8 bg-golden-light/30"></div>
              <div className="text-center">
                <div className="text-golden-light font-bold">Level 1</div>
                <div className="text-golden-light/60">Farmer</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="space-y-3 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleShare}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-md text-white"
          >
            <img src={share} alt="" className="h-7 w-auto mr-2" />
            Share Achievement
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={handleViewFarm}
            className="h-12 bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold rounded-md"
          >
            Start Farming
          </Button>
          <Button
            onClick={handleContinueHome}
            className="h-12 border border-golden-light/30 bg-transparent text-golden-light font-bold rounded-md hover:bg-golden-light/10"
          >
            View Dashboard
          </Button>
        </motion.div>
      </div>

      {/* Next Steps Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 mx-4 mt-4"
      >
        <div className="text-center">
          <h5 className="text-golden-light font-semibold text-sm mb-2">What's Next?</h5>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 bg-golden-light/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-golden-light">🌱</span>
              </div>
              <p className="text-golden-light/80">Start Farming</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-golden-light/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-golden-light">👥</span>
              </div>
              <p className="text-golden-light/80">Invite Friends</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-golden-light/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-golden-light">📈</span>
              </div>
              <p className="text-golden-light/80">Track Progress</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Container>
  );
};

export default DepositSuccess;