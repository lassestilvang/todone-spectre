import { animationUtils } from "../utils/animationUtils";

interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  type: "fade" | "slide" | "scale" | "bounce" | "flip" | "zoom" | "rotate";
}

interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  animationQueue: string[];
  config: AnimationConfig;
}

class AnimationService {
  private state: AnimationState;
  private subscribers: ((state: AnimationState) => void)[];

  constructor() {
    this.state = {
      isAnimating: true,
      currentAnimation: null,
      animationQueue: [],
      config: {
        duration: 300,
        easing: "easeInOut",
        type: "fade",
      },
    };
    this.subscribers = [];
  }

  public initialize(config?: Partial<AnimationConfig>): void {
    if (config) {
      this.state.config = { ...this.state.config, ...config };
    }
    this.notifySubscribers();
  }

  public startAnimation(animationName: string): void {
    this.state.animationQueue.push(animationName);
    this.processQueue();
    this.notifySubscribers();
  }

  public stopAnimation(): void {
    this.state.isAnimating = false;
    this.state.currentAnimation = null;
    this.state.animationQueue = [];
    this.notifySubscribers();
  }

  public resumeAnimation(): void {
    this.state.isAnimating = true;
    this.processQueue();
    this.notifySubscribers();
  }

  public setConfig(config: Partial<AnimationConfig>): void {
    this.state.config = { ...this.state.config, ...config };
    this.notifySubscribers();
  }

  public getState(): AnimationState {
    return { ...this.state };
  }

  public subscribe(callback: (state: AnimationState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private processQueue(): void {
    if (!this.state.isAnimating || this.state.animationQueue.length === 0)
      return;

    const nextAnimation = this.state.animationQueue.shift();
    if (nextAnimation) {
      this.state.currentAnimation = nextAnimation;
      this.executeAnimation(nextAnimation);
    }
  }

  private async executeAnimation(animationName: string): Promise<void> {
    try {
      const animationFn = animationUtils.getAnimationFunction(animationName);
      if (animationFn) {
        await animationFn(this.state.config);
      }

      // Animation completed, process next in queue
      this.state.currentAnimation = null;
      this.processQueue();
      this.notifySubscribers();
    } catch (error) {
      console.error(`Failed to execute animation ${animationName}:`, error);
      this.state.currentAnimation = null;
      this.processQueue();
      this.notifySubscribers();
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback({ ...this.state }));
  }
}

export const animationService = new AnimationService();

export const useAnimationService = () => {
  return animationService;
};
