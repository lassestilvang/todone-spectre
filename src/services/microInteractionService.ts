import { microInteractionUtils } from '../utils/microInteractionUtils';

interface MicroInteractionConfig {
  feedbackType: 'visual' | 'haptic' | 'sound' | 'combined';
  intensity: number;
  duration: number;
  enabled: boolean;
}

interface MicroInteractionState {
  activeInteractions: string[];
  config: MicroInteractionConfig;
  isProcessing: boolean;
}

class MicroInteractionService {
  private state: MicroInteractionState;
  private subscribers: ((state: MicroInteractionState) => void)[];

  constructor() {
    this.state = {
      activeInteractions: [],
      config: {
        feedbackType: 'visual',
        intensity: 1,
        duration: 200,
        enabled: true
      },
      isProcessing: false
    };
    this.subscribers = [];
  }

  public initialize(config?: Partial<MicroInteractionConfig>): void {
    if (config) {
      this.state.config = { ...this.state.config, ...config };
    }
    this.notifySubscribers();
  }

  public triggerInteraction(type: string): void {
    if (!this.state.config.enabled || this.state.isProcessing) return;

    this.state.isProcessing = true;
    this.state.activeInteractions.push(type);
    this.notifySubscribers();

    this.executeInteraction(type)
      .then(() => {
        this.state.activeInteractions = this.state.activeInteractions.filter(
          interaction => interaction !== type
        );
        this.state.isProcessing = false;
        this.notifySubscribers();
      })
      .catch(error => {
        console.error(`Failed to execute micro-interaction ${type}:`, error);
        this.state.isProcessing = false;
        this.notifySubscribers();
      });
  }

  public setConfig(config: Partial<MicroInteractionConfig>): void {
    this.state.config = { ...this.state.config, ...config };
    this.notifySubscribers();
  }

  public enableInteractions(enabled: boolean): void {
    this.state.config.enabled = enabled;
    this.notifySubscribers();
  }

  public getState(): MicroInteractionState {
    return { ...this.state };
  }

  public subscribe(callback: (state: MicroInteractionState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private async executeInteraction(type: string): Promise<void> {
    try {
      const interactionFn = microInteractionUtils.getInteractionFunction(type);
      if (interactionFn) {
        await interactionFn({
          type,
          config: this.state.config
        });
      }
    } catch (error) {
      console.error(`Micro-interaction execution error:`, error);
      throw error;
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback({ ...this.state }));
  }
}

export const microInteractionService = new MicroInteractionService();

export const useMicroInteractionService = () => {
  return microInteractionService;
};