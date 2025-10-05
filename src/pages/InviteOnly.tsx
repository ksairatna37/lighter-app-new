import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft,RefreshCw ,Lock, Users, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";


const InviteOnly = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleBack = () => {
    navigate("/wallet-connect/success");
  };

  const handleContinue = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter an invite code to continue",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    // Simulate API validation
    setTimeout(() => {
      if (inviteCode.trim() === "LIGHTER2024" || inviteCode.trim() === "FARM123" || inviteCode.trim() === "BETA2024") {
        toast({
          title: "🎉 Welcome aboard!",
          description: "Your invite code has been validated successfully",
        });
        navigate("/deposit");
      } else {
        toast({
          title: "Invalid Invite Code",
          description: "Please check your code and try again",
          variant: "destructive",
        });
      }
      setIsValidating(false);
    }, 1500);
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
    <div className="min-h-screen bg-background flex flex-col py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Invite Only</h1>
          <p className="text-sm text-golden-light/80">exclusive access</p>
        </div>

      </header>

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
              placeholder="LIGHTER2024"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="bg-transparent border-none text-golden-light text-xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto placeholder:text-golden-light/30 uppercase tracking-wider"
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
            disabled={!inviteCode.trim() || isValidating}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 inline-block"
                >
                  <RefreshCw className="w-10 h-10 text-golden-light" />
                  
                </motion.div>
                Validating...
              </>
            ) : (
              <>
                Continue to Farm
              </>
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
              href="https://twitter.com/lighterfarm"
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
              href="https://t.me/lighterfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-golden-light/10 hover:bg-golden-light/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
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