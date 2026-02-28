import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import './DigitalGarden.css';

const DigitalGarden = () => {
    return (
        <div className="digital-garden-container layout-fade-in">
            <header className="garden-header">
                <h2>Digital Garden</h2>
                <p>Your legacy and accountability ring.</p>
            </header>

            {/* Inner Circle Horizontal Scroll */}
            <section className="garden-section">
                <h3><Star size={18} color="#FFCC00" /> Inner Circle</h3>
                <p className="section-sub">Your top 5 closest friends.</p>

                <div className="inner-circle-scroll">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            className="circle-member"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="ghost-avatar user" />
                            <span className="member-name">Friend {i}</span>
                            <span className="member-vibe">100% Vibe</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Trophy Case */}
            <section className="garden-section">
                <h3><Award size={18} color="#34C759" /> Trophy Case</h3>
                <p className="section-sub">Completed High-Stakes Vaults.</p>

                <div className="trophy-grid">
                    {/* Mocking Golden Sprouts (Vault Trophies) */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="trophy-item"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="golden-sprout-icon">🌱</div>
                            <span className="trophy-title">The 5AM Club {i > 1 ? `Vol ${i}` : ''}</span>
                            <span className="trophy-date">Oct 2026</span>
                        </motion.div>
                    ))}

                    {/* Empty Slots */}
                    {[1, 2, 3].map((i) => (
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
