import React, { useState } from 'react';
import { useAnimationContext } from './AnimationProvider';
import { motion } from 'framer-motion';

interface AnimationConfigProps {
  onSave: () => void;
  onCancel: () => void;
}

export const AnimationConfig: React.FC<AnimationConfigProps> = ({ onSave, onCancel }) => {
  const {
    animationSpeed,
    animationType,
    setAnimationSpeed,
    setAnimationType
  } = useAnimationContext();

  const [tempSpeed, setTempSpeed] = useState(animationSpeed);
  const [tempType, setTempType] = useState(animationType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnimationSpeed(tempSpeed);
    setAnimationType(tempType);
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        margin: '0 auto'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Animation Configuration</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Animation Speed ({tempSpeed.toFixed(1)}x)
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={tempSpeed}
            onChange={(e) => setTempSpeed(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Animation Type
          </label>
          <select
            value={tempType}
            onChange={(e) => setTempType(e.target.value)}
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

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: '#4CAF50',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </motion.div>
  );
};