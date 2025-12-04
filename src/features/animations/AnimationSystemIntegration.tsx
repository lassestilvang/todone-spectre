import React from 'react';
import { AnimationProvider } from './AnimationProvider';
import { AnimationPerformanceOptimizer } from './AnimationPerformanceOptimizer';
import { AnimationAccessibility } from './AnimationAccessibility';
import { AnimationStateManager } from './AnimationStateManager';
import { AnimationToolbar } from './AnimationToolbar';
import { AnimationControls } from './AnimationControls';
import { useState } from 'react';

interface AnimationSystemIntegrationProps {
  children: React.ReactNode;
  performanceMode?: 'balanced' | 'performance' | 'quality';
  accessibilityMode?: 'auto' | 'enhanced' | 'minimal';
  showControls?: boolean;
  maxConcurrentAnimations?: number;
}

export const AnimationSystemIntegration: React.FC<AnimationSystemIntegrationProps> = ({
  children,
  performanceMode = 'balanced',
  accessibilityMode = 'auto',
  showControls = true,
  maxConcurrentAnimations = 3
}) => {
  const [controlsVisible, setControlsVisible] = useState(showControls);
  const [controlsPanelVisible, setControlsPanelVisible] = useState(false);

  const getAccessibilityProps = () => {
    switch (accessibilityMode) {
      case 'enhanced':
        return {
          reducedMotion: true,
          highContrast: true,
          screenReaderEnabled: true
        };
      case 'minimal':
        return {
          reducedMotion: false,
          highContrast: false,
          screenReaderEnabled: false
        };
      default: // 'auto'
        return {
          reducedMotion: undefined,
          highContrast: undefined,
          screenReaderEnabled: undefined
        };
    }
  };

  return (
    <AnimationProvider>
      <AnimationStateManager>
        <AnimationPerformanceOptimizer
          performanceMode={performanceMode}
          maxConcurrentAnimations={maxConcurrentAnimations}
        >
          <AnimationAccessibility {...getAccessibilityProps()}>
            {children}

            {controlsVisible && (
              <>
                <AnimationToolbar
                  onToggleControls={() => setControlsPanelVisible(!controlsPanelVisible)}
                  showControls={controlsPanelVisible}
                />

                {controlsPanelVisible && (
                  <AnimationControls onClose={() => setControlsPanelVisible(false)} />
                )}
              </>
            )}
          </AnimationAccessibility>
        </AnimationPerformanceOptimizer>
      </AnimationStateManager>
    </AnimationProvider>
  );
};