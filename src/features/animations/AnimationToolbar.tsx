import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { AnimationConfig } from './AnimationConfig';

interface AnimationToolbarProps {
  onToggleControls: () => void;
  showControls: boolean;
}

export const AnimationToolbar: React.FC<AnimationToolbarProps> = ({
  onToggleControls,
  showControls
}) => {
  const {
    isAnimating,
    microInteractionEnabled,
    toggleAnimation,
    toggleMicroInteraction
  } = useAnimationContext();

  const [showConfig, setShowConfig] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: '80px', left: '20px', zIndex: 1001 }}
          >
            <AnimationConfig
              onSave={() => setShowConfig(false)}
              onCancel={() => setShowConfig(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleAnimation}
        style={{
          padding: '10px 15px',
          borderRadius: '20px',
          border: 'none',
          background: isAnimating ? '#4CAF50' : '#f0f0f0',
          color: isAnimating ? 'white' : '#333',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span>{isAnimating ? '🎭' : '🚫'}</span>
        <span>{isAnimating ? 'Animations ON' : 'Animations OFF'}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleMicroInteraction}
        style={{
          padding: '10px 15px',
          borderRadius: '20px',
          border: 'none',
          background: microInteractionEnabled ? '#2196F3' : '#f0f0f0',
          color: microInteractionEnabled ? 'white' : '#333',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span>{microInteractionEnabled ? '✨' : '🚫'}</span>
        <span>{microInteractionEnabled ? 'Micro ON' : 'Micro OFF'}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConfig(!showConfig)}
        style={{
          padding: '10px 15px',
          borderRadius: '20px',
          border: 'none',
          background: '#FF9800',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span>⚙️</span>
        <span>Configure</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleControls}
        style={{
          padding: '10px 15px',
          borderRadius: '20px',
          border: 'none',
          background: showControls ? '#F44336' : '#9C27B0',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span>{showControls ? '🔼' : '🔽'}</span>
        <span>{showControls ? 'Hide Panel' : 'Show Panel'}</span>
      </motion.button>
    </div>
  );
};