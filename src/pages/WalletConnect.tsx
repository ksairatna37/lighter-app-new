import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Key, LogIn } from "lucide-react";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from "react";


const WalletConnect = () => {
  const { ready, authenticated, login } = usePrivy();

  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) {
      navigate("/wallet-connect/success");
    }
  }, [ready, authenticated, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (authenticated) {
    navigate("/wallet-connect/success");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-8 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">


        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Connect Wallet</h1>
          <p className="text-sm text-golden-light/80">secure & simple</p>
        </div>

      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <img src={logo} alt="Lighter Farm" className="w-auto h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-golden-light mb-4">Welcome to LighterFarm</h2>
          <p className="text-lg text-golden-light/80">
            Connect securely with Privy - no seed phrases needed
          </p>
        </motion.div>

        {/* Privy Authentication Card */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-golden-light/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-golden-light" />
            </div>
            <div>
              <h3 className="text-golden-light text-lg font-semibold">Secure Authentication</h3>
              <p className="text-sm text-golden-light font-extralight opacity-60">
                Powered by <span className="font-semibold text-golden-light">Privy</span>
              </p>
            </div>
          </div>

          {/* Privy Features */}
          <div className="bg-background/30 rounded-xl p-4 mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-golden-light/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <img src={slice} alt="" className="h-8 w-auto" />
              </div>
              <h4 className="text-golden-light font-semibold mb-2">One-Click Authentication</h4>
              <p className="text-sm text-golden-light/70">
                Connect using your preferred method - email, phone, or social accounts
              </p>
            </div>
          </div>

          {/* Primary Connect Button */}
          <Button
            onClick={login}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50 mb-4"
          >
            <LogIn className="w-10 h-10" />
            Connect with Privy
          </Button>

          <p className="text-xs text-golden-light/60 text-center">
            Privy will guide you through the secure authentication process
          </p>
        </motion.div>

        {/* Security Features */}
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Why Privy?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={slice} alt="" className="h-4 w-auto opacity-80" />
              <span className="text-sm text-golden-light/80">No seed phrases to remember</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={slice} alt="" className="h-4 w-auto opacity-80" />
              <span className="text-sm text-golden-light/80">Institutional-grade security</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={slice} alt="" className="h-4 w-auto opacity-80" />
              <span className="text-sm text-golden-light/80">Easy account recovery</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={slice} alt="" className="h-4 w-auto opacity-80" />
              <span className="text-sm text-golden-light/80">Multi-device synchronization</span>
            </div>
          </div>
        </motion.div>


        {/* Trust Indicators */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-golden-light" />
            <span className="text-xs text-golden-light/60">SOC 2 Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-golden-light" />
            <span className="text-xs text-golden-light/60">Self-Custodial</span>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-xs text-golden-light/50">
            Your wallet is secured with enterprise-grade encryption
          </p>
        </motion.div>
      </div>


    </div>
  );
};

export default WalletConnect;