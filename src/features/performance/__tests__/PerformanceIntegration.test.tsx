import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceIntegration } from "../PerformanceIntegration";
import { PerformanceProvider } from "../PerformanceProvider";
import { createPerformanceServiceMock } from "./performanceTestUtils";

jest.mock("../../../services/performanceService", () => ({
  performanceService: createPerformanceServiceMock(),
}));

describe("PerformanceIntegration", () => {
  const renderIntegration = (props = {}) => {
    return render(
      <PerformanceProvider>
        <PerformanceIntegration {...props} />
      </PerformanceProvider>,
    );
  };

  it("should render performance integration with all components", () => {
    renderIntegration();
    expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    expect(screen.getByText("Performance Controls")).toBeInTheDocument();
    expect(screen.getByText("Performance Status")).toBeInTheDocument();
  });

  it("should hide controls when showControls is false", () => {
    renderIntegration({ showControls: false });
    expect(screen.queryByText("Performance Controls")).not.toBeInTheDocument();
  });

  it("should hide status when showStatus is false", () => {
    renderIntegration({ showStatus: false });
    expect(screen.queryByText("Performance Status")).not.toBeInTheDocument();
  });

  it("should render compact version when compact is true", () => {
    renderIntegration({ compact: true });
    const integration = screen.getByTestId("performance-integration");
    expect(integration).toHaveClass("compact");
  });

  it("should show monitoring status", () => {
    renderIntegration();
    expect(screen.getByText("Monitoring inactive")).toBeInTheDocument();
  });

  it("should integrate performance monitor", () => {
    renderIntegration();
    expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    expect(
      screen.getByText("No performance data available"),
    ).toBeInTheDocument();
  });
});
