import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, points = 1, isVisible, onClose, duration = 3000 }) => {
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const animationVariants = shouldReduceMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        }
        : {
            initial: { y: -50, opacity: 0, scale: 0.9 },
            animate: { y: 16, opacity: 1, scale: 1 },
            exit: { y: -20, opacity: 0, scale: 0.9 }
        };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="sprout-toast-container"
                    variants={animationVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="sprout-toast-content">
                        <div className="sprout-toast-icon">
                            <Sparkles size={20} color="var(--color-white)" />
                        </div>
                        <div className="sprout-toast-text">
                            <span className="sprout-toast-points">+{points} Spark Point</span>
                            <span className="sprout-toast-message">{message}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
