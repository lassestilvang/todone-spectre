import { animationUtils } from "../../../utils/animationUtils";

export const generateMockAnimationData = () => {
  return {
    taskAnimations: [
      {
        name: "task-appear",
        config: { duration: 200, easing: "easeOut", type: "slide" },
      },
      {
        name: "task-complete",
        config: { duration: 150, easing: "easeIn", type: "fade" },
      },
      {
        name: "task-drag",
        config: { duration: 100, easing: "linear", type: "scale" },
      },
    ],
    viewAnimations: [
      {
        name: "view-transition",
        config: { duration: 300, easing: "easeInOut", type: "fade" },
      },
      {
        name: "view-enter",
        config: { duration: 250, easing: "easeOut", type: "slide" },
      },
      {
        name: "view-exit",
        config: { duration: 200, easing: "easeIn", type: "fade" },
      },
    ],
    microInteractions: [
      {
        type: "click",
        config: { feedbackType: "visual", intensity: 0.8, duration: 150 },
      },
      {
        type: "hover",
        config: { feedbackType: "visual", intensity: 0.5, duration: 100 },
      },
      {
        type: "press",
        config: { feedbackType: "visual", intensity: 1.2, duration: 200 },
      },
      {
        type: "success",
        config: { feedbackType: "combined", intensity: 1.0, duration: 300 },
      },
      {
        type: "error",
        config: { feedbackType: "combined", intensity: 1.0, duration: 400 },
      },
    ],
  };
};

export const mockAnimationService = {
  getState: () => ({
    isAnimating: true,
    currentAnimation: null,
    animationQueue: [],
    config: {
      duration: 300,
      easing: "easeInOut",
      type: "fade",
    },
  }),
  startAnimation: jest.fn(),
  stopAnimation: jest.fn(),
  resumeAnimation: jest.fn(),
  setConfig: jest.fn(),
  subscribe: jest.fn(),
};

export const mockMicroInteractionService = {
  getState: () => ({
    activeInteractions: [],
    config: {
      feedbackType: "visual",
      intensity: 1,
      duration: 200,
      enabled: true,
    },
    isProcessing: false,
  }),
  triggerInteraction: jest.fn(),
  setConfig: jest.fn(),
  enableInteractions: jest.fn(),
  subscribe: jest.fn(),
};

export const setupAnimationTestEnvironment = () => {
  // Register test animations
  animationUtils.registerAnimation("test-animation", async ({ config }) => {
    return new Promise((resolve) => setTimeout(resolve, config.duration));
  });

};

export const cleanupAnimationTestEnvironment = () => {
  // Clean up test registrations if needed
};

export const createAnimationTestData = () => {
  return {
    animationState: {
      isAnimating: true,
      animationSpeed: 1.0,
      animationType: "fade",
      microInteractionEnabled: true,
    },
    animationConfig: {
      duration: 300,
      easing: "easeInOut",
      type: "fade",
    },
    microInteractionConfig: {
      feedbackType: "visual",
      intensity: 1,
      duration: 200,
      enabled: true,
    },
  };
};
