import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AIIntegration } from "../AIIntegration";
import {
  AIFeatureImplementation,
  useAIFeatureIntegration,
} from "../AIFeatureImplementation";
import { useAIStore } from "../../../store/useAIStore";
import { useTaskStore } from "../../../store/useTaskStore";

// Mock the stores
jest.mock("../../../store/useAIStore");
jest.mock("../../../store/useTaskStore");

// Mock child components
jest.mock("../AIAssistant", () => ({
  AIAssistant: () => (
    <div data-testid="ai-assistant">AI Assistant Component</div>,
}));

jest.mock("../AITaskSuggestions", () => ({
  AITaskSuggestions: () => (
    <div data-testid="ai-suggestions">Task Suggestions Component</div>,
}));

jest.mock("../AITaskBreakdown", () => ({
  AITaskBreakdown: () => (
    <div data-testid="ai-breakdown">Task Breakdown Component</div>,
}));

jest.mock("../AITaskActionable", () => ({
  AITaskActionable: () => (
    <div data-testid="ai-actionable">Actionable Items Component</div>,
}));

describe("AI Integration Tests", () => {
  const mockTaskId = "test-task-123";
  const mockTask = {
    id: "test-task-123",
    title: "Test Task",
    description: "Test Description",
    priority: "medium",
    status: "pending",
    dueDate: "2025-12-15",
    createdAt: "2025-12-01",
    updatedAt: "2025-12-04",
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock store implementations
    useAIStore.mockReturnValue({
      aiAssistantEnabled: true,
      enableAIAssistant: jest.fn(),
      disableAIAssistant: jest.fn(),
      setAILoading: jest.fn(),
      setAIError: jest.fn(),
      recordAIUsage: jest.fn(),
    });

    useTaskStore.mockReturnValue({
      tasks: [mockTask],
    });
  });

  describe("AIIntegration Component", () => {
    it("should render AI integration component", () => {
      render(<AIIntegration taskId={mockTaskId} />);

      expect(screen.getByText("AI Task Assistance")).toBeInTheDocument();
      expect(screen.getByText("Enable AI")).toBeInTheDocument();
      expect(screen.getByText("Show AI Assistant")).toBeInTheDocument();
    });

    it("should show AI disabled message when AI is disabled", () => {
      useAIStore.mockReturnValue({
        ...useAIStore(),
        aiAssistantEnabled: false,
      });

      render(<AIIntegration taskId={mockTaskId} />);

      expect(
        screen.getByText("AI assistance is currently disabled"),
      ).toBeInTheDocument();
    });

    it("should toggle AI assistant visibility", () => {
      render(<AIIntegration taskId={mockTaskId} />);

      // Initially should not show AI assistant
      expect(screen.queryByTestId("ai-assistant")).not.toBeInTheDocument();

      // Click show button
      fireEvent.click(screen.getByText("Show AI Assistant"));

      // Should now show AI assistant
      expect(screen.getByTestId("ai-assistant")).toBeInTheDocument();
    });

    it("should render different modes correctly", () => {
      // Test suggestions mode
      const { rerender } = render(
        <AIIntegration taskId={mockTaskId} mode="suggestions" />,
      );
      expect(screen.getByTestId("ai-suggestions")).toBeInTheDocument();

      // Test breakdown mode
      rerender(<AIIntegration taskId={mockTaskId} mode="breakdown" />);
      expect(screen.getByTestId("ai-breakdown")).toBeInTheDocument();

      // Test actionable mode
      rerender(<AIIntegration taskId={mockTaskId} mode="actionable" />);
      expect(screen.getByTestId("ai-actionable")).toBeInTheDocument();
    });
  });

  describe("AIFeatureImplementation Component", () => {
    it("should render AI feature implementation", () => {
      render(<AIFeatureImplementation taskId={mockTaskId} />);

      expect(screen.getByText("AI Task Assistance")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Intelligent suggestions and breakdowns for your task",
        ),
      ).toBeInTheDocument();
    });

    it("should show loading state initially", () => {
      render(<AIFeatureImplementation taskId={mockTaskId} />);

      expect(
        screen.getByText("Preparing AI assistance..."),
      ).toBeInTheDocument();
    });

    it("should handle different integration modes", () => {
      // Test full mode
      const { rerender } = render(
        <AIFeatureImplementation taskId={mockTaskId} integrationMode="full" />,
      );

      // Test compact mode
      rerender(
        <AIFeatureImplementation
          taskId={mockTaskId}
          integrationMode="compact"
        />,
      );

      // Test minimal mode
      rerender(
        <AIFeatureImplementation
          taskId={mockTaskId}
          integrationMode="minimal"
        />,
      );
    });
  });

  describe("useAIFeatureIntegration Hook", () => {
    it("should initialize AI integration", async () => {
      const mockSetAILoading = jest.fn();
      const mockSetAIError = jest.fn();
      const mockRecordAIUsage = jest.fn();

      useAIStore.mockReturnValue({
        aiAssistantEnabled: true,
        setAILoading: mockSetAILoading,
        setAIError: mockSetAIError,
        recordAIUsage: mockRecordAIUsage,
      });

      const { result } = renderHook(() => useAIFeatureIntegration(mockTaskId));

      expect(result.current.aiIntegrationStatus).toBe("idle");
      expect(result.current.aiAssistantEnabled).toBe(true);

      // Initialize integration
      await act(async () => {
        await result.current.initializeAIIntegration();
      });

      expect(mockSetAILoading).toHaveBeenCalledWith(true);
      expect(mockSetAILoading).toHaveBeenCalledWith(false);
      expect(result.current.aiIntegrationStatus).toBe("ready");
    });

    it("should handle AI integration errors", async () => {
      const mockSetAIError = jest.fn();
      const mockRecordAIUsage = jest.fn();

      // Mock console.error to avoid test output pollution
      const originalError = console.error;
      console.error = jest.fn();

      useAIStore.mockReturnValue({
        aiAssistantEnabled: true,
        setAILoading: jest.fn(),
        setAIError: mockSetAIError,
        recordAIUsage: mockRecordAIUsage,
      });

      useTaskStore.mockReturnValue({
        tasks: [], // Empty tasks to trigger error
      });

      const { result } = renderHook(() =>
        useAIFeatureIntegration("non-existent-task"),
      );

      await act(async () => {
        await result.current.initializeAIIntegration();
      });

      expect(mockSetAIError).toHaveBeenCalled();
      expect(result.current.aiIntegrationStatus).toBe("error");

      // Restore console.error
      console.error = originalError;
    });

    it("should provide refresh functionality", async () => {
      const mockRecordAIUsage = jest.fn();

      useAIStore.mockReturnValue({
        aiAssistantEnabled: true,
        setAILoading: jest.fn(),
        setAIError: jest.fn(),
        recordAIUsage: mockRecordAIUsage,
      });

      const { result } = renderHook(() => useAIFeatureIntegration(mockTaskId));

      // Initialize first time
      await act(async () => {
        await result.current.initializeAIIntegration();
      });

      const firstCallCount = mockRecordAIUsage.mock.calls.length;

      // Refresh
      await act(async () => {
        await result.current.refreshAIData();
      });

      expect(mockRecordAIUsage.mock.calls.length).toBeGreaterThan(
        firstCallCount,
      );
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle task not found scenario", () => {
      useTaskStore.mockReturnValue({
        tasks: [], // No tasks
      });

      render(<AIIntegration taskId="non-existent-task" />);

      expect(screen.getByText("Task not found")).toBeInTheDocument();
    });

    it("should show error when AI feature fails to initialize", async () => {
      const mockSetAIError = jest.fn();

      useAIStore.mockReturnValue({
        aiAssistantEnabled: true,
        setAILoading: jest.fn(),
        setAIError: mockSetAIError,
        recordAIUsage: jest.fn(),
      });

      // Mock the store to throw an error during initialization
      const originalGetState = useAIStore.getState;
      useAIStore.getState = jest.fn().mockImplementation(() => {
        throw new Error("Initialization failed");
      });

      render(<AIFeatureImplementation taskId={mockTaskId} />);

      await waitFor(() => {
        expect(
          screen.getByText("AI feature failed to initialize"),
        ).toBeInTheDocument();
      });

      // Restore original implementation
      useAIStore.getState = originalGetState;
    });
  });
});
