import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Onboarding2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-between px-8 py-12">
      {/* Top Section with Logo and Content */}
      <div className="flex-1 flex flex-col items-start justify-center w-full max-w-md">
        {/* Lightning Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <Zap className="w-20 h-20 text-accent-primary fill-accent-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl font-bold text-white mb-16"
        >
          LighterFarm
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl text-white/90 mb-8"
        >
          Stake USDL, earn Lighter Points
        </motion.p>

        {/* Pagination Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex gap-2 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </motion.div>
      </div>

      {/* Bottom Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Button
          onClick={() => navigate("/onboarding/3")}
          className="w-full h-14 text-lg font-semibold bg-accent-primary hover:bg-accent-primary/90 text-black rounded-xl"
        >
          Next
        </Button>
      </motion.div>
    </div>
  );
};

export default Onboarding2;
