import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";

const Onboarding2 = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Stake USDL, earn Lighter Points",
      description: "Deposit your USDL and watch your Lighter Points grow automatically"
    },
    {
      title: "Trade instantly with zero hassle",
      description: "Buy and sell Lighter Points seamlessly with our intuitive interface"
    },
    {
      title: "Earn 10% from referrals",
      description: "Invite friends and earn 10% of their points forever"
    }
  ];

  // Auto-carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-6">
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

        {/* Carousel Content */}
        <div className="mb-8 min-h-[120px] flex flex-col justify-center">
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Main Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-xl font-semibold text-golden-light mb-0"
            >
              {slides[currentSlide].title}
            </motion.p>

            {/* Sub Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-base text-golden-light/80 leading-relaxed"
            >
              {slides[currentSlide].description}
            </motion.p>
          </motion.div>
        </div>

        {/* Pagination Dots */}
        
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
          className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-background text-lg font-bold rounded-xl text-white disabled:opacity-50"
        >
          Next
        </Button>
      </motion.div>

      {/* Progress indicator for slide timing */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex gap-1">
          {slides.map((_, index) => (
            <div
              key={index}
              className="h-1 bg-golden-light/20 rounded-full overflow-hidden"
              style={{ width: '60px' }}
            >
              <motion.div
                className="h-full bg-golden-light rounded-full"
                initial={{ width: '0%' }}
                animate={{ 
                  width: index === currentSlide ? '100%' : '0%'
                }}
                transition={{ 
                  duration: index === currentSlide ? 3 : 0,
                  ease: "linear"
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding2; 