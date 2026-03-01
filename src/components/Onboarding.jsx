import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Toast from './Toast';
import IntroSequence from './IntroSequence';
import seedImg from '../assets/sprout_seed.png';
import buddyImg from '../assets/sprout_buddy.png';
import './Onboarding.css';

// ── Intro video imports (graceful fallback if not yet present) ──
let introSeedFall, introGerminate, introEmerge, introAlive;
try { introSeedFall = new URL('../assets/intro_seed_fall.mp4', import.meta.url).href; } catch (e) { introSeedFall = null; }
try { introGerminate = new URL('../assets/intro_germinate.mp4', import.meta.url).href; } catch (e) { introGerminate = null; }
try { introEmerge = new URL('../assets/intro_emerge.mp4', import.meta.url).href; } catch (e) { introEmerge = null; }
try { introAlive = new URL('../assets/intro_alive.mp4', import.meta.url).href; } catch (e) { introAlive = null; }

// Clip 1: plays before the seed-tap screen
const OPENING_CLIPS = [
    introSeedFall && { id: 'fall', src: introSeedFall },
].filter(Boolean);

// Clips 2-4: play after the user taps the seed + toast
const GROWTH_CLIPS = [
    introGerminate && { id: 'germinate', src: introGerminate },
    introEmerge && { id: 'emerge', src: introEmerge },
    introAlive && { id: 'alive', src: introAlive },
].filter(Boolean);

/**
 * Onboarding Flow:
 *   intro     → Video 1 (seed falling through darkness)
 *   drop      → Seed image drops in
 *   idle      → Seed bobs, waiting for tap
 *   tapped    → User taps seed → Spark Point toast + "Sprout" logo
 *   growth    → Videos 2, 3, 4 (germination → emerge → first smile)
 *   vibe      → Personality picker
 *   hatch     → Buddy reveal animation
 *   lockin    → Save your Sprout
 */
const Onboarding = ({ onComplete, addPoints }) => {
    const [step, setStep] = useState(OPENING_CLIPS.length > 0 ? 'intro' : 'drop');
    const [toastMessage, setToastMessage] = useState(null);

    // Step 1: Seed drops in
    useEffect(() => {
        if (step === 'drop') {
            const timer = setTimeout(() => setStep('idle'), 1000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // After tap + toast delay → trigger growth videos
    useEffect(() => {
        if (step === 'tapped') {
            const delay = GROWTH_CLIPS.length > 0 ? 1800 : 2000;
            const timer = setTimeout(() => {
                if (GROWTH_CLIPS.length > 0) {
                    setStep('growth');
                } else {
                    setStep('vibe');
                }
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleSeedTap = () => {
        if (step !== 'idle') return;
        setStep('tapped');
        addPoints('spark', 1);
        showToast("You've started something good.", 1);
    };

    const handleGrowthComplete = () => {
        setStep('vibe');
    };

    const handleVibeSelect = (vibe) => {
        setStep('hatch');
        addPoints('sprout', 5);
        showToast("Identity Established.", 5);
        setTimeout(() => setStep('lockin'), 2500);
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
                {/* ═══ Step 0: Opening cinematic (Video 1) ═══ */}
                {step === 'intro' && (
                    <IntroSequence
                        clips={OPENING_CLIPS}
                        onComplete={() => setStep('drop')}
                        skippable={true}
                    />
                )}

                {/* ═══ Step 1 & 2: Seed Drop → Idle → Tapped ═══ */}
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

                        {/* Tapped state — brief moment before growth videos */}
                        {step === 'tapped' && (
                            <motion.div
                                className="tapped-subtitle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                <p>Something is happening...</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ═══ Step 3: Growth cinematic (Videos 2, 3, 4) ═══ */}
                {step === 'growth' && (
                    <IntroSequence
                        clips={GROWTH_CLIPS}
                        onComplete={handleGrowthComplete}
                        skippable={true}
                    />
                )}

                {/* ═══ Step 4: Vibe Check ═══ */}
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

                {/* ═══ Step 5: Hatching & Lock-in ═══ */}
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
