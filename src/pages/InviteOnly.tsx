import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Lock, Users, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

const InviteOnly = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { address } = useWallet();
  const { ready, authenticated, login, user } = usePrivy();

  const handleBack = () => {
    navigate("/wallet-connect/success");
  };

  const handleContinue = async () => {
    // Validation checks
    if (!inviteCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter an invite code to continue",
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

    setIsValidating(true);

    try {
      const requestData = {
        wallet_address: address,
        referral_code: inviteCode.trim(),
      };

      const headers = {
        'X-Privy-User-Id': user.id,
        'X-Wallet-Address': address,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('🚀 Making registration request:', {
        url: '/api/referral/register-user',
        method: 'POST',
        headers: headers,
        data: requestData,
        baseURL: axios.defaults.baseURL || window.location.origin
      });

      const response = await axios.post('/api/referral/register-user', requestData, {
        headers: headers
      });

      console.log('✅ Registration response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      // Check for successful response
      if (response.status === 200 && response.data?.success) {
        toast({
          title: "🎉 Registration Successful!",
          description: "Preparing your welcome bonus...",
          duration: 2000,
        });

        // Navigate to the welcome congratulations page
        setTimeout(() => {
          navigate('/welcome-congratulations');
        }, 1000);
      } else {
        // Handle unexpected response format
        toast({
          title: 'Registration failed',
          description: response.data?.error || 'Unexpected response from server',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('❌ Registration error details:', {
        error: error,
        message: error.message,
        name: error.name,
        code: error.code,
        isAxiosError: axios.isAxiosError(error)
      });

      let errorMessage = 'Network or server error';
      let errorTitle = 'Registration Error';

      // Handle axios errors with response
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
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;

          console.log(`🚨 Server responded with ${status}:`, data);

          if (status === 400) {
            errorTitle = 'Invalid Request';
            errorMessage = data?.error || data?.message || 'Please check your input and try again';
          } else if (status === 401) {
            errorTitle = 'Authentication Failed';
            errorMessage = 'Please reconnect your wallet and try again';
          } else if (status === 404) {
            errorTitle = 'API Endpoint Not Found';
            errorMessage = 'The server endpoint is not available. Please check if your server is running.';
          } else if (status === 409) {
            errorTitle = 'Already Registered';
            errorMessage = 'This wallet or user is already registered';
          } else if (status >= 500) {
            errorTitle = 'Server Error';
            errorMessage = 'Server is temporarily unavailable. Please try again later';
          } else {
            errorMessage = data?.error || data?.message || `Server error (${status})`;
          }
        } else if (error.request) {
          // Network error
          console.log('🌐 Network error:', error.request);
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to server. Please check your internet connection and ensure the server is running.';
        } else {
          // Request setup error
          console.log('⚙️ Request setup error:', error.message);
          errorMessage = error.message || 'Failed to make request';
        }
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
      setIsValidating(false);
    }
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      console.log('🧪 Testing server connection...');
      const response = await axios.get('/api/health');
      console.log('✅ Server health check:', response.data);
      toast({
        title: "Server Connected",
        description: "Server is running and accessible",
      });
    } catch (error) {
      console.error('❌ Server health check failed:', error);
      toast({
        title: "Server Not Accessible",
        description: "Cannot connect to server. Please check if your Express server is running.",
        variant: "destructive",
      });
    }
  };

  const benefits = [
    {
      icon: Star,
      title: "Exclusive Access",
      description: "Be among the first to farm Lighter Points"
    },
    {
      icon: Gift,
      title: "Higher Rewards",
      description: "Early adopters get bonus multipliers"
    },
    {
      icon: Users,
      title: "Priority Support",
      description: "Direct access to our team"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col py-6 px-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Invite Only</h1>
          <p className="text-sm text-golden-light/80">exclusive access</p>
        </div>
      </header>


      {/* Authentication Warning */}
      {!authenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 max-w-md mx-auto w-full"
        >
          <div className="text-center">
            <p className="text-yellow-500 text-sm">⚠️ Please authenticate with Privy first</p>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-golden-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-golden-light" />
          </div>
          <h2 className="text-4xl font-bold text-golden-light mb-4">Invite Only!</h2>
          <p className="text-lg text-golden-light/80 leading-relaxed">
            LighterFarm is currently in exclusive beta. Enter your invite code to unlock premium farming opportunities.
          </p>
        </motion.div>

        {/* Invite Code Input */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-golden-light/20 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-golden-light" />
            </div>
            <h3 className="text-golden-light text-lg font-semibold">Enter Invite Code</h3>
          </div>

          <div className="border-2 text-golden-light rounded-sm px-4 py-2 mb-4 flex items-center justify-between">
            <Input
              type="text"
              placeholder="REF_A72F778A_8DPZ13AQ"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="bg-transparent border-none text-golden-light text-xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto placeholder:text-golden-light/30 tracking-wider"
              onKeyDown={(e) => e.key === "Enter" && !isValidating && handleContinue()}
              disabled={isValidating}
            />
          </div>

          <p className="text-sm text-golden-light font-extralight opacity-60 text-center">
            Don't have a code? Join our community for early access
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-6"
        >
          <Button
            onClick={handleContinue}
            disabled={!inviteCode.trim() || isValidating || !authenticated || !address}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 inline-block"
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
                Validating...
              </>
            ) : (
              "Continue to Farm"
            )}
          </Button>
        </motion.div>

        {/* Community Links */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4 text-center">Need an invite code?</h3>
          <div className="flex gap-3 justify-center">
            <a
              href="https://x.com/LighterFarm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-golden-light/10 hover:bg-golden-light/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
            </a>

            <a
              href="https://t.me/+sKmppf_5gNo5YzRl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-golden-light/10 hover:bg-golden-light/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </span>
            </a>
          </div>
          <p className="text-xs text-golden-light/60 text-center mt-3">
            Follow us for exclusive invite code drops
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteOnly;