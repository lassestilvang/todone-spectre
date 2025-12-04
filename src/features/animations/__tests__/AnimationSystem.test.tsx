import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimationSystemIntegration } from '../AnimationSystemIntegration';
import { MicroInteraction } from '../MicroInteraction';
import { TaskAnimation } from '../TaskAnimation';
import { ViewAnimation } from '../ViewAnimation';
import { AnimationProvider, useAnimationContext } from '../AnimationProvider';

describe('Animation System Integration Tests', () => {
  // Mock child component for testing
  const TestChild = () => <div data-testid="child-content">Test Content</div>;

  describe('AnimationSystemIntegration', () => {
    it('should render children correctly', () => {
      render(
        <AnimationSystemIntegration>
          <TestChild />
        </AnimationSystemIntegration>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should handle different performance modes', () => {
      const { rerender } = render(
        <AnimationSystemIntegration performanceMode="performance">
          <TestChild />
        </AnimationSystemIntegration>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();

      rerender(
        <AnimationSystemIntegration performanceMode="quality">
          <TestChild />
        </AnimationSystemIntegration>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('MicroInteraction Component', () => {
    it('should render children', () => {
      render(
        <AnimationProvider>
          <MicroInteraction type="click">
            <button>Click Me</button>
          </MicroInteraction>
        </AnimationProvider>
      );

      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should handle click interactions', async () => {
      const handleInteraction = jest.fn();

      render(
        <AnimationProvider>
          <MicroInteraction type="click" onInteraction={handleInteraction}>
            <button>Click Me</button>
          </MicroInteraction>
        </AnimationProvider>
      );

      fireEvent.click(screen.getByText('Click Me'));
      await waitFor(() => expect(handleInteraction).toHaveBeenCalled());
    });

    it('should handle keyboard interactions', async () => {
      const handleInteraction = jest.fn();

      render(
        <AnimationProvider>
          <MicroInteraction type="click" onInteraction={handleInteraction}>
            <button>Click Me</button>
          </MicroInteraction>
        </AnimationProvider>
      );

      const button = screen.getByText('Click Me');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      await waitFor(() => expect(handleInteraction).toHaveBeenCalled());
    });

    it('should be disabled when disabled prop is true', () => {
      const handleInteraction = jest.fn();

      render(
        <AnimationProvider>
          <MicroInteraction type="click" onInteraction={handleInteraction} disabled>
            <button>Disabled</button>
          </MicroInteraction>
        </AnimationProvider>
      );

      fireEvent.click(screen.getByText('Disabled'));
      expect(handleInteraction).not.toHaveBeenCalled();
    });
  });

  describe('TaskAnimation Component', () => {
    it('should render children', () => {
      render(
        <AnimationProvider>
          <TaskAnimation taskId="test-1">
            <div>Task Content</div>
          </TaskAnimation>
        </AnimationProvider>
      );

      expect(screen.getByText('Task Content')).toBeInTheDocument();
    });

    it('should handle completed state', async () => {
      const handleComplete = jest.fn();

      const { rerender } = render(
        <AnimationProvider>
          <TaskAnimation taskId="test-1" isCompleted={false} onAnimationComplete={handleComplete}>
            <div>Task Content</div>
          </TaskAnimation>
        </AnimationProvider>
      );

      rerender(
        <AnimationProvider>
          <TaskAnimation taskId="test-1" isCompleted={true} onAnimationComplete={handleComplete}>
            <div>Task Content</div>
          </TaskAnimation>
        </AnimationProvider>
      );

      await waitFor(() => expect(handleComplete).toHaveBeenCalled());
    });
  });

  describe('ViewAnimation Component', () => {
    it('should render children', () => {
      render(
        <AnimationProvider>
          <ViewAnimation viewName="test-view">
            <div>View Content</div>
          </ViewAnimation>
        </AnimationProvider>
      );

      expect(screen.getByText('View Content')).toBeInTheDocument();
    });

    it('should handle view transitions', async () => {
      const { rerender } = render(
        <AnimationProvider>
          <ViewAnimation viewName="view-1">
            <div>View 1</div>
          </ViewAnimation>
        </AnimationProvider>
      );

      expect(screen.getByText('View 1')).toBeInTheDocument();

      rerender(
        <AnimationProvider>
          <ViewAnimation viewName="view-2">
            <div>View 2</div>
          </ViewAnimation>
        </AnimationProvider>
      );

      expect(screen.getByText('View 2')).toBeInTheDocument();
    });
  });

  describe('Animation Context', () => {
    it('should provide animation context', () => {
      const TestComponent = () => {
        const context = useAnimationContext();
        return <div data-testid="context-test">{context.isAnimating ? 'animating' : 'not-animating'}</div>;
      };

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('context-test')).toHaveTextContent('animating');
    });
  });

  describe('Accessibility Features', () => {
    it('should handle reduced motion preferences', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <AnimationSystemIntegration accessibilityMode="enhanced">
          <TestChild />
        </AnimationSystemIntegration>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });
});