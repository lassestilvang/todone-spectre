import React, { useEffect, useState } from "react";
import { useAnimationContext } from "./AnimationProvider";
import { useAnimation } from "../../hooks/useAnimation";

interface AnimationPerformanceOptimizerProps {
  children: React.ReactNode;
  maxConcurrentAnimations?: number;
  throttleDuration?: number;
  performanceMode?: "balanced" | "performance" | "quality";
}

export const AnimationPerformanceOptimizer: React.FC<
  AnimationPerformanceOptimizerProps
> = ({
  children,
  maxConcurrentAnimations = 3,
  throttleDuration = 100,
  performanceMode = "balanced",
}) => {
  const { isAnimating, animationSpeed, setAnimationSpeed } =
    useAnimationContext();
  const { animationState, setAnimationConfig } = useAnimation();
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    animationQueueLength: 0,
    memoryUsage: 0,
    isThrottled: false,
  });

  useEffect(() => {
    if (!isAnimating) return;

    // Performance monitoring
    const performanceInterval = setInterval(() => {
      updatePerformanceStats();
    }, 1000);

    // Animation queue monitoring
    const queueInterval = setInterval(() => {
      checkAnimationQueue();
    }, 200);

    return () => {
      clearInterval(performanceInterval);
      clearInterval(queueInterval);
    };
  }, [isAnimating]);

  const updatePerformanceStats = () => {
    // Simulate performance monitoring
    const newFps = calculateFPS();
    const newMemoryUsage = calculateMemoryUsage();

    setPerformanceStats((prev) => ({
      ...prev,
      fps: newFps,
      memoryUsage: newMemoryUsage,
    }));

    // Apply performance optimizations based on current stats
    optimizeBasedOnPerformance(newFps, newMemoryUsage);
  };

  const checkAnimationQueue = () => {
    const queueLength = animationState.animationQueue?.length || 0;

    setPerformanceStats((prev) => ({
      ...prev,
      animationQueueLength: queueLength,
      isThrottled: queueLength > maxConcurrentAnimations,
    }));

    // Throttle animations if queue is too long
    if (queueLength > maxConcurrentAnimations) {
      applyThrottling();
    } else {
      removeThrottling();
    }
  };

  const calculateFPS = () => {
    // Simulate FPS calculation
    if (performanceMode === "performance") {
      return Math.max(30, 60 - animationState.animationQueue?.length * 2);
    } else if (performanceMode === "quality") {
      return Math.min(60, 60 - animationState.animationQueue?.length);
    } else {
      return Math.max(45, 60 - animationState.animationQueue?.length * 1.5);
    }
  };

  const calculateMemoryUsage = () => {
    // Simulate memory usage calculation
    const baseUsage = 100;
    const animationOverhead = animationState.animationQueue?.length * 15 || 0;
    return Math.min(100, baseUsage + animationOverhead);
  };

  const optimizeBasedOnPerformance = (fps: number, memoryUsage: number) => {
    // Apply performance optimizations
    if (fps < 45 || memoryUsage > 80) {
      // Reduce animation quality when performance is low
      setAnimationConfig({
        duration: Math.max(100, animationState.config?.duration * 0.8),
        easing: "easeInOut",
      });

      if (animationSpeed > 0.8) {
        setAnimationSpeed(Math.max(0.8, animationSpeed * 0.9));
      }
    } else if (fps > 55 && memoryUsage < 60) {
      // Increase animation quality when performance is good
      setAnimationConfig({
        duration: Math.min(500, animationState.config?.duration * 1.1),
        easing: [0.4, 0, 0.2, 1],
      });

      if (animationSpeed < 1.5) {
        setAnimationSpeed(Math.min(1.5, animationSpeed * 1.05));
      }
    }
  };

  const applyThrottling = () => {
    // Reduce animation speed and complexity when throttled
    setAnimationConfig({
      duration: Math.max(150, animationState.config?.duration * 0.7),
      easing: "easeInOut",
      type: "fade", // Use simplest animation type
    });

    if (animationSpeed > 0.7) {
      setAnimationSpeed(Math.max(0.7, animationSpeed * 0.9));
    }
  };

  const removeThrottling = () => {
    // Restore normal animation settings
    setAnimationConfig({
      duration: animationState.config?.duration * 1.1 || 300,
      easing: animationState.config?.easing || "easeInOut",
      type: animationState.config?.type || "fade",
    });
  };

  const getPerformanceIndicatorColor = () => {
    if (performanceStats.fps < 30 || performanceStats.memoryUsage > 90) {
      return "#F44336"; // Red - Critical
    } else if (performanceStats.fps < 45 || performanceStats.memoryUsage > 75) {
      return "#FF9800"; // Orange - Warning
    } else if (performanceStats.fps < 55 || performanceStats.memoryUsage > 60) {
      return "#FFC107"; // Yellow - Caution
    } else {
      return "#4CAF50"; // Green - Good
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {children}

      {isAnimating && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: getPerformanceIndicatorColor(),
              animation: performanceStats.isThrottled
                ? "pulse 1s infinite"
                : "none",
            }}
          />
          <span>🎭 {performanceStats.fps.toFixed(0)} FPS</span>
          <span>📦 {performanceStats.memoryUsage.toFixed(0)}%</span>
          <span>🚦 {performanceStats.animationQueueLength} Q</span>
        </div>
      )}
    </div>
  );
};
