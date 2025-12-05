import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceMonitor } from "../PerformanceMonitor";
import { PerformanceControls } from "../PerformanceControls";
import { PerformanceSettings } from "../PerformanceSettings";
import { PerformanceStatus } from "../PerformanceStatus";
import { PerformanceProvider } from "../PerformanceProvider";
import {
  createPerformanceServiceMock,
  createPerformanceConfigServiceMock,
} from "./performanceTestUtils";

jest.mock("../../../services/performanceService", () => ({
  performanceService: createPerformanceServiceMock(),
}));

jest.mock("../../../services/performanceConfigService", () => ({
  performanceConfigService: createPerformanceConfigServiceMock(),
}));

describe("Performance Components", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<PerformanceProvider>{component}</PerformanceProvider>);
  };

  describe("PerformanceMonitor", () => {
    it("should render performance monitor with initial state", () => {
      renderWithProvider(<PerformanceMonitor />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
      expect(
        screen.getByText("No performance data available"),
      ).toBeInTheDocument();
    });

    it("should show monitoring controls", () => {
      renderWithProvider(<PerformanceMonitor />);
      expect(screen.getByText("Start Monitoring")).toBeInTheDocument();
    });
  });

  describe("PerformanceControls", () => {
    it("should render performance controls with default config", () => {
      renderWithProvider(<PerformanceControls />);
      expect(screen.getByText("Performance Controls")).toBeInTheDocument();
      expect(screen.getByLabelText("Enable Monitoring")).toBeInTheDocument();
      expect(screen.getByLabelText("Enable Logging")).toBeInTheDocument();
    });

    it("should allow changing sampling rate", () => {
      renderWithProvider(<PerformanceControls />);
      const select = screen.getByLabelText("Sampling Rate:");
      fireEvent.change(select, { target: { value: "500" } });
      expect(select).toHaveValue("500");
    });
  });

  describe("PerformanceSettings", () => {
    it("should render performance settings form", () => {
      renderWithProvider(<PerformanceSettings />);
      expect(screen.getByText("Performance Settings")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Enable Advanced Monitoring"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Enable Memory Tracking"),
      ).toBeInTheDocument();
    });

    it("should allow changing data retention days", () => {
      renderWithProvider(<PerformanceSettings />);
      const input = screen.getByLabelText("Data Retention (days):");
      fireEvent.change(input, { target: { value: "60" } });
      expect(input).toHaveValue(60);
    });
  });

  describe("PerformanceStatus", () => {
    it("should render performance status indicator", () => {
      renderWithProvider(<PerformanceStatus />);
      expect(screen.getByText("Monitoring inactive")).toBeInTheDocument();
    });

    it("should show status indicator with correct color", () => {
      renderWithProvider(<PerformanceStatus />);
      const indicator = screen.getByTestId("status-indicator");
      expect(indicator).toHaveStyle("backgroundColor: gray");
    });
  });
});
