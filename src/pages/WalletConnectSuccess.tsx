import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, ArrowLeft, Shield, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useWalletStore } from '@/hooks/useWallet';

const WalletConnectSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { address, user } = useWallet();

  if (!address) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Wallet className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Creating Your Wallet</h2>
            <p className="text-muted-foreground">
              Please wait while we set up your secure wallet...
            </p>
          </div>
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "🎯 Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleBack = () => {
    navigate("/wallet-connect");
  };

  const handleStartFarming = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!address || !user?.id) {
      toast({
        title: "Wallet Required",
        description: "Wallet address or user ID not found.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    console.log("🚀 Checking user existence for:", user.id);

    try {
      const response = await axios.post('/api/check_user_exist', { 
        privy_id: user.id 
      });

      console.log("✅ Check user response:", response.data);

      if (response.data && response.data.exists === 'yes') {
        // User exists - store user data in localStorage
        const userData = response.data.user;
        
        console.log("💾 Storing user data in localStorage:", userData);
        
        // Create comprehensive user data object
        const userDataToStore = {
          // Core user info
          id: userData.id,
          wallet_address: userData.wallet_address,
          referral_code: userData.referral_code,
          
          // // Balance information
          // usdl_balance: userData.usdl_balance,
          // points_balance: userData.points_balance,
          // staked_amount: userData.staked_amount,
          
          // // Points and rewards
          // bonus_points: userData.bonus_points,
          // total_points: userData.total_points,
          // referral_count: userData.referral_count,
          // referral_rewards_earned: userData.referral_rewards_earned,
          // total_referral_rewards: userData.total_referral_rewards,
          
          // // Referral info
          // referrer_id: userData.referrer_id,
          
          // // Timestamps
          // created_at: userData.created_at,
          // updated_at: userData.updated_at,
          
          // // Calculated values
          // total_portfolio_value: (
          //   parseFloat(userData.usdl_balance) + 
          //   parseFloat(userData.staked_amount) + 
          //   (parseFloat(userData.points_balance) * 4.005) // Assuming current exchange rate
          // ).toFixed(2),
          
          // // Store timestamp of when this data was cached
          // last_fetched: new Date().toISOString()
        };

        // Store in localStorage using privy_id as key
        localStorage.setItem(user.id, JSON.stringify(userDataToStore));
        
        console.log("✅ User data stored successfully:", {
          key: user.id,
          dataKeys: Object.keys(userDataToStore),
        });

        toast({
          title: "🎉 Welcome Back!",
          description: "Redirecting to your dashboard...",
          duration: 2000,
        });

        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
      } else {
        // User doesn't exist - redirect to invite-only registration
        console.log("❌ User not found, redirecting to registration");
        
        toast({
          title: "Registration Required",
          description: "Please complete registration with an invite code.",
          duration: 3000,
        });

        setTimeout(() => {
          navigate('/invite-only');
        }, 1500);
      }
      
    } catch (error) {
      console.error("❌ Error checking user existence:", error);
      
      // More specific error handling
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Could not verify your account.";
        
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col py-6 px-4">
      {/* Header */}
      <header className="flex items-center justify-end mb-8">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Wallet Connected</h1>
          <p className="text-sm text-golden-light/80">ready to farm</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-golden-light mb-2">You're all set!</h2>
          <p className="text-lg text-golden-light/80">Ready to start farming Lighter points?</p>
        </motion.div>

        {/* Wallet Info Card */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-0">
            <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-golden-light" />
            </div>
            <div>
              <h3 className="text-golden-light text-lg font-semibold">Wallet Connected</h3>
              <p className="text-sm text-golden-light font-extralight opacity-60">Secured by Privy</p>
            </div>
          </div>

          {/* Wallet Address Display */}
          {/* <div className="bg-background/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-golden-light/60 text-sm">Wallet Address</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
                className="h-8 w-8 text-golden-light hover:bg-golden-light/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-golden-light font-mono text-sm font-semibold">{address && formatAddress(address)}</p>
            <p className="text-golden-light font-thin text-sm">Base Network</p>
          </div> */}
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1 border-2 border-golden-light/30 data-[state=checked]:bg-golden-light data-[state=checked]:text-black data-[state=checked]:border-golden-light"
            />
            <label htmlFor="terms" className="text-sm text-golden-light/80 leading-relaxed cursor-pointer">
              I agree with the LighterFarm{" "}
              <span className="text-golden-light underline hover:text-golden-light/80 transition-colors">
                user terms and conditions
              </span>{" "}
              and acknowledge the TFH{" "}
              <span className="text-golden-light underline hover:text-golden-light/80 transition-colors">
                privacy notice
              </span>
            </label>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-4 mb-6"
        >
          <Button
            onClick={handleBack}
            disabled={isChecking}
            className="flex-1 h-14 bg-transparent border-2 border-golden-light/30 text-golden-light hover:bg-golden-light/10 rounded-xl text-lg font-semibold transition-all disabled:opacity-50"
          >
            Back
          </Button>
          <Button
            onClick={handleStartFarming}
            disabled={!agreedToTerms || isChecking}
            className="flex-1 h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50"
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </div>
            ) : (
              "Start Farming"
            )}
          </Button>
        </motion.div>

        {/* Privy Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 text-golden-light/60">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Protected by Privy</span>
          </div>
          <p className="text-xs text-golden-light/40 mt-2">
            Your wallet is secured with enterprise-grade encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletConnectSuccess;