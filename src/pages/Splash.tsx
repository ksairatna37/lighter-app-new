import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/onboarding/1");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate("/onboarding/1");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Large Circle Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-background rounded-full z-0" />
      
      {/* Golden curved shape bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-accent-primary rounded-t-[50%] z-0" />
      
      {/* White curved shape at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-white rounded-t-[50%] z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-8">
        {/* Lightning Icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className="mb-12"
        >
          <Zap className="w-32 h-32 text-accent-primary fill-accent-primary" />
        </motion.div>

        {/* Text with staggered animation */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-block"
            >
              Farm.{" "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="inline-block"
            >
              Buy.{" "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="inline-block"
            >
              Trade.
            </motion.span>
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Lighter Points.
          </motion.h2>
        </div>
      </div>

      {/* Skip/Continue Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={handleSkip}
        className="absolute bottom-[12vh] left-1/2 -translate-x-1/2 z-30 w-16 h-16 bg-background rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
};

export default Splash;
