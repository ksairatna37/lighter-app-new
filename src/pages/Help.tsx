import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, BookOpen, Video, Mail, ExternalLink, HelpCircle, FileText, Settings } from "lucide-react";
import logo from "@/assets/logo.png";

const Help = () => {
  const navigate = useNavigate();

  const helpSections = [
    {
      title: "Getting Started",
      description: "Learn the basics of LighterFarm",
      icon: <BookOpen className="w-6 h-6" />,
      items: [
        "How to create an account",
        "Connecting your wallet",
        "Making your first deposit",
        "Understanding USDL tokens"
      ]
    },
    {
      title: "Farming & Staking",
      description: "Maximize your rewards",
      icon: <Settings className="w-6 h-6" />,
      items: [
        "How to stake USDL",
        "Understanding APY rates",
        "Unstaking process",
        "Reward calculations"
      ]
    },
    {
      title: "Trading Points",
      description: "Buy and sell Lighter Points",
      icon: <MessageCircle className="w-6 h-6" />,
      items: [
        "How to buy points",
        "Selling your points",
        "Understanding price impact",
        "Market analysis tools"
      ]
    }
  ];

  const quickActions = [

    {
      title: "Contact Support",
      description: "Get direct help from our team",
      icon: <Mail className="w-5 h-5" />,
      action: () => window.open("mailto:bd@melloai.health", "_blank")
    },
    {
      title: "Documentation",
      description: "Read detailed guides",
      icon: <FileText className="w-5 h-5" />,
      action: () => window.open("https://docs.lighterfarm.com", "_blank")
      
    }
  ];

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 bg-[#D4B679] rounded-full hover:bg-[#A07715]"
        >
          <ArrowLeft className="w-8 h-8 text-black" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-[#D4B679]">Help and Support</h1>
          <p className="text-sm text-[#D4B679]/80">Get help and tutorials</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Welcome Message */}
      <motion.div
        className="bg-[#2a2929] border border-[#a07715]/20 rounded-2xl p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#a07715] rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#a07715]">Need Help?</h2>
            <p className="text-sm text-gray-400">We're here to help you succeed</p>
          </div>
        </div>
        <p className="text-[#a07715] text-sm">
          Find answers to common questions, watch tutorials, or contact our support team directly.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Quick Actions</h3>
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={action.action}
              className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-4 flex items-center gap-4 hover:bg-[#3a3939] transition-colors group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 bg-[#D4B679]/20 rounded-full flex items-center justify-center group-hover:bg-[#D4B679]/30 transition-colors">
                {action.icon}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[#D4B679] font-semibold">{action.title}</h4>
                <p className="text-gray-400 text-sm">{action.description}</p>
              </div>
              <div className="w-6 h-6 bg-[#D4B679] rounded-full flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-black" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Help Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Help Topics</h3>
        <div className="space-y-4">
          {helpSections.map((section, index) => (
            <motion.div
              key={index}
              className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#D4B679]/20 rounded-full flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h4 className="text-[#D4B679] font-semibold">{section.title}</h4>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#3a3939] transition-colors cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-[#D4B679] rounded-full"></div>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Frequently Asked Questions</h3>
        <div className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-6">
          <div className="space-y-4">
            <div className="border-b border-[#D4B679]/10 pb-4">
              <h4 className="text-[#D4B679] font-semibold mb-2">What is USDL?</h4>
              <p className="text-gray-300 text-sm">USDL is our platform token used for farming and earning rewards on LighterFarm.</p>
            </div>
            <div className="border-b border-[#D4B679]/10 pb-4">
              <h4 className="text-[#D4B679] font-semibold mb-2">How do I earn rewards?</h4>
              <p className="text-gray-300 text-sm">Stake your USDL tokens to earn points and participate in our farming ecosystem.</p>
            </div>
            <div>
              <h4 className="text-[#D4B679] font-semibold mb-2">Is my wallet secure?</h4>
              <p className="text-gray-300 text-sm">Yes, we use industry-standard security measures and your private keys remain in your control.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Help;