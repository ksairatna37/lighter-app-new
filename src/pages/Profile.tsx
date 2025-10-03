import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Zap, Download, Key, HelpCircle, MessageCircle, ArrowRight, LogOut, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const paymentItems = [
    {
      icon: DollarSign,
      label: "Deposit",
      description: "Deposit and earn",
      href: "/deposit",
    },
    {
      icon: Download,
      label: "Withdraw",
      description: "Withdraw money into any crypto account",
      href: "/withdraw",
    },
  ];

  const accountItems = [
    {
      icon: Key,
      label: "Private Key",
      description: "Export private keys",
      href: "/private-key",
    },
  ];

  const supportItems = [
    {
      icon: HelpCircle,
      label: "Help and Support",
      description: "Get help and tutorials",
      href: "/help",
    },
    {
      icon: MessageCircle,
      label: "Community",
      description: "Join our telegram and X (formerly twitter)",
      href: "/community",
    },
  ];

  const MenuCard = ({ icon: Icon, label, description, href }: { icon: any, label: string, description: string, href: string }) => (
    <motion.button
      onClick={() => navigate(href)}
      className="w-full bg-card/50 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-card/70 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-accent-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-accent-primary mb-0.5">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-background" />
      </div>
    </motion.button>
  );

  return (
    <Container className="bg-background">
      <PageHeader 
        title="Profile" 
        showBack={true}
      >
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Zap className="w-5 h-5 text-accent-primary fill-accent-primary" />
        </Button>
      </PageHeader>

      {/* User Greeting */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-accent-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-background" />
        </div>
        <h2 className="text-2xl font-bold text-accent-primary">Hi there!</h2>
      </div>

      {/* Payment Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-accent-primary mb-4">Payment</h3>
        <div className="space-y-3">
          {paymentItems.map((item, index) => (
            <MenuCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-accent-primary mb-4">Account</h3>
        <div className="space-y-3">
          {accountItems.map((item, index) => (
            <MenuCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-accent-primary mb-4">Support</h3>
        <div className="space-y-3">
          {supportItems.map((item, index) => (
            <MenuCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Log Out */}
      <button 
        onClick={() => console.log("Log out")}
        className="flex items-center gap-2 text-accent-primary font-semibold mb-24 hover:opacity-80 transition-opacity"
      >
        <span>Log Out</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <BottomNavigation />
    </Container>
  );
};

export default Profile;