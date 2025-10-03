import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Referrals = () => {
  const [referralCode] = useState("G7215SDF");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Code Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy code",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareText = `Join Lighter Farm with my referral code: ${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Lighter Farm",
          text: shareText,
        });
      } catch (error) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-golden-light rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-background" />
        </button>
        <h1 className="text-xl font-medium text-golden-light">Refer Stats</h1>
        <Zap className="w-8 h-8 text-golden-light" />
      </div>

      {/* Stats Card */}
      <motion.div 
        className="bg-card border border-border rounded-2xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-golden-light">Points Earned</span>
          <span className="text-2xl font-bold text-golden-light">4.2</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-golden-light">Remaining Referrals</span>
          <span className="text-2xl font-bold text-golden-light">2/3</span>
        </div>
      </motion.div>

      {/* Ticket Section */}
      <motion.div 
        className="mb-8 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Ticket Shape */}
        <div className="relative w-full max-w-sm mb-6">
          <svg viewBox="0 0 400 160" className="w-full">
            <path
              d="M 20 20 L 30 10 L 50 30 L 70 10 L 90 30 L 110 10 L 130 30 L 150 10 L 170 30 L 190 10 L 210 30 L 230 10 L 250 30 L 270 10 L 290 30 L 310 10 L 330 30 L 350 10 L 370 20 L 380 80 L 370 140 L 350 150 L 330 130 L 310 150 L 290 130 L 270 150 L 250 130 L 230 150 L 210 130 L 190 150 L 170 130 L 150 150 L 130 130 L 110 150 L 90 130 L 70 150 L 50 130 L 30 150 L 20 140 Z"
              fill="hsl(var(--golden-light))"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-black text-background mb-1">10%</div>
            <div className="text-lg font-medium text-background">of earned points</div>
          </div>
        </div>

        <p className="text-lg text-golden-light text-center mb-8">
          You get 10% of their earned points
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-8">
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <span className="text-golden-light text-xs">★</span>
            <span className="text-4xl font-serif text-golden-light">&</span>
            <span className="text-golden-light text-xs">★</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <p className="text-base text-foreground text-center mb-8">
          Your friend gets <span className="font-bold text-golden-light">1 bonus point</span> on signup
        </p>
      </motion.div>

      {/* Share Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <Button
          onClick={handleShare}
          className="w-full h-14 bg-gradient-to-r from-golden-dark to-golden-light text-background font-bold text-lg hover:opacity-90"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Invite
        </Button>
      </motion.div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-2 border-dashed border-golden-light/50 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-golden-light transition-colors"
        onClick={handleCopyCode}
      >
        <Copy className="w-5 h-5 text-golden-light" />
        <span className="text-xl font-mono font-bold text-golden-light tracking-wider">
          {referralCode}
        </span>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Referrals;
