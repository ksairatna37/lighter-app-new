import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const InviteOnly = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");

  const handleContinue = () => {
    if (inviteCode.trim() === "123") {
      toast({
        title: "Success!",
        description: "Welcome to LighterFarm",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Invalid Invite Code",
        description: "Please enter a valid invite code to continue",
        variant: "destructive",
      });
    }
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
        {/* Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[#D4AF6A] rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold text-black mb-4 text-center">Invite Only !</h2>
          <p className="text-base text-black/80 mb-8 text-center leading-relaxed">
            Invite codes unlock higher earning rates and exclusive farming opportunities.
          </p>

          {/* Input Field */}
          <Input
            type="text"
            placeholder="Enter Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="h-14 text-lg bg-[#D4AF6A] border-2 border-black/30 text-black placeholder:text-black/50 rounded-xl mb-6"
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          />
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold bg-[#8B6F2B] hover:bg-[#7A5F1F] text-white rounded-xl"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteOnly;
