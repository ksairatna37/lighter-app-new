import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";

export function Splash() {
  const navigate = useNavigate();

  // Memoized navigation handler
  const handleNavigation = useCallback(() => {
    navigate("/onboarding/1");
  }, [navigate]);

  // Auto redirect timer
  useEffect(() => {
    const timer = setTimeout(handleNavigation, 4000);
    return () => clearTimeout(timer);
  }, [handleNavigation]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4">


      {/* Top Section with Logo and Content - Matching Onboarding1 structure */}
      <div className="flex-1 flex flex-col items-start justify-center w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <img src={logo} alt="Lighter Farm" className="w-auto h-20" />
            
            {/* Pulsing glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: 1.5,
                ease: "easeInOut"
              }}
              className="absolute inset-0 w-20 h-20 bg-[#D4B679]/30 rounded-full blur-xl"
            />
          </div>
        </motion.div>

        {/* Main Title - Matching Onboarding1 style */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl font-bold text-golden-light mb-4"
        >
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="inline-block"
          >
            Farm.{" "}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="inline-block"
          >
            Buy.{" "}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="inline-block"
          >
            Trade.
          </motion.span>
        </motion.h1>

        {/* Secondary Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-5xl font-bold text-golden-light mb-4"
        >
          Lighter Points.
        </motion.h2>

        {/* Description - Matching Onboarding1 style */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-md w-[80%] mb-6 font-extralight leading-relaxed text-golden-light/80"
        >
          The future of DeFi farming is here with zero hassle.
        </motion.p>

        {/* Built for Badge - Matching Onboarding1 style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex items-center gap-2 text-golden-light/70 flex-wrap mb-6"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-md font-medium tracking-wider">LIGHTERFARM</span>
          <span className="text-xs bg-golden-light/20 px-2 py-1 rounded-full">v1.0.0</span>
        </motion.div>

        {/* Floating particles - Positioned relative to content */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4B679]/30 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + (i % 2) * 30}%`,
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bottom Section with Continue Button - Matching Onboarding1 structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="w-full max-w-md space-y-4"
      >
        {/* Continue Button - Similar to Onboarding1 Get Started button */}
        <motion.button
          onClick={handleNavigation}
          className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Continue</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.button>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4, 0.6].map((delay, index) => (
              <motion.div
                key={index}
                className="w-1.5 h-1.5 bg-[#D4B679]/40 rounded-full"
                animate={{
                  backgroundColor: [
                    "rgba(212, 182, 121, 0.4)", 
                    "rgba(212, 182, 121, 1)", 
                    "rgba(212, 182, 121, 0.4)"
                  ],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Splash;