import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { User, Download, Key, HelpCircle, MessageCircle, ArrowRight, LogOut, DollarSign, ArrowLeft, LucideIcon, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useCallback, memo } from "react";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";
import deposit from "@/assets/deposit.png";
import withdraw from "@/assets/withdraw.png";
import { useWallet, useWalletStore } from '@/hooks/useWallet';
import { useToast } from "@/hooks/use-toast";
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { generateAuthToken } from '@/utils/authGenerator';
// ✅ FIXED: Import the function (not a class)
import { retrievePrivateKey } from '../../server/encryption_handler.js';

// Memoized MenuCard component to prevent unnecessary re-renders
const MenuCard = memo(({ icon: Icon, label, description, href, index, onClick, disabled }: {
  icon: LucideIcon | string,
  label: string,
  description: string,
  href?: string,
  index: number,
  onClick?: () => void,
  disabled?: boolean
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  }, [onClick, href, navigate]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full bg-card backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-card/80 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      // Add layout ID to prevent animation replay on re-mount
      layoutId={`menu-card-${label.toLowerCase().replace(' ', '-')}`}
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
});

MenuCard.displayName = 'MenuCard';

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address, logout } = useWallet();
  const { ready, authenticated, user, exportWallet } = usePrivy();
  const stored = localStorage.getItem(user.id);
  const localdata = JSON.parse(stored);

  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isLoadingPrivateKey, setIsLoadingPrivateKey] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // Fetch user account data from backend
  const fetchUserAccount = async () => {
    if (!localdata?.id || !user?.id) {
      console.warn("User ID or Privy ID not found");
      return;
    }

    setIsLoadingAccount(true);

    try {
      const endpoint = `/api/account/${localdata.id}`;
      const authToken = generateAuthToken(endpoint);

      const response = await axios.get(`/api/account/${localdata.id}`, {
        headers: {
          'X-Privy-User-Id': user.id,
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data && response.data.success !== false) {
        console.log('Account data fetched successfully:', response.data);
        setAccountData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch account data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccount(false);
    }
  };

  // Memoize computed values to prevent unnecessary re-calculations
  const isAuthenticated = useMemo(() => ready && authenticated, [ready, authenticated]);

  // Fetch account data when component mounts
  useEffect(() => {
    if (isAuthenticated && localdata?.id) {
      fetchUserAccount();
    }
  }, [isAuthenticated, localdata?.id]);

  const hasEmbeddedWallet = useMemo(() => {
    if (!user?.linkedAccounts) return false;
    return !!user.linkedAccounts.find(
      (account) =>
        account.type === 'wallet' &&
        account.walletClientType === 'privy' &&
        account.chainType === 'ethereum'
    );
  }, [user?.linkedAccounts]);

  const formattedAddress = useMemo(() => {
    if (!localdata.wallet_address) return '';
    return `${localdata.wallet_address.slice(0, 6)}...${localdata.wallet_address.slice(-4)}`;
  }, [address]);

  // Memoize static data to prevent recreation on each render
  const paymentItems = useMemo(() => [
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
      href: "",
      disabled: true, // Feature not available yet
    },
  ], []);

  const supportItems = useMemo(() => [
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
  ], []);

  // Memoize callback functions to prevent recreation
  const copyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(localdata.wallet_address);
      toast({
        title: "✅ Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  }, [localdata.wallet_address, toast]);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await logout();
      toast({
        title: "✅ Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
      navigate("/wallet-connect");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  }, [logout, toast, navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ✅ FIXED: Use the function API instead of class API
  const handleExportWallet = useCallback(async () => {
    if (!isAuthenticated || !hasEmbeddedWallet) {
      toast({
        title: "Not Available",
        description: "Private key export is only available for embedded wallets",
        variant: "destructive",
      });
      return;
    }

    if (!localdata?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPrivateKey(true);

    try {
      console.log('🔐 Starting private key export...');

      // Generate fresh authentication token
      const endpoint = `/api/account/${localdata.id}`;
      const authToken = generateAuthToken(endpoint);

      // ✅ NEW: Call the function directly (not as a class constructor)
      const result = await retrievePrivateKey(localdata.id, authToken);

      if (result.success && result.privateKey) {
        console.log('✅ Private key obtained successfully');
        setPrivateKey(result.privateKey);
        setShowPrivateKeyModal(true);

        toast({
          title: "✅ Success!",
          description: "Private key retrieved successfully",
        });
      } else {
        throw new Error(result.error || 'Failed to retrieve private key');
      }

    } catch (error) {
      console.error('❌ Failed to export private key:', error);

      toast({
        title: "Export Failed",
        description: error.message || "Failed to retrieve private key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrivateKey(false);
    }
  }, [isAuthenticated, hasEmbeddedWallet, localdata, toast]);


  // ===== 4. ADD COPY PRIVATE KEY FUNCTION =====
  const copyPrivateKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      toast({
        title: "✅ Copied!",
        description: "Private key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy private key",
        variant: "destructive",
      });
    }
  }, [privateKey, toast]);


  // ===== 5. ADD CLOSE MODAL FUNCTION =====
  const closePrivateKeyModal = useCallback(() => {
    setShowPrivateKeyModal(false);
    // Clear private key after 100ms for security
    setTimeout(() => {
      setPrivateKey('');
    }, 100);
  }, []);

  // Animation variants to control timing better
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        // Add key to prevent animation replay on prop changes
        key="profile-container"
      >
        {/* Header - Matching Farm component style */}
        <motion.header
          className="flex items-center justify-between py-6"
          variants={itemVariants}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-10 w-10 bg-golden-light rounded-full hover:bg-golden-light/90"
          >
            <ArrowLeft className="w-8 h-8 text-background" />
          </Button>

          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-golden-light">Profile</h1>
            <p className="text-sm text-golden-light/80">manage account</p>
          </div>

          <img src={logo} alt="" className="h-8 w-auto" />
        </motion.header>

        {/* User Greeting Card */}
        <motion.div
          className="p-6 mb-6 text-center"
          variants={itemVariants}
          layoutId="user-greeting"
        >
          <div className="w-20 h-20 bg-[#a07715] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-black" />
          </div>
          <div className="flex items-center justify-center gap-2 ml-2">
            <h2 className="text-2xl font-bold text-[#a07715] mb-1">{formattedAddress}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="h-8 w-8 text-[#a07715] hover:bg-[#a07715] hover:text-black"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {user?.email?.address && (
            <p className="text-md text-[#a07715] font-extralight">{user.email.address}</p>
          )}
        </motion.div>

        {/* Payment Section */}
        <motion.div
          className="mb-6"
          variants={itemVariants}
          layoutId="payment-section"
        >
          <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Payment</h3>
          <div className="space-y-3">
            {paymentItems.map((item, index) => (
              <MenuCard key={`payment-${index}`} {...item} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          className="mb-6"
          variants={itemVariants}
          layoutId="account-section"
        >
          <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Account</h3>
          <div className="space-y-3">
            <MenuCard
              key="private-key"
              icon={isLoadingPrivateKey ? "" : Key}
              label={isLoadingPrivateKey ? "Loading..." : "Private Key"}
              description={isLoadingPrivateKey ? "Retrieving your private key..." : "Export private keys"}
              index={paymentItems.length}
              onClick={handleExportWallet}
              disabled={!isAuthenticated || !hasEmbeddedWallet || isLoadingPrivateKey}
            />
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          className="mb-6"
          variants={itemVariants}
          layoutId="support-section"
        >
          <h3 className="text-lg font-semibold text-golden-light mb-4 px-1">Support</h3>
          <div className="space-y-3">
            {supportItems.map((item, index) => (
              <MenuCard
                key={`support-${index}`}
                {...item}
                index={index + paymentItems.length + 1}
              />
            ))}
          </div>
        </motion.div>

        {/* Log Out Card */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
          layoutId="logout-section"
        >
          <button
            onClick={handleLogout}
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

        {/* App Info Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
          layoutId="app-info"
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
      </motion.div>

      {/* Private Key Modal */}
      <AnimatePresence>
        {showPrivateKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePrivateKeyModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-golden-light/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-golden-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-golden-light" />
                </div>
                <h3 className="text-golden-light text-xl font-bold mb-2">
                  Your Private Key
                </h3>
                <p className="text-golden-light/70 text-sm">
                  Keep this secure and never share with anyone
                </p>
              </div>

              {/* Private Key Display */}
              <div className="bg-background/50 rounded-lg p-4 mb-4 border border-golden-light/20">
                <p className="text-golden-light font-mono text-xs break-all leading-relaxed">
                  {privateKey}
                </p>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-6">
                <p className="text-red-500 text-xs flex items-start gap-2">
                  <span className="text-base">⚠️</span>
                  <span>
                    <strong>Warning:</strong> Anyone with this private key can access your wallet.
                    Store it securely and never share it.
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={copyPrivateKey}
                  className="border-golden-light/30 text-golden-light hover:bg-golden-light/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={closePrivateKeyModal}
                  className="bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white"
                >
                  Close
                </Button>
              </div>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation />
    </Container>
  );
};

export default Profile;