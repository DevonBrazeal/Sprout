import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import petImage from '../assets/sprout_pet.jpg';
import './SproutCharacter.css';

const SproutCharacter = ({ state = 'thriving', size = 200, action = null, onActionComplete = () => { } }) => {
    const containerRef = useRef(null);

    // Track mouse to softly rotate the frame representing the pet looking around
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [localAction, setLocalAction] = useState(null);

    // Synchronize external actions into local animation triggers
    useEffect(() => {
        if (action) {
            setLocalAction(action);
            const timer = setTimeout(() => {
                setLocalAction(null);
                onActionComplete();
            }, 1500); // 1.5s action duration
            return () => clearTimeout(timer);
        }
    }, [action, onActionComplete]);

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current || state !== 'thriving' || localAction) return;

            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxRot = 8; // Max degrees of tilt
            let rotX = ((e.clientY - centerY) / window.innerHeight) * -maxRot * 2;
            let rotY = ((e.clientX - centerX) / window.innerWidth) * maxRot * 2;

            rotX = Math.max(-maxRot, Math.min(maxRot, rotX));
            rotY = Math.max(-maxRot, Math.min(maxRot, rotY));

            setRotation({ x: rotX, y: rotY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [state, localAction]);

    const isFading = state === 'fading';
    const isStubborn = state === 'stubborn';

    // Breathing animation physics
    const duration = isFading ? 6 : isStubborn ? 4 : 3;
    const breatheY = isFading ? [0, 2, 0] : isStubborn ? [0, 6, 0] : [0, -12, 0];
    const breatheScaleY = isFading ? [1, 0.99, 1] : isStubborn ? [1, 0.96, 1] : [1, 0.96, 1, 1.02, 1];
    const breatheScaleX = isFading ? [1, 1.01, 1] : isStubborn ? [1, 1.04, 1] : [1, 1.04, 1, 0.98, 1];

    // Interaction handlers
    const handlePetClick = () => {
        if (state !== 'thriving' || localAction) return;
        setLocalAction('pet');
        setTimeout(() => setLocalAction(null), 800);
    };

    // Calculate the current active animation override based on the action
    let activeY = breatheY;
    let activeScaleY = breatheScaleY;
    let activeScaleX = breatheScaleX;
    let activeRotateZ = 0;
    let activeDuration = duration;

    if (localAction === 'pet') {
        // Quick happy squish down and up
        activeY = [0, 10, -5, 0];
        activeScaleY = [1, 0.85, 1.05, 1];
        activeScaleX = [1, 1.15, 0.95, 1];
        activeDuration = 0.8;
    } else if (localAction === 'feed') {
        // Joyful jump and double spin/wiggle
        activeY = [0, -40, 0, -20, 0];
        activeScaleY = [1, 1.1, 0.9, 1.05, 1];
        activeScaleX = [1, 0.9, 1.1, 0.95, 1];
        activeRotateZ = [0, -15, 15, -10, 10, 0];
        activeDuration = 1.5;
    }

    return (
        <div
            className={`pet-container state-${state} ${localAction ? `action-${localAction}` : ''}`}
            ref={containerRef}
            onClick={handlePetClick}
            style={{
                width: size,
                height: size,
                perspective: 1000
            }}
            whileHover={{ scale: state === 'thriving' && !localAction ? 1.05 : 1 }}
        >
            <motion.div
                className="pet-breathing-wrapper"
                animate={{
                    y: activeY,
                    scaleY: activeScaleY,
                    scaleX: activeScaleX,
                    rotateX: localAction ? 0 : rotation.x,
                    rotateY: localAction ? 0 : rotation.y,
                    rotateZ: activeRotateZ
                }}
                transition={{
                    y: { repeat: localAction ? 0 : Infinity, duration: activeDuration, ease: "easeInOut" },
                    scaleX: { repeat: localAction ? 0 : Infinity, duration: activeDuration, ease: "easeInOut" },
                    scaleY: { repeat: localAction ? 0 : Infinity, duration: activeDuration, ease: "easeInOut" },
                    rotateZ: { duration: activeDuration, ease: "easeInOut" },
                    rotateX: { type: "spring", stiffness: 100, damping: 20 },
                    rotateY: { type: "spring", stiffness: 100, damping: 20 }
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <div className="pet-image-wrapper">
                    <img src={petImage} alt="Sprout Pet" className="pet-image" />

                    {/* Glassmorphic Shine Overlay */}
                    <div className="pet-glass-shine" />

                    {/* Action hearts/particles purely handled via CSS overlay classes */}
                    {localAction === 'feed' && <div className="action-particles feed" />}
                    {localAction === 'pet' && <div className="action-particles pet" />}
                </div>
            </motion.div>
        </div>
    );
};

export default SproutCharacter;
