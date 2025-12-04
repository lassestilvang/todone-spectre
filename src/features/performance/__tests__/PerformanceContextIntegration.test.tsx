import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerformanceContextIntegration } from "../PerformanceContextIntegration";
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

describe("PerformanceContextIntegration", () => {
  const renderContextIntegration = () => {
    return render(
      <PerformanceProvider>
        <PerformanceContextIntegration />
      </PerformanceProvider>,
    );
  };

  it("should render context integration with metrics display", () => {
    renderContextIntegration();
    expect(
      screen.getByText("Performance Context Integration"),
    ).toBeInTheDocument();
    expect(screen.getByText("No metrics available")).toBeInTheDocument();
  });

  it("should show performance status", () => {
    renderContextIntegration();
    expect(screen.getByText("Performance Status")).toBeInTheDocument();
    expect(screen.getByText("Monitoring inactive")).toBeInTheDocument();
  });

  it("should show performance controls", () => {
    renderContextIntegration();
    expect(screen.getByText("Performance Controls")).toBeInTheDocument();
  });

  it("should show current configuration", () => {
    renderContextIntegration();
    expect(screen.getByText("Current Configuration")).toBeInTheDocument();
    expect(screen.getByText("Sampling Rate: 1000ms")).toBeInTheDocument();
    expect(screen.getByText("Memory Threshold: 500MB")).toBeInTheDocument();
  });

  it("should allow starting and stopping monitoring", () => {
    renderContextIntegration();

    fireEvent.click(screen.getByText("Start Monitoring"));
    expect(screen.getByText("Stop Monitoring")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Stop Monitoring"));
    expect(screen.getByText("Start Monitoring")).toBeInTheDocument();
  });
});
