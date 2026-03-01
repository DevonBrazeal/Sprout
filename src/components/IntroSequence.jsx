import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroSequence.css';

/**
 * IntroSequence — Cinematic video sequence player.
 *
 * Accepts an array of video sources and plays them in order.
 * Auto-advances when each video ends. Tap anywhere to skip.
 *
 * Props:
 *   clips     — Array of { id, src } objects
 *   onComplete — Called when all clips finish (or skipped)
 *   skippable — Show "Tap to skip" hint (default: true)
 */
const IntroSequence = ({ clips = [], onComplete, skippable = true }) => {
    const [currentClip, setCurrentClip] = useState(0);
    const [showSkip, setShowSkip] = useState(false);
    const videoRef = useRef(null);
    const skipTimerRef = useRef(null);

    // If no clips, skip immediately
    useEffect(() => {
        if (clips.length === 0) {
            onComplete();
        }
    }, [clips.length, onComplete]);

    if (clips.length === 0) return null;

    const goNext = () => {
        if (currentClip < clips.length - 1) {
            setCurrentClip(prev => prev + 1);
            setShowSkip(false);
        } else {
            onComplete();
        }
    };

    const handleVideoLoaded = () => {
        if (skippable) {
            clearTimeout(skipTimerRef.current);
            skipTimerRef.current = setTimeout(() => setShowSkip(true), 1500);
        }
    };

    const handleSkip = () => {
        if (!skippable) return;
        clearTimeout(skipTimerRef.current);
        onComplete();
    };

    return (
        <div className="intro-sequence" onClick={handleSkip}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={clips[currentClip].id}
                    className="intro-clip-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <video
                        ref={videoRef}
                        src={clips[currentClip].src}
                        className="intro-video"
                        autoPlay
                        muted
                        playsInline
                        onLoadedData={handleVideoLoaded}
                        onEnded={goNext}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Skip hint */}
            <AnimatePresence>
                {showSkip && skippable && (
                    <motion.p
                        className="intro-skip-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                    >
                        Tap to skip
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Progress dots */}
            {clips.length > 1 && (
                <div className="intro-dots">
                    {clips.map((clip, i) => (
                        <div
                            key={clip.id}
                            className={`intro-dot ${i === currentClip ? 'active' : ''} ${i < currentClip ? 'done' : ''}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IntroSequence;
