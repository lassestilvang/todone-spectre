import { AnimationConfig, AnimationState } from '../../services/animationService';
import { MicroInteractionConfig, MicroInteractionState } from '../../services/microInteractionService';

export const createMockAnimationService = (overrides: Partial<AnimationState> = {}) => {
  const defaultState: AnimationState = {
    isAnimating: true,
    currentAnimation: null,
    animationQueue: [],
    config: {
      duration: 300,
      easing: 'easeInOut',
      type: 'fade'
    },
    ...overrides
  };

  let state = { ...defaultState };
  const subscribers: Array<(state: AnimationState) => void> = [];

  return {
    getState: () => ({ ...state }),
    startAnimation: (animationName: string) => {
      state.animationQueue.push(animationName);
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    stopAnimation: () => {
      state.isAnimating = false;
      state.currentAnimation = null;
      state.animationQueue = [];
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    resumeAnimation: () => {
      state.isAnimating = true;
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    setConfig: (config: Partial<AnimationConfig>) => {
      state.config = { ...state.config, ...config };
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    subscribe: (callback: (state: AnimationState) => void) => {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    },
    reset: () => {
      state = { ...defaultState };
      subscribers.length = 0;
    }
  };
};

export const createMockMicroInteractionService = (overrides: Partial<MicroInteractionState> = {}) => {
  const defaultState: MicroInteractionState = {
    activeInteractions: [],
    config: {
      feedbackType: 'visual',
      intensity: 1,
      duration: 200,
      enabled: true
    },
    isProcessing: false,
    ...overrides
  };

  let state = { ...defaultState };
  const subscribers: Array<(state: MicroInteractionState) => void> = [];

  return {
    getState: () => ({ ...state }),
    triggerInteraction: (type: string) => {
      if (!state.config.enabled || state.isProcessing) return;

      state.isProcessing = true;
      state.activeInteractions.push(type);
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));

      // Simulate async processing
      setTimeout(() => {
        state.activeInteractions = state.activeInteractions.filter(
          interaction => interaction !== type
        );
        state.isProcessing = false;
        state = { ...state };
        subscribers.forEach(callback => callback({ ...state }));
      }, state.config.duration);
    },
    setConfig: (config: Partial<MicroInteractionConfig>) => {
      state.config = { ...state.config, ...config };
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    enableInteractions: (enabled: boolean) => {
      state.config.enabled = enabled;
      state = { ...state };
      subscribers.forEach(callback => callback({ ...state }));
    },
    subscribe: (callback: (state: MicroInteractionState) => void) => {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      };
    },
    reset: () => {
      state = { ...defaultState };
      subscribers.length = 0;
    }
  };
};

export const createAnimationTestContext = () => {
  const mockAnimationService = createMockAnimationService();
  const mockMicroInteractionService = createMockMicroInteractionService();

  return {
    animationService: mockAnimationService,
    microInteractionService: mockMicroInteractionService,
    cleanup: () => {
      mockAnimationService.reset();
      mockMicroInteractionService.reset();
    }
  };
};