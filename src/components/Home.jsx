import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Battery, Droplets, Heart } from 'lucide-react';
import BottomTabBar from './BottomTabBar';
import Button from './Button';
import Toast from './Toast';
import AIVerificationModal from './AIVerificationModal';
import SparkStream from './SparkStream';
import Vaults from './Vaults';
import BountyBoard from './BountyBoard';
import DigitalGarden from './DigitalGarden';
import SproutShop from './SproutShop';
import { useGhostEngine } from '../hooks/useGhostEngine';

import buddyImg from '../assets/prd_sprout_crop.jpg';
import bgImg from '../assets/prd_bg.jpg';
import './Home.css';

const Home = ({ points, addPoints }) => {
    const [activeTab, setActiveTab] = useState('garden');
    const [toastMessage, setToastMessage] = useState(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Initialize the Tamagotchi Engine
    const ghostEngine = useGhostEngine();

    const handleVerifyPhotoClick = () => {
        setIsAiModalOpen(true);
    };

    const handleVerificationSuccess = () => {
        // AI verification JSON passed
        addPoints('spark', 10);
        ghostEngine.logHabitSpark(); // Feeds the ghost manually 100% essence
        showToast('AI Verified. +10 Spark!', 10);
    };

    const showToast = (message, pointAmount) => {
        setToastMessage({ message, points: pointAmount });
    };

    return (
        <div className="home-container layout-fade-in" style={{ backgroundImage: `url(${bgImg})` }}>
            <Toast
                isVisible={!!toastMessage}
                message={toastMessage?.message}
                points={toastMessage?.points}
                onClose={() => setToastMessage(null)}
            />

            {/* Header */}
            <header className="home-header">
                <h1 className="sprout-logo">Sprout</h1>

                <div className="header-points">
                    <div className="point-stat">
                        <span className="spark-icon">✨</span>
                        <span>Spark: {points.spark}</span>
                    </div>
                    <div className="point-stat">
                        <span className="sprout-icon">💵</span>
                        <span>Fiat: $20.00</span>
                    </div>
                </div>
            </header>

            {/* Ghost HUD Stats (Energy, Essence, Vibe) */}
            <div className="ghost-hud">
                <div className="hud-stat" onClick={ghostEngine.logMorningSpark}>
                    <Battery size={14} color={ghostEngine.ghostState.energy > 50 ? "#34C759" : "#FF3B30"} />
                    <span className="hud-label">Energy</span>
                    <div className="hud-bar-bg"><div className="hud-bar-fill" style={{ width: `${ghostEngine.ghostState.energy}%`, backgroundColor: ghostEngine.ghostState.energy > 50 ? "#34C759" : "#FF3B30" }}></div></div>
                </div>
                <div className="hud-stat" onClick={ghostEngine.debugForceDecay}>
                    <Droplets size={14} color="#0A84FF" />
                    <span className="hud-label">Essence</span>
                    <div className="hud-bar-bg"><div className="hud-bar-fill" style={{ width: `${ghostEngine.ghostState.essence}%`, backgroundColor: "#0A84FF" }}></div></div>
                </div>
                <div className="hud-stat">
                    <Heart size={14} color="#FF2D55" />
                    <span className="hud-label">Vibe</span>
                    <div className="hud-bar-bg"><div className="hud-bar-fill" style={{ width: `${ghostEngine.ghostState.vibe}%`, backgroundColor: "#FF2D55" }}></div></div>
                </div>
            </div>

            {/* Main Content Area - Switches based on active tab */}
            {activeTab === 'garden' && (
                <main className="companion-area">
                    {/* Patch over the static character in the original background */}
                    <div className="bg-patch"></div>

                    {/* Render the extracted Sprout visual */}
                    <motion.div
                        className={`central-buddy-container state-${ghostEngine.ghostState.state}`}
                        animate={{
                            y: ghostEngine.ghostState.state === 'thriving' ? [0, -16, 0] : [0, -4, 0],
                            scaleY: ghostEngine.ghostState.state === 'thriving' ? [1, 0.96, 1, 1.02, 1] : [1, 0.99, 1],
                            scaleX: ghostEngine.ghostState.state === 'thriving' ? [1, 1.04, 1, 0.98, 1] : [1, 1.01, 1]
                        }}
                        transition={{ repeat: Infinity, duration: ghostEngine.ghostState.state === 'thriving' ? 3 : 6, ease: "easeInOut" }}
                    >
                        <img src={buddyImg} alt="Your Sprout Bud" className="central-buddy-img" />

                        {ghostEngine.ghostState.state === 'stubborn' && (
                            <div className="ghost-status-bubble">I'm starving. Feed me Sparks.</div>
                        )}
                        {ghostEngine.ghostState.state === 'fading' && (
                            <div className="ghost-status-bubble sad">Fading away... 🪦</div>
                        )}
                    </motion.div>

                    {/* Today's Habit Card */}
                    <motion.div
                        className="habit-card"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="habit-header">
                            <span className="habit-label">Today's Habit</span>
                        </div>
                        <h3 className="habit-title">Daily Meditation &<br />Journaling</h3>
                        <Button onClick={handleVerifyPhotoClick} className="photo-btn" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                            <Camera size={16} style={{ marginRight: 6 }} />
                            Verified Photo
                        </Button>
                    </motion.div>
                </main>
            )}

            {activeTab === 'spark' && (
                <SparkStream
                    onReceiveSunlight={() => ghostEngine.receiveSunlight()}
                />
            )}

            {activeTab === 'vaults' && <Vaults />}
            {activeTab === 'bounty' && <BountyBoard />}
            {activeTab === 'profile' && <DigitalGarden />}
            {activeTab === 'shop' && <SproutShop sparkPoints={points.spark} onPurchase={(price) => addPoints('spark', -price)} />}

            <BottomTabBar activeTab={activeTab} onTabSelect={setActiveTab} />
            <AIVerificationModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onVerifySuccess={handleVerificationSuccess}
            />
        </div>
    );
};

export default Home;
