import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Droplets, Sun, Utensils, Heart, Palette, ChevronDown, X } from 'lucide-react';
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
import btnWater from '../assets/btn_water.png';
import btnFeed from '../assets/btn_feed.png';
import btnSun from '../assets/btn_sun.png';
import btnPet from '../assets/btn_pet.png';
import './Home.css';

// ── Background Themes ──────────────────────────────────────────────
const BACKGROUNDS = [
    {
        id: 'nature',
        name: 'Morning Meadow',
        emoji: '🌿',
        css: `radial-gradient(ellipse 120% 80% at 30% 20%, rgba(180,220,150,0.6) 0%, transparent 60%),
              radial-gradient(ellipse 100% 60% at 70% 80%, rgba(200,235,180,0.5) 0%, transparent 50%),
              linear-gradient(180deg, #c8e6b0 0%, #d4edc4 20%, #e2f0d8 40%, #eaf5e0 60%, #f0f4e6 80%, #f8f6ee 100%)`,
    },
    {
        id: 'sunset',
        name: 'Golden Hour',
        emoji: '🌅',
        css: `radial-gradient(ellipse 140% 70% at 50% 10%, rgba(255,180,100,0.5) 0%, transparent 50%),
              radial-gradient(ellipse 100% 80% at 70% 90%, rgba(255,120,80,0.3) 0%, transparent 60%),
              linear-gradient(180deg, #ffd89b 0%, #f6c97e 20%, #f2a571 40%, #e88d68 60%, #d4766a 80%, #c06078 100%)`,
    },
    {
        id: 'ocean',
        name: 'Deep Ocean',
        emoji: '🌊',
        css: `radial-gradient(ellipse 120% 60% at 40% 20%, rgba(100,200,255,0.4) 0%, transparent 60%),
              radial-gradient(ellipse 80% 80% at 80% 70%, rgba(60,140,200,0.3) 0%, transparent 50%),
              linear-gradient(180deg, #89CFF0 0%, #5BA8D4 20%, #3A8EBF 40%, #2574A9 60%, #1A5276 80%, #0E3B57 100%)`,
    },
    {
        id: 'aurora',
        name: 'Northern Lights',
        emoji: '🌌',
        css: `radial-gradient(ellipse 100% 50% at 30% 30%, rgba(120,200,255,0.4) 0%, transparent 50%),
              radial-gradient(ellipse 120% 60% at 70% 60%, rgba(180,100,255,0.3) 0%, transparent 50%),
              radial-gradient(ellipse 80% 40% at 50% 80%, rgba(100,255,180,0.2) 0%, transparent 50%),
              linear-gradient(180deg, #0B1026 0%, #1A1744 25%, #2D1B69 50%, #183040 75%, #0C1B2A 100%)`,
    },
    {
        id: 'sakura',
        name: 'Cherry Blossom',
        emoji: '🌸',
        css: `radial-gradient(ellipse 100% 70% at 40% 30%, rgba(255,180,200,0.5) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 70% 70%, rgba(255,200,220,0.4) 0%, transparent 50%),
              linear-gradient(180deg, #FFE0EC 0%, #FFD0E0 20%, #FFC0D4 40%, #FFB0C8 60%, #FFA0BC 80%, #FFE8F0 100%)`,
    },
    {
        id: 'midnight',
        name: 'Midnight City',
        emoji: '🌃',
        css: `radial-gradient(ellipse 100% 60% at 50% 20%, rgba(80,80,120,0.5) 0%, transparent 50%),
              radial-gradient(ellipse 120% 40% at 30% 80%, rgba(60,60,100,0.3) 0%, transparent 50%),
              linear-gradient(180deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0d0d1a 100%)`,
    },
    {
        id: 'desert',
        name: 'Sahara Dunes',
        emoji: '🏜️',
        css: `radial-gradient(ellipse 140% 50% at 50% 0%, rgba(255,220,150,0.6) 0%, transparent 60%),
              radial-gradient(ellipse 100% 80% at 60% 90%, rgba(210,160,90,0.3) 0%, transparent 50%),
              linear-gradient(180deg, #F5DEB3 0%, #E8C88F 20%, #DEB887 40%, #D2A05A 60%, #C8943E 80%, #B87333 100%)`,
    },
    {
        id: 'cosmic',
        name: 'Cosmic Nebula',
        emoji: '✨',
        css: `radial-gradient(ellipse 80% 60% at 30% 40%, rgba(200,100,255,0.4) 0%, transparent 50%),
              radial-gradient(ellipse 100% 50% at 70% 60%, rgba(100,150,255,0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,100,150,0.2) 0%, transparent 50%),
              linear-gradient(180deg, #0D0221 0%, #190A33 25%, #2A0845 50%, #091833 75%, #050D1A 100%)`,
    },
];

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
    const [showDetails, setShowDetails] = useState(false);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [activeBg, setActiveBg] = useState(() => {
        return localStorage.getItem('sprout-bg') || 'nature';
    });
    const actionTimerRef = useRef(null);

    const engine = useSproutEngine();

    // Save background choice
    useEffect(() => {
        localStorage.setItem('sprout-bg', activeBg);
    }, [activeBg]);

    // Get current background CSS
    const currentBgCss = BACKGROUNDS.find(b => b.id === activeBg)?.css || BACKGROUNDS[0].css;
    const isDarkBg = ['aurora', 'midnight', 'cosmic'].includes(activeBg);

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
        <div
            className={`home-container layout-fade-in ${isDarkBg ? 'dark-mode' : ''}`}
            style={{ background: currentBgCss }}
        >
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
                    {/* ══════ HERO ZONE — Sprout takes center stage ══════ */}
                    <section className="hero-zone">
                        {/* Level Badge - top left */}
                        <div className="hero-level-badge">
                            <span>{engine.levelName} · {Math.round(engine.growth)}%</span>
                        </div>

                        {/* Background Picker Button - top right */}
                        <button
                            className="bg-picker-btn"
                            onClick={() => setShowBgPicker(!showBgPicker)}
                            aria-label="Choose background"
                        >
                            <Palette size={18} />
                        </button>

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

                        {/* THE SPROUT — Full hero size */}
                        <div className="hero-sprout-container">
                            <SproutCharacter
                                state={engine.sproutState}
                                mood={engine.mood}
                                action={sproutAction}
                                growth={engine.growth}
                                size={420}
                                onClick={() => handleCare('pet')}
                                onActionComplete={() => setSproutAction(null)}
                            />
                        </div>
                    </section>

                    {/* Care Buttons with integrated health rings */}
                    <nav className="care-buttons" aria-label="Care actions">
                        <CareButton img={btnWater} label="WATER" value={engine.stats.water} color="#42a5f5" disabled={!!sproutAction} onClick={() => handleCare('water')} />
                        <CareButton img={btnFeed} label="FEED" value={engine.stats.food} color="#ff9800" disabled={!!sproutAction} onClick={() => handleCare('feed')} />
                        <CareButton img={btnSun} label="SUN" value={engine.stats.sunlight} color="#fdd835" disabled={!!sproutAction} onClick={() => handleCare('sun')} />
                        <CareButton img={btnPet} label="PET" value={engine.stats.happiness} color="#e91e63" disabled={!!sproutAction} onClick={() => handleCare('pet')} />
                    </nav>

                    {/* Expandable Details Section */}
                    <button
                        className="details-toggle"
                        onClick={() => setShowDetails(!showDetails)}
                        aria-expanded={showDetails}
                    >
                        <span>Habits & Quests ({completedCount}/{engine.habits.length})</span>
                        <ChevronDown size={16} style={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                    </button>

                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                className="details-panel"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                            >
                                {/* Full Stats */}
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Background Picker Overlay */}
                    <AnimatePresence>
                        {showBgPicker && (
                            <motion.div
                                className="bg-picker-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowBgPicker(false)}
                            >
                                <motion.div
                                    className="bg-picker-sheet"
                                    initial={{ y: 200 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: 200 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="bg-picker-header">
                                        <h3>Choose Background</h3>
                                        <button className="bg-picker-close" onClick={() => setShowBgPicker(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="bg-picker-grid">
                                        {BACKGROUNDS.map(bg => (
                                            <button
                                                key={bg.id}
                                                className={`bg-option ${activeBg === bg.id ? 'active' : ''}`}
                                                style={{ background: bg.css }}
                                                onClick={() => { setActiveBg(bg.id); setShowBgPicker(false); }}
                                                aria-label={bg.name}
                                            >
                                                <span className="bg-option-emoji">{bg.emoji}</span>
                                                <span className="bg-option-name">{bg.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

function MiniStat({ img, value, color }) {
    const low = value < 30;
    return (
        <div className="mini-stat" title={`${Math.round(value)}%`}>
            <div className="mini-stat-ring" style={{
                background: `conic-gradient(${low ? '#e74c3c' : color} ${value * 3.6}deg, rgba(255,255,255,0.2) 0deg)`
            }}>
                <img src={img} alt="" className="mini-stat-img" />
            </div>
        </div>
    );
}

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

function CareButton({ img, label, value, color, disabled, onClick }) {
    const low = value < 30;
    const ringColor = low ? '#e74c3c' : color;
    return (
        <button className="care-btn" disabled={disabled} onClick={onClick} title={`${label}: ${Math.round(value)}%`}>
            <div className="care-btn-ring" style={{
                background: `conic-gradient(${ringColor} ${value * 3.6}deg, rgba(0,0,0,0.06) 0deg)`
            }}>
                <img src={img} alt={label} className="care-btn-img" />
            </div>
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
