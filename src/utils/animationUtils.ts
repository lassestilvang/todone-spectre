interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  type: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
}

interface AnimationFunctionParams {
  config: AnimationConfig;
}

const animationRegistry: Record<string, (params: AnimationFunctionParams) => Promise<void>> = {};

export const animationUtils = {
  registerAnimation: (name: string, fn: (params: AnimationFunctionParams) => Promise<void>) => {
    animationRegistry[name] = fn;
  },

  getAnimationFunction: (name: string) => {
    return animationRegistry[name];
  },

  getAnimationConfig: (name: string): AnimationConfig => {
    const baseConfig: AnimationConfig = {
      duration: 300,
      easing: 'easeInOut',
      type: 'fade'
    };

    if (name.includes('task')) {
      return {
        ...baseConfig,
        duration: 200,
        type: 'slide'
      };
    } else if (name.includes('view')) {
      return {
        ...baseConfig,
        duration: 300,
        type: 'fade'
      };
    } else if (name === 'init') {
      return {
        ...baseConfig,
        duration: 100,
        type: 'fade'
      };
    }

    return baseConfig;
  },

  executeAnimation: async (name: string, config: Partial<AnimationConfig> = {}) => {
    const animationFn = animationRegistry[name];
    if (!animationFn) {
      console.warn(`Animation "${name}" not found in registry`);
      return;
    }

    const fullConfig: AnimationConfig = {
      duration: 300,
      easing: 'easeInOut',
      type: 'fade',
      ...config
    };

    try {
      await animationFn({ config: fullConfig });
    } catch (error) {
      console.error(`Failed to execute animation "${name}":`, error);
      throw error;
    }
  }
};

// Register default animations
animationUtils.registerAnimation('task-appear', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('task-complete', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-transition', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('init', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('micro-click', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('micro-hover', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});