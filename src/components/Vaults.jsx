import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, TrendingUp, Skull, Plus } from 'lucide-react';
import Button from './Button';
import './Vaults.css';

const DEFAULT_VAULT = {
    id: 1,
    name: "The 5AM Club",
    objective: "Wake up by 5AM & Read 10 pgs.",
    buyIn: 20,
    poolSize: 100,
    surviving: 5,
    members: [
        { name: "You", status: "surviving" },
        { name: "Marcus", status: "surviving" },
        { name: "Elena", status: "surviving" },
        { name: "Sarah", status: "eliminated" },
        { name: "David", status: "surviving" }
    ]
};

const Vaults = ({ showToast }) => {
    const [vaults, setVaults] = useState(() => {
        const saved = localStorage.getItem('sprout_vaults');
        return saved ? JSON.parse(saved) : [DEFAULT_VAULT];
    });

    useEffect(() => {
        localStorage.setItem('sprout_vaults', JSON.stringify(vaults));
    }, [vaults]);

    const handleCreateVault = () => {
        const title = prompt("Enter Vault Name (e.g., No Sugar November):");
        if (!title) return;
        
        const buyInStr = prompt("Enter fiat Buy-In amount ($):", "10");
        const buyIn = parseInt(buyInStr) || 10;

        const newVault = {
            id: Date.now(),
            name: title,
            objective: "Custom objective set by you.",
            buyIn: buyIn,
            poolSize: buyIn * 3, // mock 3 people
            surviving: 3,
            members: [
                { name: "You", status: "surviving" },
                { name: "Friend A", status: "surviving" },
                { name: "Friend B", status: "surviving" }
            ]
        };

        setVaults(prev => [newVault, ...prev]);
        if (showToast) showToast('Vault created! Funds placed in escrow.', 50);
    };

    return (
        <div className="vaults-container layout-fade-in">
            <header className="vaults-header">
                <h2>Syndicate Vaults</h2>
                <p>High-stakes multiplayer accountability.</p>
            </header>

            <div className="vaults-list">
                <AnimatePresence>
                    {vaults.map((vault) => (
                        <motion.div 
                            key={vault.id} 
                            className="active-vault-card"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            style={{ marginBottom: 'var(--space-4)' }}
                        >
                            <div className="vault-top-banner">
                                <ShieldAlert size={16} />
                                <span>Active Escrow: ${vault.poolSize.toFixed(2)}</span>
                            </div>

                            <div className="vault-content">
                                <div className="vault-title-group">
                                    <h3>{vault.name}</h3>
                                    <span className="vault-objective">{vault.objective}</span>
                                </div>

                                <div className="vault-stats">
                                    <div className="stat-pill">
                                        <Users size={14} /> {vault.surviving}/{vault.members.length} Surviving
                                    </div>
                                    <div className="stat-pill highlight">
                                        <TrendingUp size={14} /> ${vault.buyIn} Buy-In
                                    </div>
                                </div>

                                <div className="roster-grid">
                                    {vault.members.map((member, i) => (
                                        <div key={i} className={`roster-member ${member.status}`}>
                                            {member.status === 'eliminated' ? (
                                                <div className="sprout-avatar dunced">
                                                    <div className="dunce-cap"></div>
                                                </div>
                                            ) : (
                                                <div className="sprout-avatar user" />
                                            )}
                                            <span className="name">{member.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="create-vault-section">
                <h3>Create New Vault</h3>
                <p className="vault-explainer">
                    Lock in a fiat deposit. Invite friends. Anyone who misses a day gets eliminated,
                    wears the Dunce Cap, and forfeits their deposit to the survivors' pool.
                </p>
                <Button variant="primary" style={{ width: '100%' }} onClick={handleCreateVault}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Create Vault Escrow
                </Button>
            </div>

            {/* Spacer for bottom tab bar */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default Vaults;
