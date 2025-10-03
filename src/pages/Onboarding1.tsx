import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Onboarding1 = () => {
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
          className="text-5xl font-bold text-white mb-8"
        >
          LighterFarm
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-white/80 mb-12 leading-relaxed"
        >
          The smartest way to farm, buy, and trade Lighter Points with zero hassle.
        </motion.p>

        {/* Built for Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-2 text-white"
        >
          <span className="text-2xl">💛⚡</span>
          <span className="text-base">Built for the</span>
          <Zap className="w-5 h-5 text-white fill-white" />
          <span className="text-base font-semibold">Lighter Protocol ecosystem</span>
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
          onClick={() => navigate("/onboarding/2")}
          className="w-full h-14 text-lg font-semibold bg-accent-primary hover:bg-accent-primary/90 text-black rounded-xl"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
};

export default Onboarding1;
