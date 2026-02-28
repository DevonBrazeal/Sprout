import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from './Button';
import './AIVerificationModal.css';

const AIVerificationModal = ({ isOpen, onClose, onVerifySuccess }) => {
    const [step, setStep] = useState('capture'); // capture, analyzing, result
    const [result, setResult] = useState(null); // { success: boolean, message: string }

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('capture');
            setResult(null);
        }
    }, [isOpen]);

    const handleCapture = () => {
        setStep('analyzing');

        // Simulate network delay and Gemini API JSON Response from PRD
        setTimeout(() => {
            // 80% chance of success for testing
            const isSuccess = Math.random() > 0.2;

            if (isSuccess) {
                setResult({
                    success: true,
                    message: 'Verified! You earned +10 Spark and fed your Sprout.'
                });
            } else {
                setResult({
                    success: false,
                    message: 'I see pixels and screen glare. Nice try, but you need to actually go outside.'
                });
            }
            setStep('result');
        }, 2500);
    };

    const handleComplete = () => {
        if (result?.success) {
            onVerifySuccess();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="ai-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="ai-modal-content"
                    initial={{ y: 100, scale: 0.9, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 100, scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    {step === 'capture' && (
                        <div className="step-container">
                            <h3>Verify Your Spark</h3>
                            <p>Snap a live photo of your daily habit. Our AI referee is uncompromising.</p>

                            <div className="mock-camera-viewfinder">
                                {/* Mocking a camera view */}
                                <div className="viewfinder-corner top-left"></div>
                                <div className="viewfinder-corner top-right"></div>
                                <div className="viewfinder-corner bottom-left"></div>
                                <div className="viewfinder-corner bottom-right"></div>

                                <Camera size={48} color="rgba(255,255,255,0.5)" />
                            </div>

                            <div className="modal-actions">
                                <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
                                <Button variant="primary" onClick={handleCapture} style={{ flex: 2 }}>
                                    <Camera size={16} /> Snap Photo
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="step-container analyzing">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                                <Loader2 size={48} color="var(--color-sprout-green)" />
                            </motion.div>
                            <h3>Gemini Referee Analyzing...</h3>
                            <p>Checking for screen pixels, relevance, and authenticity.</p>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className={`step-container result ${result.success ? 'success' : 'fail'}`}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                            >
                                {result.success ? (
                                    <CheckCircle2 size={64} color="var(--color-sprout-green)" />
                                ) : (
                                    <XCircle size={64} color="var(--color-spark-blue)" />
                                )}
                            </motion.div>

                            <h3>{result.success ? 'Spark Approved' : 'Verification Failed'}</h3>

                            <div className="ai-feedback-box">
                                <p>"{result.message}"</p>
                            </div>

                            <Button
                                variant={result.success ? "primary" : "secondary"}
                                onClick={handleComplete}
                                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                            >
                                {result.success ? 'Claim Rewards' : 'Try Again'}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIVerificationModal;
