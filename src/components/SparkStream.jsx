import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Coffee, ShieldCheck } from 'lucide-react';
import './SparkStream.css';

// Mock PRD Social Data
const MOCK_FEED = [
    {
        id: 1,
        user: "Sarah K.",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        habitTitle: "10k Steps Daily",
        photoUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256",
        timeAgo: "2h ago",
        sunlightCount: 14
    },
    {
        id: 2,
        user: "Marcus T.",
        avatar: "https://i.pravatar.cc/150?u=marcus",
        habitTitle: "Morning Hydration",
        photoUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504",
        timeAgo: "5h ago",
        sunlightCount: 8
    },
    {
        id: 3,
        user: "Elena R.",
        avatar: "https://i.pravatar.cc/150?u=elena",
        habitTitle: "Read 10 Pages",
        photoUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
        timeAgo: "1d ago",
        sunlightCount: 32
    }
];

const SparkStream = ({ onReceiveSunlight }) => {
    const [givenSunlight, setGivenSunlight] = useState({});

    const handleSunlight = (id) => {
        if (givenSunlight[id]) return; // Can only give once locally for the demo

        // Animate local UI
        setGivenSunlight(prev => ({ ...prev, [id]: true }));

        // Simulate PRD: "Tapping the photo sends Sunlight... replenish Ghost's Vibe"
        // In a real app, this sends to the OTHER user. For the demo, we'll give the 
        // current user a small vibe bump for being social.
        if (onReceiveSunlight) onReceiveSunlight();
    };

    const handleMicroTip = (user) => {
        // Simulate PRD: Apple Pay sheet for $1.99 Micro-Tip
        alert(`Apple Pay Sheet: Send $1.99 to ${user} for their Spark?`);
    };

    return (
        <div className="spark-stream-container layout-fade-in">
            <header className="stream-header">
                <h2>Spark Stream</h2>
                <p>Verified actions from your Inner Circle.</p>
            </header>

            <div className="stream-feed">
                {MOCK_FEED.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="feed-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                    >
                        {/* Card Header */}
                        <div className="card-header">
                            <div className="user-info">
                                <img src={item.avatar} alt={item.user} className="user-avatar" />
                                <div className="user-meta">
                                    <span className="user-name">{item.user}</span>
                                    <span className="time-ago">{item.timeAgo}</span>
                                </div>
                            </div>
                            <div className="habit-tag">
                                <ShieldCheck size={14} color="#34C759" />
                                <span>{item.habitTitle}</span>
                            </div>
                        </div>

                        {/* AI Verified Photo */}
                        <div className="card-photo-container" onDoubleClick={() => handleSunlight(item.id)}>
                            <img src={item.photoUrl} alt="Verified Habit" className="habit-photo" />

                            {/* Floating Sunlight Animation on click */}
                            {givenSunlight[item.id] && (
                                <motion.div
                                    className="sunlight-burst"
                                    initial={{ scale: 0, opacity: 1, y: 0 }}
                                    animate={{ scale: 2, opacity: 0, y: -50 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <Sun size={48} color="#FFCC00" fill="#FFCC00" />
                                </motion.div>
                            )}
                        </div>

                        {/* Interaction Bar */}
                        <div className="card-actions">
                            <button
                                className={`action-btn sunlight-btn ${givenSunlight[item.id] ? 'active' : ''}`}
                                onClick={() => handleSunlight(item.id)}
                            >
                                <Sun size={20} fill={givenSunlight[item.id] ? "#FFCC00" : "none"} color={givenSunlight[item.id] ? "#FFCC00" : "currentColor"} />
                                <span>{item.sunlightCount + (givenSunlight[item.id] ? 1 : 0)}</span>
                            </button>

                            <button
                                className="action-btn tip-btn"
                                onClick={() => handleMicroTip(item.user)}
                            >
                                <Coffee size={20} />
                                <span>Tip $1.99</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Spacer for bottom tab bar */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default SparkStream;
