import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GhostCharacter.css';

const GhostCharacter = ({ state = 'thriving', size = 200 }) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [isLooking, setIsLooking] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Random blink interval simulating life
    useEffect(() => {
        const blinkTimer = setInterval(() => {
            // 40% chance to double blink, standard life-like pattern
            if (Math.random() > 0.3) {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 120);

                if (Math.random() > 0.7) {
                    setTimeout(() => {
                        setIsBlinking(true);
                        setTimeout(() => setIsBlinking(false), 120);
                    }, 200);
                }
            }
        }, 4000);
        return () => clearInterval(blinkTimer);
    }, []);

    // Make the ghost track the mouse occasionally to feel alive (simulating "Apple/Pixar" interaction)
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate offset and clamp
            const maxOffset = 6;
            let diffX = (e.clientX - centerX) * 0.05;
            let diffY = (e.clientY - centerY) * 0.05;

            diffX = Math.max(-maxOffset, Math.min(maxOffset, diffX));
            diffY = Math.max(-maxOffset, Math.min(maxOffset, diffY));

            // Only track if thriving
            if (state === 'thriving') {
                setIsLooking({ x: diffX, y: diffY });
            } else {
                setIsLooking({ x: 0, y: 0 }); // Too tired to look around
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [state]);

    // Map state to motion vars indicating organic breathing
    const isHappy = state === 'thriving';
    const isStubborn = state === 'stubborn';
    const isFading = state === 'fading';

    // Dynamic breathe physics based on PRD status
    const breatheY = isFading ? [0, -2, 0] : isStubborn ? [0, -6, 0] : [0, -18, 0];
    const breatheScaleY = isFading ? [1, 0.99, 1] : isStubborn ? [1, 0.98, 1] : [1, 0.94, 1, 1.04, 1];
    const breatheScaleX = isFading ? [1, 1.01, 1] : isStubborn ? [1, 1.02, 1] : [1, 1.06, 1, 0.94, 1];
    const duration = isFading ? 6 : isStubborn ? 4 : 3;

    return (
        <div
            className={`ghost-character-wrapper ${state}`}
            ref={containerRef}
            style={{ width: size, height: size * 1.2 }}
        >
            {/* Dynamic Drop Shadow projecting below the floating character */}
            <motion.div
                className="ghost-drop-shadow"
                animate={{
                    scale: isFading ? [1, 0.98, 1] : [1, 0.7, 1],
                    opacity: isFading ? [0.2, 0.3, 0.2] : [0.4, 0.15, 0.4]
                }}
                transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
            />

            {/* Main Squishy Body Container */}
            <motion.div
                className="ghost-body"
                animate={{ y: breatheY, scaleY: breatheScaleY, scaleX: breatheScaleX }}
                transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
            >
                {/* Animated Leaf */}
                <motion.div
                    className="ghost-leaf"
                    animate={{
                        rotate: isHappy ? [-8, 12, -8] : [0, 5, 0],
                        skewX: isHappy ? [-5, 5, -5] : [0, 0, 0]
                    }}
                    transition={{ repeat: Infinity, duration: duration * 1.5, ease: "easeInOut" }}
                />

                {/* 3D Dynamic Face */}
                <motion.div
                    className="ghost-face"
                    animate={{ x: isLooking.x, y: isLooking.y }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    <div className={`ghost-eye left ${isBlinking ? 'blink' : ''} ${state}`} />
                    <div className={`ghost-eye right ${isBlinking ? 'blink' : ''} ${state}`} />
                    <div className={`ghost-mouth ${state}`} />

                    <AnimatePresence>
                        {isHappy && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ghost-blushes"
                            >
                                <div className="ghost-blush left" />
                                <div className="ghost-blush right" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Inner glow and shadow overlays to give a 3D glassmorphic blob feel */}
                <div className="ghost-highlight" />
            </motion.div>
        </div>
    );
};

export default GhostCharacter;
