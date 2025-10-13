import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';
import StakeSuccessModal from "./StakeSuccessModal";
import UnstakeSuccessModal from './UnstakeSuccessModal';


interface StakeSuccessData {
  transaction_id: string;
  tx_hash: string;
  staked_amount: string;
  total_staked: string;
  estimated_apy: string;
  estimated_daily_yield: string;
  lock_end_date: string;
  new_usdl_balance: string;
  timestamp: string;
}

interface UnstakeSuccessData {
  transaction_id: string;
  tx_hash: string;
  unstaked_amount: string;
  penalty_fee: string;
  rewards_earned: string;
  total_received: string;
  remaining_staked: string;
  new_usdl_balance: string;
  timestamp: string;
}

const Farm = () => {
  // Mode toggle: 'stake' or 'unstake'
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, authenticated, getAccessToken } = usePrivy();

  // Modal states
  const [showStakeSuccessModal, setShowStakeSuccessModal] = useState(false);
  const [stakeSuccessData, setStakeSuccessData] = useState<StakeSuccessData | null>(null);
  const [showUnstakeSuccessModal, setShowUnstakeSuccessModal] = useState(false);
  const [unstakeSuccessData, setUnstakeSuccessData] = useState<UnstakeSuccessData | null>(null);

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [stakedAmount, setstakedAmount] = useState(0);

  const stored = localStorage.getItem(user?.id);
  const localdata = stored ? JSON.parse(stored) : null;
  const address = localdata?.wallet_address;

  const [usersupabase, setUsersupabase] = useState("");

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!address) {
        toast({
          title: "Wallet Required",
          description: "Wallet address not found.",
          variant: "destructive",
        });
        return;
      }

      setUsdcBalance(localdata?.usdl_balance || 0);
      setstakedAmount(localdata?.staked_amount || 0);
    };

    fetchReferralCode();
  }, [stored]);

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (stored) {
        const referralData = JSON.parse(stored);
        setUsersupabase(referralData.id);
      }
    };

    fetchReferralCode();
  }, [address, user?.id]);

  // Switch mode and clear amounts
  const switchMode = (newMode: 'stake' | 'unstake') => {
    setMode(newMode);
    setStakeAmount("");
    setUnstakeAmount("");
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

    setIsStaking(true);

    try {
      const requestData = {
        wallet_address: address,
        amount: stakeAmount,
        duration_days: 0,
      };

      const headers = {
        'X-Privy-User-Id': usersupabase,
        'X-Wallet-Address': address,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await axios.post('/api/stake', requestData, { headers });

      if (response.status === 200 && response.data?.success) {
        setStakeSuccessData(response.data.data);
        setShowStakeSuccessModal(true);
        setStakeAmount("");
        
        if (window.Audio) {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApFn+DyvmMcBS2FzvLZiDYIG2m+7+WiTAwO'); 
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch (e) { /* empty */ }
        }
      } else {
        toast({
          title: 'Stake failed',
          description: response.data?.error?.message || response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Stake error details:', error);

      let errorMessage = 'Network or server error';
      let errorTitle = 'Stake Error';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 400) {
            errorTitle = 'Invalid Request';
            if (data?.detail?.error?.message) {
              errorMessage = data.detail.error.message;
            } else if (data?.error?.message) {
              errorMessage = data.error.message;
            } else if (data?.error) {
              errorMessage = data.error;
            } else if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = 'Please check your input and try again';
            }
          } else if (status === 401) {
            errorTitle = 'Authentication Failed';
            errorMessage = data?.error?.message || 'Wallet authentication failed. Please reconnect your wallet and try again.';
          } else if (status === 404) {
            errorTitle = 'API Endpoint Not Found';
            errorMessage = 'The API endpoint is not available. Please check if your server is running.';
          } else if (status >= 500) {
            errorTitle = 'Server Error';
            errorMessage = 'Server is temporarily unavailable. Please try again later';
          } else {
            errorMessage = data?.error?.message || data?.error || data?.message || `Server error (${status})`;
          }
        } else if (error.request) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.message || 'Failed to make request';
        }
      } else if (error.message && error.message.includes('access token')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Failed to authenticate. Please try logging out and back in.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid unstake amount",
        variant: "destructive",
      });
      return;
    }

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

    setIsUnstaking(true);

    try {
      const requestData = {
        wallet_address: address,
        amount: unstakeAmount,
        force_unlock: "false",
      };

      const headers = {
        'X-Privy-User-Id': usersupabase,
        'X-Wallet-Address': address,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await axios.post('/api/unstake', requestData, { headers });

      if (response.status === 200 && response.data?.success) {
        setUnstakeSuccessData(response.data.data);
        setShowUnstakeSuccessModal(true);
        setUnstakeAmount("");

        if (window.Audio) {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApFn+DyvmMcBS2FzvLZiDYIG2m+7+WiTAwO');
            audio.volume = 0.6;
            audio.play().catch(() => {});
          } catch (e) { /* empty */ }
        }
      } else {
        toast({
          title: 'Unstake failed',
          description: response.data?.error?.message || response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Unstake error details:', error);

      let errorMessage = 'Network or server error';
      let errorTitle = 'Unstake Error';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 400) {
            errorTitle = 'Invalid Request';
            if (data?.detail?.error?.message) {
              errorMessage = data.detail.error.message;
            } else if (data?.error?.message) {
              errorMessage = data.error.message;
            } else if (data?.error) {
              errorMessage = data.error;
            } else if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = 'Please check your input and try again';
            }
          } else if (status === 401) {
            errorTitle = 'Authentication Failed';
            errorMessage = data?.error?.message || 'Wallet authentication failed. Please reconnect your wallet and try again.';
          } else if (status === 404) {
            errorTitle = 'API Endpoint Not Found';
            errorMessage = 'The API endpoint is not available. Please check if your server is running.';
          } else if (status >= 500) {
            errorTitle = 'Server Error';
            errorMessage = 'Server is temporarily unavailable. Please try again later';
          } else {
            errorMessage = data?.error?.message || data?.error || data?.message || `Server error (${status})`;
          }
        } else if (error.request) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.message || 'Failed to make request';
        }
      } else if (error.message && error.message.includes('access token')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Failed to authenticate. Please try logging out and back in.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleCloseStakeSuccessModal = () => {
    setShowStakeSuccessModal(false);
    setStakeSuccessData(null);
  };

  const handleStakeAgain = () => {
    setShowStakeSuccessModal(false);
    setStakeSuccessData(null);
    setTimeout(() => {
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const handleCloseUnstakeSuccessModal = () => {
    setShowUnstakeSuccessModal(false);
    setUnstakeSuccessData(null);
  };

  const handleUnstakeAgain = () => {
    setShowUnstakeSuccessModal(false);
    setUnstakeSuccessData(null);
    setTimeout(() => {
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const calculateStakeProjections = () => {
    const amount = parseFloat(stakeAmount) || 0;
    const weeklyRate = 0.079;
    const weeklyPoints = (amount / 100) * 7.9;
    const apy = 414;
    const poolShare = (amount / 28450) * 100;

    return {
      weekly: weeklyPoints.toFixed(1),
      apy: apy,
      poolShare: poolShare.toFixed(1)
    };
  };

  const calculateUnstakeProjections = () => {
    const amount = parseFloat(unstakeAmount) || 0;
    const weeklyRate = 0.079;
    const weeklyPointsLoss = (amount / 100) * 7.9;
    const apy = 414;
    const poolShareLoss = (amount / 28450) * 100;

    return {
      weeklyLoss: weeklyPointsLoss.toFixed(1),
      apy: apy,
      poolShareLoss: poolShareLoss.toFixed(1)
    };
  };

  const stakeProjections = calculateStakeProjections();
  const unstakeProjections = calculateUnstakeProjections();

  const setStakePercentage = (percentage: number) => {
    const amount = (usdcBalance * percentage / 100).toFixed(2);
    setStakeAmount(amount);
  };

  const setUnstakePercentage = (percentage: number) => {
    const amount = (stakedAmount * percentage / 100).toFixed(2);
    setUnstakeAmount(amount);
  };

  const currentAmount = mode === 'stake' ? stakeAmount : unstakeAmount;
  const isProcessing = mode === 'stake' ? isStaking : isUnstaking;

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
            <h1 className="text-xl font-bold text-golden-light">Farm USDL</h1>
            <p className="text-sm text-golden-light/80">for points</p>
          </div>

          <img src={logo} alt="" className="h-8 w-auto" />
        </header>

        {/* Mode Toggle Tabs */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-2 mb-4 relative z-10 grid grid-cols-2 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => switchMode('stake')}
            className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              mode === 'stake'
                ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white'
                : 'bg-transparent text-golden-light/60 hover:text-golden-light'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDown className="w-4 h-4" />
              Stake
            </div>
          </button>
          <button
            onClick={() => switchMode('unstake')}
            className={`relative py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              mode === 'unstake'
                ? 'bg-gradient-to-r from-[#7D5A02] to-[#A07715] text-white'
                : 'bg-transparent text-golden-light/60 hover:text-golden-light'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUp className="w-4 h-4" />
              Unstake
            </div>
          </button>
        </motion.div>

        {/* Animated Content Based on Mode */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'stake' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'stake' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Balance Card */}
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-golden-light font-extralight opacity-60">
                  {mode === 'stake' ? 'Available' : 'Available to Unstake'}
                </span>
                <span className="text-golden-light font-bold">
                  {mode === 'stake' ? usdcBalance.toFixed(2) : stakedAmount.toFixed(2)} USDL
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-golden-light font-extralight opacity-60">
                  {mode === 'stake' ? 'Total Farmed' : 'Current Balance'}
                </span>
                <span className="text-golden-light font-bold">
                  {mode === 'stake' ? stakedAmount.toFixed(2) : usdcBalance.toFixed(2)} USDL
                </span>
              </div>
            </div>

            {/* Amount Input Section */}
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10">
              <label className="text-golden-light text-lg font-semibold mb-4 block">
                {mode === 'stake' ? 'Stake' : 'Unstake'} Amount:
              </label>

              {/* Amount Input */}
              <div className="border-2 text-golden-light rounded-sm px-4 py-2 mb-4 flex items-center justify-between">
                <Input
                  type="number"
                  value={currentAmount}
                  onChange={(e) =>
                    mode === 'stake' ? setStakeAmount(e.target.value) : setUnstakeAmount(e.target.value)
                  }
                  placeholder="0.00"
                  className="bg-transparent border-none text-golden-light text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-golden-light text-md font-semibold ml-2">USDL</span>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-3">
                <Button
                  onClick={() => mode === 'stake' ? setStakePercentage(25) : setUnstakePercentage(25)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  25%
                </Button>
                <Button
                  onClick={() => mode === 'stake' ? setStakePercentage(50) : setUnstakePercentage(50)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  50%
                </Button>
                <Button
                  onClick={() => mode === 'stake' ? setStakePercentage(75) : setUnstakePercentage(75)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  75%
                </Button>
                <Button
                  onClick={() => mode === 'stake' ? setStakePercentage(100) : setUnstakePercentage(100)}
                  className="bg-[#D4B679]/90 hover:bg-[#D4B679] text-background font-bold h-10"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Action Button */}
            <div className="mb-6 relative z-10">
              <Button
                onClick={mode === 'stake' ? handleStake : handleUnstake}
                disabled={
                  !currentAmount ||
                  parseFloat(currentAmount) <= 0 ||
                  (mode === 'unstake' && parseFloat(currentAmount) > stakedAmount) ||
                  isProcessing ||
                  !authenticated ||
                  !address ||
                  !usersupabase
                }
                className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    {mode === 'stake' ? 'Staking...' : 'Unstaking...'}
                  </>
                ) : (
                  <>
                    {mode === 'stake' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                    {mode === 'stake' ? 'Stake Now' : 'Unstake Now'}
                  </>
                )}
              </Button>
            </div>

            {/* Projections Card */}
            {currentAmount && parseFloat(currentAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10"
              >
                <h3 className="text-golden-light text-lg font-semibold mb-4">
                  {mode === 'stake' ? 'Projections:' : 'Impact of Unstaking:'}
                </h3>
                <div className="space-y-3">
                  {mode === 'stake' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">Weekly Points</span>
                        <span className="text-foreground font-semibold">~{stakeProjections.weekly} points</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">APY</span>
                        <span className="text-foreground font-semibold">{stakeProjections.apy}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">Pool Share</span>
                        <span className="text-foreground font-semibold">{stakeProjections.poolShare}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">Weekly Points Loss</span>
                        <span className="text-red-400 font-semibold">-{unstakeProjections.weeklyLoss} points</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">You'll Receive</span>
                        <span className="text-green-400 font-semibold">${unstakeAmount} USDC</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-golden-light font-extralight opacity-60">Remaining Staked</span>
                        <span className="text-foreground font-semibold">
                          ${(stakedAmount - parseFloat(unstakeAmount || '0')).toFixed(2)} USDL
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pool Statistics */}
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 relative z-10">
              <h3 className="text-golden-light text-lg font-semibold mb-4">Pool Statistics:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-golden-light font-extralight opacity-60">Total Staked</span>
                  <span className="text-foreground font-semibold">$28,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-golden-light font-extralight opacity-60">
                    {mode === 'stake' ? 'Your Share' : 'Your Current Share'}
                  </span>
                  <span className="text-foreground font-semibold">
                    {((stakedAmount / 28450) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <BottomNavigation />
      </Container>

      <StakeSuccessModal
        isOpen={showStakeSuccessModal}
        onClose={handleCloseStakeSuccessModal}
        data={stakeSuccessData}
        onStakeAgain={handleStakeAgain}
      />

      <UnstakeSuccessModal
        isOpen={showUnstakeSuccessModal}
        onClose={handleCloseUnstakeSuccessModal}
        data={unstakeSuccessData}
        onUnstakeAgain={handleUnstakeAgain}
      />
    </>
  );
};

export default Farm;
