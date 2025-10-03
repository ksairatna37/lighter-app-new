import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Farm = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const availableUSDL = "1245.00";
  const stakedAmount = "99.00";

  const calculateProjections = () => {
    const amount = parseFloat(stakeAmount) || 0;
    const weeklyRate = 0.079; // ~7.9% for 100 USDL
    const weeklyPoints = (amount / 100) * 7.9;
    const apy = 414; // Fixed APY from design
    const poolShare = (amount / 28450) * 100;

    return {
      weekly: weeklyPoints.toFixed(1),
      apy: apy,
      poolShare: poolShare.toFixed(1)
    };
  };

  const projections = calculateProjections();

  const setPercentage = (percentage: number) => {
    const amount = (parseFloat(availableUSDL) * percentage / 100).toFixed(2);
    setStakeAmount(amount);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    
    // Simulate staking transaction
    setTimeout(() => {
      setIsStaking(false);
      toast({
        title: "🎯 Stake Successful!",
        description: `Staked $${stakeAmount} USDL successfully`,
      });
      setStakeAmount("");
    }, 3000);
  };

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-12 w-12 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-6 h-6 text-background" />
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Farm USDL</h1>
          <p className="text-sm text-golden-light/80">for points</p>
        </div>
        
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <Zap className="w-8 h-8 text-golden-light fill-golden-light" />
        </Button>
      </header>
      {/* Balance Card */}
      <motion.div 
        className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-golden-light font-medium">Available</span>
          <span className="text-golden-light text-xl font-bold">${availableUSDL} USDL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-golden-light font-medium">Total Farmed</span>
          <span className="text-golden-light text-xl font-bold">${stakedAmount} USDL</span>
        </div>
      </motion.div>

      {/* Stake Amount Section */}
      <motion.div 
        className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-golden-light text-lg font-semibold mb-4 block">Stake Amount:</label>
        
        {/* Amount Input */}
        <div className="bg-golden-light rounded-xl p-4 mb-4 flex items-center justify-between">
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent border-none text-2xl font-bold text-background placeholder:text-background/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-background text-xl font-semibold ml-2">USDL</span>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            onClick={() => setPercentage(25)}
            className="bg-accent-primary/90 hover:bg-accent-primary text-background font-bold h-12"
          >
            25%
          </Button>
          <Button
            onClick={() => setPercentage(50)}
            className="bg-accent-primary/90 hover:bg-accent-primary text-background font-bold h-12"
          >
            50%
          </Button>
          <Button
            onClick={() => setPercentage(75)}
            className="bg-accent-primary/90 hover:bg-accent-primary text-background font-bold h-12"
          >
            75%
          </Button>
          <Button
            onClick={() => setPercentage(100)}
            className="bg-accent-primary/90 hover:bg-accent-primary text-background font-bold h-12"
          >
            MAX
          </Button>
        </div>
      </motion.div>

      {/* Stake Button */}
      <Button
        onClick={handleStake}
        disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking}
        className="w-full h-14 bg-gradient-to-r from-golden-dark to-golden-light hover:opacity-90 text-background text-lg font-bold rounded-2xl mb-6 disabled:opacity-50"
      >
        {isStaking ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2 inline-block"
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            Staking...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Stake Now
          </>
        )}
      </Button>

      {/* Projections Card */}
      {stakeAmount && parseFloat(stakeAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Projections:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light/70">Weekly Yield</span>
              <span className="text-foreground font-semibold">~{projections.weekly} points</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light/70">APY</span>
              <span className="text-foreground font-semibold">{projections.apy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light/70">Pool Share</span>
              <span className="text-foreground font-semibold">{projections.poolShare}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light/70">Risk Level</span>
              <span className="text-foreground font-semibold">Medium</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pool Statistics */}
      <motion.div 
        className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-golden-light text-lg font-semibold mb-4">Pool Statistics:</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-golden-light/70">Total Staked</span>
            <span className="text-foreground font-semibold">$28,450</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-golden-light/70">Weekly Yield</span>
            <span className="text-foreground font-semibold">1,350 points</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-golden-light/70">Active Stakers</span>
            <span className="text-foreground font-semibold">127</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-golden-light/70">Pool APY</span>
            <span className="text-foreground font-semibold">520%</span>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Farm;