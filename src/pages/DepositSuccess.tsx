import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Share2, ExternalLink } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import moneyBag from "@/assets/money-bag.png";
import share from "@/assets/Share.png";

const DepositSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const handleShare = async () => {
    const shareText = `I just earned ${depositData.pointsEarned} Lighter Points! 🎉`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lighter Farm Achievement",
          text: shareText,
        });
      } catch (error) {
        // User cancelled share
      }
    }
  };

  const handleViewTransaction = () => {
    // Open transaction in explorer (placeholder)
    console.log("View transaction:", depositData.transactionHash);
  };

  return (
    <Container className="bg-background min-h-screen pb-24 flex flex-col px-4">
      {/* Header - Matching other components */}
      <header className="flex items-center justify-center py-6 relative">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Quick Start</h1>
          <p className="text-sm text-golden-light/80">deposit complete</p>
        </div>
        <img src={logo} alt="" className="h-8 w-auto absolute right-0" />
      </header>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Money Bag Image */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-8"
        >
          <img 
            src={moneyBag} 
            alt="Success" 
            className="w-40 h-40 object-contain"
          />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-golden-light mb-2">
            You've Successfully earned
          </h2>
          <p className="text-3xl font-bold text-golden-light">
            {depositData.pointsEarned} Lighter Points
          </p>
          <p className="text-sm text-golden-light font-extralight opacity-60 mt-2">
            Worth ~${depositData.pointsValue}
          </p>
        </motion.div>

        {/* Transaction Details Card - Matching card style */}
        <motion.div 
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Transaction Details:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Transaction Hash</span>
              <button 
                onClick={handleViewTransaction}
                className="flex items-center gap-2 text-foreground font-semibold hover:text-golden-light transition-colors"
              >
                <span className="font-mono text-sm">{depositData.transactionHash}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Deposit Amount</span>
              <span className="text-foreground font-semibold">${depositData.amount} USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Points Earned</span>
              <span className="text-foreground font-semibold">{depositData.pointsEarned} points</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">New Balance</span>
              <span className="text-foreground font-semibold">${depositData.newBalance} USDC</span>
            </div>
          </div>
        </motion.div>

        {/* Order Details Card - Matching card style */}
        <motion.div 
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Order Information:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Date</span>
              <span className="text-foreground font-semibold">{depositData.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-500 font-semibold">Completed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Matching Farm component style */}
      <div className="space-y-3 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleShare}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-md text-white disabled:opacity-50"
          >
            <img src={share} alt="" className="h-7 w-auto" />
            Share Achievement
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold rounded-md"
          >
            Continue to Home
          </Button>
        </motion.div>
      </div>

      {/* Celebration Card - Additional visual element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mx-4 mt-4"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-golden-light font-semibold text-sm">Congratulations!</span>
          </div>
          <p className="text-xs text-golden-light font-extralight opacity-60">
            You're now earning points on Lighter Farm
          </p>
        </div>
      </motion.div>
    </Container>
  );
};

export default DepositSuccess;