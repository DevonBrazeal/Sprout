import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Plus, Globe } from 'lucide-react';
import Button from './Button';
import { useSproutEngine } from '../hooks/useSproutEngine';
import './DigitalGarden.css';

const DigitalGarden = () => {
    const engine = useSproutEngine();
    
    const [friends, setFriends] = useState(() => {
        const saved = localStorage.getItem('sprout_friends');
        return saved ? JSON.parse(saved) : [{ name: 'Alex', vibe: '100% Vibe' }, { name: 'Sam', vibe: '90% Vibe' }];
    });

    const [trophies, setTrophies] = useState(() => {
        const saved = localStorage.getItem('sprout_trophies');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('sprout_friends', JSON.stringify(friends));
    }, [friends]);

    useEffect(() => {
        localStorage.setItem('sprout_trophies', JSON.stringify(trophies));
    }, [trophies]);

    const handleAddFriend = () => {
        const name = prompt("Enter friend's Sprout ID or Name:");
        if (name) {
            setFriends(prev => [{ name, vibe: 'Needs Water' }, ...prev]);
        }
    };

    const handlePlantSprout = () => {
        if (engine.level >= 4) {
            setTrophies(prev => [...prev, {
                title: 'The Great Bloom',
                date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }]);
            engine.debugReset();
            alert("Sprout planted in the garden! A new seed has been given to you.");
        } else {
            alert(`Your Sprout needs to reach Level 4 (Bloomling) to be planted in the garden. It is currently Level ${engine.level}.`);
        }
    };

    return (
        <div className="digital-garden-container layout-fade-in">
            <header className="garden-header">
                <h2>Digital Garden</h2>
                <p>Your legacy and accountability ring.</p>
            </header>

            {/* Inner Circle Horizontal Scroll */}
            <section className="garden-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><Star size={18} color="#FFCC00" /> Inner Circle</h3>
                    <Button variant="glass" onClick={handleAddFriend} style={{ padding: '4px 12px', fontSize: '11px' }}>
                        <Plus size={12} style={{ marginRight: 4 }} /> Add
                    </Button>
                </div>
                <p className="section-sub">Your top closest friends.</p>

                <div className="inner-circle-scroll">
                    <AnimatePresence>
                        {friends.map((friend, i) => (
                            <motion.div
                                key={friend.name + i}
                                className="circle-member"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="sprout-avatar user" />
                                <span className="member-name">{friend.name}</span>
                                <span className="member-vibe">{friend.vibe}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Trophy Case */}
            <section className="garden-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><Award size={18} color="#34C759" /> Trophy Case</h3>
                    <Button 
                        variant="primary" 
                        onClick={handlePlantSprout} 
                        style={{ padding: '4px 12px', fontSize: '11px', background: engine.level >= 4 ? 'var(--color-sprout-green)' : 'rgba(255,255,255,0.1)' }}
                    >
                        <Globe size={12} style={{ marginRight: 4 }} /> Plant Sprout
                    </Button>
                </div>
                <p className="section-sub">Completed High-Stakes Vaults and Retired Sprouts.</p>

                <div className="trophy-grid">
                    {trophies.map((trophy, i) => (
                        <motion.div
                            key={i}
                            className="trophy-item"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="golden-sprout-icon">🌱</div>
                            <span className="trophy-title">{trophy.title}</span>
                            <span className="trophy-date">{trophy.date}</span>
                        </motion.div>
                    ))}

                    {/* Empty Slots to pad out to at least 3 */}
                    {Array.from({ length: Math.max(3 - trophies.length, 0) }).map((_, i) => (
                        <div key={`empty-${i}`} className="trophy-item empty" />
                    ))}
                </div>
            </section>

            {/* Spacer for bottom tab bar */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default DigitalGarden;
