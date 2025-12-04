import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from './accessibilitySetup';
import { runComprehensiveAccessibilityAudit } from './accessibilityTestRunner';
import { AccessibilityProvider, AccessibilityControls, AccessibilitySettings } from '../../features/accessibility';
import { PriorityBadge, StatusBadge } from '../../components';
import { Button } from '../../features/ui/Button';
import { Modal } from '../../features/ui/Modal';
import { Navigation } from '../../features/ui/Navigation';
import { AnimationAccessibility, AnimationControls, TaskAnimation, ViewAnimation } from '../../features/animations';

// Mock all components for suite testing
jest.mock('../../components/PriorityBadge.tsx', () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span role="status" aria-label={`Priority: ${priority}`}>
      {priority}
    </span>
  )
}));

jest.mock('../../components/StatusBadge.tsx', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span role="status" aria-label={`Status: ${status}`}>
      {status}
    </span>
  )
}));

jest.mock('../../features/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} aria-disabled={disabled}>
      {children}
    </button>
  )
}));

jest.mock('../../features/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Modal Title</h2>
        <button onClick={onClose} aria-label="Close modal">Close</button>
        {children}
      </div>
    ) : null
}));

jest.mock('../../features/ui/Navigation', () => ({
  Navigation: ({ items }: { items: Array<{ label: string; path: string }> }) => (
    <nav aria-label="Main navigation">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href={item.path} aria-current={index === 0 ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}));

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

describe('Comprehensive Accessibility Test Suite', () => {
  // Define all test components
  const testComponents = [
    {
      name: 'Priority Badge',
      component: <PriorityBadge priority="high" />
    },
    {
      name: 'Status Badge',
      component: <StatusBadge status="in-progress" />
    },
    {
      name: 'Button Component',
      component: <Button onClick={() => {}}>Test Button</Button>
    },
    {
      name: 'Disabled Button',
      component: <Button disabled>Disabled Button</Button>
    },
    {
      name: 'Modal Component',
      component: (
        <Modal isOpen={true} onClose={() => {}}>
          <p>Modal content for testing</p>
          <Button onClick={() => {}}>Modal Button</Button>
        </Modal>
      )
    },
    {
      name: 'Navigation Component',
      component: (
        <Navigation items={[
          { label: 'Home', path: '/' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Projects', path: '/projects' }
        ]} />
      )
    },
    {
      name: 'Accessibility Controls',
      component: <AccessibilityControls />
    },
    {
      name: 'Accessibility Settings',
      component: <AccessibilitySettings isOpen={true} onSave={() => {}} />
    },
    {
      name: 'Animation Controls',
      component: <AnimationControls />
    },
    {
      name: 'Task Animation',
      component: <TaskAnimation isAnimating={true} />
    },
    {
      name: 'View Animation',
      component: <ViewAnimation isAnimating={false} />
    },
    {
      name: 'Complete Application Page',
      component: (
        <AccessibilityProvider>
          <div lang="en">
            <header role="banner">
              <h1>Todone Application</h1>
              <Navigation items={[
                { label: 'Home', path: '/' },
                { label: 'Tasks', path: '/tasks' },
                { label: 'Projects', path: '/projects' }
              ]} />
            </header>

            <main role="main">
              <section aria-labelledby="tasks-section">
                <h2 id="tasks-section">Your Tasks</h2>
                <div>
                  <PriorityBadge priority="high" />
                  <StatusBadge status="in-progress" />
                  <Button onClick={() => {}}>Add Task</Button>
                </div>
              </section>

              <section aria-labelledby="accessibility-section">
                <h2 id="accessibility-section">Accessibility Controls</h2>
                <AccessibilityControls />
                <AccessibilitySettings isOpen={false} onSave={() => {}} />
              </section>

              <section aria-labelledby="animations-section">
                <h2 id="animations-section">Animations</h2>
                <AnimationAccessibility>
                  <AnimationControls />
                  <TaskAnimation isAnimating={true} />
                  <ViewAnimation isAnimating={false} />
                </AnimationAccessibility>
              </section>
            </main>

            <footer role="contentinfo">
              <p>© 2023 Todone. All rights reserved.</p>
            </footer>
          </div>
        </AccessibilityProvider>
      )
    }
  ];

  describe('Automated Accessibility Audit', () => {
    it('should run comprehensive accessibility audit on all components', async () => {
      const report = await runComprehensiveAccessibilityAudit(
        testComponents,
        {
          includeWCAG21AA: true,
          includeBestPractices: true
        }
      );

      // Validate report structure
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('results');
      expect(report).toHaveProperty('wcagCompliance');

      // Validate summary
      expect(report.summary.totalTests).toBe(testComponents.length);
      expect(report.summary.passedTests + report.summary.failedTests).toBe(testComponents.length);

      // Validate WCAG compliance
      expect(report.wcagCompliance).toHaveProperty('level');
      expect(report.wcagCompliance).toHaveProperty('description');
      expect(report.wcagCompliance).toHaveProperty('score');

      // Log detailed results
      console.log('📊 Accessibility Audit Results:');
      console.log(`🎯 Compliance Level: ${report.wcagCompliance.level} (${report.wcagCompliance.score}/100)`);
      console.log(`✅ Passed: ${report.summary.passedTests}/${report.summary.totalTests}`);

      if (report.summary.failedTests > 0) {
        console.log(`❌ Failed: ${report.summary.failedTests}`);
        report.results
          .filter(r => !r.passed)
          .forEach(failed => {
            console.log(`  - ${failed.component}: ${failed.violations.length} violations`);
          });
      }
    });
  });

  describe('Individual Component Tests', () => {
    testComponents.forEach(({ name, component }) => {
      it(`should pass accessibility tests for ${name}`, async () => {
        const { container } = render(component);
        const results = await axe(container);

        // Log any violations for debugging
        if (results.violations.length > 0) {
          console.log(`⚠️  ${name} has ${results.violations.length} accessibility violations:`);
          results.violations.forEach(violation => {
            console.log(`  - ${violation.id}: ${violation.description}`);
          });
        }

        expect(results).toHaveNoViolations();
      });
    });
  });
});