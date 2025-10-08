import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ExternalLink, ArrowRight, X, TrendingUp, DollarSign, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import logo from "@/assets/logo.png";

interface UnstakeSuccessData {
    transaction_id: string;
    tx_hash: string;
    unstaked_amount: string;
    penalty_fee: string;
    rewards_earned: string;
    total_received: string;
    remaining_staked: string;
    new_usdl_balance: string;
    timestamp: string;
}

interface UnstakeSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: UnstakeSuccessData | null;
    onUnstakeAgain?: () => void;
}

const UnstakeSuccessModal: React.FC<UnstakeSuccessModalProps> = ({
    isOpen,
    onClose,
    data,
    onUnstakeAgain
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && data) {
            // Animation sequence
            const timer1 = setTimeout(() => setAnimationStep(1), 300);
            const timer2 = setTimeout(() => setAnimationStep(2), 800);
            const timer3 = setTimeout(() => {
                setShowConfetti(true);
                // Haptic feedback for mobile
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]);
                }
            }, 1200);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [isOpen, data]);

    const copyTxHash = () => {
        if (data?.tx_hash) {
            navigator.clipboard.writeText(data.tx_hash);
            toast({
                title: "Copied!",
                description: "Transaction hash copied to clipboard",
                duration: 2000,
            });
        }
    };

    const viewOnExplorer = () => {
        if (data?.tx_hash) {
            // Base network explorer
            window.open(`https://basescan.org/tx/${data.tx_hash}`, '_blank');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTxHash = (hash: string) => {
        return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
    };

    const handleUnstakeAgain = () => {
        onClose();
        if (onUnstakeAgain) {
            onUnstakeAgain();
        }
    };

    const handleGoToDashboard = () => {
        onClose();
        navigate('/dashboard');
    };

    const handleGoToFarm = () => {
        onClose();
        navigate('/unstake');
    };

    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Confetti Animation */}
                    {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 1,
                                        scale: 0,
                                        x: Math.random() * window.innerWidth,
                                        y: window.innerHeight + 50
                                    }}
                                    animate={{
                                        opacity: 0,
                                        scale: 1,
                                        y: -100,
                                        rotate: 360
                                    }}
                                    transition={{
                                        duration: 3,
                                        delay: Math.random() * 0.5,
                                        ease: "easeOut"
                                    }}
                                    className="absolute w-3 h-3 bg-gradient-to-r from-[#D4B679] to-[#A07715] rounded-full"
                                />
                            ))}
                        </div>
                    )}

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-background rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl hide-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X size={16} className="text-gray-300" />
                        </button>

                        {/* Header with Logo */}
                        <div className="text-center pt-8 pb-6 px-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                                className="mx-auto mb-4 w-auto h-auto rounded-full flex items-start justify-end"
                            >
                                <img src={logo} alt="LighterFarm" className="w-auto h-10" />
                            </motion.div>

                            {/* Success Animation */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: animationStep >= 1 ? 1 : 0 }}
                                transition={{ type: "spring", damping: 15, delay: 0.3 }}
                                className="mx-auto mb-4 w-20 h-20 bg-[#A07715]/5 rounded-full flex items-center justify-center border-4 border-[#A07715]"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{
                                        scale: animationStep >= 2 ? 1 : 0,
                                        rotate: animationStep >= 2 ? 0 : -90
                                    }}
                                    transition={{ delay: 0.8, type: "spring", damping: 12 }}
                                >
                                    <Check size={40} className="text-[#A07715]" strokeWidth={3} />
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: animationStep >= 2 ? 1 : 0, y: animationStep >= 2 ? 0 : 20 }}
                                transition={{ delay: 1.0 }}
                            >
                                <h1 className="text-2xl font-bold text-[#A07715] mb-2">Unstake Successful!</h1>
                                <p className="text-gray-400 text-sm">Your USDL has been withdrawn with rewards</p>
                            </motion.div>
                        </div>

                        {/* Main Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: animationStep >= 2 ? 1 : 0, y: animationStep >= 2 ? 0 : 30 }}
                            transition={{ delay: 1.2 }}
                            className="px-6 mb-6"
                        >
                            {/* Total Received - Main Focus */}
                            <div className="bg-card rounded-xl p-4 mb-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="text-sm text-gray-400">Total Received</span>
                                    </div>
                                    <p className="text-4xl font-bold text-[#A07715] mb-1">
                                        ${parseFloat(data.total_received).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-[#D4B679]">USDL</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-card rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-0">
                                        <span className="text-xs text-gray-400">Unstaked Amount</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#D4B679]">
                                        ${parseFloat(data.unstaked_amount).toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-card rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-0">
                                        <span className="text-xs text-gray-400">Rewards Earned</span>
                                    </div>
                                    <p className="text-lg font-bold text-[#D4B679]">
                                        ${parseFloat(data.rewards_earned).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Balance & Penalty Info */}
                            <div className="bg-card rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">New USDL Balance</span>
                                    <span className="text-lg font-bold text-[#D4B679]">
                                        ${parseFloat(data.new_usdl_balance).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-400">Remaining Staked</span>
                                    <span className="text-lg font-bold text-[#D4B679]">
                                        ${parseFloat(data.remaining_staked).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-400">Penalty Fee</span>
                                    <span className="text-sm font-bold text-gray-400">
                                        {parseFloat(data.penalty_fee) > 0 ? `$${parseFloat(data.penalty_fee).toLocaleString()}` : 'None'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Transaction Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: animationStep >= 2 ? 1 : 0, y: animationStep >= 2 ? 0 : 30 }}
                            transition={{ delay: 1.4 }}
                            className="px-6 mb-6"
                        >
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Transaction Details</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-card rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Hash size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-400">TX Hash</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-[#D4B679]">
                                            {formatTxHash(data.tx_hash)}
                                        </span>
                                        <button
                                            onClick={copyTxHash}
                                            className="p-1 hover:bg-[#d4b679] rounded transition-colors"
                                        >
                                            <Copy size={14} className="text-gray-400 hover:text-black" />
                                        </button>
                                        {/* <button
                                            onClick={viewOnExplorer}
                                            className="p-1 hover:bg-[#d4b679] rounded transition-colors"
                                        >
                                            <ExternalLink size={14} className="text-gray-400 hover:text-black" />
                                        </button> */}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-card rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-400">Completed At</span>
                                    </div>
                                    <span className="text-sm text-[#D4B679]">
                                        {formatDate(data.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: animationStep >= 2 ? 1 : 0, y: animationStep >= 2 ? 0 : 30 }}
                            transition={{ delay: 1.6 }}
                            className="px-6 pb-8 space-y-3"
                        >
                            <Button
                                onClick={handleGoToFarm}
                                className="w-full h-12 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                            >
                                Back to Unstake
                            </Button>

                            <Button
                                onClick={handleGoToDashboard}
                                variant="outline"
                                className="w-full h-12 border-[#D4B679]/30 text-[#D4B679] hover:bg-[#D4B679] hover:text-black font-semibold rounded-xl flex items-center justify-center gap-2"
                            >
                                Go to Dashboard
                                <ArrowRight size={18} />
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UnstakeSuccessModal;