import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Share2, ExternalLink } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import moneyBag from "@/assets/money-bag.png";

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
    <Container className="bg-background min-h-screen pb-24 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-6 relative">
        <h1 className="text-xl font-medium text-golden-light">Quick Start</h1>
        <Zap className="w-8 h-8 text-golden-light absolute right-0" />
      </div>

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
          <h2 className="text-2xl font-medium text-golden-light mb-2">
            You've Successfully earned
          </h2>
          <p className="text-3xl font-bold text-golden-light">
            {depositData.pointsEarned} Lighter Points
          </p>
        </motion.div>

        {/* Transaction Details Card */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-6 mb-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Transaction Hash</p>
              <button 
                onClick={handleViewTransaction}
                className="flex items-center gap-2 text-golden-light font-bold hover:opacity-80"
              >
                <span>{depositData.transactionHash}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Deposit Amount</p>
              <p className="text-golden-light font-bold">${depositData.amount} USDC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Points Earned</p>
              <p className="text-golden-light font-bold">
                {depositData.pointsEarned} <span className="text-sm text-muted-foreground">(~${depositData.pointsValue})</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">New Balance</p>
              <p className="text-golden-light font-bold">${depositData.newBalance} USDC</p>
            </div>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-6 mb-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-golden-light font-bold">{depositData.orderId}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-golden-light font-bold">{depositData.date}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleShare}
            className="w-full h-14 bg-gradient-to-r from-golden-dark to-golden-light text-background font-bold text-lg hover:opacity-90"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Achievement
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="w-full h-14 bg-gradient-to-r from-golden-dark to-golden-light text-background font-bold text-lg hover:opacity-90"
          >
            Continue to Home
          </Button>
        </motion.div>
      </div>
    </Container>
  );
};

export default DepositSuccess;
