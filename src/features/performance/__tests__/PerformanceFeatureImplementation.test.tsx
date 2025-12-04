import React from "react";
import { render, screen } from "@testing-library/react";
import { PerformanceFeatureImplementation } from "../PerformanceFeatureImplementation";
import { PerformanceProvider } from "../PerformanceProvider";

describe("PerformanceFeatureImplementation", () => {
  const renderFeature = (props = {}) => {
    return render(
      <PerformanceProvider>
        <PerformanceFeatureImplementation {...props} />
      </PerformanceProvider>,
    );
  };

  it("should render dashboard mode by default", () => {
    renderFeature();
    expect(
      screen.getByText("Performance Optimization Feature"),
    ).toBeInTheDocument();
    expect(screen.getByText("Performance Dashboard")).toBeInTheDocument();
  });

  it("should render integration mode when specified", () => {
    renderFeature({ mode: "integration" });
    expect(
      screen.getByText("Performance Optimization Feature"),
    ).toBeInTheDocument();
  });

  it("should render context mode when specified", () => {
    renderFeature({ mode: "context" });
    expect(
      screen.getByText("Performance Optimization Feature"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Performance Context Integration"),
    ).toBeInTheDocument();
  });

  it("should render compact integration when specified", () => {
    renderFeature({ mode: "integration", compact: true });
    const integration = screen.getByTestId("performance-integration");
    expect(integration).toHaveClass("compact");
  });

  it("should show feature description", () => {
    renderFeature();
    expect(
      screen.getByText(
        "Comprehensive performance monitoring and optimization system for Todone application.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Features include real-time metrics, configurable monitoring, and performance alerts.",
      ),
    ).toBeInTheDocument();
  });

  it("should show feature footer", () => {
    renderFeature();
    expect(
      screen.getByText(
        "Performance monitoring helps optimize application responsiveness and resource usage.",
      ),
    ).toBeInTheDocument();
  });
});
