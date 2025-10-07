import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Trophy,
    Gift,
    Coins,
    ArrowRight,
    Timer,
    Zap,
    Star,
    Crown,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import slice from "@/assets/Slice.png";

const WelcomeCongratulations = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Confetti and step progression animation
    useEffect(() => {
        // Trigger confetti animation
        const confettiTimer = setTimeout(() => {
            setShowConfetti(true);
        }, 500);

        // Step progression animation
        const stepTimer = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % 3);
        }, 2000);

        return () => {
            clearTimeout(confettiTimer);
            clearInterval(stepTimer);
        };
    }, []);

    const handleClaimNow = useCallback(() => {
        navigate("/deposit");
    }, [navigate]);

    const bonusFeatures = [
        {
            icon: Crown,
            title: "VIP Status",
            description: "Early adopter privileges"
        },
        {
            icon: Zap,
            title: "2x Multiplier",
            description: "Double rewards for 30 days"
        },
        {
            icon: Star,
            title: "Premium Support",
            description: "Priority customer service"
        }
    ];

    const steps = [
        { icon: Gift, text: "Welcome Bonus Ready" },
        { icon: Coins, text: "1 Lighter Point Waiting" },
        { icon: Trophy, text: "Join Elite Farmers" }
    ];

    return (
        <div className="min-h-screen bg-background overflow-hidden relative">


            {/* Confetti Animation */}
            <AnimatePresence>
                {showConfetti && (
                    <>
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-[#D4B679] rounded-full z-10"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                initial={{ scale: 0, rotate: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    rotate: [0, 360, 720],
                                    opacity: [0, 1, 0],
                                    y: [-50, 50, -50],
                                    x: [-25, 25, -25]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 relative z-20">

                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-8"
                >
                    <div className="relative mb-6">
                        <img src={logo} alt="LighterFarm" className="w-auto h-20 mx-auto" />

                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-4xl font-bold text-[#D4B679] mb-2"
                    >
                        Congratulations!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-lg text-[#D4B679]/80"
                    >
                        Welcome to the LighterFarm Elite!
                    </motion.p>
                </motion.div>

                {/* Main Bonus Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-br from-[#D4B679]/20 to-[#7D5A02]/10 border-2 border-[#D4B679]/30 rounded-3xl p-8 mb-8 max-w-sm w-full relative overflow-hidden"
                >
                    {/* Glowing Background Effect */}
                    <motion.div
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-[#D4B679]/10 to-transparent rounded-3xl"
                    />

                    <div className="relative z-10 text-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-20 h-20 bg-[#D4B679]/20 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <Gift className="w-10 h-10 text-[#D4B679]" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-[#D4B679] mb-2">
                            Welcome Bonus
                        </h2>

                        <div className="flex items-center justify-center gap-2 mb-4">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Coins className="w-8 h-8 text-[#D4B679]" />
                            </motion.div>
                            <span className="text-3xl font-bold text-[#D4B679]">1</span>
                            <span className="text-xl text-[#D4B679]/80">Lighter Point</span>
                        </div>

                        <p className="text-sm text-[#D4B679]/70 leading-relaxed">
                            Your exclusive welcome bonus is ready to claim!
                            Make your first deposit to unlock this reward.
                        </p>
                    </div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="flex items-center justify-center gap-4 mb-8 max-w-sm w-full"
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={`flex flex-col items-center gap-2 ${currentStep === index ? 'opacity-100' : 'opacity-50'
                                }`}
                            animate={{
                                scale: currentStep === index ? 1.1 : 1,
                                opacity: currentStep === index ? 1 : 0.5
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep === index
                                    ? 'bg-[#D4B679]/30 border-2 border-[#D4B679]'
                                    : 'bg-[#D4B679]/10 border border-[#D4B679]/30'
                                }`}>
                                <step.icon className="w-6 h-6 text-[#D4B679]" />
                            </div>
                            <span className="text-xs text-[#D4B679]/70 text-center max-w-[80px]">
                                {step.text}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>



                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="w-full max-w-sm space-y-3"
                >
                    {/* Primary CTA */}
                    <Button
                        onClick={handleClaimNow}
                        className="w-full h-14 bg-gradient-to-r from-[#7D5A02] to-[#A07715] hover:opacity-90 text-white text-lg font-bold rounded-xl flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ x: [-100, 100] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <span className="relative z-10">Claim My Bonus Now!</span>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ChevronRight className="w-5 h-5 relative z-10" />
                        </motion.div>
                    </Button>


                </motion.div>

                {/* FOMO Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.6 }}
                    className="text-center mt-6 max-w-sm"
                >
                    <p className="text-[#D4B679]/60 text-sm leading-relaxed">
                        🔥 Limited time offer for new members only!
                        <br />
                        <span className="text-[#D4B679] font-semibold">
                            Start farming now to maximize your rewards.
                        </span>
                    </p>
                </motion.div>

                {/* Floating Achievement Badge */}

                {/* Success Particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#D4B679]/40 rounded-full"
                        style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 3) * 20}%`,
                        }}
                        animate={{
                            y: [-20, -40, -20],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.5, 0.5]
                        }}
                        transition={{
                            duration: 3 + i * 0.2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default WelcomeCongratulations;