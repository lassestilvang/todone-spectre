interface MicroInteractionConfig {
  feedbackType: 'visual' | 'haptic' | 'sound' | 'combined';
  intensity: number;
  duration: number;
  enabled: boolean;
}

interface MicroInteractionParams {
  type: string;
  config: MicroInteractionConfig;
}

const interactionRegistry: Record<string, (params: MicroInteractionParams) => Promise<void>> = {};

export const microInteractionUtils = {
  registerInteraction: (type: string, fn: (params: MicroInteractionParams) => Promise<void>) => {
    interactionRegistry[type] = fn;
  },

  getInteractionFunction: (type: string) => {
    return interactionRegistry[type];
  },

  getInteractionConfig: (type: string): Partial<MicroInteractionConfig> => {
    const baseConfig: Partial<MicroInteractionConfig> = {
      feedbackType: 'visual',
      intensity: 1,
      duration: 200,
      enabled: true
    };

    if (type === 'click') {
      return {
        ...baseConfig,
        duration: 150,
        intensity: 0.8
      };
    } else if (type === 'hover') {
      return {
        ...baseConfig,
        duration: 100,
        intensity: 0.5
      };
    } else if (type === 'press') {
      return {
        ...baseConfig,
        duration: 200,
        intensity: 1.2
      };
    } else if (type === 'success') {
      return {
        ...baseConfig,
        feedbackType: 'combined',
        duration: 300
      };
    } else if (type === 'error') {
      return {
        ...baseConfig,
        feedbackType: 'combined',
        duration: 400
      };
    }

    return baseConfig;
  },

  executeInteraction: async (type: string, config: Partial<MicroInteractionConfig> = {}) => {
    const interactionFn = interactionRegistry[type];
    if (!interactionFn) {
      console.warn(`Micro-interaction "${type}" not found in registry`);
      return;
    }

    const fullConfig: MicroInteractionConfig = {
      feedbackType: 'visual',
      intensity: 1,
      duration: 200,
      enabled: true,
      ...config
    };

    try {
      await interactionFn({ type, config: fullConfig });
    } catch (error) {
      console.error(`Failed to execute micro-interaction "${type}":`, error);
      throw error;
    }
  }
};

// Register default micro-interactions
microInteractionUtils.registerInteraction('click', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

microInteractionUtils.registerInteraction('hover', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

microInteractionUtils.registerInteraction('press', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

microInteractionUtils.registerInteraction('success', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

microInteractionUtils.registerInteraction('error', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});

microInteractionUtils.registerInteraction('loading', async ({ config }) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), config.duration);
  });
});