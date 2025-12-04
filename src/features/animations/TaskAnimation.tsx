import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { useAnimation } from '../../hooks/useAnimation';

interface TaskAnimationProps {
  children: React.ReactNode;
  taskId: string;
  isCompleted?: boolean;
  isDragging?: boolean;
  onAnimationComplete?: () => void;
}

export const TaskAnimation: React.FC<TaskAnimationProps> = ({
  children,
  taskId,
  isCompleted = false,
  isDragging = false,
  onAnimationComplete
}) => {
  const { animationType, animationSpeed, isAnimating } = useAnimationContext();
  const { triggerAnimation } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      triggerAnimation('task-appear');
      setIsVisible(true);
    } else {
      setIsVisible(true);
    }
  }, [isAnimating, taskId]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3 / animationSpeed,
          ease: 'easeOut'
        }
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.2 / animationSpeed,
          ease: 'easeIn'
        }
      },
      completed: {
        opacity: 0.7,
        scale: 0.95,
        transition: {
          duration: 0.2 / animationSpeed,
          ease: 'easeOut'
        }
      },
      dragging: {
        scale: 1.05,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 100,
        transition: {
          duration: 0.1 / animationSpeed,
          ease: 'easeOut'
        }
      }
    };

    if (animationType === 'slide') {
      baseVariants.hidden.x = -50;
      baseVariants.visible.x = 0;
      baseVariants.exit.x = 50;
    } else if (animationType === 'scale') {
      baseVariants.hidden.scale = 0.8;
      baseVariants.visible.scale = 1;
      baseVariants.exit.scale = 0.8;
    }

    return baseVariants;
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`task-${taskId}`}
          initial="hidden"
          animate={isCompleted ? 'completed' : isDragging ? 'dragging' : 'visible'}
          exit="exit"
          variants={variants}
          onAnimationComplete={() => {
            if (isCompleted && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
          style={{
            position: 'relative',
            width: '100%'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};