import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Toast from './Toast';
import IntroSequence from './IntroSequence';
import idleVideo from '../assets/sprout_idle.mp4';
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

                {/* ═══ Vibe Check — Premium Design ═══ */}
                {step === 'vibe' && (
                    <motion.div
                        key="vibe"
                        className="onboarding-step vibe-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="vibe-header"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 className="vibe-title">Set the Tone.</h2>
                            <p className="vibe-subtitle">Every sprout grows differently.<br />How will yours begin?</p>
                        </motion.div>

                        <div className="vibe-cards">
                            {/* Zen */}
                            <motion.button
                                className="vibe-card vibe-zen"
                                onClick={() => handleVibeSelect('Zen')}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 18 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className="vibe-card-glyph">◯</div>
                                <div className="vibe-card-content">
                                    <h3>Zen</h3>
                                    <p className="vibe-card-tagline">Stillness is strength</p>
                                    <p className="vibe-card-desc">Your sprout grows through patience, mindfulness, and quiet consistency.</p>
                                </div>
                            </motion.button>

                            {/* Hype */}
                            <motion.button
                                className="vibe-card vibe-hype"
                                onClick={() => handleVibeSelect('Hype')}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55, type: 'spring', stiffness: 120, damping: 18 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className="vibe-card-glyph">△</div>
                                <div className="vibe-card-content">
                                    <h3>Hype</h3>
                                    <p className="vibe-card-tagline">Energy is everything</p>
                                    <p className="vibe-card-desc">Your sprout feeds on momentum, streaks, and the thrill of leveling up.</p>
                                </div>
                            </motion.button>

                            {/* Kind */}
                            <motion.button
                                className="vibe-card vibe-kind"
                                onClick={() => handleVibeSelect('Kind')}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, type: 'spring', stiffness: 120, damping: 18 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className="vibe-card-glyph">❋</div>
                                <div className="vibe-card-content">
                                    <h3>Kind</h3>
                                    <p className="vibe-card-tagline">Growth through giving</p>
                                    <p className="vibe-card-desc">Your sprout thrives on compassion, generosity, and meaningful connection.</p>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Apple-Ad Style Reveal ═══ */}
                {(step === 'hatch' || step === 'lockin') && (
                    <motion.div
                        key="lockin"
                        className="onboarding-step reveal-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        {/* Sprout logo — animates down from top */}
                        <motion.h1
                            className="reveal-logo"
                            initial={{ opacity: 0, y: -40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            Sprout
                        </motion.h1>

                        {/* Idle MP4 playing in a premium showcase container */}
                        <motion.div
                            className="reveal-video-container"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                        >
                            <video
                                src={idleVideo}
                                className="reveal-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        </motion.div>

                        {step === 'lockin' && (
                            <div className="reveal-bottom">
                                {/* Apple-style notification badges */}
                                <motion.div
                                    className="reveal-badges"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        className="reveal-badge"
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring', stiffness: 150, damping: 18 }}
                                    >
                                        <span className="reveal-badge-icon">✦</span>
                                        <div className="reveal-badge-text">
                                            <span className="reveal-badge-title">+1 Spark Point</span>
                                            <span className="reveal-badge-sub">First interaction earned</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="reveal-badge"
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.7, type: 'spring', stiffness: 150, damping: 18 }}
                                    >
                                        <span className="reveal-badge-icon sprout-icon">🌱</span>
                                        <div className="reveal-badge-text">
                                            <span className="reveal-badge-title">+10 Sprout Points</span>
                                            <span className="reveal-badge-sub">Identity established</span>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Premium CTA button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, type: 'spring', stiffness: 120, damping: 18 }}
                                >
                                    <Button onClick={handleLockIn} className="reveal-cta">
                                        Begin Your Journey
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
