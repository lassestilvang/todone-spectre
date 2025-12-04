import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { animationService } from '../../services/animationService';
import { animationUtils } from '../../utils/animationUtils';

// Mock the animation utilities
vi.mock('../../utils/animationUtils');

describe('Animation System Integration Tests', () => {
  const mockAnimationConfig = {
    duration: 300,
    easing: 'easeInOut',
    type: 'fade'
  };

  const mockAnimationFunction = vi.fn().mockImplementation(async (config) => {
    // Simulate animation execution
    await new Promise(resolve => setTimeout(resolve, config.duration));
    return { success: true, config };
  });

  beforeEach(() => {
    // Mock animation utilities
    vi.spyOn(animationUtils, 'getAnimationFunction').mockImplementation((animationName) => {
      return mockAnimationFunction;
    });

    // Reset animation service state
    animationService.initialize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    animationService.stopAnimation();
  });

  test('User actions → Animation triggers → Performance impact flow', async () => {
    // Test animation initialization
    animationService.initialize({
      duration: 250,
      easing: 'easeOut',
      type: 'slide'
    });

    const state = animationService.getState();
    expect(state.config.duration).toBe(250);
    expect(state.config.easing).toBe('easeOut');
    expect(state.config.type).toBe('slide');

    // Test starting animations
    animationService.startAnimation('task_creation');
    animationService.startAnimation('task_completion');
    animationService.startAnimation('project_switch');

    // Verify animations are queued
    expect(state.animationQueue).toHaveLength(3);

    // Test animation execution
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for animations to process

    // Verify animations were executed
    expect(mockAnimationFunction).toHaveBeenCalledTimes(3);
  });

  test('Animation queue management and execution', async () => {
    // Test adding multiple animations to queue
    const animations = ['fade_in', 'slide_up', 'bounce', 'zoom_in', 'rotate'];

    animations.forEach(animation => {
      animationService.startAnimation(animation);
    });

    // Verify all animations are queued
    const state = animationService.getState();
    expect(state.animationQueue).toHaveLength(animations.length);

    // Process queue
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for queue processing

    // Verify all animations were executed
    expect(mockAnimationFunction).toHaveBeenCalledTimes(animations.length);
  });

  test('Animation configuration and performance', async () => {
    // Test different animation configurations
    const configs = [
      { duration: 100, easing: 'easeIn', type: 'fade' },
      { duration: 200, easing: 'easeOut', type: 'slide' },
      { duration: 300, easing: 'easeInOut', type: 'bounce' }
    ];

    for (const config of configs) {
      animationService.setConfig(config);
      animationService.startAnimation(`test_${config.type}`);

      const state = animationService.getState();
      expect(state.config).toEqual(config);
    }

    // Wait for animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify all animations executed with correct configs
    expect(mockAnimationFunction).toHaveBeenCalledTimes(configs.length);
  });

  test('Animation system error handling', async () => {
    // Mock animation failure
    const failingAnimationFunction = vi.fn().mockRejectedValue(new Error('Animation failed to execute'));
    vi.spyOn(animationUtils, 'getAnimationFunction').mockImplementationOnce(() => failingAnimationFunction);

    // Test error handling
    animationService.startAnimation('failing_animation');

    // Wait for error to occur
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify system continues to work after error
    const state = animationService.getState();
    expect(state.currentAnimation).toBeNull();
    expect(state.isAnimating).toBe(true);

    // Test that subsequent animations still work
    animationService.startAnimation('recovery_animation');
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockAnimationFunction).toHaveBeenCalledTimes(1);
  });

  test('Animation queue pause and resume', async () => {
    // Add animations to queue
    animationService.startAnimation('animation_1');
    animationService.startAnimation('animation_2');
    animationService.startAnimation('animation_3');

    // Pause animation processing
    animationService.stopAnimation();
    let state = animationService.getState();
    expect(state.isAnimating).toBe(false);
    expect(state.animationQueue).toHaveLength(3);

    // Verify no animations are executed while paused
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mockAnimationFunction).toHaveBeenCalledTimes(0);

    // Resume animation processing
    animationService.resumeAnimation();
    state = animationService.getState();
    expect(state.isAnimating).toBe(true);

    // Verify animations are executed after resume
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(mockAnimationFunction).toHaveBeenCalledTimes(3);
  });

  test('Animation performance impact measurement', async () => {
    const startTime = performance.now();

    // Execute multiple animations
    const animationCount = 10;
    for (let i = 0; i < animationCount; i++) {
      animationService.startAnimation(`perf_test_${i}`);
    }

    // Wait for all animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable
    expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    expect(mockAnimationFunction).toHaveBeenCalledTimes(animationCount);
  });

  test('Animation state management and subscriptions', async () => {
    // Test state subscription
    const states: any[] = [];
    const unsubscribe = animationService.subscribe((state) => {
      states.push(state);
    });

    // Perform state changes
    animationService.initialize({ duration: 400, type: 'zoom' });
    animationService.startAnimation('test_animation');
    animationService.setConfig({ easing: 'linear' });

    // Wait for state changes to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify state changes were captured
    expect(states.length).toBeGreaterThan(0);
    expect(states[states.length - 1].config.duration).toBe(400);
    expect(states[states.length - 1].config.easing).toBe('linear');

    // Test unsubscribe
    unsubscribe();
    states.length = 0;

    // Perform more changes
    animationService.stopAnimation();
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify no new states were captured after unsubscribe
    expect(states.length).toBe(0);
  });

  test('Complex animation sequences', async () => {
    // Test complex animation sequence
    const sequence = [
      { name: 'intro_fade', config: { duration: 200, type: 'fade' } },
      { name: 'content_slide', config: { duration: 300, type: 'slide' } },
      { name: 'highlight_bounce', config: { duration: 150, type: 'bounce' } },
      { name: 'exit_zoom', config: { duration: 250, type: 'zoom' } }
    ];

    // Execute sequence
    for (const step of sequence) {
      animationService.setConfig(step.config);
      animationService.startAnimation(step.name);
    }

    // Wait for sequence to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify all animations executed
    expect(mockAnimationFunction).toHaveBeenCalledTimes(sequence.length);

    // Verify final state
    const finalState = animationService.getState();
    expect(finalState.config.duration).toBe(250); // Last config
    expect(finalState.config.type).toBe('zoom'); // Last config
  });
});