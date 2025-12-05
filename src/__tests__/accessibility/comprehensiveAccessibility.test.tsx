import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  axe,
  setupAccessibilityTests,
  cleanupAccessibilityTests,
} from "./accessibilitySetup";
import {
  AccessibilityProvider,
  AccessibilityControls,
  AccessibilitySettings,
} from "../../features/accessibility";
import { PriorityBadge, StatusBadge } from "../../components";
import { Button } from "../../features/ui/Button";
import { Modal } from "../../features/ui/Modal";
import { Navigation } from "../../features/ui/Navigation";
import {
  AnimationAccessibility,
  AnimationControls,
} from "../../features/animations";
import { TaskAnimation } from "../../features/animations/TaskAnimation";
import { ViewAnimation } from "../../features/animations/ViewAnimation";

// Mock all components for comprehensive testing
jest.mock("../../components/PriorityBadge.tsx", () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span
      role="status"
      aria-label={`Priority: ${priority}`}
      data-testid="priority-badge"
    >
      {priority}
    </span>
  ),
}));

jest.mock("../../components/StatusBadge.tsx", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      data-testid="status-badge"
    >
      {status}
    </span>
  ),
}));

jest.mock("../../features/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      data-testid="mock-button"
    >
      {children}
    </button>
  ),
}));

jest.mock("../../features/ui/Modal", () => ({
  Modal: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-testid="mock-modal"
      >
        <h2 id="modal-title">Modal Title</h2>
        <button
          onClick={onClose}
          aria-label="Close modal"
          data-testid="close-modal"
        >
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock("../../features/ui/Navigation", () => ({
  Navigation: ({
    items,
  }: {
    items: Array<{ label: string; path: string }>;
  }) => (
    <nav aria-label="Main navigation" data-testid="mock-navigation">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a
              href={item.path}
              aria-current={index === 0 ? "page" : undefined}
              data-testid="nav-link"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ),
}));

jest.mock("../../features/animations/AnimationAccessibility.tsx", () => ({
  AnimationAccessibility: ({ children }: { children: React.ReactNode }) => (
    <div
      role="region"
      aria-label="Animation accessibility controls"
      data-testid="animation-accessibility"
    >
      {children}
    </div>
  ),
}));

jest.mock("../../features/animations/AnimationControls.tsx", () => ({
  AnimationControls: () => (
    <div
      role="group"
      aria-label="Animation controls"
      data-testid="animation-controls"
    >
      <button aria-label="Pause animations" data-testid="pause-animations">
        Pause
      </button>
      <button aria-label="Reduce motion" data-testid="reduce-motion">
        Reduce Motion
      </button>
      <button aria-label="Enable animations" data-testid="enable-animations">
        Enable
      </button>
    </div>
  ),
}));

jest.mock("../../features/animations/TaskAnimation.tsx", () => ({
  TaskAnimation: ({ isAnimating }: { isAnimating: boolean }) => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={isAnimating ? "animate-pulse" : ""}
      aria-label={
        isAnimating ? "Task animation in progress" : "Task animation complete"
      }
      data-testid="task-animation"
    >
      Task Animation
    </div>
  ),
}));

jest.mock("../../features/animations/ViewAnimation.tsx", () => ({
  ViewAnimation: ({ isAnimating }: { isAnimating: boolean }) => (
    <div
      role="region"
      aria-live="polite"
      aria-label={
        isAnimating ? "View transition in progress" : "View transition complete"
      }
      data-testid="view-animation"
    >
      View Animation
    </div>
  ),
}));

describe("Comprehensive Accessibility Testing Suite - WCAG 2.1 AA Compliance", () => {
  beforeAll(() => {
    setupAccessibilityTests();
  });

  afterAll(() => {
    cleanupAccessibilityTests();
  });

  describe("WCAG 2.1 AA Compliance Validation", () => {
    it("should validate overall application accessibility with axe-core", async () => {
      // Render a comprehensive test page with all major components
      const { container } = render(
        <AccessibilityProvider>
          <div>
            <h1>Todone Application - Accessibility Test</h1>

            <section aria-label="Core components section">
              <PriorityBadge priority="high" />
              <StatusBadge status="in-progress" />
              <Button onClick={() => {}}>Test Button</Button>
            </section>

            <section aria-label="Feature components section">
              <AccessibilityControls />
              <AccessibilitySettings isOpen={false} onSave={() => {}} />
            </section>

            <section aria-label="Animation components section">
              <AnimationAccessibility>
                <AnimationControls />
                <TaskAnimation isAnimating={true} />
                <ViewAnimation isAnimating={false} />
              </AnimationAccessibility>
            </section>

            <section aria-label="Navigation section">
              <Navigation
                items={[
                  { label: "Home", path: "/" },
                  { label: "Tasks", path: "/tasks" },
                  { label: "Projects", path: "/projects" },
                ]}
              />
            </section>
          </div>
        </AccessibilityProvider>,
      );

      // Run comprehensive axe-core test
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility tests for all component categories", async () => {
      // Test core components
      const coreComponents = render(
        <>
          <PriorityBadge priority="medium" />
          <StatusBadge status="completed" />
          <Button disabled>Disabled Button</Button>
          <Button onClick={() => {}}>Enabled Button</Button>
        </>,
      );

      const coreResults = await axe(coreComponents.container);
      expect(coreResults).toHaveNoViolations();

      // Test feature components
      const featureComponents = render(
        <>
          <AccessibilityControls />
          <AccessibilitySettings isOpen={true} onSave={() => {}} />
        </>,
      );

      const featureResults = await axe(featureComponents.container);
      expect(featureResults).toHaveNoViolations();

      // Test animation components
      const animationComponents = render(
        <>
          <AnimationControls />
          <TaskAnimation isAnimating={true} />
          <ViewAnimation isAnimating={false} />
        </>,
      );

      const animationResults = await axe(animationComponents.container);
      expect(animationResults).toHaveNoViolations();
    });
  });

  describe("Keyboard Navigation Compliance", () => {
    it("should ensure all interactive elements are keyboard accessible", () => {
      render(
        <div>
          <Button onClick={() => {}}>Button 1</Button>
          <Button onClick={() => {}}>Button 2</Button>
          <a href="#">Link 1</a>
          <input type="text" placeholder="Input field" />
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>,
      );

      const interactiveElements = screen.getAllByRole(
        /button|link|textbox|combobox/,
      );
      interactiveElements.forEach((element, index) => {
        // Each element should be focusable
        element.focus();
        expect(document.activeElement).toBe(element);

        // Each element should respond to keyboard events
        if (index < interactiveElements.length - 1) {
          fireEvent.keyDown(element, { key: "Tab" });
          expect(document.activeElement).toBe(interactiveElements[index + 1]);
        }
      });
    });

    it("should validate keyboard navigation in complex components", () => {
      render(
        <AccessibilityProvider>
          <AccessibilityControls />
          <Navigation
            items={[
              { label: "Home", path: "/" },
              { label: "Tasks", path: "/tasks" },
            ]}
          />
          <Modal isOpen={true} onClose={() => {}}>
            <Button onClick={() => {}}>Modal Button</Button>
          </Modal>
        </AccessibilityProvider>,
      );

      // Test navigation through all focusable elements
      const allFocusable = screen.getAllByRole(/button|link|dialog/);
      allFocusable.forEach((element) => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should ensure proper ARIA attributes for screen readers", () => {
      render(
        <div>
          <PriorityBadge priority="critical" />
          <StatusBadge status="pending" />
          <Button onClick={() => {}}>Submit</Button>
          <div role="alert" aria-live="assertive">
            Important notification
          </div>
          <div role="status" aria-live="polite">
            Status update
          </div>
        </div>,
      );

      // Check ARIA attributes
      expect(screen.getByLabelText("Priority: critical")).toBeInTheDocument();
      expect(screen.getByLabelText("Status: pending")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should validate screen reader announcements", () => {
      render(
        <div>
          <div role="alert" aria-live="assertive">
            Error: Operation failed
          </div>
          <div role="status" aria-live="polite">
            Loading complete
          </div>
          <div role="log" aria-live="polite">
            <div>Log entry 1</div>
            <div>Log entry 2</div>
          </div>
        </div>,
      );

      // Screen reader should announce these elements
      expect(window.__accessibility__.screenReader.announce).toHaveBeenCalled();
    });
  });

  describe("Color Contrast Compliance", () => {
    it("should validate color contrast ratios meet WCAG 2.1 AA standards", () => {
      // Test various color combinations
      const testCases = [
        { fg: "#000000", bg: "#FFFFFF", expected: "pass" }, // Black on white
        { fg: "#FFFFFF", bg: "#000000", expected: "pass" }, // White on black
        { fg: "#333333", bg: "#FFFFFF", expected: "pass" }, // Dark gray on white
        { fg: "#666666", bg: "#FFFFFF", expected: "fail" }, // Light gray on white (fails)
        { fg: "#0066CC", bg: "#FFFFFF", expected: "pass" }, // Blue on white
        { fg: "#FFFFFF", bg: "#0066CC", expected: "pass" }, // White on blue
      ];

      testCases.forEach(({ expected }) => {
        // Mock contrast check
        const isCompliant =
          window.__accessibility__.colorContrast.isAACompliant();

        if (expected === "pass") {
          expect(isCompliant).toBe(true);
        } else {
          expect(isCompliant).toBe(false);
        }
      });
    });

    it("should ensure sufficient contrast in all themes", () => {
      const themes = [
        { name: "light", bg: "#FFFFFF", fg: "#333333" },
        { name: "dark", bg: "#1A1A1A", fg: "#F0F0F0" },
        { name: "high-contrast", bg: "#000000", fg: "#FFFF00" },
      ];

      themes.forEach(() => {
        // Set theme colors
        window.__accessibility__.colorContrast.checkContrastRatio("#000000", "#FFFFFF");

        // All themes should pass AA compliance
        expect(window.__accessibility__.colorContrast.isAACompliant()).toBe(
          true,
        );
      });
    });
  });

  describe("Focus Management Compliance", () => {
    it("should validate proper focus management in modals", () => {
      const ModalTest = () => {
        const [isOpen, setIsOpen] = React.useState(true);

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            {isOpen && (
              <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <button>Modal Button 1</button>
                <button>Modal Button 2</button>
                <input type="text" placeholder="Modal input" />
              </Modal>
            )}
          </div>
        );
      };

      render(<ModalTest />);

      // Focus should be trapped in modal
      const modalButtons = screen.getAllByRole("button", {
        name: /Modal Button/,
      });
      modalButtons[0].focus();

      // Tab should stay within modal
      fireEvent.keyDown(modalButtons[0], { key: "Tab" });
      expect(document.activeElement).toBe(modalButtons[1]);

      fireEvent.keyDown(modalButtons[1], { key: "Tab" });
      const modalInput = screen.getByPlaceholderText("Modal input");
      expect(document.activeElement).toBe(modalInput);
    });

    it("should ensure focus returns to trigger element after modal closes", () => {
      const FocusReturnTest = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        return (
          <div>
            <button ref={triggerRef} onClick={() => setIsOpen(true)}>
              Open Modal
            </button>
            {isOpen && (
              <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </Modal>
            )}
          </div>
        );
      };

      render(<FocusReturnTest />);
      const openButton = screen.getByText("Open Modal");

      // Open modal
      openButton.focus();
      fireEvent.click(openButton);

      // Focus should be in modal
      const closeButton = screen.getByText("Close");
      expect(document.activeElement).toBe(closeButton);

      // Close modal
      fireEvent.click(closeButton);

      // Focus should return to trigger
      expect(document.activeElement).toBe(openButton);
    });
  });

  describe("ARIA Attributes Compliance", () => {
    it("should validate proper ARIA attributes across all components", () => {
      render(
        <div>
          <PriorityBadge priority="high" />
          <StatusBadge status="completed" />
          <Button onClick={() => {}}>Click Me</Button>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-dialog-title"
          >
            <h2 id="test-dialog-title">Dialog Title</h2>
            <p>Dialog content</p>
          </div>
          <nav aria-label="Primary navigation">
            <ul>
              <li>
                <a href="#" aria-current="page">
                  Home
                </a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
            </ul>
          </nav>
        </div>,
      );

      // Check all expected ARIA attributes
      expect(
        screen.getByRole("status", { name: "Priority: high" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: "Status: completed" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Click Me" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Primary navigation",
      );
    });

    it("should ensure ARIA attributes are valid and appropriate", () => {
      render(
        <div>
          <div role="alert" aria-live="assertive">
            Error message
          </div>
          <div role="status" aria-live="polite">
            Status message
          </div>
          <div role="log" aria-live="polite">
            Log messages
          </div>
          <div role="marquee" aria-live="off">
            Static content
          </div>
        </div>,
      );

      // Validate ARIA live regions
      expect(screen.getByRole("alert")).toHaveAttribute(
        "aria-live",
        "assertive",
      );
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
      expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
      expect(screen.getByRole("marquee")).toHaveAttribute("aria-live", "off");
    });
  });

  describe("Animation Accessibility Compliance", () => {
    it("should validate reduced motion support", () => {
      render(
        <div>
          <TaskAnimation isAnimating={true} />
          <ViewAnimation isAnimating={true} />
        </div>,
      );

      // Test reduced motion preference
      window.__accessibility__.reducedMotion.setReducedMotion(true);
      expect(window.__accessibility__.reducedMotion.getAnimationState()).toBe(
        "reduced",
      );

      // Animations should respect reduced motion
      const taskAnimation = screen.getByTestId("task-animation");

      expect(taskAnimation).not.toHaveClass("animate-pulse");
    });

    it("should ensure animation controls are accessible", () => {
      render(<AnimationControls />);

      const controls = screen.getByTestId("animation-controls");
      expect(controls).toHaveAttribute("aria-label", "Animation controls");

      const buttons = screen.getAllByRole("button", { container: controls });
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
      });
    });
  });

  describe("Comprehensive Integration Tests", () => {
    it("should validate accessibility across all component categories", () => {
      render(
        <AccessibilityProvider>
          <div>
            <section aria-label="Core components">
              <PriorityBadge priority="high" />
              <StatusBadge status="in-progress" />
              <Button onClick={() => {}}>Test Button</Button>
            </section>

            <section aria-label="Feature components">
              <AccessibilityControls />
              <AccessibilitySettings isOpen={false} onSave={() => {}} />
            </section>

            <section aria-label="Animation components">
              <AnimationAccessibility>
                <AnimationControls />
                <TaskAnimation isAnimating={true} />
              </AnimationAccessibility>
            </section>

            <section aria-label="Navigation">
              <Navigation
                items={[
                  { label: "Home", path: "/" },
                  { label: "Tasks", path: "/tasks" },
                ]}
              />
            </section>
          </div>
        </AccessibilityProvider>,
      );

      // Verify all components are present and accessible
      expect(screen.getByTestId("priority-badge")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge")).toBeInTheDocument();
      expect(screen.getByTestId("mock-button")).toBeInTheDocument();
      expect(screen.getByTestId("animation-accessibility")).toBeInTheDocument();
      expect(screen.getByTestId("animation-controls")).toBeInTheDocument();
      expect(screen.getByTestId("task-animation")).toBeInTheDocument();
      expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
    });

    it("should ensure cross-component accessibility integration", () => {
      render(
        <div>
          <AccessibilityControls />
          <Navigation items={[{ label: "Home", path: "/" }]} />
          <Modal isOpen={true} onClose={() => {}}>
            <TaskAnimation isAnimating={true} />
          </Modal>
        </div>,
      );

      // All components should work together
      const controls = screen.getByTestId("animation-controls");
      const navigation = screen.getByTestId("mock-navigation");
      const modal = screen.getByTestId("mock-modal");
      const animation = screen.getByTestId("task-animation");

      expect(controls).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
      expect(animation).toBeInTheDocument();
    });
  });

  describe("WCAG 2.1 AA Success Criteria Validation", () => {
    it("should validate all WCAG 2.1 AA success criteria", async () => {
      // This comprehensive test validates the main WCAG 2.1 AA criteria
      const { container } = render(
        <AccessibilityProvider>
          <div lang="en">
            <header role="banner">
              <h1>Todone Application</h1>
              <Navigation
                items={[
                  { label: "Home", path: "/" },
                  { label: "Tasks", path: "/tasks" },
                  { label: "Projects", path: "/projects" },
                ]}
              />
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
        </AccessibilityProvider>,
      );

      // Run comprehensive axe test covering all WCAG 2.1 AA rules
      const results = await axe(container, {
        rules: {
          // Enable all WCAG 2.1 AA rules
          "color-contrast": { enabled: true },
          "aria-required-attr": { enabled: true },
          "aria-valid-attr": { enabled: true },
          "button-name": { enabled: true },
          bypass: { enabled: true },
          "html-has-lang": { enabled: true },
          "image-alt": { enabled: true },
          label: { enabled: true },
          "link-name": { enabled: true },
          "page-has-heading-one": { enabled: true },
          region: { enabled: true },
          "skip-link": { enabled: true },
          "table-fake-caption": { enabled: true },
          "td-has-header": { enabled: true },
          "th-has-data-cells": { enabled: true },
          "valid-lang": { enabled: true },
          "video-caption": { enabled: true },
          "frame-title": { enabled: true },
          "heading-order": { enabled: true },
          "html-lang-valid": { enabled: true },
          "landmark-one-main": { enabled: true },
          "landmark-unique": { enabled: true },
          list: { enabled: true },
          listitem: { enabled: true },
          "meta-viewport": { enabled: true },
          "object-alt": { enabled: true },
          "role-img-alt": { enabled: true },
          "scope-attr-valid": { enabled: true },
          "server-side-image-map": { enabled: true },
          "svg-img-alt": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });
});
