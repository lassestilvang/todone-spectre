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
      if (name === 'task-complete') {
        return {
          ...baseConfig,
          duration: 300,
          type: 'scale',
          easing: [0.4, 0, 0.2, 1]
        };
      } else if (name === 'task-overdue') {
        return {
          ...baseConfig,
          duration: 400,
          type: 'scale',
          easing: [0.4, 0, 0.2, 1]
        };
      } else if (name === 'task-archive') {
        return {
          ...baseConfig,
          duration: 350,
          type: 'fade',
          easing: 'easeInOut'
        };
      } else if (name === 'task-restore') {
        return {
          ...baseConfig,
          duration: 250,
          type: 'slide',
          easing: 'easeOut'
        };
      } else if (name === 'task-priority') {
        return {
          ...baseConfig,
          duration: 200,
          type: 'bounce',
          easing: [0.4, 0, 0.2, 1]
        };
      } else {
        return {
          ...baseConfig,
          duration: 200,
          type: 'slide'
        };
      }
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

animationUtils.registerAnimation('task-overdue', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('task-archive', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('task-restore', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('task-priority', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-transition', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-slide', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-scale', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-flip', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-zoom', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

animationUtils.registerAnimation('view-rotate', async ({ config }) => {
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