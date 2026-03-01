import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Toast from './Toast';
import IntroSequence from './IntroSequence';
import buddyImg from '../assets/sprout_buddy.png';
import './Onboarding.css';

// ── Intro video imports (graceful fallback if not yet present) ──
let introSeedFall, introGerminate, introEmerge, introAlive;
try { introSeedFall = new URL('../assets/intro_seed_fall.mp4', import.meta.url).href; } catch (e) { introSeedFall = null; }
try { introGerminate = new URL('../assets/intro_germinate.mp4', import.meta.url).href; } catch (e) { introGerminate = null; }
try { introEmerge = new URL('../assets/intro_emerge.mp4', import.meta.url).href; } catch (e) { introEmerge = null; }
try { introAlive = new URL('../assets/intro_alive.mp4', import.meta.url).href; } catch (e) { introAlive = null; }

// Clips 2-4: play after the user taps the seed
const GROWTH_CLIPS = [
    introGerminate && { id: 'germinate', src: introGerminate },
    introEmerge && { id: 'emerge', src: introEmerge },
    introAlive && { id: 'alive', src: introAlive },
].filter(Boolean);

/**
 * Onboarding Flow:
 *   intro      → Video 1 plays (seed falls through darkness)
 *   waitForTap → Video 1 frozen on last frame, "Tap Seed" overlay
 *   tapped     → Spark Point toast + brief pause
 *   growth     → Videos 2, 3, 4 (germination → emerge → first breath)
 *   vibe       → Personality picker
 *   hatch      → Buddy reveal animation
 *   lockin     → Save your Sprout
 */
const Onboarding = ({ onComplete, addPoints }) => {
    const [step, setStep] = useState(introSeedFall ? 'intro' : 'vibe');
    const [toastMessage, setToastMessage] = useState(null);
    const [showTapHint, setShowTapHint] = useState(false);
    const videoRef = useRef(null);
    const tapHintTimer = useRef(null);

    // When Video 1 ends, freeze and show tap overlay
    const handleVideo1End = () => {
        setStep('waitForTap');
        // Show "Tap Seed" after a brief moment
        tapHintTimer.current = setTimeout(() => setShowTapHint(true), 600);
    };

    // User taps the seed on the frozen frame
    const handleSeedTap = () => {
        if (step !== 'waitForTap') return;
        clearTimeout(tapHintTimer.current);
        setShowTapHint(false);
        setStep('tapped');
        addPoints('spark', 1);
        showToast("You've started something good.", 1);
    };

    // After tap + toast, start growth videos
    useEffect(() => {
        if (step === 'tapped') {
            const timer = setTimeout(() => {
                if (GROWTH_CLIPS.length > 0) {
                    setStep('growth');
                } else {
                    setStep('vibe');
                }
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [step]);

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
                {/* ═══ Video 1: Seed Falls Through Darkness ═══ */}
                {(step === 'intro' || step === 'waitForTap' || step === 'tapped') && (
                    <motion.div
                        key="video1-phase"
                        className="onboarding-step video-phase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8 } }}
                    >
                        {/* The video — plays once, freezes on last frame */}
                        <video
                            ref={videoRef}
                            src={introSeedFall}
                            className="intro-fullscreen-video"
                            autoPlay
                            muted
                            playsInline
                            onEnded={handleVideo1End}
                        />

                        {/* "Tap Seed" overlay — appears after Video 1 ends */}
                        <AnimatePresence>
                            {step === 'waitForTap' && (
                                <motion.div
                                    className="tap-seed-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleSeedTap}
                                >
                                    {/* Pulsing ring around where the seed landed */}
                                    <motion.div
                                        className="tap-seed-ring"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.6, 0.2, 0.6],
                                        }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    />

                                    {/* Tap hint text */}
                                    <AnimatePresence>
                                        {showTapHint && (
                                            <motion.p
                                                className="tap-seed-text"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                Tap the Seed
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* "Something is happening..." after tap */}
                        <AnimatePresence>
                            {step === 'tapped' && (
                                <motion.div
                                    className="tapped-message-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.p
                                        className="tapped-happening-text"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                    >
                                        Something is happening...
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ═══ Growth cinematic (Videos 2, 3, 4) ═══ */}
                {step === 'growth' && (
                    <IntroSequence
                        clips={GROWTH_CLIPS}
                        onComplete={handleGrowthComplete}
                        skippable={true}
                    />
                )}

                {/* ═══ Vibe Check ═══ */}
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

                {/* ═══ Hatching & Lock-in ═══ */}
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
