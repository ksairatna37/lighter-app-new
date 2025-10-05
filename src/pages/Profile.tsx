import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Download, Key, HelpCircle, MessageCircle, ArrowRight, LogOut, DollarSign, ArrowLeft, LucideIcon, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import deposit from "@/assets/deposit.png";
import withdraw from "@/assets/withdraw.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { useToast } from "@/hooks/use-toast";
import { usePrivy } from '@privy-io/react-auth';


const Profile = () => {
  const { toast } = useToast();

  const navigate = useNavigate();
  const { address, logout, refetchBalance } = useWallet();
  const { ready, authenticated, user, exportWallet } = usePrivy();
  const isAuthenticated = ready && authenticated;
  const hasEmbeddedWallet = !!user.linkedAccounts.find(
    (account) =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.chainType === 'ethereum'
  );
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "🎯 Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handlelogout = async () => {
    await logout();
    toast({
      title: "🎯 Logged out",
      description: "You have been logged out successfully",
      variant: "default",
    });
    navigate("/wallet-connect");
  };


  const paymentItems = [
    {
      icon: deposit,
      label: "Deposit",
      description: "Deposit and earn",
      href: "/deposit",
    },
    {
      icon: withdraw,
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

  const MenuCard = ({ icon: Icon, label, description, href, index, onClick, disabled }: {
    icon: LucideIcon | string,
    label: string,
    description: string,
    href?: string,
    index: number,
    onClick?: () => void,
    disabled?: boolean
  }) => (
    <motion.button
      onClick={onClick ? onClick : () => navigate(href!)}
      disabled={disabled}
      className={`w-full bg-card backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div className="w-12 h-12 bg-golden-light/20 rounded-xl flex items-center justify-center flex-shrink-0">
        {typeof Icon === "string" ? (
          <img src={Icon} alt="" className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6 text-golden-light" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-golden-light mb-0.5">{label}</div>
        <div className="text-sm text-golden-light font-extralight opacity-60">{description}</div>
      </div>
      <div className="w-8 h-8 bg-golden-light rounded-full flex items-center justify-center flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-background" />
      </div>
    </motion.button>
  );

  return (
    <Container className="bg-background min-h-screen pb-24">
      {/* Header - Matching Farm component style */}
      <header className="flex items-center justify-between py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
        >
          <ArrowLeft className="w-8 h-8 text-background" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-golden-light">Profile</h1>
          <p className="text-sm text-golden-light/80">manage account</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* User Greeting Card - Matching card style */}
      <motion.div
        className="p-6 mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 bg-[#a07715] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-black" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-[#a07715] mb-1">{address && formatAddress(address)}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyAddress}
            className="h-8 w-8 text-[#a07715] hover:bg-[#a07715] hover:text-black"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Payment Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Payment</h3>
        <div className="space-y-3">
          {paymentItems.map((item, index) => (
            <MenuCard key={index} {...item} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Account Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Account</h3>
        <div className="space-y-3">
          <MenuCard
            icon={Key}
            label="Private Key"
            description="Export private keys"
            index={paymentItems.length}
            onClick={exportWallet}
            disabled={!isAuthenticated || !hasEmbeddedWallet}
          />
        </div>
      </motion.div>

      {/* Support Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Support</h3>
        <div className="space-y-3">
          {supportItems.map((item, index) => (
            <MenuCard key={index} {...item} index={index + paymentItems.length + accountItems.length} />
          ))}
        </div>
      </motion.div>

      {/* Log Out Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <button
          onClick={handlelogout}
          className="w-full bg-card backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors group"
        >
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <LogOut className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-red-500 mb-0.5">Log Out</div>
            <div className="text-sm text-golden-light font-extralight opacity-60">Sign out of your account</div>
          </div>
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </motion.div>

      {/* App Info Card - Additional information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={logo} alt="" className="h-6 w-auto opacity-80" />
          <span className="text-golden-light font-semibold">Lighter Farm</span>
        </div>
        <div className="text-center">
          <p className="text-sm text-golden-light font-extralight opacity-60 mb-1">Version 1.0.0</p>
          <p className="text-xs text-golden-light font-extralight opacity-40">© 2025 Lighter Farm. All rights reserved.</p>
        </div>
      </motion.div>

      <BottomNavigation />
    </Container>
  );
};

export default Profile;