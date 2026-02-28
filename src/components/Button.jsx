import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './Button.css'; // We will create this next

const Button = ({ children, onClick, variant = 'primary', className = '', style = {}, disabled = false }) => {
    const shouldReduceMotion = useReducedMotion();

    // Bouncy spring animation parameters
    const tapAnimation = shouldReduceMotion ? {} : { scale: 0.95 };
    const hoverAnimation = shouldReduceMotion ? {} : { scale: 1.02, y: -2 };

    return (
        <motion.button
            className={`sprout-button sprout-button-${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileTap={tapAnimation}
            whileHover={hoverAnimation}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={style}
        >
            {children}
        </motion.button>
    );
};

export default Button;
