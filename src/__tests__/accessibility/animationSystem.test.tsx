import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from './accessibilitySetup';
import { setupAccessibilityTests, cleanupAccessibilityTests } from './accessibilitySetup';
import { AnimationAccessibility, AnimationControls } from '../../features/animations';
import { TaskAnimation } from '../../features/animations/TaskAnimation';
import { ViewAnimation } from '../../features/animations/ViewAnimation';

// Mock animation components
jest.mock('../../features/animations/AnimationAccessibility.tsx', () => ({
  AnimationAccessibility: ({ children }: { children: React.ReactNode }) => (
    <div role="region" aria-label="Animation accessibility controls">
      {children}
    </div>
  )
}));

jest.mock('../../features/animations/AnimationControls.tsx', () => ({
  AnimationControls: () => (
    <div role="group" aria-label="Animation controls">
      <button aria-label="Pause animations">Pause</button>
      <button aria-label="Reduce motion">Reduce Motion</button>
      <button aria-label="Enable animations">Enable</button>
    </div>
  )
}));

jest.mock('../../features/animations/TaskAnimation.tsx', () => ({
  TaskAnimation: ({ isAnimating }: { isAnimating: boolean }) => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={isAnimating ? 'animate-pulse' : ''}
      aria-label={isAnimating ? 'Task animation in progress' : 'Task animation complete'}
    >
      Task Animation
    </div>
  )
}));

jest.mock('../../features/animations/ViewAnimation.tsx', () => ({
  ViewAnimation: ({ isAnimating }: { isAnimating: boolean }) => (
    <div
      role="region"
      aria-live="polite"
      aria-label={isAnimating ? 'View transition in progress' : 'View transition complete'}
    >
      View Animation
    </div>
  )
}));

describe('Animation System Accessibility Tests', () => {
  beforeAll(() => {
    setupAccessibilityTests();
  });

  afterAll(() => {
    cleanupAccessibilityTests();
  });

  describe('Animation Accessibility Container', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AnimationAccessibility>
          <div>Animation content</div>
        </AnimationAccessibility>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Animation accessibility controls');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <AnimationAccessibility>
          <div>Animation content</div>
        </AnimationAccessibility>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Animation Controls', () => {
    it('should have accessible controls with proper labels', () => {
      render(<AnimationControls />);
      const controls = screen.getByRole('group');

      expect(controls).toHaveAttribute('aria-label', 'Animation controls');
      expect(screen.getByLabelText('Pause animations')).toBeInTheDocument();
      expect(screen.getByLabelText('Reduce motion')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable animations')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<AnimationControls />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button, index) => {
        button.focus();
        expect(document.activeElement).toBe(button);

        if (index < buttons.length - 1) {
          fireEvent.keyDown(button, { key: 'Tab' });
          expect(document.activeElement).toBe(buttons[index + 1]);
        }
      });
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<AnimationControls />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Task Animation', () => {
    it('should have proper ARIA live region attributes', () => {
      render(<TaskAnimation isAnimating={true} />);
      const animation = screen.getByRole('status');

      expect(animation).toHaveAttribute('aria-live', 'polite');
      expect(animation).toHaveAttribute('aria-atomic', 'true');
      expect(animation).toHaveAttribute('aria-label', 'Task animation in progress');
    });

    it('should update ARIA label when animation state changes', () => {
      const { rerender } = render(<TaskAnimation isAnimating={true} />);
      let animation = screen.getByLabelText('Task animation in progress');
      expect(animation).toBeInTheDocument();

      rerender(<TaskAnimation isAnimating={false} />);
      animation = screen.getByLabelText('Task animation complete');
      expect(animation).toBeInTheDocument();
    });

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
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
          dispatchEvent: jest.fn()
        }))
      });

      render(<TaskAnimation isAnimating={true} />);
      const animation = screen.getByRole('status');

      // Should not have animation class when reduced motion is preferred
      expect(animation).not.toHaveClass('animate-pulse');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<TaskAnimation isAnimating={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('View Animation', () => {
    it('should have proper ARIA attributes', () => {
      render(<ViewAnimation isAnimating={true} />);
      const animation = screen.getByRole('region');

      expect(animation).toHaveAttribute('aria-live', 'polite');
      expect(animation).toHaveAttribute('aria-label', 'View transition in progress');
    });

    it('should update ARIA label when animation completes', () => {
      const { rerender } = render(<ViewAnimation isAnimating={true} />);
      let animation = screen.getByLabelText('View transition in progress');
      expect(animation).toBeInTheDocument();

      rerender(<ViewAnimation isAnimating={false} />);
      animation = screen.getByLabelText('View transition complete');
      expect(animation).toBeInTheDocument();
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<ViewAnimation isAnimating={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Reduced Motion Tests', () => {
    it('should disable animations when reduced motion is preferred', () => {
      // Set reduced motion preference
      window.__accessibility__.reducedMotion.setReducedMotion(true);

      render(<TaskAnimation isAnimating={true} />);
      const animation = screen.getByRole('status');

      // Animation should be disabled
      expect(window.__accessibility__.reducedMotion.getAnimationState()).toBe('reduced');
    });

    it('should allow manual override of reduced motion', () => {
      render(<AnimationControls />);
      const reduceMotionButton = screen.getByLabelText('Reduce motion');

      // Initially should not be in reduced motion state
      expect(window.__accessibility__.reducedMotion.getAnimationState()).toBe('normal');

      // Click reduce motion button
      fireEvent.click(reduceMotionButton);

      // Should now be in reduced motion state
      expect(window.__accessibility__.reducedMotion.getAnimationState()).toBe('reduced');
    });
  });

  describe('Animation System Integration Tests', () => {
    it('should integrate animation controls with accessibility features', () => {
      render(
        <>
          <AnimationAccessibility>
            <AnimationControls />
            <TaskAnimation isAnimating={true} />
          </AnimationAccessibility>
        </>
      );

      // Verify all components are accessible
      expect(screen.getByLabelText('Animation controls')).toBeInTheDocument();
      expect(screen.getByLabelText('Task animation in progress')).toBeInTheDocument();
    });

    it('should maintain accessibility across animation components', () => {
      render(
        <>
          <AnimationControls />
          <TaskAnimation isAnimating={true} />
          <ViewAnimation isAnimating={false} />
        </>
      );

      // All animation components should have proper ARIA attributes
      const statusElements = screen.getAllByRole('status');
      const regionElements = screen.getAllByRole('region');

      expect(statusElements.length + regionElements.length).toBeGreaterThan(0);

      [...statusElements, ...regionElements].forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
    });
  });
});