import { useState, useEffect, useCallback } from 'react';

// Default initial state for a new player
const initialState = {
    energy: 0,
    essence: 50,
    vibe: 50,
    lastSparkAt: Date.now(),
    lastMorningSparkAt: null,
    state: 'thriving' // thriving, stubborn, fading
};

/**
 * Custom hook to simulate the offline-first Tamagotchi Sprout Engine 
 * mimicking WatermelonDB SQLite sync queue algorithms.
 */
export const useSproutEngine = () => {
    const [sproutState, setSproutState] = useState(() => {
        const saved = localStorage.getItem('sprout_sprout_state');
        return saved ? JSON.parse(saved) : initialState;
    });

    // Save to local storage whenever state changes
    useEffect(() => {
        localStorage.setItem('sprout_sprout_state', JSON.stringify(sproutState));
    }, [sproutState]);

    // The Decay Algorithm (Calculated deterministically on render)
    const calculateDecay = useCallback(() => {
        const now = Date.now();
        const msSinceSpark = now - sproutState.lastSparkAt;
        const hoursSinceSpark = msSinceSpark / (1000 * 60 * 60);

        // Essence: Decays 15% every 4 hours (approx 3.75% per hour)
        const essenceDecay = Math.floor(hoursSinceSpark * 3.75);
        let newEssence = Math.max(0, sproutState.essence - essenceDecay);

        // Vibe: Decays 10% daily (approx 0.41% per hour)
        const vibeDecay = Math.floor(hoursSinceSpark * 0.41);
        let newVibe = Math.max(0, sproutState.vibe - vibeDecay);

        // Energy: Resets to 0 at midnight 
        let newEnergy = sproutState.energy;
        if (sproutState.lastMorningSparkAt) {
            const lastMorning = new Date(sproutState.lastMorningSparkAt);
            const today = new Date();
            if (lastMorning.getDate() !== today.getDate() || lastMorning.getMonth() !== today.getMonth()) {
                newEnergy = 0; // Midnight reset occurred
            }
        }

        // Determine Mascot Visual State based on PRD
        let newState = 'thriving';
        // If average stats are very low, switch state
        if (newEssence === 0) {
            newState = 'fading';
        } else if (newEssence < 30 || newVibe < 30) {
            newState = 'stubborn';
        }

        // Only update state if something actually changed to avoid infinite re-renders
        if (
            newEssence !== sproutState.essence ||
            newVibe !== sproutState.vibe ||
            newEnergy !== sproutState.energy ||
            newState !== sproutState.state
        ) {
            setSproutState(prev => ({
                ...prev,
                essence: newEssence,
                vibe: newVibe,
                energy: newEnergy,
                state: newState
            }));
        }
    }, [sproutState]);

    // Run the decay check every minute while app is open
    useEffect(() => {
        calculateDecay();
        const interval = setInterval(calculateDecay, 60000);
        return () => clearInterval(interval);
    }, [calculateDecay]);

    // "Spark" Logged - Feed the Sprout (Essence -> 100%)
    const logHabitSpark = () => {
        setSproutState(prev => ({
            ...prev,
            essence: 100, // PRD: Replenished by verified sparks
            lastSparkAt: Date.now(),
            state: prev.vibe < 30 ? 'stubborn' : 'thriving' // Ensure snap out of fading
        }));
    };

    // "Morning Spark" - Wake the Sprout up (Energy -> 100%)
    const logMorningSpark = () => {
        setSproutState(prev => ({
            ...prev,
            energy: 100,
            lastMorningSparkAt: Date.now()
        }));
    }

    // "Sunlight" Received - Social Interaction (Vibe -> +20%)
    const receiveSunlight = () => {
        setSproutState(prev => ({
            ...prev,
            vibe: Math.min(100, prev.vibe + 20)
        }));
    };

    // DEBUG: Force decay for testing animations
    const debugForceDecay = () => {
        setSproutState(prev => {
            let updatedEssence = prev.essence - 25;
            let newState = 'thriving';
            if (updatedEssence <= 0) {
                updatedEssence = 0;
                newState = 'fading';
            } else if (updatedEssence < 30) {
                newState = 'stubborn';
            }
            return {
                ...prev,
                essence: updatedEssence,
                state: newState
            }
        });
    }

    return {
        sproutState,
        logHabitSpark,
        logMorningSpark,
        receiveSunlight,
        debugForceDecay
    };
};
