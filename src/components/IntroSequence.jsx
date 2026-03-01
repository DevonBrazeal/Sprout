import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroSequence.css';

/**
 * IntroSequence — Cinematic 3-video intro before onboarding.
 *
 * Plays 3 full-screen videos in sequence:
 *   1. Seed falling through darkness
 *   2. Underground germination
 *   3. Sprout emerging into light
 *
 * Tap anywhere to skip. Auto-advances when each video ends.
 */

// Videos will be imported once generated and placed in assets:
// import introFall from '../assets/intro_seed_fall.mp4';
// import introGerminate from '../assets/intro_germinate.mp4';
// import introEmerge from '../assets/intro_emerge.mp4';

// For now, we'll check if the files exist and gracefully skip if not
let introFall, introGerminate, introEmerge;
try { introFall = new URL('../assets/intro_seed_fall.mp4', import.meta.url).href; } catch (e) { introFall = null; }
try { introGerminate = new URL('../assets/intro_germinate.mp4', import.meta.url).href; } catch (e) { introGerminate = null; }
try { introEmerge = new URL('../assets/intro_emerge.mp4', import.meta.url).href; } catch (e) { introEmerge = null; }

const CLIPS = [
    { id: 'fall', src: introFall },
    { id: 'germinate', src: introGerminate },
    { id: 'emerge', src: introEmerge },
].filter(c => c.src); // Only include clips that exist

const IntroSequence = ({ onComplete }) => {
    const [currentClip, setCurrentClip] = useState(0);
    const [showSkip, setShowSkip] = useState(false);
    const videoRef = useRef(null);
    const skipTimerRef = useRef(null);

    // If no clips available, skip intro entirely
    if (CLIPS.length === 0) {
        // Call onComplete on next tick to avoid render-during-render
        setTimeout(onComplete, 0);
        return null;
    }

    const goNext = useCallback(() => {
        if (currentClip < CLIPS.length - 1) {
            setCurrentClip(prev => prev + 1);
        } else {
            onComplete();
        }
    }, [currentClip, onComplete]);

    const handleVideoLoaded = () => {
        // Show "Tap to skip" after 1.5 seconds
        skipTimerRef.current = setTimeout(() => setShowSkip(true), 1500);
    };

    const handleSkip = () => {
        clearTimeout(skipTimerRef.current);
        onComplete();
    };

    return (
        <div className="intro-sequence" onClick={handleSkip}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={CLIPS[currentClip].id}
                    className="intro-clip-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <video
                        ref={videoRef}
                        src={CLIPS[currentClip].src}
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
                {showSkip && (
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
            <div className="intro-dots">
                {CLIPS.map((clip, i) => (
                    <div
                        key={clip.id}
                        className={`intro-dot ${i === currentClip ? 'active' : ''} ${i < currentClip ? 'done' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default IntroSequence;
