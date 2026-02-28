import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import petImage from '../assets/sprout_pet.jpg';
import './SproutCharacter.css';

/**
 * Behavior State Machine
 * The Sprout cycles through idle behaviors on its own, reacts to clicks,
 * and responds to external actions (feed, sunlight). All animations are
 * local — no network needed.
 * 
 * Idle behaviors: breathe, lookAround, blink, doubleBlink, wink, wiggle, yawn
 * Triggered actions: pet, feed, celebrate
 */

const IDLE_BEHAVIORS = ['blink', 'blink', 'doubleBlink', 'lookAround', 'wiggle', 'wink', 'yawn'];

const SproutCharacter = ({ state = 'thriving', size = 300, action = null, onActionComplete = () => { } }) => {
    const containerRef = useRef(null);
    const idleTimerRef = useRef(null);

    // --- Animation State ---
    const [eyeState, setEyeState] = useState('open');       // open | closed | winkLeft | winkRight | halfOpen | wide
    const [mouthState, setMouthState] = useState('smile');   // smile | open | wide | frown | ooh
    const [eyebrowState, setEyebrowState] = useState('normal'); // normal | raised | worried | angry
    const [blushVisible, setBlushVisible] = useState(false);
    const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
    const [leafAnim, setLeafAnim] = useState('idle');        // idle | wave | droop | perk
    const [bodyAnim, setBodyAnim] = useState('breathe');     // breathe | squish | jump | wiggle | bounce
    const [particles, setParticles] = useState([]);          // [{id, emoji, x, y}]
    const [localAction, setLocalAction] = useState(null);

    // --- Mouse Tracking for Pupils ---
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current || state !== 'thriving' || localAction) return;
            const rect = containerRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height * 0.38; // Eye center is ~38% down
            const maxPx = 4;
            let dx = ((e.clientX - cx) / window.innerWidth) * maxPx * 3;
            let dy = ((e.clientY - cy) / window.innerHeight) * maxPx * 3;
            dx = Math.max(-maxPx, Math.min(maxPx, dx));
            dy = Math.max(-maxPx, Math.min(maxPx, dy));
            setPupilOffset({ x: dx, y: dy });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [state, localAction]);

    // --- Idle Behavior Scheduler ---
    const runIdleBehavior = useCallback(() => {
        if (state !== 'thriving' || localAction) return;

        const behavior = IDLE_BEHAVIORS[Math.floor(Math.random() * IDLE_BEHAVIORS.length)];

        switch (behavior) {
            case 'blink':
                setEyeState('closed');
                setTimeout(() => setEyeState('open'), 120);
                break;
            case 'doubleBlink':
                setEyeState('closed');
                setTimeout(() => setEyeState('open'), 100);
                setTimeout(() => setEyeState('closed'), 250);
                setTimeout(() => setEyeState('open'), 350);
                break;
            case 'wink':
                setMouthState('smile');
                setEyeState('winkRight');
                setBlushVisible(true);
                setTimeout(() => { setEyeState('open'); setBlushVisible(false); }, 600);
                break;
            case 'lookAround':
                setPupilOffset({ x: -4, y: 0 });
                setTimeout(() => setPupilOffset({ x: 4, y: -1 }), 400);
                setTimeout(() => setPupilOffset({ x: 0, y: 0 }), 800);
                break;
            case 'wiggle':
                setBodyAnim('wiggle');
                setTimeout(() => setBodyAnim('breathe'), 800);
                break;
            case 'yawn':
                setMouthState('wide');
                setEyeState('halfOpen');
                setEyebrowState('raised');
                setTimeout(() => {
                    setMouthState('smile');
                    setEyeState('open');
                    setEyebrowState('normal');
                }, 1200);
                break;
            default:
                break;
        }
    }, [state, localAction]);

    useEffect(() => {
        // Schedule idle behaviors every 2.5-5 seconds
        const scheduleNext = () => {
            const delay = 2500 + Math.random() * 2500;
            idleTimerRef.current = setTimeout(() => {
                runIdleBehavior();
                scheduleNext();
            }, delay);
        };
        scheduleNext();
        return () => clearTimeout(idleTimerRef.current);
    }, [runIdleBehavior]);

    // --- External Action Handler ---
    useEffect(() => {
        if (!action) return;
        setLocalAction(action);

        if (action === 'feed') {
            // Happy jump, wide eyes, open mouth, particles
            setEyeState('wide');
            setMouthState('wide');
            setEyebrowState('raised');
            setBlushVisible(true);
            setLeafAnim('perk');
            setBodyAnim('jump');
            spawnParticles(['✨', '⭐', '💚'], 5);
            setTimeout(() => {
                setEyeState('open');
                setMouthState('smile');
                setEyebrowState('normal');
                setBlushVisible(false);
                setLeafAnim('idle');
                setBodyAnim('breathe');
                setLocalAction(null);
                onActionComplete();
            }, 2000);
        } else if (action === 'pet') {
            setEyeState('closed');
            setMouthState('smile');
            setBlushVisible(true);
            setBodyAnim('squish');
            setLeafAnim('wave');
            spawnParticles(['❤️', '💕'], 3);
            setTimeout(() => {
                setEyeState('open');
                setBlushVisible(false);
                setBodyAnim('breathe');
                setLeafAnim('idle');
                setLocalAction(null);
                onActionComplete();
            }, 1000);
        } else if (action === 'celebrate') {
            setEyeState('wide');
            setMouthState('open');
            setEyebrowState('raised');
            setBodyAnim('bounce');
            setLeafAnim('wave');
            spawnParticles(['🎉', '🌟', '✨', '💪'], 8);
            setTimeout(() => {
                setEyeState('open');
                setMouthState('smile');
                setEyebrowState('normal');
                setBodyAnim('breathe');
                setLeafAnim('idle');
                setLocalAction(null);
                onActionComplete();
            }, 2500);
        }
    }, [action]);

    // --- State-based overrides (stubborn/fading) ---
    useEffect(() => {
        if (state === 'stubborn') {
            setEyeState('halfOpen');
            setMouthState('frown');
            setEyebrowState('worried');
            setLeafAnim('droop');
            setBodyAnim('breathe');
        } else if (state === 'fading') {
            setEyeState('closed');
            setMouthState('frown');
            setEyebrowState('worried');
            setLeafAnim('droop');
            setBodyAnim('breathe');
        } else if (state === 'thriving' && !localAction) {
            setEyeState('open');
            setMouthState('smile');
            setEyebrowState('normal');
            setLeafAnim('idle');
        }
    }, [state]);

    // --- Particle System ---
    const spawnParticles = (emojis, count) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                x: 30 + Math.random() * 40, // % from left
                y: 10 + Math.random() * 30,  // % from top
                delay: i * 0.15,
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 2000);
    };

    // --- Click Handler ---
    const handleClick = () => {
        if (localAction || state !== 'thriving') return;
        setLocalAction('pet');
        setEyeState('closed');
        setMouthState('smile');
        setBlushVisible(true);
        setBodyAnim('squish');
        setLeafAnim('wave');
        spawnParticles(['❤️', '💕'], 3);
        setTimeout(() => {
            setEyeState('open');
            setBlushVisible(false);
            setBodyAnim('breathe');
            setLeafAnim('idle');
            setLocalAction(null);
        }, 1000);
    };

    // --- Compute body motion values ---
    const isFading = state === 'fading';
    const isStubborn = state === 'stubborn';

    const bodyVariants = {
        breathe: {
            y: isFading ? [0, 2, 0] : isStubborn ? [0, 4, 0] : [0, -8, 0],
            scaleY: isFading ? [1, 0.995, 1] : isStubborn ? [1, 0.98, 1] : [1, 0.97, 1, 1.01, 1],
            scaleX: isFading ? [1, 1.005, 1] : isStubborn ? [1, 1.02, 1] : [1, 1.03, 1, 0.99, 1],
            rotate: 0,
            transition: { repeat: Infinity, duration: isFading ? 5 : isStubborn ? 4 : 3, ease: 'easeInOut' },
        },
        squish: {
            y: [0, 8, -4, 0],
            scaleY: [1, 0.82, 1.08, 1],
            scaleX: [1, 1.18, 0.92, 1],
            rotate: 0,
            transition: { duration: 0.6, ease: 'easeInOut' },
        },
        jump: {
            y: [0, -30, 0, -15, 0],
            scaleY: [1, 1.15, 0.88, 1.05, 1],
            scaleX: [1, 0.88, 1.12, 0.96, 1],
            rotate: [0, -6, 6, -3, 0],
            transition: { duration: 1.2, ease: 'easeInOut' },
        },
        wiggle: {
            y: 0,
            scaleY: 1,
            scaleX: 1,
            rotate: [0, -5, 5, -3, 3, 0],
            transition: { duration: 0.6, ease: 'easeInOut' },
        },
        bounce: {
            y: [0, -20, 0, -12, 0, -6, 0],
            scaleY: [1, 1.08, 0.92, 1.04, 0.97, 1.02, 1],
            scaleX: [1, 0.92, 1.08, 0.96, 1.03, 0.98, 1],
            rotate: [0, 5, -5, 3, -3, 0],
            transition: { duration: 1.8, ease: 'easeInOut' },
        },
    };

    const currentBody = bodyVariants[bodyAnim] || bodyVariants.breathe;

    return (
        <div
            className={`sprout-pet-stage state-${state}`}
            ref={containerRef}
            onClick={handleClick}
            style={{ width: size, height: size * 1.1 }}
            role="button"
            aria-label="Interact with your Sprout"
            tabIndex={0}
        >
            {/* Particles Layer */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="sprout-particle"
                        initial={{ opacity: 0, y: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -60, scale: [0, 1.3, 0.8] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Body + Image Layer */}
            <motion.div
                className="sprout-body"
                animate={currentBody}
            >
                {/* The base image */}
                <div className="sprout-image-frame">
                    <img src={petImage} alt="Your Sprout companion" className="sprout-base-image" />

                    {/* === SVG Face Overlay === */}
                    <svg className="sprout-face-overlay" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        {/* Left Eyebrow */}
                        <motion.path
                            d="M 30 33 Q 35 30 40 33"
                            fill="none"
                            stroke="#3a5a1a"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            animate={{
                                d: eyebrowState === 'raised' ? 'M 30 30 Q 35 27 40 30' :
                                    eyebrowState === 'worried' ? 'M 30 34 Q 35 30 40 32' :
                                        'M 30 33 Q 35 30 40 33'
                            }}
                            transition={{ duration: 0.2 }}
                        />
                        {/* Right Eyebrow */}
                        <motion.path
                            d="M 58 33 Q 63 30 68 33"
                            fill="none"
                            stroke="#3a5a1a"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            animate={{
                                d: eyebrowState === 'raised' ? 'M 58 30 Q 63 27 68 30' :
                                    eyebrowState === 'worried' ? 'M 58 32 Q 63 30 68 34' :
                                        'M 58 33 Q 63 30 68 33'
                            }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* Left Eye */}
                        <g className="sprout-eye-left">
                            {/* Eye white */}
                            <motion.ellipse
                                cx={36}
                                cy={40}
                                fill="white"
                                stroke="#2a4a10"
                                strokeWidth="0.5"
                                animate={{
                                    rx: eyeState === 'closed' || eyeState === 'winkLeft' ? 5 : eyeState === 'halfOpen' ? 5 : eyeState === 'wide' ? 6 : 5,
                                    ry: eyeState === 'closed' || eyeState === 'winkLeft' ? 0.5 : eyeState === 'halfOpen' ? 2.5 : eyeState === 'wide' ? 7 : 5.5,
                                }}
                                transition={{ duration: 0.1 }}
                            />
                            {/* Pupil */}
                            {eyeState !== 'closed' && eyeState !== 'winkLeft' && (
                                <motion.circle
                                    cx={36}
                                    cy={40}
                                    r={eyeState === 'wide' ? 3.2 : eyeState === 'halfOpen' ? 1.8 : 2.8}
                                    fill="#3d1f00"
                                    animate={{ cx: 36 + pupilOffset.x, cy: 40 + pupilOffset.y }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                />
                            )}
                            {/* Eye highlight */}
                            {eyeState !== 'closed' && eyeState !== 'winkLeft' && (
                                <circle cx={34.5} cy={38.5} r={1.2} fill="rgba(255,255,255,0.9)" />
                            )}
                        </g>

                        {/* Right Eye */}
                        <g className="sprout-eye-right">
                            <motion.ellipse
                                cx={62}
                                cy={40}
                                fill="white"
                                stroke="#2a4a10"
                                strokeWidth="0.5"
                                animate={{
                                    rx: eyeState === 'closed' || eyeState === 'winkRight' ? 5 : eyeState === 'halfOpen' ? 5 : eyeState === 'wide' ? 6 : 5,
                                    ry: eyeState === 'closed' || eyeState === 'winkRight' ? 0.5 : eyeState === 'halfOpen' ? 2.5 : eyeState === 'wide' ? 7 : 5.5,
                                }}
                                transition={{ duration: 0.1 }}
                            />
                            {eyeState !== 'closed' && eyeState !== 'winkRight' && (
                                <motion.circle
                                    cx={62}
                                    cy={40}
                                    r={eyeState === 'wide' ? 3.2 : eyeState === 'halfOpen' ? 1.8 : 2.8}
                                    fill="#3d1f00"
                                    animate={{ cx: 62 + pupilOffset.x, cy: 40 + pupilOffset.y }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                />
                            )}
                            {eyeState !== 'closed' && eyeState !== 'winkRight' && (
                                <circle cx={60.5} cy={38.5} r={1.2} fill="rgba(255,255,255,0.9)" />
                            )}
                        </g>

                        {/* Mouth */}
                        <motion.path
                            fill="none"
                            stroke="#3a5a1a"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            animate={{
                                d: mouthState === 'smile' ? 'M 42 49 Q 49 54 56 49' :
                                    mouthState === 'open' ? 'M 43 48 Q 49 56 55 48' :
                                        mouthState === 'wide' ? 'M 43 47 Q 49 58 55 47' :
                                            mouthState === 'ooh' ? 'M 46 48 Q 49 53 52 48' :
                                                mouthState === 'frown' ? 'M 43 52 Q 49 47 55 52' :
                                                    'M 42 49 Q 49 54 56 49'
                            }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        />
                        {/* Mouth fill for open/wide states */}
                        {(mouthState === 'open' || mouthState === 'wide') && (
                            <motion.path
                                fill="#5a2a1a"
                                opacity={0.6}
                                animate={{
                                    d: mouthState === 'wide' ? 'M 43 47 Q 49 58 55 47 Z' : 'M 43 48 Q 49 56 55 48 Z'
                                }}
                                transition={{ duration: 0.2 }}
                            />
                        )}

                        {/* Blush */}
                        <AnimatePresence>
                            {blushVisible && (
                                <>
                                    <motion.ellipse
                                        cx={28} cy={46} rx={5} ry={3}
                                        fill="rgba(255, 120, 160, 0.4)"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <motion.ellipse
                                        cx={70} cy={46} rx={5} ry={3}
                                        fill="rgba(255, 120, 160, 0.4)"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </>
                            )}
                        </AnimatePresence>
                    </svg>

                    {/* Leaf Overlay */}
                    <motion.div
                        className="sprout-leaf-overlay"
                        animate={{
                            rotate: leafAnim === 'idle' ? [-3, 3, -3] :
                                leafAnim === 'wave' ? [-15, 15, -10, 10, 0] :
                                    leafAnim === 'droop' ? [8] :
                                        leafAnim === 'perk' ? [-10, 5, -3, 0] : 0,
                            scaleY: leafAnim === 'droop' ? 0.85 : 1,
                        }}
                        transition={{
                            rotate: { repeat: leafAnim === 'idle' ? Infinity : 0, duration: leafAnim === 'idle' ? 4 : 0.8, ease: 'easeInOut' },
                            scaleY: { duration: 0.5 },
                        }}
                    />

                    {/* Glass shine on top */}
                    <div className="sprout-glass-shine" />
                </div>
            </motion.div>

            {/* Ground Shadow */}
            <motion.div
                className="sprout-ground-shadow"
                animate={{
                    scaleX: bodyAnim === 'jump' ? [1, 0.6, 1, 0.8, 1] :
                        bodyAnim === 'bounce' ? [1, 0.7, 1, 0.85, 1] : [1, 0.85, 1],
                    opacity: bodyAnim === 'jump' ? [0.4, 0.15, 0.4, 0.25, 0.4] : [0.4, 0.25, 0.4],
                }}
                transition={{ repeat: bodyAnim === 'breathe' ? Infinity : 0, duration: isFading ? 5 : 3, ease: 'easeInOut' }}
            />
        </div>
    );
};

export default SproutCharacter;
