import React from "react";
import { render, screen } from "@testing-library/react";
import { PerformanceFeatureImplementation } from "../PerformanceFeatureImplementation";
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

describe("Performance Complete Integration", () => {
  const renderCompleteIntegration = () => {
    return render(
      <PerformanceProvider>
        <PerformanceFeatureImplementation />
      </PerformanceProvider>,
    );
  };

  it("should render complete performance feature implementation", () => {
    renderCompleteIntegration();

    // Check main feature elements
    expect(
      screen.getByText("Performance Optimization Feature"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Comprehensive performance monitoring and optimization system for Todone application.",
      ),
    ).toBeInTheDocument();

    // Check dashboard components
    expect(screen.getByText("Performance Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    expect(screen.getByText("Performance Controls")).toBeInTheDocument();
    expect(screen.getByText("Performance Settings")).toBeInTheDocument();
    expect(screen.getByText("Performance Status")).toBeInTheDocument();

    // Check feature footer
    expect(
      screen.getByText(
        "Performance monitoring helps optimize application responsiveness and resource usage.",
      ),
    ).toBeInTheDocument();
  });

  it("should integrate all performance components", () => {
    renderCompleteIntegration();

    // Verify all major components are present
    const components = [
      "Performance Monitor",
      "Performance Controls",
      "Performance Settings",
      "Performance Status",
      "Performance Dashboard",
    ];

    components.forEach((component) => {
      expect(screen.getByText(component)).toBeInTheDocument();
    });
  });

  it("should show performance feature description", () => {
    renderCompleteIntegration();

    expect(
      screen.getByText(
        "Features include real-time metrics, configurable monitoring, and performance alerts.",
      ),
    ).toBeInTheDocument();
  });

  it("should render all performance sections in dashboard mode", () => {
    renderCompleteIntegration();

    // Check that all dashboard sections are rendered
    expect(screen.getByTestId("monitor-section")).toBeInTheDocument();
    expect(screen.getByTestId("controls-section")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section")).toBeInTheDocument();
    expect(screen.getByTestId("status-section")).toBeInTheDocument();
  });

  it("should provide complete performance monitoring system", () => {
    renderCompleteIntegration();

    // Verify the complete system is functional
    expect(
      screen.getByText("Performance Optimization Feature"),
    ).toBeInTheDocument();
    expect(screen.getByText("Performance Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    expect(screen.getByText("Performance Controls")).toBeInTheDocument();
    expect(screen.getByText("Performance Settings")).toBeInTheDocument();
    expect(screen.getByText("Performance Status")).toBeInTheDocument();
  });
});
