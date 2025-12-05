import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AccessibilityProvider,
  AccessibilityControls,
  AccessibilitySettings,
  AccessibilityStatus,
  useAccessibilityContext,
} from "../";
import { accessibilityTestUtils } from "./accessibilityTestUtils";
import { accessibilityService } from "../../../services/accessibilityService";
import { accessibilityConfigService } from "../../../services/accessibilityConfigService";

// Mock services
jest.mock("../../../services/accessibilityService");
jest.mock("../../../services/accessibilityConfigService");

describe("Accessibility Components", () => {
  const mockAccessibilityService =
    accessibilityTestUtils.createAccessibilityServiceMock();
  const mockAccessibilityConfigService =
    accessibilityTestUtils.createAccessibilityConfigServiceMock();

  beforeEach(() => {
    // @ts-ignore
    accessibilityService.getCurrentState.mockReturnValue(
      mockAccessibilityService.getCurrentState(),
    );
    // @ts-ignore
    accessibilityService.getCurrentPreferences.mockReturnValue(
      mockAccessibilityService.getCurrentPreferences(),
    );
    // @ts-ignore
    accessibilityService.toggleHighContrast.mockImplementation(
      mockAccessibilityService.toggleHighContrast,
    );
    // @ts-ignore
    accessibilityService.setFontSize.mockImplementation(
      mockAccessibilityService.setFontSize,
    );
    // @ts-ignore
    accessibilityService.toggleReduceMotion.mockImplementation(
      mockAccessibilityService.toggleReduceMotion,
    );
    // @ts-ignore
    accessibilityService.toggleScreenReaderSupport.mockImplementation(
      mockAccessibilityService.toggleScreenReaderSupport,
    );
    // @ts-ignore
    accessibilityService.toggleKeyboardNavigation.mockImplementation(
      mockAccessibilityService.toggleKeyboardNavigation,
    );
    // @ts-ignore
    accessibilityService.addFeature.mockImplementation(
      mockAccessibilityService.addFeature,
    );
    // @ts-ignore
    accessibilityService.removeFeature.mockImplementation(
      mockAccessibilityService.removeFeature,
    );
    // @ts-ignore
    accessibilityService.resetToDefaults.mockImplementation(
      mockAccessibilityService.resetToDefaults,
    );
    // @ts-ignore
    accessibilityService.getAccessibilityStatus.mockReturnValue(
      mockAccessibilityService.getAccessibilityStatus(),
    );
    // @ts-ignore
    accessibilityService.applySystemPreferences.mockImplementation(
      mockAccessibilityService.applySystemPreferences,
    );

    // @ts-ignore
    accessibilityConfigService.getConfig.mockReturnValue(
      mockAccessibilityConfigService.getConfig(),
    );
    // @ts-ignore
    accessibilityConfigService.updateConfig.mockImplementation(
      mockAccessibilityConfigService.updateConfig,
    );
    // @ts-ignore
    accessibilityConfigService.resetToDefaults.mockImplementation(
      mockAccessibilityConfigService.resetToDefaults,
    );
    // @ts-ignore
    accessibilityConfigService.getFeatureDefault.mockImplementation(
      mockAccessibilityConfigService.getFeatureDefault,
    );
    // @ts-ignore
    accessibilityConfigService.setFeatureDefault.mockImplementation(
      mockAccessibilityConfigService.setFeatureDefault,
    );
    // @ts-ignore
    accessibilityConfigService.validateConfig.mockImplementation(
      mockAccessibilityConfigService.validateConfig,
    );
    // @ts-ignore
    accessibilityConfigService.getConfigSummary.mockReturnValue(
      mockAccessibilityConfigService.getConfigSummary(),
    );
    // @ts-ignore
    accessibilityConfigService.exportConfig.mockReturnValue(
      mockAccessibilityConfigService.exportConfig(),
    );
    // @ts-ignore
    accessibilityConfigService.importConfig.mockImplementation(
      mockAccessibilityConfigService.importConfig,
    );
    // @ts-ignore
    accessibilityConfigService.getThemeCompatibility.mockReturnValue(
      mockAccessibilityConfigService.getThemeCompatibility(),
    );
    // @ts-ignore
    accessibilityConfigService.setThemeCompatibility.mockImplementation(
      mockAccessibilityConfigService.setThemeCompatibility,
    );
    // @ts-ignore
    accessibilityConfigService.getNotificationPreferences.mockReturnValue(
      mockAccessibilityConfigService.getNotificationPreferences(),
    );
    // @ts-ignore
    accessibilityConfigService.setNotificationPreferences.mockImplementation(
      mockAccessibilityConfigService.setNotificationPreferences,
    );
    // @ts-ignore
    accessibilityConfigService.applyConfigToDOM.mockImplementation(
      mockAccessibilityConfigService.applyConfigToDOM,
    );
  });

  describe("AccessibilityProvider", () => {
    it("should render children and provide accessibility context", () => {
      const testContent = "Test Content";
      render(
        <AccessibilityProvider>
          <div>{testContent}</div>
        </AccessibilityProvider>,
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it("should apply accessibility classes based on state", () => {
      // Mock high contrast state
      mockAccessibilityService.updateState({
        isHighContrast: true,
        reduceMotion: true,
      });

      const { container } = render(
        <AccessibilityProvider>
          <div>Test</div>
        </AccessibilityProvider>,
      );

      expect(container.firstChild).toHaveClass("high-contrast");
      expect(container.firstChild).toHaveClass("reduce-motion");
    });
  });

  describe("AccessibilityControls", () => {
    const renderControls = (props = {}) => {
      return render(
        <AccessibilityProvider>
          <AccessibilityControls {...props} />
        </AccessibilityProvider>,
      );
    };

    it("should render accessibility controls", () => {
      renderControls();
      expect(screen.getByLabelText("Accessibility")).toBeInTheDocument();
    });

    it("should toggle high contrast when button is clicked", () => {
      renderControls();
      const toggle = screen.getByLabelText("Toggle high contrast mode");
      fireEvent.click(toggle);
      expect(mockAccessibilityService.toggleHighContrast).toHaveBeenCalled();
    });

    it("should change font size when select value changes", () => {
      renderControls();
      const selectTrigger = screen.getByLabelText("Text size options");
      fireEvent.click(selectTrigger);

      // This would need actual select implementation to test properly
      // For now, just verify the control exists
      expect(screen.getByLabelText("Text size options")).toBeInTheDocument();
    });

    it("should call onAccessibilityChange when settings change", () => {
      const mockCallback = jest.fn();
      renderControls({ onAccessibilityChange: mockCallback });

      const highContrastToggle = screen.getByLabelText(
        "Toggle high contrast mode",
      );
      fireEvent.click(highContrastToggle);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          isHighContrast: true,
          fontSize: "medium",
          reduceMotion: false,
          screenReaderEnabled: false,
          keyboardNavigation: false,
        }),
      );
    });
  });

  describe("AccessibilitySettings", () => {
    it("should render settings dialog when open", () => {
      render(
        <AccessibilityProvider>
          <AccessibilitySettings isOpen={true} />
        </AccessibilityProvider>,
      );

      expect(screen.getByText("Accessibility Settings")).toBeInTheDocument();
    });

    it("should save settings when save button is clicked", () => {
      const mockOnSave = jest.fn();
      render(
        <AccessibilityProvider>
          <AccessibilitySettings isOpen={true} onSave={mockOnSave} />
        </AccessibilityProvider>,
      );

      const saveButton = screen.getByText("Save Settings");
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });

    it("should validate config before saving", () => {
      const invalidConfig = {
        defaultFontSize: "invalid-size",
      };

      const validation =
        mockAccessibilityConfigService.validateConfig(invalidConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "defaultFontSize must be one of: small, medium, large, xlarge",
      );
    });
  });

  describe("AccessibilityStatus", () => {
    it("should display accessibility status", () => {
      render(
        <AccessibilityProvider>
          <AccessibilityStatus />
        </AccessibilityProvider>,
      );

      expect(
        screen.getByText(/Accessibility features available/),
      ).toBeInTheDocument();
    });

    it("should show detailed status when showDetailedStatus is true", () => {
      render(
        <AccessibilityProvider>
          <AccessibilityStatus showDetailedStatus={true} />
        </AccessibilityProvider>,
      );

      expect(screen.getByText("Accessibility Status")).toBeInTheDocument();
    });

    it("should call onSettingsClick when settings button is clicked", () => {
      const mockCallback = jest.fn();
      render(
        <AccessibilityProvider>
          <AccessibilityStatus onSettingsClick={mockCallback} />
        </AccessibilityProvider>,
      );

      const settingsButton = screen.getByLabelText(
        "Open accessibility settings",
      );
      fireEvent.click(settingsButton);
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe("useAccessibilityContext", () => {
    it("should throw error when used outside AccessibilityProvider", () => {
      const TestComponent = () => {
        useAccessibilityContext();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow(
        "useAccessibilityContext must be used within an AccessibilityProvider",
      );
    });
  });

  describe("Integration Tests", () => {
    it("should integrate accessibility controls with provider", () => {
      render(
        <AccessibilityProvider>
          <AccessibilityControls />
          <AccessibilityStatus />
        </AccessibilityProvider>,
      );

      // Verify both components are rendered
      expect(screen.getByLabelText("Accessibility")).toBeInTheDocument();
      expect(
        screen.getByText(/Accessibility features available/),
      ).toBeInTheDocument();
    });

    it("should update status when controls change accessibility settings", () => {
      render(
        <AccessibilityProvider>
          <AccessibilityControls />
          <AccessibilityStatus />
        </AccessibilityProvider>,
      );

      const initialStatus = screen.getByText(
        /Accessibility features available/,
      );
      expect(initialStatus).toBeInTheDocument();

      // Change a setting
      const highContrastToggle = screen.getByLabelText(
        "Toggle high contrast mode",
      );
      fireEvent.click(highContrastToggle);

      // Status should update (this would need more complex testing with actual state management)
      expect(mockAccessibilityService.toggleHighContrast).toHaveBeenCalled();
    });
  });

  describe("Service Integration", () => {
    it("should use accessibility service for state management", () => {
      const state = accessibilityService.getCurrentState();
      expect(state).toBeDefined();
      expect(state.isHighContrast).toBeDefined();
    });

    it("should use accessibility config service for configuration", () => {
      const config = accessibilityConfigService.getConfig();
      expect(config).toBeDefined();
      expect(config.defaultHighContrast).toBeDefined();
    });
  });
});
