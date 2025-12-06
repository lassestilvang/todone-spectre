// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimationContext } from "./AnimationProvider";
import { useAnimation } from "../../hooks/useAnimation";

interface TaskAnimationProps {
  children: React.ReactNode;
  taskId: string;
  isCompleted?: boolean;
  isDragging?: boolean;
  isOverdue?: boolean;
  isHighPriority?: boolean;
  isArchived?: boolean;
  taskState?: "active" | "completed" | "overdue" | "archived" | "deleted";
  onAnimationComplete?: () => void;
  onStateChangeComplete?: () => void;
}

export const TaskAnimation: React.FC<TaskAnimationProps> = ({
  children,
  taskId,
  isCompleted = false,
  isDragging = false,
  isOverdue = false,
  isHighPriority = false,
  isArchived = false,
  taskState = "active",
  onAnimationComplete,
  onStateChangeComplete,
}) => {
  const { animationType, animationSpeed, isAnimating } = useAnimationContext();
  const { triggerAnimation } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentState, setCurrentState] = useState<
    "active" | "completed" | "overdue" | "archived" | "deleted"
  >("active");

  useEffect(() => {
    if (isAnimating) {
      triggerAnimation("task-appear");
      setIsVisible(true);
    } else {
      setIsVisible(true);
    }
  }, [isAnimating, taskId]);

  useEffect(() => {
    // Handle task state changes with appropriate animations
    if (isCompleted && currentState !== "completed") {
      setCurrentState("completed");
      triggerAnimation("task-complete");
      if (onStateChangeComplete) {
        setTimeout(() => onStateChangeComplete(), 300 / animationSpeed);
      }
    } else if (isOverdue && currentState !== "overdue") {
      setCurrentState("overdue");
      triggerAnimation("task-overdue");
      if (onStateChangeComplete) {
        setTimeout(() => onStateChangeComplete(), 300 / animationSpeed);
      }
    } else if (isArchived && currentState !== "archived") {
      setCurrentState("archived");
      triggerAnimation("task-archive");
      if (onStateChangeComplete) {
        setTimeout(() => onStateChangeComplete(), 300 / animationSpeed);
      }
    } else if (
      !isCompleted &&
      !isOverdue &&
      !isArchived &&
      currentState !== "active"
    ) {
      setCurrentState("active");
      triggerAnimation("task-restore");
    }
  }, [isCompleted, isOverdue, isArchived, taskState]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3 / animationSpeed,
          ease: "easeOut",
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.2 / animationSpeed,
          ease: "easeIn",
        },
      },
      completed: {
        opacity: 0.7,
        scale: 0.95,
        x: 20,
        borderLeft: "4px solid #4CAF50",
        transition: {
          duration: 0.3 / animationSpeed,
          ease: [0.4, 0, 0.2, 1],
        },
      },
      overdue: {
        opacity: 1,
        scale: 1.02,
        borderLeft: "4px solid #F44336",
        boxShadow: "0 0 10px rgba(244, 67, 54, 0.2)",
        transition: {
          duration: 0.3 / animationSpeed,
          ease: [0.4, 0, 0.2, 1],
          repeat: 1,
          repeatType: "reverse",
        },
      },
      archived: {
        opacity: 0.6,
        scale: 0.9,
        y: 5,
        filter: "grayscale(0.3)",
        transition: {
          duration: 0.4 / animationSpeed,
          ease: "easeInOut",
        },
      },
      highPriority: {
        scale: 1.03,
        boxShadow: "0 0 15px rgba(255, 193, 7, 0.3)",
        borderLeft: "4px solid #FFC107",
        transition: {
          duration: 0.2 / animationSpeed,
          ease: "easeOut",
        },
      },
      dragging: {
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        zIndex: 100,
        transition: {
          duration: 0.1 / animationSpeed,
          ease: "easeOut",
        },
      },
    };

    if (animationType === "slide") {
      baseVariants.hidden.x = -50;
      baseVariants.visible.x = 0;
      baseVariants.exit.x = 50;
    } else if (animationType === "scale") {
      baseVariants.hidden.scale = 0.8;
      baseVariants.visible.scale = 1;
      baseVariants.exit.scale = 0.8;
    } else if (animationType === "bounce") {
      baseVariants.visible.transition = {
        ...baseVariants.visible.transition,
        type: "spring",
        damping: 10,
        stiffness: 100,
      };
    } else if (animationType === "flip") {
      baseVariants.hidden.rotateY = 15;
      baseVariants.visible.rotateY = 0;
      baseVariants.exit.rotateY = -15;
    }

    return baseVariants;
  };

  const getCurrentAnimationState = () => {
    if (isDragging) return "dragging";
    if (isOverdue) return "overdue";
    if (isHighPriority) return "highPriority";
    if (isCompleted) return "completed";
    if (isArchived) return "archived";
    return "visible";
  };

  const getTaskAriaLabel = () => {
    switch (currentState) {
      case "completed":
        return "Task completed";
      case "overdue":
        return "Task overdue";
      case "archived":
        return "Task archived";
      case "dragging":
        return "Task being dragged";
      case "highPriority":
        return "High priority task";
      default:
        return "Active task";
    }
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`task-${taskId}-${currentState}`}
          initial="hidden"
          animate={getCurrentAnimationState()}
          exit="exit"
          variants={variants}
          onAnimationComplete={() => {
            if (isCompleted && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          whileHover={isAnimating ? { scale: 1.01 } : {}}
          whileTap={isAnimating ? { scale: 0.99 } : {}}
          role="region"
          aria-live="polite"
          aria-atomic="true"
          aria-label={getTaskAriaLabel()}
          data-task-state={currentState}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
