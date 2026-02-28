import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Battery, Droplets, Heart } from 'lucide-react';
import TopNavBar from './TopNavBar';
import Button from './Button';
import Toast from './Toast';
import AIVerificationModal from './AIVerificationModal';
import SparkStream from './SparkStream';
import Vaults from './Vaults';
import BountyBoard from './BountyBoard';
import DigitalGarden from './DigitalGarden';
import SproutShop from './SproutShop';
import { useGhostEngine } from '../hooks/useGhostEngine';

import GhostCharacter from './GhostCharacter';
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

                    {/* Render the extracted Sprout visual */}
                    <div className="central-buddy-container">
                        <GhostCharacter state={ghostEngine.ghostState.state} size={300} />

                        {ghostEngine.ghostState.state === 'stubborn' && (
                            <div className="ghost-status-bubble">I'm starving. Feed me Sparks.</div>
                        )}
                        {ghostEngine.ghostState.state === 'fading' && (
                            <div className="ghost-status-bubble sad">Fading away... 🪦</div>
                        )}
                    </div>

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

            <AIVerificationModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onVerifySuccess={handleVerificationSuccess}
            />
        </div>
    );
};

export default Home;
