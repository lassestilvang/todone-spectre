import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { useAnimation } from '../../hooks/useAnimation';

interface ViewAnimationProps {
  children: React.ReactNode;
  viewName: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip';
  onEnter?: () => void;
  onExit?: () => void;
}

export const ViewAnimation: React.FC<ViewAnimationProps> = ({
  children,
  viewName,
  transitionType = 'fade',
  onEnter,
  onExit
}) => {
  const { animationSpeed, isAnimating } = useAnimationContext();
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
    const baseVariants = {
      initial: {
        opacity: 0,
        transition: {
          duration: 0.2 / animationSpeed
        }
      },
      animate: {
        opacity: 1,
        transition: {
          duration: 0.3 / animationSpeed,
          ease: 'easeOut'
        }
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.2 / animationSpeed,
          ease: 'easeIn'
        }
      }
    };

    if (transitionType === 'slide') {
      baseVariants.initial.x = 50;
      baseVariants.animate.x = 0;
      baseVariants.exit.x = -50;
    } else if (transitionType === 'scale') {
      baseVariants.initial.scale = 0.95;
      baseVariants.animate.scale = 1;
      baseVariants.exit.scale = 0.95;
    } else if (transitionType === 'flip') {
      baseVariants.initial.rotateY = 15;
      baseVariants.animate.rotateY = 0;
      baseVariants.exit.rotateY = -15;
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
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};