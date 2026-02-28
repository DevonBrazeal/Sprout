import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import petImage from '../assets/sprout_pet.jpg';
import './SproutCharacter.css';

const SproutCharacter = ({ state = 'thriving', size = 200 }) => {
    const containerRef = useRef(null);

    // Track mouse to softly rotate the frame representing the pet looking around
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current || state !== 'thriving') return;

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
    }, [state]);

    const isFading = state === 'fading';
    const isStubborn = state === 'stubborn';
    const isThriving = state === 'thriving';

    // Breathing animation physics
    const duration = isFading ? 6 : isStubborn ? 4 : 3;
    const breatheY = isFading ? [0, 2, 0] : isStubborn ? [0, 6, 0] : [0, -12, 0];
    const breatheScaleY = isFading ? [1, 0.99, 1] : isStubborn ? [1, 0.96, 1] : [1, 0.96, 1, 1.02, 1];
    const breatheScaleX = isFading ? [1, 1.01, 1] : isStubborn ? [1, 1.04, 1] : [1, 1.04, 1, 0.98, 1];

    return (
        <div
            className={`pet-container state-${state}`}
            ref={containerRef}
            style={{
                width: size,
                height: size,
                perspective: 1000
            }}
        >
            <motion.div
                className="pet-breathing-wrapper"
                animate={{
                    y: breatheY,
                    scaleY: breatheScaleY,
                    scaleX: breatheScaleX,
                    rotateX: rotation.x,
                    rotateY: rotation.y
                }}
                transition={{
                    y: { repeat: Infinity, duration: duration, ease: "easeInOut" },
                    scaleX: { repeat: Infinity, duration: duration, ease: "easeInOut" },
                    scaleY: { repeat: Infinity, duration: duration, ease: "easeInOut" },
                    rotateX: { type: "spring", stiffness: 100, damping: 20 },
                    rotateY: { type: "spring", stiffness: 100, damping: 20 }
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <div className="pet-image-wrapper">
                    <img src={petImage} alt="Sprout Pet" className="pet-image" />

                    {/* Glassmorphic Shine Overlay */}
                    <div className="pet-glass-shine" />
                </div>
            </motion.div>
        </div>
    );
};

export default SproutCharacter;
