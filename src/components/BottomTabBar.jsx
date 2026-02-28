import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, ShieldAlert, Flame, Star, ShoppingBag } from 'lucide-react';
import './BottomTabBar.css';

const tabs = [
    { id: 'garden', label: 'Sanctuary', icon: Leaf },
    { id: 'spark', label: 'Stream', icon: Zap },
    { id: 'vaults', label: 'Vaults', icon: ShieldAlert },
    { id: 'bounty', label: 'Bounties', icon: Flame },
    { id: 'profile', label: 'Legacy', icon: Star },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
];

const BottomTabBar = ({ activeTab, onTabSelect }) => {
    return (
        <div className="bottom-tab-bar-container">
            <nav className="bottom-tab-bar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <motion.button
                            key={tab.id}
                            className={`tab-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabSelect(tab.id)}
                            whileTap={{ scale: 0.9 }}
                            aria-label={tab.label}
                            aria-pressed={isActive}
                        >
                            <div className="tab-icon-container">
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="tab-label">{tab.label}</span>
                        </motion.button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomTabBar;
