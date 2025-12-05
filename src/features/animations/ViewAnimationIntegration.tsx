import React from "react";
import { ViewAnimation } from "./ViewAnimation";
import { useAnimationContext } from "./AnimationProvider";

interface ViewAnimationIntegrationProps {
  viewName: string;
  children: React.ReactNode;
  transitionType?: "fade" | "slide" | "scale" | "flip";
  onEnter?: () => void;
  onExit?: () => void;
}

export const ViewAnimationIntegration: React.FC<
  ViewAnimationIntegrationProps
> = ({ viewName, children, transitionType, onEnter, onExit }) => {
  const { triggerMicroInteraction } = useAnimationContext();

  const handleEnter = () => {
    triggerMicroInteraction("hover");
    if (onEnter) onEnter();
  };

  const handleExit = () => {
    triggerMicroInteraction("press");
    if (onExit) onExit();
  };

  return (
    <ViewAnimation
      viewName={viewName}
      transitionType={transitionType}
      onEnter={handleEnter}
      onExit={handleExit}
    >
      {children}
    </ViewAnimation>
  );
};
