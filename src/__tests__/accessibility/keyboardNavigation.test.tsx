import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  axe,
  setupAccessibilityTests,
  cleanupAccessibilityTests,
} from "./accessibilitySetup";

// Mock components for keyboard navigation testing
const KeyboardNavTestComponent = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <div role="tablist" aria-label="Test tabs">
      {tabs.map((tab, index) => (
        <button
          key={index}
          role="tab"
          aria-selected={index === activeTab}
          aria-controls={`tab-panel-${index}`}
          id={`tab-${index}`}
          onClick={() => setActiveTab(index)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && index < tabs.length - 1) {
              setActiveTab(index + 1);
              document.getElementById(`tab-${index + 1}`)?.focus();
            } else if (e.key === "ArrowLeft" && index > 0) {
              setActiveTab(index - 1);
              document.getElementById(`tab-${index - 1}`)?.focus();
            }
          }}
        >
          {tab}
        </button>
      ))}
      <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        Content for {tabs[activeTab]}
      </div>
    </div>
  );
};

const FocusTrapTestComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusableElements =
          containerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) || [];

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            // Shift+Tab from first element - trap at last element
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            // Tab from last element - trap at first element
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-trap-title"
    >
      <h2 id="focus-trap-title">Focus Trap Test</h2>
      {children}
    </div>
  );
};

const KeyboardShortcutsComponent = () => {
  const [actions, setActions] = React.useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          setActions((prev) => [...prev, "Save"]);
          break;
        case "n":
          e.preventDefault();
          setActions((prev) => [...prev, "New"]);
          break;
        case "z":
          if (e.shiftKey) {
            e.preventDefault();
            setActions((prev) => [...prev, "Redo"]);
          } else {
            e.preventDefault();
            setActions((prev) => [...prev, "Undo"]);
          }
          break;
      }
    }
  };

  return (
    <div
      role="application"
      aria-label="Keyboard shortcuts test"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h3>Keyboard Shortcuts Test</h3>
      <p>
        Press Ctrl/Cmd + S for Save, Ctrl/Cmd + N for New, Ctrl/Cmd + Z for
        Undo, Ctrl/Cmd + Shift + Z for Redo
      </p>
      <div role="log" aria-live="polite">
        {actions.map((action, index) => (
          <p key={index}>{action}</p>
        ))}
      </div>
      <button>Focusable Button</button>
    </div>
  );
};

describe("Keyboard Navigation Accessibility Tests", () => {
  beforeAll(() => {
    setupAccessibilityTests();
  });

  afterAll(() => {
    cleanupAccessibilityTests();
  });

  describe("Tab Order Tests", () => {
    it("should maintain logical tab order", () => {
      render(
        <div>
          <button>Button 1</button>
          <input type="text" placeholder="Input 1" />
          <button>Button 2</button>
          <a href="#">Link 1</a>
          <button>Button 3</button>
        </div>,
      );

      const focusableElements = screen.getAllByRole(/button|link|textbox/);
      expect(focusableElements.length).toBe(5);

      // Test tab order
      focusableElements.forEach((element, index) => {
        element.focus();
        expect(document.activeElement).toBe(element);

        if (index < focusableElements.length - 1) {
          fireEvent.keyDown(element, { key: "Tab" });
          expect(document.activeElement).toBe(focusableElements[index + 1]);
        }
      });
    });

    it("should skip disabled elements in tab order", () => {
      render(
        <div>
          <button>Button 1</button>
          <button disabled>Disabled Button</button>
          <button>Button 2</button>
        </div>,
      );

      const buttons = screen.getAllByRole("button");
      const enabledButtons = buttons.filter(
        (button) => !button.hasAttribute("disabled"),
      );

      // Focus first button
      enabledButtons[0].focus();
      expect(document.activeElement).toBe(enabledButtons[0]);

      // Tab should skip disabled button
      fireEvent.keyDown(enabledButtons[0], { key: "Tab" });
      expect(document.activeElement).toBe(enabledButtons[1]);
    });
  });

  describe("Focus Management Tests", () => {
    it("should manage focus in modal dialogs", () => {
      const { container } = render(
        <FocusTrapTestComponent>
          <button>First Button</button>
          <button>Second Button</button>
          <input type="text" placeholder="Input" />
          <button>Third Button</button>
        </FocusTrapTestComponent>,
      );

      const dialog = screen.getByRole("dialog");
      const buttons = screen.getAllByRole("button");
      const input = screen.getByRole("textbox");

      // Verify dialog has proper ARIA attributes
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "focus-trap-title");

      // Focus should be trapped within dialog
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Tab through elements
      fireEvent.keyDown(buttons[0], { key: "Tab" });
      expect(document.activeElement).toBe(input);

      fireEvent.keyDown(input, { key: "Tab" });
      expect(document.activeElement).toBe(buttons[2]);

      // Tab from last element should wrap to first
      fireEvent.keyDown(buttons[2], { key: "Tab" });
      expect(document.activeElement).toBe(buttons[0]);

      // Shift+Tab from first element should wrap to last
      fireEvent.keyDown(buttons[0], { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(buttons[2]);
    });

    it("should return focus to triggering element after modal closes", () => {
      const ModalWithTrigger = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        return (
          <div>
            <button ref={triggerRef} onClick={() => setIsOpen(true)}>
              Open Modal
            </button>
            {isOpen && (
              <FocusTrapTestComponent>
                <button onClick={() => setIsOpen(false)}>Close Modal</button>
                <button>Modal Button</button>
              </FocusTrapTestComponent>
            )}
          </div>
        );
      };

      render(<ModalWithTrigger />);
      const openButton = screen.getByText("Open Modal");

      // Open modal
      openButton.focus();
      fireEvent.click(openButton);

      // Focus should be in modal
      const closeButton = screen.getByText("Close Modal");
      expect(document.activeElement).toBe(closeButton);

      // Close modal
      fireEvent.click(closeButton);

      // Focus should return to trigger button
      expect(document.activeElement).toBe(openButton);
    });
  });

  describe("Keyboard Shortcuts Tests", () => {
    it("should handle keyboard shortcuts", () => {
      render(<KeyboardShortcutsComponent />);
      const app = screen.getByRole("application");

      // Focus the application
      app.focus();

      // Test Ctrl+S (Save)
      fireEvent.keyDown(app, { key: "s", ctrlKey: true });
      expect(screen.getByText("Save")).toBeInTheDocument();

      // Test Ctrl+N (New)
      fireEvent.keyDown(app, { key: "n", ctrlKey: true });
      expect(screen.getByText("New")).toBeInTheDocument();

      // Test Ctrl+Z (Undo)
      fireEvent.keyDown(app, { key: "z", ctrlKey: true });
      expect(screen.getByText("Undo")).toBeInTheDocument();

      // Test Ctrl+Shift+Z (Redo)
      fireEvent.keyDown(app, { key: "z", ctrlKey: true, shiftKey: true });
      expect(screen.getByText("Redo")).toBeInTheDocument();
    });

    it("should not interfere with browser shortcuts", () => {
      render(<KeyboardShortcutsComponent />);
      const app = screen.getByRole("application");
      app.focus();

      // These should not be prevented
      fireEvent.keyDown(app, { key: "Tab" });
      fireEvent.keyDown(app, { key: "Escape" });
      fireEvent.keyDown(app, { key: "ArrowUp" });

      // Verify no actions were triggered
      const actions = screen.queryAllByRole("log");
      expect(actions.length).toBe(0);
    });
  });

  describe("Tab Navigation Tests", () => {
    it("should handle tab navigation in complex components", () => {
      render(<KeyboardNavTestComponent />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(3);

      // Test arrow key navigation
      tabs[0].focus();
      expect(document.activeElement).toBe(tabs[0]);

      // Right arrow should move to next tab
      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(tabs[1]);

      // Right arrow again
      fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(tabs[2]);

      // Left arrow should move to previous tab
      fireEvent.keyDown(tabs[2], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(tabs[1]);
    });

    it("should maintain ARIA attributes during tab navigation", () => {
      render(<KeyboardNavTestComponent />);

      const tabs = screen.getAllByRole("tab");
      const tabPanel = screen.getByRole("tabpanel");

      // First tab should be selected
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabPanel).toHaveAttribute("aria-labelledby", "tab-0");

      // Navigate to second tab
      fireEvent.click(tabs[1]);

      // Second tab should now be selected
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabPanel).toHaveAttribute("aria-labelledby", "tab-1");
    });
  });

  describe("Focus Indicators Tests", () => {
    it("should show visible focus indicators", () => {
      render(
        <div>
          <button className="focus:outline focus:outline-2 focus:outline-blue-500">
            Button with focus
          </button>
          <a href="#" className="focus:ring-2 focus:ring-blue-500">
            Link with focus
          </a>
        </div>,
      );

      const button = screen.getByRole("button");
      const link = screen.getByRole("link");

      // Focus button and check styles
      button.focus();
      expect(button).toHaveClass("focus:outline");

      // Focus link and check styles
      link.focus();
      expect(link).toHaveClass("focus:ring-2");
    });

    it("should maintain focus indicators across themes", () => {
      const { rerender } = render(
        <div data-theme="light">
          <button className="focus:outline">Light Theme Button</button>
        </div>,
      );

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveClass("focus:outline");

      // Switch to dark theme
      rerender(
        <div data-theme="dark">
          <button className="focus:outline">Dark Theme Button</button>
        </div>,
      );

      const darkButton = screen.getByRole("button");
      darkButton.focus();
      expect(darkButton).toHaveClass("focus:outline");
    });
  });

  describe("WCAG 2.1 AA Compliance Tests", () => {
    it("should pass axe accessibility tests for keyboard navigation", async () => {
      const { container } = render(
        <div>
          <KeyboardNavTestComponent />
          <FocusTrapTestComponent>
            <button>Test Button</button>
          </FocusTrapTestComponent>
        </div>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should ensure all interactive elements are keyboard accessible", () => {
      render(
        <div>
          <button>Button</button>
          <input type="text" placeholder="Input" />
          <a href="#">Link</a>
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>,
      );

      const interactiveElements = screen.getAllByRole(
        /button|link|textbox|combobox/,
      );
      interactiveElements.forEach((element) => {
        // Each element should be focusable
        element.focus();
        expect(document.activeElement).toBe(element);

        // Each element should respond to keyboard events
        fireEvent.keyDown(element, { key: "Tab" });
      });
    });

    it("should validate keyboard navigation compliance", () => {
      render(
        <>
          <KeyboardNavTestComponent />
          <FocusTrapTestComponent>
            <button>Focusable 1</button>
            <button>Focusable 2</button>
          </FocusTrapTestComponent>
        </>,
      );

      // Test that all keyboard navigable elements work
      const allFocusable = screen.getAllByRole(/button|tab|dialog/);
      allFocusable.forEach((element) => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should integrate keyboard navigation with accessibility features", () => {
      render(
        <>
          <KeyboardNavTestComponent />
          <FocusTrapTestComponent>
            <button>Modal Button</button>
          </FocusTrapTestComponent>
        </>,
      );

      // Verify both components work together
      const tabs = screen.getAllByRole("tab");
      const modalButton = screen.getByText("Modal Button");

      tabs[0].focus();
      expect(document.activeElement).toBe(tabs[0]);

      modalButton.focus();
      expect(document.activeElement).toBe(modalButton);
    });

    it("should maintain accessibility across keyboard navigation components", () => {
      render(
        <div>
          <KeyboardNavTestComponent />
          <KeyboardShortcutsComponent />
          <FocusTrapTestComponent>
            <button>Trapped Button</button>
          </FocusTrapTestComponent>
        </div>,
      );

      // All components should be accessible
      const allComponents = screen.getAllByRole(/tablist|application|dialog/);
      expect(allComponents.length).toBe(3);

      allComponents.forEach((component) => {
        expect(component).toHaveAttribute("aria-label");
      });
    });
  });
});
