import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import referbox from "@/assets/referbox.png";
import and from "@/assets/and.png";
import share from "@/assets/Share.png";
const Referrals = () => {
  const [referralCode] = useState("G7215SDF");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "🎯 Code Copied!",
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
    <Container className="bg-background min-h-screen pb-24 px-4">
      {/* Header - Matching Farm component style */}
      <header className="flex items-center justify-between py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-8 h-8 text-background" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Refer Stats</h1>
          <p className="text-sm text-golden-light/80">earn together</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Stats Card - Matching Farm component style */}
      <motion.div 
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-golden-light font-extralight opacity-60">Points Earned</span>
          <span className="text-golden-light font-bold">4.2</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-golden-light font-extralight opacity-60">Remaining Referrals</span>
          <span className="text-golden-light font-bold">2/3</span>
        </div>
      </motion.div>

      {/* Ticket Section */}
      <motion.div 
        className="mb-8 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Ticket Shape - Updated with golden theme */}
        <div className="relative w-full max-w-sm mb-6 items-center flex justify-center">
          <img src={referbox} alt="" className="h-120 w-auto" />
        </div>

        <p className="text-lg text-golden-light text-center mb-8 font-extralight">
          You get <span className="font-bold text-golden-light">10%</span> of their earned points
        </p>

        {/* Divider - Matching golden theme */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-8">
          <div className="flex-1 h-px bg-golden-light/20"></div>
          <div className="flex items-center gap">
            <img src={and} alt="" className="h-18 w-auto" />
          </div>
          <div className="flex-1 h-px bg-golden-light/20"></div>
        </div>

        <p className="text-lg font-extralight text-foreground text-center mb-8">
          Your friend gets <span className="font-bold text-golden-light">1 bonus point</span> on signup
        </p>
      </motion.div>

      {/* Share Button - Matching Farm component style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <Button
          onClick={handleShare}
          className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-md text-white disabled:opacity-50"
        >
          <img src={share} alt="" className="h-6 w-auto" />
          Share Invite
        </Button>
      </motion.div>

      {/* Referral Code Card - Matching card style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
      >
        <h3 className="text-golden-light text-lg font-semibold mb-4">Your Referral Code:</h3>
        <div 
          className="border-2 border-dashed border-golden-light/30 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-golden-light/50 transition-colors"
          onClick={handleCopyCode}
        >
          <Copy className="w-5 h-5 text-golden-light" />
          <span className="text-xl font-mono font-bold text-golden-light tracking-wider">
            {referralCode}
          </span>
        </div>
        <p className="text-sm text-golden-light font-extralight opacity-60 text-center mt-3">
          Tap to copy code
        </p>
      </motion.div>

      {/* Instructions Card - Additional helpful information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
      >
        <h3 className="text-golden-light text-lg font-semibold mb-4">How it works:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-golden-light/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-golden-light text-sm font-bold">1</span>
            </div>
            <p className="text-foreground text-sm">
              Share your referral code with friends
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-golden-light/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-golden-light text-sm font-bold">2</span>
            </div>
            <p className="text-foreground text-sm">
              They sign up and get <span className="font-semibold text-golden-light">1 bonus point</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-golden-light/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-golden-light text-sm font-bold">3</span>
            </div>
            <p className="text-foreground text-sm">
              You earn <span className="font-semibold text-golden-light">10% of their points</span> forever
            </p>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Referrals;