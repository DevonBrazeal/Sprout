import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Toast from './Toast';
import seedImg from '../assets/sprout_seed.png';
import buddyImg from '../assets/sprout_buddy.png';
import './Onboarding.css';

const Onboarding = ({ onComplete, addPoints }) => {
    const [step, setStep] = useState('drop'); // drop -> idle -> tapped -> vibe -> lockin
    const [toastMessage, setToastMessage] = useState(null);

    // Step 1: Seed drops in
    useEffect(() => {
        if (step === 'drop') {
            const timer = setTimeout(() => {
                setStep('idle');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleSeedTap = () => {
        if (step !== 'idle') return;
        setStep('tapped');
        addPoints('spark', 1);
        showToast("You've started something good.", 1);
    };

    const handleContinue = () => {
        setStep('vibe');
    };

    const handleVibeSelect = (vibe) => {
        setStep('hatch');
        addPoints('sprout', 5);
        showToast("Identity Established.", 5);

        setTimeout(() => {
            setStep('lockin');
        }, 2500);
    };

    const handleLockIn = () => {
        addPoints('sprout', 5);
        onComplete();
    };

    const showToast = (message, points) => {
        setToastMessage({ message, points });
    };

    return (
        <div className="onboarding-container">
            <Toast
                isVisible={!!toastMessage}
                message={toastMessage?.message}
                points={toastMessage?.points}
                onClose={() => setToastMessage(null)}
            />

            <AnimatePresence mode="wait">
                {/* Step 1 & 2: Seed Drop, Idle, and Tapped */}
                {(step === 'drop' || step === 'idle' || step === 'tapped') && (
                    <motion.div
                        key="seed"
                        className="onboarding-step center-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.5 } }}
                    >
                        {/* Logo text shown in tapped state */}
                        <motion.div
                            className="tapped-logo-area"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: step === 'tapped' ? 1 : 0, y: step === 'tapped' ? 0 : -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="tapped-sprout-logo">Sprout</h2>
                        </motion.div>

                        <motion.div
                            className={`seed-image-container ${step === 'tapped' ? 'tapped-glow' : ''}`}
                            initial={{ scale: 0.8 }}
                            animate={{
                                scale: step === 'idle' ? 1 : (step === 'tapped' ? 1.05 : 0.8),
                                y: step === 'idle' ? [0, -5, 0] : 0
                            }}
                            transition={step === 'idle' ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { type: 'spring', damping: 20 }}
                            onClick={handleSeedTap}
                            whileTap={step === 'idle' ? { scale: 0.95 } : {}}
                        >
                            <img src={seedImg} alt="Glowing Seed" className="seed-image" />
                        </motion.div>

                        {/* Intro text shown in drop/idle state */}
                        <motion.div
                            className="intro-text-area"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: (step === 'idle' || step === 'drop') ? 1 : 0, y: (step === 'idle' || step === 'drop') ? 0 : 10 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <h1>Sprout: The start of<br />something good.</h1>
                        </motion.div>

                        {/* Continue button shown in tapped state */}
                        <motion.div
                            className="continue-action-area"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: step === 'tapped' ? 1 : 0, scale: step === 'tapped' ? 1 : 0.9, y: step === 'tapped' ? 0 : 20 }}
                            transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                        >
                            {step === 'tapped' && (
                                <Button onClick={handleContinue} className="green-pill-btn">
                                    Continue
                                </Button>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Step 3: Vibe Check */}
                {step === 'vibe' && (
                    <motion.div
                        key="vibe"
                        className="onboarding-step center-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        <h2>Choose their Vibe</h2>
                        <p className="subtitle">This determines their initial personality.</p>
                        <div className="vibe-buttons">
                            <Button onClick={() => handleVibeSelect('Zen')} variant="secondary">🧘 Zen</Button>
                            <Button onClick={() => handleVibeSelect('Hype')} variant="secondary">⚡️ Hype</Button>
                            <Button onClick={() => handleVibeSelect('Kind')} variant="secondary">💛 Kind</Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Hatching & Lock-in */}
                {(step === 'hatch' || step === 'lockin') && (
                    <motion.div
                        key="lockin"
                        className="onboarding-step center-content lockin-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.div
                            className="buddy-image-container"
                            initial={{ scale: 0, rotate: -10, y: 50 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 18 }}
                        >
                            <img src={buddyImg} alt="Sprout Buddy" className="buddy-image" />
                        </motion.div>

                        {step === 'lockin' && (
                            <motion.div
                                className="lockin-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2>Your Bud is born.</h2>
                                <div className="points-summary">
                                    <div className="point-badge spark">✨ 1 Spark Point</div>
                                    <div className="point-badge sprout">🌱 10 Sprout Points</div>
                                </div>
                                <Button onClick={handleLockIn} className="green-pill-btn" style={{ width: '100%' }}>
                                    Save your Sprout
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
