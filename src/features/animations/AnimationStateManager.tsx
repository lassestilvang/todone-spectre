import React, { useState, useEffect } from "react";
import { useAnimationContext } from "./AnimationProvider";
import { useAnimation } from "../../hooks/useAnimation";
import { useMicroInteraction } from "../../hooks/useMicroInteraction";

interface AnimationStateManagerProps {
  children: React.ReactNode;
}

export const AnimationStateManager: React.FC<AnimationStateManagerProps> = ({
  children,
}) => {
  const { animationState } = useAnimation();
  const { microInteractionState } = useMicroInteraction();
  const {
    isAnimating,
    animationSpeed,
    animationType,
    microInteractionEnabled,
  } = useAnimationContext();

  const [stateHistory, setStateHistory] = useState<any[]>([]);

  useEffect(() => {
    // Log animation state changes
    const newState = {
      timestamp: new Date().toISOString(),
      isAnimating,
      animationSpeed,
      animationType,
      microInteractionEnabled,
      currentAnimation: animationState.currentAnimation,
      animationQueue: animationState.animationQueue,
      activeInteractions: microInteractionState.activeInteractions,
    };

    setStateHistory((prev) => {
      const updatedHistory = [...prev, newState];
      return updatedHistory.slice(-10); // Keep last 10 states
    });
  }, [
    isAnimating,
    animationSpeed,
    animationType,
    microInteractionEnabled,
    animationState,
    microInteractionState,
  ]);

  const getCurrentState = () => {
    return {
      isAnimating,
      animationSpeed,
      animationType,
      microInteractionEnabled,
      currentAnimation: animationState.currentAnimation,
      animationQueue: animationState.animationQueue,
      activeInteractions: microInteractionState.activeInteractions,
    };
  };

  const restoreState = (state: any) => {
    // This would be implemented to restore animation state
    console.log("Restoring animation state:", state);
  };

  return <div style={{ display: "contents" }}>{children}</div>;
};

export const useAnimationState = () => {
  const { animationState } = useAnimation();
  const { microInteractionState } = useMicroInteraction();
  const {
    isAnimating,
    animationSpeed,
    animationType,
    microInteractionEnabled,
  } = useAnimationContext();

  const getCurrentState = () => ({
    isAnimating,
    animationSpeed,
    animationType,
    microInteractionEnabled,
    currentAnimation: animationState.currentAnimation,
    animationQueue: animationState.animationQueue,
    activeInteractions: microInteractionState.activeInteractions,
  });

  return {
    getCurrentState,
    animationState,
    microInteractionState,
  };
};
