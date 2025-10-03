import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, HandCoins, Wallet, Clock, TrendingUp, ArrowRight } from "lucide-react";


const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Main Balance Card */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-golden-light">
            Hello, <span className="font-medium">User!</span>
          </h1>
          <Zap className="w-6 h-6 text-golden-light" />
        </div>

        {/* Balance */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
          <p className="text-5xl font-bold text-golden-light mb-6">$1,245.50</p>
        </div>

        {/* Stats Grid */}
        <div className="bg-background/50 rounded-xl p-4 mb-6 grid grid-cols-3 divide-x divide-border/50">
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">$995.00</p>
            <p className="text-xs text-muted-foreground mt-1">USDL</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">$99.00</p>
            <p className="text-xs text-muted-foreground mt-1">Staked</p>
          </div>
          <div className="text-center px-2">
            <p className="text-lg font-bold text-golden-light">$156</p>
            <p className="text-xs text-muted-foreground mt-1">Point Value</p>
          </div>
        </div>

        {/* Points */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Your Current total lighter points are</p>
          <p className="text-2xl font-bold text-golden-light">12.5</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4 grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-2 group">
          <HandCoins className="w-8 h-8 text-golden-light group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Deposit</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <Wallet className="w-8 h-8 text-golden-light group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Withdraw</span>
        </button>
        <button onClick={() => navigate("/farm")} className="flex flex-col items-center gap-2 group">
          <Zap className="w-8 h-8 text-golden-light group-hover:scale-110 transition-transform" />
          <span className="text-sm text-golden-light">Farm</span>
        </button>
      </motion.div>

      {/* Refer a Friend */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/referrals")}
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-golden-light mb-2">Refer a friend</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Earn <span className="font-bold text-golden-light">10%</span> for each* referral
          </p>
          <div className="inline-flex items-center gap-2 border border-golden-light/30 rounded-lg px-4 py-2 border-dashed">
            <span className="text-golden-light font-mono">📋 G7215SDF</span>
          </div>
        </div>
        <div className="absolute top-6 right-6">
          <ArrowRight className="w-6 h-6 text-golden-light/50" />
        </div>
      </motion.div>

      {/* Two Column Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Limited Bonus */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs text-muted-foreground">Limited Bonus</p>
            <ArrowRight className="w-4 h-4 text-golden-light" />
          </div>
          <p className="text-sm text-golden-light mb-1">Stake</p>
          <p className="text-3xl font-bold text-golden-light mb-2">$100+</p>
          <p className="text-xs text-muted-foreground mb-3">
            Get <span className="text-golden-light font-bold">2</span> free points
          </p>
          <div className="flex items-center gap-1 text-golden-light">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono">00:59:36</span>
          </div>
        </motion.div>

        {/* Point Price Alert */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs text-muted-foreground">Point price alert!</p>
            <ArrowRight className="w-4 h-4 text-golden-light" />
          </div>
          <p className="text-3xl font-bold text-golden-light mb-1">$52.50</p>
          <div className="flex items-center gap-1 text-warning mb-3">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs font-bold">+8.3%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Suggested action:</p>
          <p className="text-xs text-muted-foreground">Price trending up! Consider holding</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-golden-light mb-4">Recent Activity:</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-foreground">@user123 joined</p>
              <p className="text-xs text-muted-foreground">(2h ago)</p>
            </div>
            <span className="text-golden-light font-bold">+0.5 pt</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-foreground">@trader deposited</p>
              <p className="text-xs text-muted-foreground">(10h ago)</p>
            </div>
            <span className="text-golden-light font-bold">+1.0 pt</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-foreground">@farmer staked</p>
              <p className="text-xs text-muted-foreground">(2d ago)</p>
            </div>
            <span className="text-golden-light font-bold">+0.5 pt</span>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Dashboard;