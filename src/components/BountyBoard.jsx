import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Link, Trophy } from 'lucide-react';
import Button from './Button';
import './BountyBoard.css';

const MOCK_LEADERBOARD = [
    { rank: 1, user: "Alex J.", views: "1.2M", isMe: false },
    { rank: 2, user: "Sarah K.", views: "850K", isMe: false },
    { rank: 3, user: "Marcus T.", views: "410K", isMe: false },
    { rank: 42, user: "You", views: "1.2K", isMe: true },
];

const BountyBoard = () => {
    return (
        <div className="bounty-board-container layout-fade-in">
            <header className="bounty-header">
                <h2>Bounty Board</h2>
                <p>Go viral. Grow the protocol. Win Fiat.</p>
            </header>

            {/* Today's Global Challenge */}
            <motion.div
                className="global-challenge-card"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="challenge-badge">
                    <Flame size={16} fill="currentColor" color="#FF3B30" />
                    <span>Daily Viral Bounty</span>
                </div>
                <h3>Buy coffee for the person behind you in the drive-thru.</h3>
                <p className="bounty-prize">Prize Pool: <strong>$500.00</strong> + Excl. Cosmetic</p>
                <p className="countdown">Closes in: 08:42:10</p>
            </motion.div>

            {/* Submission Input */}
            <div className="submission-section">
                <label>Submit your evidence link (TikTok / Reels)</label>
                <div className="input-row">
                    <div className="input-wrapper">
                        <Link size={16} className="input-icon" />
                        <input type="url" placeholder="https://tiktok.com/@..." className="bounty-input" />
                    </div>
                    <Button variant="primary">Submit</Button>
                </div>
            </div>

            {/* Live Leaderboard */}
            <div className="leaderboard-section">
                <div className="section-header">
                    <Trophy size={18} color="#FFCC00" />
                    <h3>Live Rankings</h3>
                </div>

                <div className="leaderboard-list">
                    {MOCK_LEADERBOARD.map((item) => (
                        <div key={item.rank} className={`leaderboard-row ${item.isMe ? 'is-me' : ''}`}>
                            <span className="rank">#{item.rank}</span>
                            <span className="user">{item.user}</span>
                            <span className="views">{item.views} views</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default BountyBoard;
