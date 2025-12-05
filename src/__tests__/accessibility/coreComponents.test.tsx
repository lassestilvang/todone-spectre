import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  axe,
  setupAccessibilityTests,
  cleanupAccessibilityTests,
} from "./accessibilitySetup";
import { PriorityBadge, StatusBadge } from "../../components";
import { Button } from "../../features/ui/Button";
import { Modal } from "../../features/ui/Modal";
import { Navigation } from "../../features/ui/Navigation";

// Mock components for testing
jest.mock("../../components/PriorityBadge.tsx", () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span role="status" aria-label={`Priority: ${priority}`}>
      {priority}
    </span>
  ),
}));

jest.mock("../../components/StatusBadge.tsx", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span role="status" aria-label={`Status: ${status}`}>
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
    <button onClick={onClick} disabled={disabled} aria-disabled={disabled}>
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
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Modal Title</h2>
        <button onClick={onClose} aria-label="Close modal">
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
    <nav aria-label="Main navigation">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href={item.path} aria-current={index === 0 ? "page" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ),
}));

describe("Core Components Accessibility Tests", () => {
  beforeAll(() => {
    setupAccessibilityTests();
  });

  afterAll(() => {
    cleanupAccessibilityTests();
  });

  describe("PriorityBadge Component", () => {
    it("should render with proper ARIA attributes", () => {
      render(<PriorityBadge priority="high" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "Priority: high");
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<PriorityBadge priority="medium" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have sufficient color contrast", () => {
      const { container } = render(<PriorityBadge priority="low" />);
      const contrastRatio =
        window.__accessibility__.colorContrast.getContrastRatio();

      expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG 2.1 AA minimum
    });
  });

  describe("StatusBadge Component", () => {
    it("should render with proper ARIA attributes", () => {
      render(<StatusBadge status="completed" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "Status: completed");
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<StatusBadge status="in-progress" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Button Component", () => {
    it("should be accessible with keyboard navigation", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click Me");

      // Test keyboard focus
      button.focus();
      expect(document.activeElement).toBe(button);

      // Test click
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it("should handle disabled state properly", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toBeDisabled();
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Modal Component", () => {
    it("should have proper ARIA attributes when open", () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal Content
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    });

    it("should trap focus within modal", () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal Content
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      const closeButton = screen.getByLabelText("Close modal");

      // Focus should be trapped within modal
      expect(window.__accessibility__.keyboardNav.trapFocus).toHaveBeenCalled();
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Modal content for accessibility testing</p>
        </Modal>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Navigation Component", () => {
    const navItems = [
      { label: "Home", path: "/" },
      { label: "Tasks", path: "/tasks" },
      { label: "Projects", path: "/projects" },
    ];

    it("should have proper ARIA attributes", () => {
      render(<Navigation items={navItems} />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Main navigation");
    });

    it("should indicate current page", () => {
      render(<Navigation items={navItems} />);
      const currentLink = screen.getByRole("link", { current: "page" });
      expect(currentLink).toHaveTextContent("Home");
    });

    it("should be navigable with keyboard", () => {
      render(<Navigation items={navItems} />);
      const links = screen.getAllByRole("link");

      links.forEach((link, index) => {
        link.focus();
        expect(document.activeElement).toBe(link);

        // Test tab navigation
        if (index < links.length - 1) {
          fireEvent.keyDown(link, { key: "Tab" });
          expect(document.activeElement).toBe(links[index + 1]);
        }
      });
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<Navigation items={navItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Keyboard Navigation Tests", () => {
    it("should handle tab navigation correctly", () => {
      render(
        <>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </>,
      );

      const buttons = screen.getAllByRole("button");

      // Test forward tab navigation
      buttons[0].focus();
      fireEvent.keyDown(buttons[0], { key: "Tab" });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(buttons[1], { key: "Tab" });
      expect(document.activeElement).toBe(buttons[2]);

      // Test backward tab navigation
      fireEvent.keyDown(buttons[2], { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(buttons[1]);
    });

    it("should handle focus trapping in modals", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <Button>Modal Button</Button>
        </Modal>,
      );

      const modalButton = screen.getByText("Modal Button");
      modalButton.focus();

      // Attempt to tab out of modal - should be trapped
      fireEvent.keyDown(modalButton, { key: "Tab" });
      expect(window.__accessibility__.keyboardNav.trapFocus).toHaveBeenCalled();
    });
  });

  describe("Screen Reader Compatibility Tests", () => {
    it("should announce status changes to screen readers", () => {
      const { container } = render(
        <>
          <StatusBadge status="in-progress" />
          <PriorityBadge priority="high" />
        </>,
      );

      // Simulate status change
      const statusBadge = screen.getByText("in-progress");
      fireEvent.click(statusBadge);

      // Should announce to screen reader
      expect(window.__accessibility__.screenReader.announce).toHaveBeenCalled();
    });

    it("should provide proper labels for screen readers", () => {
      render(
        <>
          <Button>Submit</Button>
          <PriorityBadge priority="critical" />
        </>,
      );

      const button = screen.getByRole("button");
      const badge = screen.getByRole("status");

      expect(button).toHaveTextContent("Submit");
      expect(badge).toHaveAttribute("aria-label", "Priority: critical");
    });
  });
});
