import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { useAnimation } from '../../hooks/useAnimation';

interface ViewAnimationProps {
  children: React.ReactNode;
  viewName: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' | 'zoom' | 'rotate' | 'custom';
  direction?: 'left' | 'right' | 'up' | 'down' | 'none';
  onEnter?: () => void;
  onExit?: () => void;
  customVariants?: {
    initial: any;
    animate: any;
    exit: any;
  };
  durationMultiplier?: number;
}

export const ViewAnimation: React.FC<ViewAnimationProps> = ({
  children,
  viewName,
  transitionType = 'fade',
  direction = 'right',
  onEnter,
  onExit,
  customVariants,
  durationMultiplier = 1
}) => {
  const { animationSpeed, isAnimating, animationType } = useAnimationContext();
  const { triggerAnimation } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      triggerAnimation('view-transition');
      setIsVisible(true);
      if (onEnter) onEnter();
    } else {
      setIsVisible(true);
      if (onEnter) onEnter();
    }

    return () => {
      if (onExit) onExit();
    };
  }, [viewName]);

  const getTransitionVariants = () => {
    if (customVariants) {
      return customVariants;
    }

    const baseDuration = 0.3 * durationMultiplier;
    const baseVariants = {
      initial: {
        opacity: 0,
        transition: {
          duration: 0.2 * baseDuration / animationSpeed,
          ease: 'easeIn'
        }
      },
      animate: {
        opacity: 1,
        transition: {
          duration: baseDuration / animationSpeed,
          ease: 'easeOut'
        }
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.2 * baseDuration / animationSpeed,
          ease: 'easeIn'
        }
      }
    };

    // Apply transition type
    if (transitionType === 'slide') {
      const slideDistance = 50;
      if (direction === 'left') {
        baseVariants.initial.x = -slideDistance;
        baseVariants.exit.x = slideDistance;
      } else if (direction === 'right') {
        baseVariants.initial.x = slideDistance;
        baseVariants.exit.x = -slideDistance;
      } else if (direction === 'up') {
        baseVariants.initial.y = slideDistance;
        baseVariants.exit.y = -slideDistance;
      } else if (direction === 'down') {
        baseVariants.initial.y = -slideDistance;
        baseVariants.exit.y = slideDistance;
      }
    } else if (transitionType === 'scale') {
      baseVariants.initial.scale = 0.95;
      baseVariants.exit.scale = 0.95;
    } else if (transitionType === 'flip') {
      baseVariants.initial.rotateY = direction === 'left' ? -15 : 15;
      baseVariants.animate.rotateY = 0;
      baseVariants.exit.rotateY = direction === 'left' ? 15 : -15;
    } else if (transitionType === 'zoom') {
      baseVariants.initial.scale = 0.8;
      baseVariants.exit.scale = 1.1;
    } else if (transitionType === 'rotate') {
      baseVariants.initial.rotate = direction === 'left' ? -5 : 5;
      baseVariants.animate.rotate = 0;
      baseVariants.exit.rotate = direction === 'left' ? 5 : -5;
    }

    // Apply global animation type override
    if (animationType === 'bounce') {
      baseVariants.animate.transition = {
        ...baseVariants.animate.transition,
        type: 'spring',
        damping: 10,
        stiffness: 100
      };
    }

    return baseVariants;
  };

  const variants = getTransitionVariants();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`view-${viewName}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
          role="region"
          aria-live="polite"
          aria-label={`${viewName} view`}
          data-view-name={viewName}
          data-transition-type={transitionType}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};