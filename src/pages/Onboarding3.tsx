import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Onboarding3 = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const handleNext = () => {
    navigate("/wallet-connect");
  };

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
          className="text-5xl font-bold text-white mb-12"
        >
          LighterFarm
        </motion.h1>

        {/* Stay Connected Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center gap-3 text-white mb-8"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xl font-medium">Stay Connected</span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg text-white/80 mb-12 leading-relaxed"
        >
          Get alpha, exclusive drops, and community support.
        </motion.p>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex gap-4 mb-12"
        >
          {/* X (Twitter) Icon */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center hover:bg-accent-primary/90 transition-colors"
          >
            <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Telegram Icon */}
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center hover:bg-accent-primary/90 transition-colors"
          >
            <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full max-w-md flex gap-4"
      >
        <Button
          onClick={handleSkip}
          variant="outline"
          className="flex-1 h-14 text-lg font-semibold bg-transparent border-2 border-white/20 text-white hover:bg-white/10 rounded-xl"
        >
          Skip
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 h-14 text-lg font-semibold bg-accent-primary hover:bg-accent-primary/90 text-black rounded-xl"
        >
          Next
        </Button>
      </motion.div>
    </div>
  );
};

export default Onboarding3;
