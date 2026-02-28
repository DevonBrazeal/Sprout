import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, TrendingUp, Skull } from 'lucide-react';
import Button from './Button';
import './Vaults.css';

const Vaults = () => {
    return (
        <div className="vaults-container layout-fade-in">
            <header className="vaults-header">
                <h2>Syndicate Vaults</h2>
                <p>High-stakes multiplayer accountability.</p>
            </header>

            <div className="active-vault-card">
                <div className="vault-top-banner">
                    <ShieldAlert size={16} />
                    <span>Active Escrow: $100.00</span>
                </div>

                <div className="vault-content">
                    <div className="vault-title-group">
                        <h3>The 5AM Club</h3>
                        <span className="vault-objective">Wake up by 5AM & Read 10 pgs.</span>
                    </div>

                    <div className="vault-stats">
                        <div className="stat-pill">
                            <Users size={14} /> 5/5 Surviving
                        </div>
                        <div className="stat-pill highlight">
                            <TrendingUp size={14} /> $20 Buy-In
                        </div>
                    </div>

                    <div className="roster-grid">
                        {/* Mocking the 5 Ghosts */}
                        <div className="roster-member surviving">
                            <div className="ghost-avatar user" />
                            <span className="name">You</span>
                        </div>
                        <div className="roster-member surviving">
                            <div className="ghost-avatar" />
                            <span className="name">Marcus</span>
                        </div>
                        <div className="roster-member surviving">
                            <div className="ghost-avatar" />
                            <span className="name">Elena</span>
                        </div>
                        <div className="roster-member eliminated">
                            <div className="ghost-avatar dunced" >
                                <div className="dunce-cap"></div>
                            </div>
                            <span className="name">Sarah</span>
                        </div>
                        <div className="roster-member surviving">
                            <div className="ghost-avatar" />
                            <span className="name">David</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="create-vault-section">
                <h3>Create New Vault</h3>
                <p className="vault-explainer">
                    Lock in a fiat deposit. Invite friends. Anyone who misses a day gets eliminated,
                    wears the Dunce Cap, and forfeits their deposit to the survivors' pool.
                </p>
                <Button variant="primary" style={{ width: '100%' }}>
                    + Create Vault Escrow
                </Button>
            </div>

            {/* Spacer for bottom tab bar */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default Vaults;
