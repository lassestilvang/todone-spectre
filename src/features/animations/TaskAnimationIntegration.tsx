import React from "react";
import { TaskAnimation } from "./TaskAnimation";
import { MicroInteraction } from "./MicroInteraction";
import { useAnimationContext } from "./AnimationProvider";

interface TaskAnimationIntegrationProps {
  taskId: string;
  children: React.ReactNode;
  isCompleted?: boolean;
  isDragging?: boolean;
  onComplete?: () => void;
}

export const TaskAnimationIntegration: React.FC<
  TaskAnimationIntegrationProps
> = ({
  taskId,
  children,
  isCompleted = false,
  isDragging = false,
  onComplete,
}) => {
  const { triggerMicroInteraction } = useAnimationContext();

  const handleCompleteWithAnimation = () => {
    triggerMicroInteraction("success");
    if (onComplete) {
      setTimeout(onComplete, 300); // Allow animation to complete
    }
  };

  return (
    <MicroInteraction
      type="click"
      onInteraction={() => triggerMicroInteraction("click")}
    >
      <TaskAnimation
        taskId={taskId}
        isCompleted={isCompleted}
        isDragging={isDragging}
        onAnimationComplete={handleCompleteWithAnimation}
      >
        {children}
      </TaskAnimation>
    </MicroInteraction>
  );
};
