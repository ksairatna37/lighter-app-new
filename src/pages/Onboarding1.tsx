import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import lighter from "@/assets/lighter.png";

const Onboarding1 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6">
      {/* Top Section with Logo and Content */}
      <div className="flex-1 flex flex-col items-start justify-end w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <img src={logo} alt="Lighter Farm" className="w-auto h-20" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl font-bold text-golden-light mb-4"
        >
          LighterFarm
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-md w-[80%]  mb-6 font-extralight leading-relaxed"
        >
          The smartest way to farm, buy, and trade Lighter Points with zero hassle.
        </motion.p>

        {/* Built for Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-2 text-white flex-wrap mb-6"
        >
          <span className="text-2xl">💛</span>
          <span className="text-md font-medium">Built for the</span>
          <img src={lighter} alt="" className="h-16 w-auto mb-1" />
          <span className="text-md font-medium">Protocol ecosystem</span>
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
          className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50"
        >
          Get Started
        </Button>
      </motion.div>

    </div>
  );
};

export default Onboarding1;
