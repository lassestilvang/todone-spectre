import React, { useState } from 'react';
import { useAnimationContext } from './AnimationProvider';
import { motion } from 'framer-motion';

interface AnimationControlsProps {
  onClose: () => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({ onClose }) => {
  const {
    isAnimating,
    animationSpeed,
    animationType,
    microInteractionEnabled,
    toggleAnimation,
    setAnimationSpeed,
    setAnimationType,
    toggleMicroInteraction
  } = useAnimationContext();

  const [speedValue, setSpeedValue] = useState(animationSpeed);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSpeedValue(value);
    setAnimationSpeed(value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnimationType(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="animation-controls"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        width: '250px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Animation Controls</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 5px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={isAnimating}
            onChange={toggleAnimation}
            style={{ marginRight: '8px' }}
          />
          Enable Animations
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={microInteractionEnabled}
            onChange={toggleMicroInteraction}
            style={{ marginRight: '8px' }}
          />
          Enable Micro-interactions
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          Animation Speed: {speedValue.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speedValue}
          onChange={handleSpeedChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          Animation Type:
        </label>
        <select
          value={animationType}
          onChange={handleTypeChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="scale">Scale</option>
          <option value="bounce">Bounce</option>
          <option value="flip">Flip</option>
        </select>
      </div>
    </motion.div>
  );
};