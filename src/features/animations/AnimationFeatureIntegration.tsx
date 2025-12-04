import React from 'react';
import { AnimationProvider } from './AnimationProvider';
import { AnimationToolbar } from './AnimationToolbar';
import { AnimationControls } from './AnimationControls';
import { AnimationStateManager } from './AnimationStateManager';
import { useState } from 'react';

interface AnimationFeatureIntegrationProps {
  children: React.ReactNode;
}

export const AnimationFeatureIntegration: React.FC<AnimationFeatureIntegrationProps> = ({ children }) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <AnimationProvider>
      <AnimationStateManager>
        {children}

        <AnimationToolbar
          onToggleControls={() => setShowControls(!showControls)}
          showControls={showControls}
        />

        {showControls && (
          <AnimationControls onClose={() => setShowControls(false)} />
        )}
      </AnimationStateManager>
    </AnimationProvider>
  );
};