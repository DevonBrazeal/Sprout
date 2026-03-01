import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Droplets, Sun, Utensils, Heart } from 'lucide-react';
import TopNavBar from './TopNavBar';
import Button from './Button';
import Toast from './Toast';
import AIVerificationModal from './AIVerificationModal';
import SparkStream from './SparkStream';
import Vaults from './Vaults';
import BountyBoard from './BountyBoard';
import DigitalGarden from './DigitalGarden';
import SproutShop from './SproutShop';
import { useSproutEngine } from '../hooks/useSproutEngine';
import SproutCharacter from './SproutCharacter';
import './Home.css';

// ── Idle Messages by Mood ─────────────────────────────────────────
const MOOD_MESSAGES = {
    happy: ['Life is good! 🌿', "I feel so loved! 💚", 'Growing strong! 🌱', 'Complete a quest for mega growth! ⭐'],
    neutral: ['Could use some attention...', 'Try completing a habit! 📋', 'A quest would really help me grow ⭐', "I'm okay but could be better~"],
    sad: ['I\'m withering... 😢', 'Please complete a habit! 🥺', 'I really need a quest done... ⭐', "Don't forget about me..."],
};

const Home = ({ points, addPoints }) => {
    const [activeTab, setActiveTab] = useState('garden');
    const [toastMessage, setToastMessage] = useState(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [sproutAction, setSproutAction] = useState(null);
    const [speechMsg, setSpeechMsg] = useState('Welcome! Complete habits to help me grow! 🌱');
    const actionTimerRef = useRef(null);

    const engine = useSproutEngine();

    // ── Idle speech bubble rotation ─────────────────────────────
    useEffect(() => {
        if (sproutAction) return;
        const iv = setInterval(() => {
            const pool = MOOD_MESSAGES[engine.mood] || MOOD_MESSAGES.neutral;
            setSpeechMsg(pool[Math.floor(Math.random() * pool.length)]);
        }, 6000);
        return () => clearInterval(iv);
    }, [engine.mood, sproutAction]);

    // ── Fire an action on the Sprout ────────────────────────────
    const fireAction = useCallback((type, msg, duration = 1200) => {
        if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
        setSproutAction(type);
        if (msg) setSpeechMsg(msg);
        actionTimerRef.current = setTimeout(() => setSproutAction(null), duration);
    }, []);

    // ── Care button handlers ────────────────────────────────────
    const handleCare = (type) => {
        if (sproutAction) return;
        engine.doCare(type);
        const msgs = {
            water: 'Ahh, refreshing! 💧',
            feed: 'Yum yum! 🍽️',
            sun: 'Warm and cozy! ☀️',
            pet: 'Hehe, that tickles! 💚',
        };
        fireAction(type, msgs[type], type === 'sun' ? 1800 : 1000);
        addPoints('spark', 3);
    };

    // ── Habit completion ────────────────────────────────────────
    const handleHabitComplete = (habitId) => {
        const habit = engine.habits.find(h => h.id === habitId);
        if (!habit || habit.completed || sproutAction) return;
        engine.completeHabit(habitId);
        if (habit.isQuest) {
            fireAction('quest', '⭐ QUEST COMPLETE! Massive growth! ⭐', 2500);
            addPoints('spark', 30);
        } else {
            fireAction('complete', 'Habit done! Growing stronger! 🎉', 1400);
            addPoints('spark', 15);
        }
    };

    // ── AI Photo Verification ───────────────────────────────────
    const handleVerifyPhotoClick = () => setIsAiModalOpen(true);
    const handleVerificationSuccess = () => {
        addPoints('spark', 10);
        engine.doCare('feed');
        fireAction('feed', 'AI Verified. +10 Spark! 🌟', 1500);
    };

    const showToast = (message, pointAmount) => {
        setToastMessage({ message, points: pointAmount });
    };

    const completedCount = engine.habits.filter(h => h.completed).length;

    return (
        <div className="home-container layout-fade-in">
            <Toast
                isVisible={!!toastMessage}
                message={toastMessage?.message}
                points={toastMessage?.points}
                onClose={() => setToastMessage(null)}
            />

            <TopNavBar
                activeTab={activeTab}
                onTabSelect={setActiveTab}
                points={points}
            />

            {/* Main Content Area */}
            {activeTab === 'garden' && (
                <main className="companion-area">
                    {/* Level Badge */}
                    <div className="level-badge">
                        <span>{engine.levelName} · {Math.round(engine.growth)}% grown</span>
                    </div>

                    {/* Speech Bubble */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={speechMsg}
                            className="speech-bubble"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                        >
                            {speechMsg}
                        </motion.div>
                    </AnimatePresence>

                    {/* The Sprout Character */}
                    <div className="central-buddy-container">
                        <SproutCharacter
                            state={engine.sproutState}
                            size={300}
                            action={sproutAction}
                            onActionComplete={() => setSproutAction(null)}
                        />
                    </div>

                    {/* 4-Stat HUD */}
                    <section className="stats-panel" aria-label="Sprout vitals">
                        <header className="stats-header">
                            <span className="stats-title">VITALS</span>
                            <span className="stats-hint">Care cap: {engine.CARE_CAP}% · Habits break cap</span>
                        </header>
                        <StatBar label="WATER" value={engine.stats.water} color="#42a5f5" icon={<Droplets size={14} />} />
                        <StatBar label="FOOD" value={engine.stats.food} color="#ff9800" icon={<Utensils size={14} />} />
                        <StatBar label="SUNLIGHT" value={engine.stats.sunlight} color="#fdd835" icon={<Sun size={14} />} />
                        <StatBar label="HAPPINESS" value={engine.stats.happiness} color="#e91e63" icon={<Heart size={14} />} />
                    </section>

                    {/* Care Action Buttons */}
                    <nav className="care-buttons" aria-label="Care actions">
                        <CareButton icon="💧" label="WATER" disabled={!!sproutAction} onClick={() => handleCare('water')} />
                        <CareButton icon="🍽️" label="FEED" disabled={!!sproutAction} onClick={() => handleCare('feed')} />
                        <CareButton icon="☀️" label="SUN" disabled={!!sproutAction} onClick={() => handleCare('sun')} />
                        <CareButton icon="🤗" label="PET" disabled={!!sproutAction} onClick={() => handleCare('pet')} />
                    </nav>
                    <p className="care-hint">
                        Care gives small boosts (capped at {engine.CARE_CAP}%). Complete habits & quests for real growth!
                    </p>

                    {/* Habits & Quests */}
                    <section className="habits-panel" aria-label="Today's habits and quests">
                        <header className="habits-header">
                            <span className="habits-title">TODAY'S QUESTS & HABITS</span>
                            <span className="habits-progress">{completedCount}/{engine.habits.length}</span>
                        </header>
                        {engine.habits.map(habit => (
                            <HabitRow
                                key={habit.id}
                                habit={habit}
                                growthValue={habit.isQuest ? engine.GROWTH_FROM_QUEST : engine.GROWTH_FROM_HABIT}
                                onComplete={() => handleHabitComplete(habit.id)}
                            />
                        ))}
                        {engine.habits.every(h => h.completed) && (
                            <p className="all-done">All done today! 🌟</p>
                        )}
                    </section>

                    {/* Photo Verify CTA */}
                    <motion.div
                        className="habit-card"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                        <div className="habit-header">
                            <span className="habit-label">AI Verification</span>
                        </div>
                        <h3 className="habit-title">Snap a Photo of Your Habit</h3>
                        <Button onClick={handleVerifyPhotoClick} className="photo-btn" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                            <Camera size={16} style={{ marginRight: 6 }} />
                            Verified Photo
                        </Button>
                    </motion.div>
                </main>
            )}

            {activeTab === 'spark' && (
                <SparkStream onReceiveSunlight={() => { engine.doCare('sun'); fireAction('sun', 'Sunlight received! ☀️', 1200); }} />
            )}
            {activeTab === 'vaults' && <Vaults />}
            {activeTab === 'bounty' && <BountyBoard />}
            {activeTab === 'profile' && <DigitalGarden />}
            {activeTab === 'shop' && <SproutShop sparkPoints={points.spark} onPurchase={(price) => addPoints('spark', -price)} />}

            <AIVerificationModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onVerifySuccess={handleVerificationSuccess}
            />
        </div>
    );
};

// ── Sub-Components ────────────────────────────────────────────────

function StatBar({ label, value, color, icon }) {
    const low = value < 30;
    return (
        <div className="stat-bar-row">
            <span className="stat-icon" style={{ color }}>{icon}</span>
            <div className="stat-bar-content">
                <div className="stat-bar-label-row">
                    <span className={`stat-label ${low ? 'low' : ''}`}>{label}</span>
                    <span className={`stat-value ${low ? 'low' : ''}`}>{Math.round(value)}%</span>
                </div>
                <div className="stat-bar-bg">
                    <div
                        className="stat-bar-fill"
                        style={{
                            width: `${value}%`,
                            background: low ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : `linear-gradient(90deg, ${color}cc, ${color})`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function CareButton({ icon, label, disabled, onClick }) {
    return (
        <button className="care-btn" disabled={disabled} onClick={onClick}>
            <span className="care-btn-icon">{icon}</span>
            <span className="care-btn-label">{label}</span>
        </button>
    );
}

function HabitRow({ habit, growthValue, onComplete }) {
    return (
        <div className={`habit-row ${habit.completed ? 'completed' : ''} ${habit.isQuest ? 'quest' : ''}`} onClick={onComplete}>
            <div className={`habit-check ${habit.completed ? 'checked' : ''}`}>
                {habit.completed && (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
                {!habit.completed && habit.isQuest && <span className="quest-star">⭐</span>}
            </div>
            <div className="habit-row-text">
                <span className="habit-row-name">{habit.name}</span>
                <span className="habit-row-meta">
                    {habit.streak} day streak · {habit.isQuest ? '⭐ Quest · ' : ''}+{growthValue}% growth
                </span>
            </div>
            {habit.completed && <span className="habit-done-icon">{habit.isQuest ? '🌟' : '✨'}</span>}
        </div>
    );
}

export default Home;
