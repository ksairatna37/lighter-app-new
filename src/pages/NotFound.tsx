import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";

const NotFound = () => {
  const navigate = useNavigate();

  // Memoized navigation handlers
  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Container className="bg-background min-h-screen justify-start flex flex-col">
      {/* Custom header matching LighterFarm theme */}
      <header className="flex items-center justify-between py-6 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-8 h-8 text-background" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Page Not Found</h1>
          <p className="text-sm text-golden-light/80">Lost in the farm?</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>
     

      {/* Main Content - Mobile centered */}
      <div className="flex flex-col mt-16 items-center justify-center py-16 px-4 text-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 max-w-sm"
        >
       

          {/* 404 Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl font-bold text-[#D4B679] mb-3"
          >
            404
          </motion.h1>

          {/* Error Message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl font-semibold text-[#D4B679] mb-4"
          >
            Page Not Found
          </motion.h2>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8 px-4 py-2 bg-[#D4B679]/10 rounded-full border border-[#D4B679]/20"
          >
            <Sparkles className="w-4 h-4 text-[#D4B679]/70" />
            <span className="text-[#D4B679]/70 text-sm font-medium">Lost in the farm</span>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="w-full max-w-sm space-y-3"
        >
          {/* Home Button - Primary */}
          <Button
            onClick={handleGoHome}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl flex items-center justify-center gap-3 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span>Return to Farm</span>
          </Button>

         
        </motion.div>

      
      </div>

      {/* Farm Tips Section */}
  
      
      <BottomNavigation />
    </Container>
  );
};

export default NotFound;