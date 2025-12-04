import React from 'react';
import { AnimationSystemIntegration } from './AnimationSystemIntegration';

interface AnimationFeatureIntegrationProps {
  children: React.ReactNode;
  performanceMode?: 'balanced' | 'performance' | 'quality';
  accessibilityMode?: 'auto' | 'enhanced' | 'minimal';
  showControls?: boolean;
  maxConcurrentAnimations?: number;
}

export const AnimationFeatureIntegration: React.FC<AnimationFeatureIntegrationProps> = ({
  children,
  performanceMode = 'balanced',
  accessibilityMode = 'auto',
  showControls = true,
  maxConcurrentAnimations = 3
}) => {
  return (
    <AnimationSystemIntegration
      performanceMode={performanceMode}
      accessibilityMode={accessibilityMode}
      showControls={showControls}
      maxConcurrentAnimations={maxConcurrentAnimations}
    >
      {children}
    </AnimationSystemIntegration>
  );
};