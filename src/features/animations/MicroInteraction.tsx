import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from './AnimationProvider';
import { useMicroInteraction } from '../../hooks/useMicroInteraction';

interface MicroInteractionProps {
  children: React.ReactNode;
  type: 'click' | 'hover' | 'press' | 'success' | 'error' | 'loading' | 'focus' | 'drag' | 'tap';
  onInteraction?: () => void;
  disabled?: boolean;
  feedbackType?: 'visual' | 'haptic' | 'sound' | 'combined';
  intensity?: number;
  duration?: number;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type,
  onInteraction,
  disabled = false,
  feedbackType = 'visual',
  intensity = 1,
  duration = 200
}) => {
  const { microInteractionEnabled, triggerMicroInteraction, animationSpeed } = useAnimationContext();
  const { triggerMicroInteraction: triggerMicro } = useMicroInteraction();
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || disabled || !microInteractionEnabled) return;

    const element = elementRef.current;

    const handleClick = () => {
      if (type === 'click' || type === 'tap') {
        setIsActive(true);
        triggerMicroInteraction('click');
        triggerMicro('click');
        if (onInteraction) onInteraction();
        setTimeout(() => setIsActive(false), duration / animationSpeed);
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
      if (type === 'press' || type === 'tap') {
        setIsActive(true);
        triggerMicroInteraction('press');
        triggerMicro('press');
      }
    };

    const handleMouseUp = () => {
      if (type === 'press' || type === 'tap') {
        setIsActive(false);
      }
    };

    const handleFocus = () => {
      if (type === 'focus') {
        setIsFocused(true);
        triggerMicroInteraction('focus');
        triggerMicro('focus');
      }
    };

    const handleBlur = () => {
      if (type === 'focus') {
        setIsFocused(false);
      }
    };

    const handleDragStart = () => {
      if (type === 'drag') {
        setIsDragging(true);
        triggerMicroInteraction('drag');
        triggerMicro('drag');
      }
    };

    const handleDragEnd = () => {
      if (type === 'drag') {
        setIsDragging(false);
      }
    };

    element.addEventListener('click', handleClick);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('dragstart', handleDragStart);
      element.removeEventListener('dragend', handleDragEnd);
    };
  }, [type, disabled, microInteractionEnabled, duration, animationSpeed]);

  const getMicroInteractionVariants = () => {
    const adjustedDuration = duration / (animationSpeed * 1000);
    const adjustedIntensity = intensity;

    const baseVariants = {
      default: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: adjustedDuration,
          ease: 'easeOut'
        }
      },
      active: {
        scale: getScaleForType(type, adjustedIntensity),
        opacity: getOpacityForType(type, adjustedIntensity),
        transition: {
          duration: adjustedDuration,
          ease: 'easeOut'
        }
      },
      focused: {
        scale: 1.02,
        boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.3)',
        transition: {
          duration: adjustedDuration,
          ease: 'easeOut'
        }
      },
      dragging: {
        scale: 1.05,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 100,
        transition: {
          duration: adjustedDuration,
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

  const getScaleForType = (type: string, intensity: number) => {
    switch (type) {
      case 'click': return 0.95 * (2 - intensity);
      case 'press': return 0.98 * (2 - intensity);
      case 'tap': return 0.97 * (2 - intensity);
      case 'hover': return 1.02 * intensity;
      case 'focus': return 1.01 * intensity;
      case 'drag': return 1.05 * intensity;
      default: return 1;
    }
  };

  const getOpacityForType = (type: string, intensity: number) => {
    switch (type) {
      case 'click': return 0.9 * (2 - intensity);
      case 'press': return 0.95 * (2 - intensity);
      case 'tap': return 0.93 * (2 - intensity);
      default: return 1;
    }
  };

  const variants = getMicroInteractionVariants();
  const currentVariant = isDragging ? 'dragging' : isFocused ? 'focused' : isActive ? 'active' : 'default';

  return (
    <motion.div
      ref={elementRef}
      initial="default"
      animate={currentVariant}
      variants={variants}
      style={{
        display: 'inline-block',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : getCursorForType(type),
        opacity: disabled ? 0.6 : 1,
        outline: 'none'
      }}
      whileTap={type === 'press' || type === 'tap' ? { scale: getScaleForType(type, intensity) } : {}}
      whileHover={type === 'hover' ? { scale: getScaleForType('hover', intensity) } : {}}
      drag={type === 'drag' ? true : undefined}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={type === 'drag' ? 0.2 : undefined}
    >
      {children}
    </motion.div>
  );
};

const getCursorForType = (type: string) => {
  switch (type) {
    case 'click': return 'pointer';
    case 'press': return 'pointer';
    case 'tap': return 'pointer';
    case 'hover': return 'pointer';
    case 'focus': return 'pointer';
    case 'drag': return 'grab';
    case 'loading': return 'wait';
    default: return 'default';
  }
};