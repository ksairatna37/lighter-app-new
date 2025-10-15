import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  QrCode,
  Clock,
  Wallet,
  FileText,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import QRCode from "qrcode";

// ===== TYPES =====
interface TrackingState {
  status: 'tracking' | 'completed' | 'expired';
  externalWalletAddress: string;
  selectedAmount: number | null;
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
}

const DepositExternal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = usePrivy();

  // Form states
  const [externalWalletAddress, setExternalWalletAddress] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // UI states
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDepositStarted, setIsDepositStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isRestoringState, setIsRestoringState] = useState(true);

  // Our receiving address (replace with actual address from backend)
  const RECEIVING_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Amount options with points
  const amounts = [
    { value: 100, points: 24.9 },
    { value: 250, points: 62.3 },
    { value: 500, points: 124.7 },
    { value: 1000, points: 249.4 },
  ];

  // ===== LOCALSTORAGE UTILITIES =====
  const getStorageKey = () => {
    if (!user?.id) return null;
    return `${user.id}_trackexternaldeposit`;
  };

  const saveTrackingState = (state: TrackingState) => {
    const key = getStorageKey();
    if (!key) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(state));
      console.log('✅ Tracking state saved to localStorage:', state);
    } catch (error) {
      console.error('❌ Failed to save tracking state:', error);
    }
  };

  const loadTrackingState = (): TrackingState | null => {
    const key = getStorageKey();
    if (!key) return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const state: TrackingState = JSON.parse(stored);
      console.log('📦 Loaded tracking state from localStorage:', state);
      return state;
    } catch (error) {
      console.error('❌ Failed to load tracking state:', error);
      return null;
    }
  };

  const clearTrackingState = () => {
    const key = getStorageKey();
    if (!key) return;

    try {
      localStorage.removeItem(key);
      console.log('🗑️ Tracking state cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear tracking state:', error);
    }
  };

  // ===== RESTORE STATE ON MOUNT =====
  useEffect(() => {
    if (!user?.id) {
      setIsRestoringState(false);
      return;
    }

    const restoreState = () => {
      const savedState = loadTrackingState();
      
      if (!savedState) {
        setIsRestoringState(false);
        return;
      }

      // Check if tracking session is still valid
      const now = new Date();
      const expiresAt = new Date(savedState.expiresAt);
      const remainingSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      if (remainingSeconds <= 0) {
        // Session expired
        console.log('⏰ Tracking session expired');
        clearTrackingState();
        toast({
          title: "⏰ Session Expired",
          description: "Your previous deposit tracking session has expired.",
          variant: "destructive",
        });
        setIsRestoringState(false);
        return;
      }

      // Restore state
      console.log('🔄 Resuming tracking session...');
      setExternalWalletAddress(savedState.externalWalletAddress);
      setSelectedAmount(savedState.selectedAmount);
      setIsValidAddress(true); // Already validated before
      setIsDepositStarted(true);
      setTimeLeft(remainingSeconds);

      toast({
        title: "🔄 Session Resumed",
        description: `Tracking resumed with ${Math.floor(remainingSeconds / 60)} minutes remaining`,
      });

      setIsRestoringState(false);
    };

    restoreState();
  }, [user?.id]);

  // Validate Ethereum address
  const validateAddress = (address: string) => {
    if (!address) {
      setIsValidAddress(false);
      setAddressError("");
      return;
    }

    try {
      const isValid = ethers.isAddress(address);
      setIsValidAddress(isValid);

      if (!isValid) {
        setAddressError("Invalid Ethereum address format");
      } else {
        setAddressError("");
      }
    } catch (error) {
      setIsValidAddress(false);
      setAddressError("Invalid address format");
    }
  };

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setExternalWalletAddress(value);
    validateAddress(value);
  };

  // Generate QR code when showQR is enabled
  useEffect(() => {
    if (showQR && RECEIVING_ADDRESS) {
      QRCode.toDataURL(RECEIVING_ADDRESS, {
        width: 256,
        margin: 2,
        color: {
          dark: '#A07715',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error('QR Code generation failed:', err);
        });
    }
  }, [showQR, RECEIVING_ADDRESS]);

  // Timer countdown effect
  useEffect(() => {
    if (!isDepositStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDepositStarted, timeLeft]);

  // Handle timer expiration
  const handleTimerExpired = () => {
    // Clear localStorage
    clearTrackingState();

    toast({
      title: "⏰ Time Expired",
      description: "The deposit window has closed. Please start a new deposit.",
      variant: "destructive",
    });

    // Reset form
    setIsDepositStarted(false);
    setTimeLeft(600);
    setExternalWalletAddress("");
    setSelectedAmount(null);
    setIsValidAddress(false);
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-500';
    if (timeLeft <= 180) return 'text-orange-500';
    return 'text-green-500';
  };

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Copy receiving address to clipboard
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(RECEIVING_ADDRESS);
      toast({
        title: "🎯 Address Copied!",
        description: "Receiving address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy address",
        variant: "destructive",
      });
    }
  };

  // Handle Start Deposit button click
  const handleStartDeposit = () => {
    if (!isValidAddress || !externalWalletAddress || !selectedAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid wallet address and select an amount",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmDeposit = async () => {
    setShowConfirmModal(false);

    // Calculate timestamps
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    // Save to localStorage
    const trackingState: TrackingState = {
      status: 'tracking',
      externalWalletAddress,
      selectedAmount,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    saveTrackingState(trackingState);

    // Start tracking
    setIsDepositStarted(true);
    setTimeLeft(600); // Reset to 10 minutes

    toast({
      title: "🚀 Deposit Started",
      description: "Send USDC to the address below within 10 minutes",
    });

    // TODO: Call backend API to start deposit tracking
    /*
    try {
      const response = await axios.post('/api/deposit/external/start', {
        user_id: user.id,
        external_wallet_address: externalWalletAddress,
        amount: selectedAmount,
        receiving_address: RECEIVING_ADDRESS
      }, {
        headers: {
          'X-Privy-User-Id': user.id,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Backend will track transaction for 10 minutes
        console.log('✅ Deposit tracking started:', response.data);
      }
    } catch (error) {
      console.error("❌ Failed to start deposit tracking:", error);
      // Clear localStorage if API fails
      clearTrackingState();
      setIsDepositStarted(false);
      
      toast({
        title: "Error",
        description: "Failed to start deposit. Please try again.",
        variant: "destructive",
      });
    }
    */
  };

  // ===== SIMULATE DEPOSIT SUCCESS (for testing) =====
  // Remove this in production - backend will handle detection
  const handleDepositSuccess = () => {
    // Clear tracking state
    clearTrackingState();

    // Navigate to success page with data
    navigate("/deposit/success", {
      state: {
        amount: selectedAmount,
        pointsEarned: 100, // Replace with actual from API
        pointsValue: (100 * 4.005).toFixed(2),
        newBalance: 500, // Replace with actual from API
        transactionHash: "0x123456...", // Replace with actual from API
        blockNumber: 12345678,
        gasUsed: 45000,
        referralInfo: null,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    });
  };

  // Check if CTA button should be enabled
  const isCTAEnabled = isValidAddress && externalWalletAddress.length > 0 && selectedAmount !== null;

  // Show loading state while restoring
  if (isRestoringState) {
    return (
      <Container className="bg-background min-h-screen pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-golden-light/30 border-t-golden-light rounded-full mx-auto mb-4"
          />
          <p className="text-golden-light">Checking for active session...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="bg-background min-h-screen pb-24 px-4">
      {/* Header */}
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
          <h1 className="text-xl font-bold text-golden-light">External Wallet</h1>
          <p className="text-sm text-golden-light/80">deposit from any wallet</p>
        </div>

        <img src={logo} alt="" className="h-8 w-auto" />
      </header>

      {/* Timer Display (shown when deposit started) */}
      {isDepositStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#7D5A02] to-[#A07715] rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-white" />
              <div>
                <p className="text-white/80 text-xs">Time Remaining</p>
                <p className={`text-2xl font-bold ${getTimerColor()}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-sm">Tracking...</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-golden-light font-semibold text-sm mb-1">
              How External Wallet Deposit Works
            </h3>
            <p className="text-golden-light/70 text-xs leading-relaxed">
              Enter your external wallet address, we'll track your USDC deposit for 10 minutes.
              Send from the exact address you entered to ensure proper matching.
            </p>
          </div>
        </div>
      </motion.div>

      {/* External Wallet Address Input */}
      <motion.div
        className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-golden-light text-lg font-semibold">Your External Wallet</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-golden-light/20 text-golden-light hover:bg-golden-light/30"
            onClick={() => {
              toast({
                title: "💡 Why do we ask?",
                description: "We need your sending address to match and credit your deposit correctly.",
              });
            }}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Input
            type="text"
            placeholder="0x..."
            value={externalWalletAddress}
            onChange={handleAddressChange}
            disabled={isDepositStarted}
            className={`h-12 bg-background border-2 ${externalWalletAddress && !isValidAddress
                ? 'border-red-500'
                : isValidAddress
                  ? 'border-green-500'
                  : 'border-border'
              } text-golden-light placeholder:text-muted-foreground`}
          />
          {externalWalletAddress && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidAddress ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>

        {addressError && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {addressError}
          </p>
        )}

        {isValidAddress && (
          <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Valid Ethereum address
          </p>
        )}

        {/* Warning */}
        <div className="mt-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
          <p className="text-yellow-600 dark:text-yellow-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Important:</strong> Send USDC only from the address you entered above.
              Deposits from different addresses may not be matched.
            </span>
          </p>
        </div>
      </motion.div>

      {/* Choose Amount */}
      {!isDepositStarted && (
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-golden-light text-lg font-semibold mb-4">Choose Amount:</h3>
          <div className="grid grid-cols-4 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount.value}
                onClick={() => setSelectedAmount(amount.value)}
                disabled={isDepositStarted}
                className={`bg-[#D4B679]/90 hover:bg-[#D4B679] rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedAmount === amount.value ? 'ring-2 ring-golden-light scale-105' : ''
                  }`}
              >
                <span className="text-xl font-bold text-background">${amount.value}</span>
                <span className="text-xs text-background/70 mt-1">(~{amount.points}pt)</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-golden-light/60 text-center mt-3">
            Select amount to track your deposit
          </p>
        </motion.div>
      )}

      {/* Receiving Address Section - Shown after form filled or deposit started */}
      {(isValidAddress || isDepositStarted) && (
        <motion.div
          className={`border-2 rounded-2xl p-4 mb-6 ${isDepositStarted
              ? 'border-green-500 bg-green-500/5'
              : 'bg-card backdrop-blur-sm border-border'
            }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-golden-light text-lg font-semibold">
              {isDepositStarted ? '💰 Send USDC Here' : 'Our Receiving Address'}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="h-8 text-xs bg-golden-light/20 text-golden-light hover:bg-golden-light/30"
              >
                {showQR ? <FileText className="w-4 h-4 " /> : <QrCode className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Address warning */}
          <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-3 mb-4">
            <p className="text-orange-600 dark:text-orange-400 text-xs flex items-start gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>This address is valid for {formatTime(timeLeft)}.</strong> Send USDC before time expires.
              </span>
            </p>
          </div>

          {/* Display mode toggle */}
          {!showQR ? (
            // Text format
            <div>
              <div
                className="border-2 border-dashed border-golden-light/30 rounded-xl p-4 cursor-pointer hover:border-golden-light/50 transition-colors"
                onClick={handleCopyAddress}
              >
                <div className="flex items-center justify-center gap-3">
                  <Copy className="w-5 h-5 text-golden-light" />
                  <span className="text-golden-light font-mono text-xs break-all">
                    {RECEIVING_ADDRESS}
                  </span>
                </div>
              </div>
              <p className="text-sm text-golden-light font-extralight opacity-60 text-center mt-3">
                Tap to copy address
              </p>
            </div>
          ) : (
            // QR format
            <div className="flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-golden-light/20 rounded-xl"
                />
              ) : (
                <div className="w-64 h-64 bg-golden-light/10 rounded-xl flex items-center justify-center">
                  <p className="text-golden-light/60">Generating QR...</p>
                </div>
              )}
              <p className="text-sm text-golden-light font-extralight opacity-60 text-center mt-3">
                Scan with your wallet app
              </p>
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                size="sm"
                className="mt-3 border-golden-light/30 text-golden-light hover:bg-golden-light/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
            </div>
          )}

          {/* Network reminder */}
          <div className="mt-4 bg-card/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-golden-light" />
              <p className="text-xs text-golden-light/70">
                <strong>Network:</strong> Base Mainnet • <strong>Token:</strong> USDC
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trust Indicators */}
      {!isDepositStarted && (
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-golden-light" />
              </div>
              <span className="text-xs text-golden-light font-extralight opacity-60">10-Min Tracking</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-golden-light" />
              </div>
              <span className="text-xs text-golden-light font-extralight opacity-60">Auto-Detection</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 bg-golden-light/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-golden-light" />
              </div>
              <span className="text-xs text-golden-light font-extralight opacity-60">Secure & Safe</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Start Deposit Button */}
      {!isDepositStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Button
            onClick={handleStartDeposit}
            disabled={!isCTAEnabled}
            className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Start Deposit Tracking
          </Button>
          <p className="text-xs text-golden-light/60 text-center mt-2">
            {!isCTAEnabled && !isValidAddress && "Enter a valid wallet address to continue"}
            {!isCTAEnabled && isValidAddress && !selectedAmount && "Select an amount to continue"}
          </p>
        </motion.div>
      )}

      {/* Deposit Started Status */}
      {isDepositStarted && (
        <motion.div
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-500 animate-pulse" />
            </div>
            <h3 className="text-golden-light text-lg font-semibold mb-2">
              Waiting for Your Deposit
            </h3>
            <p className="text-golden-light/70 text-sm mb-4">
              Send USDC from your external wallet to the address above
            </p>
            <div className="bg-golden-light/5 rounded-lg p-3 mb-3">
              <p className="text-xs text-golden-light/60">
                From: <span className="text-golden-light font-mono">{formatAddress(externalWalletAddress)}</span>
              </p>
              {selectedAmount && (
                <p className="text-xs text-golden-light/60 mt-1">
                  Expected Amount: <span className="text-golden-light font-semibold">${selectedAmount} USDC</span>
                </p>
              )}
            </div>
            <p className="text-xs text-golden-light/60 mb-4">
              We'll automatically detect your transaction and credit your points
            </p>

            {/* TEST BUTTON - Remove in production */}
            <Button
              onClick={handleDepositSuccess}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-500 hover:bg-green-500/10"
            >
              🧪 Simulate Success (Testing Only)
            </Button>
          </div>
        </motion.div>
      )}

      {/* Need Help */}
      <div className="text-center mb-6">
        <button className="text-golden-light hover:text-golden-light/80 font-medium transition-colors text-sm">
          Need help with external wallet deposit?
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-golden-light text-xl font-bold mb-2">
                  Confirm Your Wallet Address
                </h3>
                <p className="text-golden-light/70 text-sm">
                  Please verify this is the correct external wallet address you'll send from
                </p>
              </div>

              <div className="bg-golden-light/5 rounded-lg p-4 mb-6">
                <p className="text-xs text-golden-light/60 mb-2">Your External Wallet:</p>
                <p className="text-golden-light font-mono text-sm break-all">
                  {externalWalletAddress}
                </p>
                {selectedAmount && (
                  <>
                    <p className="text-xs text-golden-light/60 mt-3 mb-1">Amount:</p>
                    <p className="text-golden-light font-semibold">${selectedAmount} USDC</p>
                  </>
                )}
              </div>

              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-6">
                <p className="text-red-500 text-xs">
                  ⚠️ Deposits from different addresses will not be credited. Double-check before confirming.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="border-golden-light/30 text-golden-light hover:bg-golden-light/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDeposit}
                  className="bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white"
                >
                  Confirm & Start
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

export default DepositExternal;