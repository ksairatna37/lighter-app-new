import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const WalletConnectSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const walletAddress = "0xF2A...0.38";
  const email = "ringo@sublime.xyz";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0xF2A...0.38");
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleBack = () => {
    navigate("/wallet-connect");
  };

  const handleStartFarming = () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }
    navigate("/invite-only");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-start justify-between px-8 py-12">
      {/* Top Section */}
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Zap className="w-16 h-16 text-accent-primary fill-accent-primary mb-8" />
          <h1 className="text-5xl font-bold text-white">LighterFarm</h1>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[#D4AF6A] rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold text-black mb-2">You're all set!</h2>
          <p className="text-lg text-black/70 mb-6">Ready to start farming Lighter points?</p>

          {/* Wallet Info Card */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-6 relative overflow-hidden">
            {/* Background Lightning Pattern */}
            <div className="absolute top-0 right-0 w-64 h-full opacity-30">
              <Zap className="w-full h-full text-accent-primary fill-accent-primary transform rotate-12" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <p className="text-white/70 text-sm mb-2">{email}</p>
              <div className="flex items-center gap-2">
                <p className="text-white text-xl font-bold">{walletAddress}</p>
                <button
                  onClick={handleCopyAddress}
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-6">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label htmlFor="terms" className="text-sm text-black leading-relaxed cursor-pointer">
              I agree with the LighterFarm'{" "}
              <span className="underline">user terms and conditions</span> and acknowledge the TFH{" "}
              <span className="underline">privacy notice</span>
            </label>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex gap-4"
        >
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1 h-14 text-lg font-semibold bg-[#D4AF6A]/20 border-2 border-[#D4AF6A] text-[#D4AF6A] hover:bg-[#D4AF6A]/30 rounded-xl"
          >
            Back
          </Button>
          <Button
            onClick={handleStartFarming}
            className="flex-1 h-14 text-lg font-semibold bg-[#8B6F2B] hover:bg-[#7A5F1F] text-white rounded-xl"
          >
            Start Farming
          </Button>
        </motion.div>

        {/* Privy Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-white/50 text-sm flex items-center justify-center gap-2"
        >
          <span>🔒</span>
          <span>Protected by Privy</span>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletConnectSuccess;
