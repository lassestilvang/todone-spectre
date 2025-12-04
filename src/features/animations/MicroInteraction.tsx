import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { useMicroInteraction } from '../../hooks/useMicroInteraction';

interface MicroInteractionProps {
  children: React.ReactNode;
  type: 'click' | 'hover' | 'press' | 'success' | 'error' | 'loading';
  onInteraction?: () => void;
  disabled?: boolean;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type,
  onInteraction,
  disabled = false
}) => {
  const { microInteractionEnabled, triggerMicroInteraction } = useAnimationContext();
  const { triggerMicroInteraction: triggerMicro } = useMicroInteraction();
  const [isActive, setIsActive] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || disabled || !microInteractionEnabled) return;

    const element = elementRef.current;

    const handleClick = () => {
      if (type === 'click') {
        setIsActive(true);
        triggerMicroInteraction('click');
        triggerMicro('click');
        if (onInteraction) onInteraction();
        setTimeout(() => setIsActive(false), 300);
      }
    };

    const handleMouseEnter = () => {
      if (type === 'hover') {
        setIsActive(true);
        triggerMicroInteraction('hover');
        triggerMicro('hover');
      }
    };

    const handleMouseLeave = () => {
      if (type === 'hover') {
        setIsActive(false);
      }
    };

    const handleMouseDown = () => {
      if (type === 'press') {
        setIsActive(true);
        triggerMicroInteraction('press');
        triggerMicro('press');
      }
    };

    const handleMouseUp = () => {
      if (type === 'press') {
        setIsActive(false);
      }
    };

    element.addEventListener('click', handleClick);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [type, disabled, microInteractionEnabled]);

  const getMicroInteractionVariants = () => {
    const baseVariants = {
      default: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.1,
          ease: 'easeOut'
        }
      },
      active: {
        scale: type === 'click' ? 0.95 : type === 'press' ? 0.98 : 1.02,
        opacity: type === 'click' ? 0.9 : 1,
        transition: {
          duration: 0.1,
          ease: 'easeOut'
        }
      }
    };

    if (type === 'success') {
      baseVariants.active = {
        ...baseVariants.active,
        backgroundColor: '#4CAF50',
        color: 'white'
      };
    } else if (type === 'error') {
      baseVariants.active = {
        ...baseVariants.active,
        backgroundColor: '#F44336',
        color: 'white'
      };
    } else if (type === 'loading') {
      baseVariants.active = {
        ...baseVariants.active,
        opacity: 0.7,
        scale: 1
      };
    }

    return baseVariants;
  };

  const variants = getMicroInteractionVariants();

  return (
    <motion.div
      ref={elementRef}
      initial="default"
      animate={isActive ? 'active' : 'default'}
      variants={variants}
      style={{
        display: 'inline-block',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
      whileTap={type === 'press' ? { scale: 0.98 } : {}}
      whileHover={type === 'hover' ? { scale: 1.02 } : {}}
    >
      {children}
    </motion.div>
  );
};