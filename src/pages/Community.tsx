import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Users, Twitter, Send, ExternalLink, Globe, Hash, Bell } from "lucide-react";
import logo from "@/assets/logo.png";

const Community = () => {
  const navigate = useNavigate();

  const socialPlatforms = [
    {
      name: "Telegram",
      description: "Join our main community chat",
      icon: <svg className="w-8 h-8 " viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>,
      members: "12.5K",
      url: "https://t.me/+sKmppf_5gNo5YzRl",
      color: "bg-blue-500"
    },
    {
      name: "Twitter (X)",
      description: "Follow us for latest updates",
      icon: <svg className="w-6 h-6 " viewBox="0 0 23 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>,
      members: "8.2K",
      url: "https://x.com/LighterFarm",
      color: "bg-black"
    },

    {
      name: "Website",
      description: "Visit our official website",
      icon: <Globe className="w-6 h-6" />,
      members: "Official",
      url: "https://lighter.farm",
      color: "bg-[#D4B679]"
    }
  ];

  const communityFeatures = [
    {
      title: "Community Rewards",
      description: "Earn points for active participation",
      icon: <Users className="w-5 h-5" />,
      reward: "+50 points"
    },
    {
      title: "Daily Discussions",
      description: "Join daily market discussions",
      icon: <MessageCircle className="w-5 h-5" />,
      reward: "+10 points"
    },
    {
      title: "Event Notifications",
      description: "Get notified about special events",
      icon: <Bell className="w-5 h-5" />,
      reward: "Exclusive"
    }
  ];

  const recentUpdates = [
    {
      type: "announcement",
      title: "New Staking Rewards Program",
      time: "2 hours ago",
      preview: "Introducing enhanced APY rates for long-term stakers..."
    },
    {
      type: "update",
      title: "Platform Maintenance Complete",
      time: "6 hours ago",
      preview: "All systems are now running smoothly after the scheduled update..."
    },
    {
      type: "event",
      title: "Community AMA Session",
      time: "1 day ago",
      preview: "Join us for a live Q&A session with the development team..."
    }
  ];

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

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
          <h1 className="text-xl font-bold text-[#D4B679]">Community</h1>
          <p className="text-sm text-[#D4B679]/80">Join our telegram and X (formerly twitter)</p>
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
            <Users className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#a07715]">Join Our Community</h2>
            <p className="text-sm text-gray-400">Connect with fellow farmers</p>
          </div>
        </div>
        <p className="text-[#a07715] text-sm">
          Be part of our growing community! Get the latest updates, participate in discussions, and earn rewards.
        </p>
      </motion.div>

      {/* Social Platforms */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Connect With Us</h3>
        <div className="grid gap-3">
          {socialPlatforms.map((platform, index) => (
            <motion.button
              key={index}
              onClick={() => openLink(platform.url)}
              className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-4 flex items-center gap-4 hover:bg-[#3a3939] transition-colors group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 bg-[#D4B679]/20 rounded-full flex items-center justify-center`}>
                {platform.icon}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[#D4B679] font-semibold">{platform.name}</h4>
                <p className="text-gray-400 text-sm">{platform.description}</p>
              </div>
           
              <div className="w-6 h-6 bg-[#D4B679] rounded-full flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-black" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Community Features */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Community Benefits</h3>
        <div className="grid gap-3">
          {communityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-4 flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="w-10 h-10 bg-[#D4B679]/20 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-[#D4B679] font-semibold">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
              <div className="bg-[#D4B679]/10 text-gray-400 px-3 py-1 rounded-full text-xs font-extalight">
                {feature.reward}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Updates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-[#D4B679] mb-4">Recent Updates</h3>
        <div className="bg-[#2a2929] border border-[#D4B679]/20 rounded-xl p-6">
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#3a3939] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-[#D4B679]/20 rounded-full flex items-center justify-center mt-1">
                  <Hash className="w-4 h-4 text-[#D4B679]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#D4B679] font-semibold text-sm">{update.title}</h4>
                    <span className="text-gray-500 text-xs">{update.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{update.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Community Stats */}
  

      <BottomNavigation />
    </Container>
  );
};

export default Community;