import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 4 seconds
    const timer = setTimeout(() => {
      navigate("/onboarding/1");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate("/onboarding/1");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 0.05, scale: 1, rotate: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-10 right-10 z-0"
      >
        <img src={slice} alt="" className="w-40 h-40 rotate-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.3, rotate: 45 }}
        animate={{ opacity: 0.03, scale: 1, rotate: 0 }}
        transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-20 left-10 z-0"
      >
        <img src={slice} alt="" className="w-32 h-32 -rotate-12" />
      </motion.div>

      {/* Golden curved shape bottom */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#7D5A02] to-[#A07715] rounded-t-[50%] z-0"
      />
      
      {/* Lighter golden curved shape at very bottom */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-[20vh] bg-[#D4B679] rounded-t-[50%] z-10"
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-8">
        {/* Logo with enhanced animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className="mb-12"
        >
          <div className="relative">
            <img src={logo} alt="Lighter Farm" className="w-32 h-32" />
            {/* Glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute inset-0 w-32 h-32 bg-golden-light/20 rounded-full blur-xl"
            />
          </div>
        </motion.div>

        {/* Text with enhanced staggered animation */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-golden-light leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="inline-block"
            >
              Farm.{" "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="inline-block"
            >
              Buy.{" "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="inline-block"
            >
              Trade.
            </motion.span>
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-golden-light"
          >
            Lighter Points.
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-lg text-golden-light/80 mt-4 font-extralight"
          >
            The future of DeFi farming is here
          </motion.p>
        </div>

        {/* Brand badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="flex items-center gap-2 mt-8"
        >
          <span className="text-golden-light/70 text-sm font-semibold tracking-wider">LIGHTERFARM</span>
        </motion.div>
      </div>

      {/* Enhanced Skip/Continue Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.6, type: "spring", stiffness: 200 }}
        onClick={handleSkip}
        className="absolute bottom-[12vh] left-1/2 -translate-x-1/2 z-30 w-16 h-16 bg-golden-light rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight className="w-8 h-8 text-background group-hover:translate-x-1 transition-transform duration-300" />
        
        {/* Button glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 3 }}
          className="absolute inset-0 w-16 h-16 bg-golden-light/30 rounded-full blur-lg"
        />
      </motion.button>

      {/* Loading progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 z-30"
      >
        <div className="flex gap-2">
          {[0, 0.3, 0.6, 0.9].map((delay, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-golden-light/30 rounded-full"
              animate={{
                backgroundColor: ["rgba(212, 182, 121, 0.3)", "rgba(212, 182, 121, 1)", "rgba(212, 182, 121, 0.3)"]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-golden-light/20 rounded-full z-10"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Version indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
        className="absolute bottom-4 right-4 z-30"
      >
        <span className="text-golden-light/40 text-xs font-mono">v1.0.0-beta</span>
      </motion.div>
    </div>
  );
};

export default Splash;