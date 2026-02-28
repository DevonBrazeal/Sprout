import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, ShieldAlert, Flame, Star, ShoppingBag } from 'lucide-react';
import './TopNavBar.css';

const tabs = [
    { id: 'garden', label: 'Sanctuary', icon: Leaf },
    { id: 'spark', label: 'Stream', icon: Zap },
    { id: 'vaults', label: 'Vaults', icon: ShieldAlert },
    { id: 'bounty', label: 'Bounties', icon: Flame },
    { id: 'profile', label: 'Legacy', icon: Star },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
];

const TopNavBar = ({ activeTab, onTabSelect, points }) => {
    return (
        <div className="top-nav-bar-container">
            <h1 className="nav-logo">Sprout</h1>
            <nav className="top-nav-bar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <motion.button
                            key={tab.id}
                            className={`tab-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabSelect(tab.id)}
                            whileTap={{ scale: 0.95 }}
                            aria-label={tab.label}
                            aria-pressed={isActive}
                        >
                            <div className="tab-icon-container">
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="tab-label">{tab.label}</span>
                        </motion.button>
                    );
                })}
            </nav>
            <div className="nav-placeholder header-points">
                <div className="point-stat">
                    <span className="spark-icon">✨</span>
                    <span style={{ color: 'white' }}>Spark: {points?.spark || 0}</span>
                </div>
                <div className="point-stat">
                    <span className="sprout-icon">💵</span>
                    <span style={{ color: 'white' }}>Fiat: $20.00</span>
                </div>
            </div>
        </div>
    );
};

export default TopNavBar;
