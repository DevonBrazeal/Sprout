import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SproutCharacter.css';

// Import all pre-rendered sprite frames (bundled locally — no network needed)
import frameIdle from '../assets/sprout_idle.png';
import frameBlink from '../assets/sprout_blink.png';
import frameWink from '../assets/sprout_wink.png';
import frameHappy from '../assets/sprout_happy.png';
import frameEating from '../assets/sprout_eating.png';
import frameSleepy from '../assets/sprout_sleepy.png';
import frameSad from '../assets/sprout_sad.png';
import frameCelebrate from '../assets/sprout_celebrate.png';

// Frame map — every visual state maps to a pre-rendered image
const FRAMES = {
    idle: frameIdle,
    blink: frameBlink,
    wink: frameWink,
    happy: frameHappy,
    eating: frameEating,
    sleepy: frameSleepy,
    sad: frameSad,
    celebrate: frameCelebrate,
};

// Idle behavior sequences with timing (ms)
// Durations must be longer than CSS crossfade (400ms) so each frame
// fully resolves before the next one starts blending in.
const IDLE_SEQUENCES = [
    // Simple blink — quick close + open
    { frames: ['blink', 'idle'], durations: [450, 0], weight: 5 },
    // Double blink
    { frames: ['blink', 'idle', 'blink', 'idle'], durations: [400, 500, 400, 0], weight: 2 },
    // Playful wink — hold it longer so user notices it
    { frames: ['wink', 'idle'], durations: [1200, 0], weight: 1 },
    // Happy flash — gentle buildup
    { frames: ['happy', 'idle'], durations: [1400, 0], weight: 1 },
    // Sleepy yawn then wake
    { frames: ['sleepy', 'idle'], durations: [1800, 0], weight: 1 },
];

// Weighted random selection
const pickIdleSequence = () => {
    const totalWeight = IDLE_SEQUENCES.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (const seq of IDLE_SEQUENCES) {
        r -= seq.weight;
        if (r <= 0) return seq;
    }
    return IDLE_SEQUENCES[0];
};

/**
 * SproutCharacter — Frame-based animation player
 * 
 * All animations are pre-rendered Pixar-quality images bundled into the app.
 * The component crossfades between frames based on a behavior state machine.
 * Runs 100% offline — no network, no API, no computer vision.
 */
const SproutCharacter = ({ state = 'thriving', size = 300, action = null, onActionComplete = () => { } }) => {
    const [currentFrame, setCurrentFrame] = useState('idle');
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);
    const idleTimerRef = useRef(null);
    const sequenceTimerRef = useRef(null);

    // --- Play a sequence of frames with timing ---
    const playSequence = useCallback((frames, durations, onComplete) => {
        setIsPlayingSequence(true);
        let i = 0;

        const playNext = () => {
            if (i >= frames.length) {
                setIsPlayingSequence(false);
                if (onComplete) onComplete();
                return;
            }
            setCurrentFrame(frames[i]);
            const dur = durations[i];
            i++;
            if (dur > 0) {
                sequenceTimerRef.current = setTimeout(playNext, dur);
            } else {
                setIsPlayingSequence(false);
                if (onComplete) onComplete();
            }
        };

        playNext();
    }, []);

    // --- Idle behavior scheduler ---
    useEffect(() => {
        if (state !== 'thriving') return;

        const scheduleIdle = () => {
            const delay = 3500 + Math.random() * 4000; // 3.5-7.5 seconds — less frantic
            idleTimerRef.current = setTimeout(() => {
                if (!isPlayingSequence) {
                    const seq = pickIdleSequence();
                    playSequence(seq.frames, seq.durations, () => {
                        setCurrentFrame('idle');
                        scheduleIdle();
                    });
                } else {
                    scheduleIdle();
                }
            }, delay);
        };

        scheduleIdle();
        return () => {
            clearTimeout(idleTimerRef.current);
            clearTimeout(sequenceTimerRef.current);
        };
    }, [state, isPlayingSequence, playSequence]);

    // --- External action handler ---
    useEffect(() => {
        if (!action) return;

        // Clear any idle sequence in progress
        clearTimeout(idleTimerRef.current);
        clearTimeout(sequenceTimerRef.current);

        // All durations are >= 500ms so the 400ms CSS crossfade
        // can fully blend before the next frame starts.
        switch (action) {
            case 'feed':
                playSequence(
                    ['eating', 'idle', 'happy', 'idle'],
                    [1200, 500, 1000, 0],
                    onActionComplete
                );
                break;
            case 'water':
                playSequence(
                    ['blink', 'idle', 'happy', 'idle'],
                    [500, 500, 1000, 0],
                    onActionComplete
                );
                break;
            case 'sun':
                playSequence(
                    ['happy', 'idle', 'celebrate', 'idle'],
                    [1000, 500, 1200, 0],
                    onActionComplete
                );
                break;
            case 'pet':
                playSequence(
                    ['blink', 'idle', 'happy', 'wink', 'idle'],
                    [500, 500, 800, 1000, 0],
                    onActionComplete
                );
                break;
            case 'complete':
                playSequence(
                    ['happy', 'idle', 'celebrate', 'happy', 'idle'],
                    [800, 500, 1200, 800, 0],
                    onActionComplete
                );
                break;
            case 'quest':
                playSequence(
                    ['happy', 'celebrate', 'idle', 'celebrate', 'happy', 'idle'],
                    [600, 1200, 500, 1200, 800, 0],
                    onActionComplete
                );
                break;
            case 'celebrate':
                playSequence(
                    ['happy', 'celebrate', 'idle', 'celebrate', 'idle'],
                    [600, 1200, 500, 1200, 0],
                    onActionComplete
                );
                break;
            case 'sunlight':
                playSequence(
                    ['happy', 'idle', 'celebrate', 'idle'],
                    [800, 500, 1200, 0],
                    onActionComplete
                );
                break;
            default:
                onActionComplete();
        }
    }, [action, onActionComplete, playSequence]);

    // --- State-based frame override ---
    useEffect(() => {
        if (state === 'stubborn') {
            clearTimeout(idleTimerRef.current);
            clearTimeout(sequenceTimerRef.current);
            setCurrentFrame('sad');
            setIsPlayingSequence(false);
        } else if (state === 'fading') {
            clearTimeout(idleTimerRef.current);
            clearTimeout(sequenceTimerRef.current);
            setCurrentFrame('sleepy');
            setIsPlayingSequence(false);
        } else if (state === 'thriving' && !isPlayingSequence) {
            setCurrentFrame('idle');
        }
    }, [state]);

    // --- Click handler (pet the sprout) ---
    const handleClick = () => {
        if (isPlayingSequence || state !== 'thriving') return;
        clearTimeout(idleTimerRef.current);
        playSequence(
            ['blink', 'idle', 'happy', 'wink', 'idle'],
            [500, 500, 800, 1000, 0],
            () => { }
        );
    };

    // --- Compute body animation based on state ---
    const isFading = state === 'fading';
    const isStubborn = state === 'stubborn';
    const isThriving = state === 'thriving';

    return (
        <div
            className={`sprout-stage ${isFading ? 'fading' : ''} ${isStubborn ? 'stubborn' : ''}`}
            onClick={handleClick}
            style={{ width: size, height: size * 1.15 }}
            role="button"
            aria-label="Interact with your Sprout"
            tabIndex={0}
        >
            {/* Body container with breathing animation */}
            <motion.div
                className="sprout-body-container"
                animate={{
                    y: isFading ? [0, 2, 0] : isStubborn ? [0, 3, 0] : [0, -8, 0],
                    scaleY: isFading ? [1, 0.998, 1] : isStubborn ? [1, 0.99, 1] : [1, 0.97, 1, 1.01, 1],
                    scaleX: isFading ? [1, 1.002, 1] : isStubborn ? [1, 1.01, 1] : [1, 1.03, 1, 0.99, 1],
                }}
                transition={{
                    repeat: Infinity,
                    duration: isFading ? 5 : isStubborn ? 4 : 3,
                    ease: 'easeInOut',
                }}
            >
                {/* All frames are stacked; only the active one is visible via opacity */}
                <div className="sprout-frame-stack">
                    {Object.entries(FRAMES).map(([name, src]) => (
                        <img
                            key={name}
                            src={src}
                            alt={`Sprout ${name}`}
                            className={`sprout-frame ${currentFrame === name ? 'active' : ''}`}
                            draggable={false}
                        />
                    ))}

                    {/* Glow ring overlay */}
                    <div className={`sprout-glow-ring ${isThriving ? 'thriving' : ''}`} />
                </div>
            </motion.div>

            {/* Ground shadow */}
            <motion.div
                className="sprout-shadow"
                animate={{
                    scaleX: isFading ? [1, 0.95, 1] : [1, 0.8, 1],
                    opacity: isFading ? [0.2, 0.25, 0.2] : [0.35, 0.15, 0.35],
                }}
                transition={{
                    repeat: Infinity,
                    duration: isFading ? 5 : 3,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
};

export default SproutCharacter;
