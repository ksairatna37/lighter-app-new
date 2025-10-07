import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

const Farm = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address, logout, refetchBalance } = useWallet();
  const { user, authenticated, getAccessToken } = usePrivy(); // Use getAccessToken instead of signMessage
  const { balance, usdcBalance, usdValue, isLoading } = useWalletStore();

  const stored = localStorage.getItem(address);
  const [usersupabase, setUsersupabase] = useState("");

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (stored) {
        const referralData = JSON.parse(stored);
        const code = referralData.referral_code;
        setUsersupabase(referralData.id);
        console.log('📝 Loaded from localStorage:', {
          supabaseId: referralData.id,
          referralCode: code,
          privyUserId: user?.id,
          walletAddress: address
        });
      }
    };

    fetchReferralCode();
  }, [address, user?.id]);

  const availableUSDL = "1245.00";
  const stakedAmount = "99.00";

  // Alternative approach: Use Privy's access token for authentication
  const createWalletAuth = async () => {
    try {
      console.log('🔐 Getting access token for authentication...');

      // Get Privy access token
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      console.log('✅ Access token obtained successfully');

      return {
        accessToken,
        timestamp: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      throw error;
    }
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
      // Step 1: Get authentication token (alternative to signing)
      console.log('🔐 Getting authentication token...');
      const authData = await createWalletAuth();

      // Step 2: Prepare request data
      const requestData = {
        wallet_address: address,
        amount: stakeAmount,
        duration_days: 0, // Default value as specified
        // Add auth token instead of signature
        auth_token: authData.accessToken,
        timestamp: authData.timestamp
      };

      // Step 3: Prepare headers (use Supabase user ID as confirmed by your testing)
      const headers = {
        'X-Privy-User-Id': usersupabase, // Supabase user ID
        'X-Wallet-Address': address,
        'Authorization': `Bearer ${authData.accessToken}`, // Add Authorization header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      console.log('🚀 Making stake request with auth token:', {
        url: '/api/stake',
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': 'Bearer [TOKEN]', // Don't log the actual token
          'auth_token': '[HIDDEN]'
        },
        data: {
          ...requestData,
          auth_token: '[HIDDEN]'
        },
        supabaseUserId: usersupabase,
        privyUserId: user.id,
        baseURL: axios.defaults.baseURL || window.location.origin,
      });

      const response = await axios.post('/api/stake', requestData, { headers });

      console.log('✅ Stake response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      if (response.status === 200 && response.data?.success) {
        toast({
          title: "🎯 Stake Successful!",
          description: `Staked $${stakeAmount} USDL successfully`,
          duration: 2000,
        });
        setStakeAmount("");
        refetchBalance?.();
      } else {
        toast({
          title: 'Stake failed',
          description: response.data?.error?.message || response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Stake error details:', {
        error,
        message: error.message,
        name: error.name,
        code: error.code,
        isAxiosError: axios.isAxiosError(error),
      });

      let errorMessage = 'Network or server error';
      let errorTitle = 'Stake Error';

      if (axios.isAxiosError(error)) {
        console.log('🔍 Axios error details:', {
          hasResponse: !!error.response,
          hasRequest: !!error.request,
          config: error.config,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
          } : null
        });

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          console.log(`🚨 Server responded with ${status}:`, data);

          if (status === 400) {
            errorTitle = 'Invalid Request';
            // Try to extract nested error message from detail.error.message
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
            console.log('🔐 Authentication error details:', data?.error);
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

  const handleUnstake = () => {
    navigate("/unstake");
  };

  return (
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

      {/* Balance Card */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-golden-light font-extralight opacity-60">Available</span>
          <span className="text-golden-light font-bold">{usdcBalance} USDL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-golden-light font-extralight opacity-60">Total Farmed</span>
          <span className="text-golden-light font-bold">${stakedAmount} USDL</span>
        </div>
      </motion.div>

      {/* Stake Amount Section */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-golden-light text-lg font-semibold mb-4 block">Stake Amount:</label>

        {/* Amount Input */}
        <div className="border-2 text-golden-light rounded-sm px-4 py-2 mb-4 flex items-center justify-between">
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent border-none text-golden-light text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-golden-light text-md font-semibold ml-2">USDL</span>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-3">
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
      </motion.div>

      {/* Action Buttons - Stake and Unstake */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 mb-6 relative z-10"
      >
        {/* Stake Button */}
        <Button
          onClick={handleStake}
          disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || !authenticated || !address || !usersupabase}
          className="flex-1 h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isStaking ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Zap className="w-5 h-5" />
              </motion.div>
              Staking...
            </>
          ) : (
            <>
              <ArrowDown className="w-5 h-5" />
              Stake Now
            </>
          )}
        </Button>

        {/* Unstake Button */}
        <Button
          onClick={handleUnstake}
          disabled={parseFloat(stakedAmount) <= 0}
          className="flex-1 h-14 bg-transparent border-2 border-golden-light/30 text-golden-light hover:bg-golden-light/10 text-lg font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowUp className="w-5 h-5" />
          Unstake
        </Button>
      </motion.div>

      {/* Projections Card */}
      {stakeAmount && parseFloat(stakeAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6 relative z-10"
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Projections:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Weekly Points</span>
              <span className="text-foreground font-semibold">~{projections.weekly} points</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">APY</span>
              <span className="text-foreground font-semibold">{projections.apy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-golden-light font-extralight opacity-60">Pool Share</span>
              <span className="text-foreground font-semibold">{projections.poolShare}%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pool Statistics */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-golden-light text-lg font-semibold mb-4">Pool Statistics:</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-golden-light font-extralight opacity-60">Total Staked</span>
            <span className="text-foreground font-semibold">$28,450</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-golden-light font-extralight opacity-60">Your Share</span>
            <span className="text-foreground font-semibold">{((parseFloat(stakedAmount) / 28450) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Farm;