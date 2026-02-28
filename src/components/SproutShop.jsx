import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CloudRain, Glasses, Sparkles } from 'lucide-react';
import Button from './Button';
import './SproutShop.css';

const CosmeticsData = [
    { id: 1, name: 'Cool Shades', price: 50, currency: 'spark', icon: <Glasses size={32} /> },
    { id: 2, name: 'Golden Aura', price: 200, currency: 'spark', icon: <Sparkles size={32} /> },
];

const SproutShop = ({ sparkPoints, onPurchase }) => {
    const handleSabotage = () => {
        alert("Apple Pay Sheet: Buy Sabotage for $0.99?");
    };

    const handleBailout = () => {
        alert("Apple Pay Sheet: Buy Habit Bailout for $1.99?");
    };

    const buyCosmetic = (item) => {
        if (sparkPoints >= item.price) {
            onPurchase(item.price);
            alert(`Equipped ${item.name}!`);
        } else {
            alert("Not enough Spark Points.");
        }
    };

    return (
        <div className="sprout-shop-container layout-fade-in">
            <header className="shop-header">
                <h2>Sprout Shop</h2>
                <div className="shop-balance">
                    <span className="balance-pill">✨ {sparkPoints} Spark</span>
                    <span className="balance-pill fiat">💵 $20.00 Fiat</span>
                </div>
            </header>

            {/* Utilities Section (Fiat) */}
            <section className="shop-section">
                <h3>Protocol Utilities</h3>
                <p className="section-desc">Real-money bailouts and social sabotage.</p>

                <div className="utility-cards">
                    <motion.div className="utility-card bailout" whileTap={{ scale: 0.95 }}>
                        <div className="util-icon-wrapper">
                            <CloudRain size={24} color="#FF3B30" />
                        </div>
                        <div className="util-info">
                            <h4>Bailout Fine</h4>
                            <p>Missed a habit? Clear your Sad Raincloud status instantly.</p>
                        </div>
                        <Button variant="secondary" onClick={handleBailout} className="buy-btn fiat-btn">
                            $1.99
                        </Button>
                    </motion.div>

                    <motion.div className="utility-card sabotage" whileTap={{ scale: 0.95 }}>
                        <div className="util-icon-wrapper">
                            <ShoppingBag size={24} color="#AF52DE" />
                        </div>
                        <div className="util-info">
                            <h4>Social Sabotage</h4>
                            <p>Force a friend's Sprout to wear a silly outfit in the public stream.</p>
                        </div>
                        <Button variant="secondary" onClick={handleSabotage} className="buy-btn fiat-btn">
                            $0.99
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Cosmetics Section (Spark Points) */}
            <section className="shop-section cosmetics-section">
                <h3>Sprout Cosmetics</h3>
                <p className="section-desc">Spend your hard-earned Spark points.</p>

                <div className="cosmetics-grid">
                    {CosmeticsData.map(item => (
                        <motion.div key={item.id} className="cosmetic-item" whileHover={{ y: -5 }}>
                            <div className="cosmetic-preview">
                                {item.icon}
                            </div>
                            <div className="cosmetic-details">
                                <span className="cosmetic-name">{item.name}</span>
                                <Button
                                    variant="glass"
                                    onClick={() => buyCosmetic(item)}
                                    className={`buy-btn ${sparkPoints < item.price ? 'disabled' : ''}`}
                                >
                                    ✨ {item.price}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Spacer */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default SproutShop;
