import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const WalletConnect = () => {
  const navigate = useNavigate();

  const wallets = [
    { name: "Metamask", icon: "🦊" },
    { name: "Binance Wallet", icon: "⚫" },
    { name: "Coinbase Wallet", icon: "🔵" },
    { name: "Trust Wallet", icon: "🛡️" },
    { name: "WalletConnect", icon: "🔗" },
    { name: "More", icon: "•••" },
  ];

  const handleWalletConnect = () => {
    // Simulate wallet connection
    navigate("/wallet-connect/success");
  };

  const handleNoWallet = () => {
    navigate("/wallet-connect/success");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-start justify-between px-8 py-12">
      {/* Top Section */}
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Zap className="w-16 h-16 text-accent-primary fill-accent-primary mb-8" />
          <h1 className="text-5xl font-bold text-white">LighterFarm</h1>
        </motion.div>
      </div>

      {/* Bottom Section with Wallet Options */}
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Connect Crypto Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[#D4AF6A] rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-black mb-6">Connect Crypto Wallet</h2>
          
          {/* Wallet Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {wallets.map((wallet, index) => (
              <motion.button
                key={wallet.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                onClick={handleWalletConnect}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-black/10 hover:bg-black/20 rounded-2xl transition-colors"
              >
                <span className="text-4xl">{wallet.icon}</span>
                <span className="text-xs font-medium text-black text-center leading-tight">
                  {wallet.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* I don't have a wallet button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={handleNoWallet}
            className="w-full h-14 text-lg font-semibold bg-[#8B6F2B] hover:bg-[#7A5F1F] text-white rounded-xl"
          >
            I don't have a wallet
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletConnect;
