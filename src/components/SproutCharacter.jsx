import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SproutCharacter.css';

// Import all pre-rendered video clips (bundled locally — no network needed)
import videoIdle from '../assets/sprout_idle.mp4';
import videoBlink from '../assets/sprout_blink.mp4';
import videoWink from '../assets/sprout_wink.mp4';
import videoHappy from '../assets/sprout_happy.mp4';
import videoEating from '../assets/sprout_eating.mp4';
import videoSleepy from '../assets/sprout_sleepy.mp4';
import videoSad from '../assets/sprout_sad.mp4';
import videoCelebrate from '../assets/sprout_celebrate.mp4';

// Video map — every state maps to a video clip
const VIDEOS = {
    idle: { src: videoIdle, loop: true },
    blink: { src: videoBlink, loop: false },
    wink: { src: videoWink, loop: false },
    happy: { src: videoHappy, loop: true },
    eating: { src: videoEating, loop: false },
    sleepy: { src: videoSleepy, loop: true },
    sad: { src: videoSad, loop: true },
    celebrate: { src: videoCelebrate, loop: false },
};

// Idle behavior — which one-shot clips play randomly during idle
const IDLE_BEHAVIORS = [
    { video: 'blink', weight: 5 },
    { video: 'blink', weight: 3 },
    { video: 'wink', weight: 1 },
    { video: 'happy', weight: 1 },
];

const pickIdleBehavior = () => {
    const total = IDLE_BEHAVIORS.reduce((s, b) => s + b.weight, 0);
    let r = Math.random() * total;
    for (const b of IDLE_BEHAVIORS) {
        r -= b.weight;
        if (r <= 0) return b.video;
    }
    return 'blink';
};

/**
 * SproutCharacter — Video-based animation player
 *
 * Uses HTML5 <video> elements stacked with CSS opacity crossfades.
 * Looping videos (idle, happy, sad, sleepy) play continuously.
 * One-shot videos (blink, wink, eating, celebrate) play once then return to the base state.
 * All videos bundled locally — runs 100% offline.
 */
const SproutCharacter = ({
    state = 'thriving',
    mood,
    action = null,
    growth = 50,
    size = 300,
    onClick,
    onActionComplete = () => { },
}) => {
    const [activeVideo, setActiveVideo] = useState('idle');
    const [isPlayingAction, setIsPlayingAction] = useState(false);
    const videoRefs = useRef({});
    const idleTimerRef = useRef(null);

    // Derive mood from state if not provided
    const effectiveMood = mood || (state === 'thriving' ? 'happy' : state === 'stubborn' ? 'neutral' : 'sad');

    // Get the base looping video for the current mood
    const getBaseVideo = useCallback(() => {
        if (effectiveMood === 'sad') return 'sad';
        if (effectiveMood === 'neutral') return 'sleepy';
        return 'idle';
    }, [effectiveMood]);

    // --- Switch to a video ---
    const switchTo = useCallback((name) => {
        setActiveVideo(name);
        // Restart the target video from the beginning
        const vid = videoRefs.current[name];
        if (vid) {
            vid.currentTime = 0;
            vid.play().catch(() => { });
        }
    }, []);

    // --- Play a one-shot video, then return to base ---
    const playOneShot = useCallback((name, onDone) => {
        setIsPlayingAction(true);
        switchTo(name);

        const vid = videoRefs.current[name];
        if (!vid) {
            setIsPlayingAction(false);
            if (onDone) onDone();
            return;
        }

        const handleEnded = () => {
            vid.removeEventListener('ended', handleEnded);
            setIsPlayingAction(false);
            switchTo(getBaseVideo());
            if (onDone) onDone();
        };

        vid.removeEventListener('ended', handleEnded);
        vid.addEventListener('ended', handleEnded);
    }, [switchTo, getBaseVideo]);

    // --- Idle behavior scheduler (random blinks/winks during idle) ---
    useEffect(() => {
        if (effectiveMood !== 'happy') return;
        if (isPlayingAction) return;

        const scheduleIdle = () => {
            const delay = 4000 + Math.random() * 5000; // 4-9 seconds
            idleTimerRef.current = setTimeout(() => {
                if (!isPlayingAction) {
                    const behavior = pickIdleBehavior();
                    playOneShot(behavior, scheduleIdle);
                } else {
                    scheduleIdle();
                }
            }, delay);
        };

        scheduleIdle();
        return () => clearTimeout(idleTimerRef.current);
    }, [effectiveMood, isPlayingAction, playOneShot]);

    // --- External action handler ---
    useEffect(() => {
        if (!action) return;
        clearTimeout(idleTimerRef.current);

        const actionMap = {
            feed: 'eating',
            water: 'blink',
            sun: 'happy',
            pet: 'wink',
            complete: 'celebrate',
            quest: 'celebrate',
            celebrate: 'celebrate',
            sunlight: 'happy',
        };

        const videoName = actionMap[action] || 'blink';
        const videoConfig = VIDEOS[videoName];

        if (videoConfig.loop) {
            // For looping action videos (happy, sun), show for a set duration then return
            switchTo(videoName);
            setIsPlayingAction(true);
            const dur = action === 'quest' ? 3500 : 2000;
            setTimeout(() => {
                setIsPlayingAction(false);
                switchTo(getBaseVideo());
                onActionComplete();
            }, dur);
        } else {
            playOneShot(videoName, onActionComplete);
        }
    }, [action]);

    // --- State/mood change → switch base video ---
    useEffect(() => {
        if (!isPlayingAction) {
            switchTo(getBaseVideo());
        }
    }, [effectiveMood, isPlayingAction, getBaseVideo, switchTo]);

    // --- Click handler ---
    const handleClick = () => {
        if (isPlayingAction) return;
        clearTimeout(idleTimerRef.current);
        playOneShot('wink', () => { });
        if (onClick) onClick();
    };

    return (
        <figure
            className="sprout-stage"
            onClick={handleClick}
            style={{ width: size, height: size }}
            role="button"
            aria-label="Interact with your Sprout"
            tabIndex={0}
        >
            {/* All videos stacked — only active one visible */}
            <div className="sprout-video-stack">
                {Object.entries(VIDEOS).map(([name, config]) => (
                    <video
                        key={name}
                        ref={(el) => { videoRefs.current[name] = el; }}
                        src={config.src}
                        className={`sprout-video ${activeVideo === name ? 'active' : ''}`}
                        muted
                        playsInline
                        autoPlay={name === 'idle'}
                        loop={config.loop}
                        preload="auto"
                        aria-hidden={activeVideo !== name}
                    />
                ))}

                {/* Glow ring */}
                <div className={`sprout-glow-ring ${effectiveMood === 'happy' ? 'thriving' : ''}`} />
            </div>
        </figure>
    );
};

export default SproutCharacter;
