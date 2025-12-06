// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAnimation } from "../../hooks/useAnimation";
import { useMicroInteraction } from "../../hooks/useMicroInteraction";

interface AnimationContextType {
  isAnimating: boolean;
  animationSpeed: number;
  animationType: string;
  microInteractionEnabled: boolean;
  toggleAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationType: (type: string) => void;
  toggleMicroInteraction: () => void;
  triggerMicroInteraction: (type: string) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined,
);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animationType, setAnimationType] = useState("fade");
  const [microInteractionEnabled, setMicroInteractionEnabled] = useState(true);

  const { triggerAnimation } = useAnimation();
  const { triggerMicroInteraction: triggerMicro } = useMicroInteraction();

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const toggleMicroInteraction = () => {
    setMicroInteractionEnabled(!microInteractionEnabled);
  };

  const triggerMicroInteraction = (type: string) => {
    if (microInteractionEnabled) {
      triggerMicro(type);
    }
  };

  useEffect(() => {
    // Initialize default animations
    if (isAnimating) {
      triggerAnimation("init");
    }
  }, [isAnimating]);

  return (
    <AnimationContext.Provider
      value={{
        isAnimating,
        animationSpeed,
        animationType,
        microInteractionEnabled,
        toggleAnimation,
        setAnimationSpeed,
        setAnimationType,
        toggleMicroInteraction,
        triggerMicroInteraction,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error(
      "useAnimationContext must be used within an AnimationProvider",
    );
  }
  return context;
};
