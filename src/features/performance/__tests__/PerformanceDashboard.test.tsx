import React from "react";
import { render, screen } from "@testing-library/react";
import { PerformanceDashboard } from "../PerformanceDashboard";
import { PerformanceProvider } from "../PerformanceProvider";

describe("PerformanceDashboard", () => {
  const renderDashboard = () => {
    return render(
      <PerformanceProvider>
        <PerformanceDashboard />
      </PerformanceProvider>,
    );
  };

  it("should render performance dashboard with all sections", () => {
    renderDashboard();
    expect(screen.getByText("Performance Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    expect(screen.getByText("Performance Controls")).toBeInTheDocument();
    expect(screen.getByText("Performance Settings")).toBeInTheDocument();
    expect(screen.getByText("Performance Status")).toBeInTheDocument();
  });

  it("should have proper dashboard grid layout", () => {
    renderDashboard();
    const dashboardGrid = screen.getByTestId("dashboard-grid");
    expect(dashboardGrid).toBeInTheDocument();
    expect(dashboardGrid.children.length).toBe(4);
  });

  it("should render monitor section", () => {
    renderDashboard();
    const monitorSection = screen.getByTestId("monitor-section");
    expect(monitorSection).toBeInTheDocument();
    expect(monitorSection).toHaveClass("dashboard-section");
  });

  it("should render controls section", () => {
    renderDashboard();
    const controlsSection = screen.getByTestId("controls-section");
    expect(controlsSection).toBeInTheDocument();
    expect(controlsSection).toHaveClass("dashboard-section");
  });

  it("should render settings section", () => {
    renderDashboard();
    const settingsSection = screen.getByTestId("settings-section");
    expect(settingsSection).toBeInTheDocument();
    expect(settingsSection).toHaveClass("dashboard-section");
  });

  it("should render status section", () => {
    renderDashboard();
    const statusSection = screen.getByTestId("status-section");
    expect(statusSection).toBeInTheDocument();
    expect(statusSection).toHaveClass("dashboard-section");
  });
});
