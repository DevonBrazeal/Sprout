import { useState, useEffect, useRef, useCallback } from 'react';

// ══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════

// TIME SCALING: In production, set TIME_SCALE = 1.
// For demo, 1 real second = 2 minutes of game time (720x speed)
const TIME_SCALE = 720;
const TICK_MS = 1000; // check every 1 real second

// Decay formula: value = prev * e^(-k * scaledHours)
// k ≈ 0.055 → 16h→41%, 24h→27%, 8h→64%
const DECAY_RATE_PER_HOUR = 0.055;

// ── STAT WEIGHTS ──────────────────────────────────────────────────
const CARE_BOOST = {
    water: { water: 12, happiness: 2 },
    feed: { food: 12, happiness: 2 },
    sun: { sunlight: 12, happiness: 3 },
    pet: { happiness: 8 },
};

// Care caps: buttons can only bring stats up to this ceiling
const CARE_CAP = 60;

// Habits/quests blow past the care cap — they're the real fuel
const HABIT_BOOST = { happiness: 15, food: 8, water: 8, sunlight: 8 };
const QUEST_BOOST = { happiness: 25, food: 15, water: 15, sunlight: 15 };

// Growth: care = tiny, habits = big, quests = huge
const GROWTH_FROM_CARE = 0.5;
const GROWTH_FROM_HABIT = 5;
const GROWTH_FROM_QUEST = 12;

const LEVELS = ['Seedling', 'Sproutling', 'Sapling', 'Leafling', 'Bloomling'];

function clamp(v, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v));
}

// ── INITIAL STATE ─────────────────────────────────────────────────
const initialState = {
    stats: { water: 80, happiness: 80, food: 75, sunlight: 65 },
    growth: 35,
    spark: 120,
    sproutPts: 450,
    lastInteractionAt: Date.now(),
    habits: [
        { id: 1, name: 'Daily Meditation & Journaling', streak: 7, isQuest: true, completed: false },
        { id: 2, name: '30 Min Exercise', streak: 12, isQuest: true, completed: false },
        { id: 3, name: 'Read 20 Pages', streak: 3, isQuest: false, completed: false },
        { id: 4, name: 'Drink 8 Glasses of Water', streak: 21, isQuest: false, completed: false },
        { id: 5, name: 'No Social Media Before Noon', streak: 5, isQuest: false, completed: false },
    ],
};

// ══════════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════════
export const useSproutEngine = () => {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem('sprout_engine_v2');
        return saved ? JSON.parse(saved) : initialState;
    });

    const lastInteraction = useRef(state.lastInteractionAt || Date.now());

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('sprout_engine_v2', JSON.stringify(state));
    }, [state]);

    // ── EXPONENTIAL DECAY TICK ────────────────────────────────────
    useEffect(() => {
        const iv = setInterval(() => {
            setState(prev => {
                const decayFactor = Math.exp(
                    -DECAY_RATE_PER_HOUR * (TICK_MS / 1000 / 3600) * TIME_SCALE
                );
                return {
                    ...prev,
                    stats: {
                        water: clamp(prev.stats.water * decayFactor),
                        food: clamp(prev.stats.food * decayFactor),
                        sunlight: clamp(prev.stats.sunlight * decayFactor),
                        happiness: clamp(prev.stats.happiness * decayFactor),
                    },
                };
            });
        }, TICK_MS);
        return () => clearInterval(iv);
    }, []);

    // ── GROWTH TRACKING ─────────────────────────────────────────────
    const avg = (state.stats.water + state.stats.food + state.stats.sunlight + state.stats.happiness) / 4;

    useEffect(() => {
        setState(prev => {
            const a = (prev.stats.water + prev.stats.food + prev.stats.sunlight + prev.stats.happiness) / 4;
            const delta = a > 55 ? 0.08 : a < 25 ? -0.05 : 0;
            if (delta === 0) return prev;
            return { ...prev, growth: clamp(prev.growth + delta, 0, 100) };
        });
    }, [state.stats]);

    // ── DERIVED STATE ───────────────────────────────────────────────
    const mood = avg >= 60 ? 'happy' : avg >= 30 ? 'neutral' : 'sad';

    // Map mood to the legacy state names for SproutCharacter
    const sproutState = mood === 'happy' ? 'thriving' : mood === 'neutral' ? 'stubborn' : 'fading';

    const level = Math.min(Math.floor(state.growth / 20), 4);
    const levelName = LEVELS[level];

    // ── CARE ACTIONS (small boosts, capped at CARE_CAP) ─────────────
    const doCare = useCallback((type) => {
        const boosts = CARE_BOOST[type];
        if (!boosts) return;

        lastInteraction.current = Date.now();
        setState(prev => {
            const newStats = { ...prev.stats };
            for (const [k, v] of Object.entries(boosts)) {
                const newVal = newStats[k] + v;
                // Care actions cap at CARE_CAP unless already above (from habits)
                newStats[k] = newStats[k] >= CARE_CAP
                    ? clamp(newStats[k] + v * 0.3)
                    : clamp(Math.min(newVal, Math.max(CARE_CAP, newStats[k])));
            }
            return {
                ...prev,
                stats: newStats,
                growth: clamp(prev.growth + GROWTH_FROM_CARE, 0, 100),
                spark: prev.spark + 3,
                sproutPts: prev.sproutPts + 5,
                lastInteractionAt: Date.now(),
            };
        });
    }, []);

    // ── HABIT/QUEST COMPLETION (big boosts, no cap) ─────────────────
    const completeHabit = useCallback((habitId) => {
        setState(prev => {
            const habit = prev.habits.find(h => h.id === habitId);
            if (!habit || habit.completed) return prev;

            const boosts = habit.isQuest ? QUEST_BOOST : HABIT_BOOST;
            const newStats = { ...prev.stats };
            for (const [k, v] of Object.entries(boosts)) {
                newStats[k] = clamp(newStats[k] + v);
            }

            const growthGain = habit.isQuest ? GROWTH_FROM_QUEST : GROWTH_FROM_HABIT;

            return {
                ...prev,
                stats: newStats,
                growth: clamp(prev.growth + growthGain, 0, 100),
                spark: prev.spark + (habit.isQuest ? 30 : 15),
                sproutPts: prev.sproutPts + (habit.isQuest ? 50 : 25),
                habits: prev.habits.map(h => h.id === habitId ? { ...h, completed: true } : h),
                lastInteractionAt: Date.now(),
            };
        });

        lastInteraction.current = Date.now();
    }, []);

    // ── DEBUG: Force decay for testing ──────────────────────────────
    const debugForceDecay = useCallback(() => {
        setState(prev => ({
            ...prev,
            stats: {
                water: clamp(prev.stats.water - 20),
                food: clamp(prev.stats.food - 20),
                sunlight: clamp(prev.stats.sunlight - 20),
                happiness: clamp(prev.stats.happiness - 20),
            },
        }));
    }, []);

    // ── DEBUG: Reset state ──────────────────────────────────────────
    const debugReset = useCallback(() => {
        setState(initialState);
        lastInteraction.current = Date.now();
    }, []);

    return {
        // State
        stats: state.stats,
        growth: state.growth,
        spark: state.spark,
        sproutPts: state.sproutPts,
        habits: state.habits,
        mood,
        sproutState,
        level,
        levelName,
        avg,

        // Actions
        doCare,
        completeHabit,
        debugForceDecay,
        debugReset,

        // Constants (for UI display)
        CARE_CAP,
        GROWTH_FROM_CARE,
        GROWTH_FROM_HABIT,
        GROWTH_FROM_QUEST,
    };
};
