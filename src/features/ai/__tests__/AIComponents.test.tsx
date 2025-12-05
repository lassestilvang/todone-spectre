import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AIAssistant } from "../AIAssistant";
import { AITaskSuggestions } from "../AITaskSuggestions";
import { AITaskBreakdown } from "../AITaskBreakdown";
import { AITaskActionable } from "../AITaskActionable";

// Mock the hooks
jest.mock("../../../hooks/useAIAssistant");
jest.mock("../../../hooks/useAITaskSuggestions");

describe("AI Components Tests", () => {
  const mockTaskId = "test-task-123";
  const mockTaskTitle = "Test Task";
  const mockTaskDescription = "This is a test task description";

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("AIAssistant Component", () => {
    it("should render AIAssistant component with tabs", () => {
      render(<AIAssistant taskId={mockTaskId} />);

      expect(screen.getByText("AI Assistant")).toBeInTheDocument();
      expect(screen.getByText("Task Suggestions")).toBeInTheDocument();
    });

    it("should switch between assistant and suggestions tabs", () => {
      render(<AIAssistant taskId={mockTaskId} />);

      // Initially should show assistant tab
      expect(
        screen.getByPlaceholderText("Ask AI for task assistance..."),
      ).toBeInTheDocument();

      // Click suggestions tab
      fireEvent.click(screen.getByText("Task Suggestions"));

      // Should now show suggestions content
      expect(screen.getByText("Loading suggestions...")).toBeInTheDocument();
    });

    it("should handle form submission", async () => {
      const mockGenerateAIResponse = jest.fn();
      require("../../../hooks/useAIAssistant").useAIAssistant.mockReturnValue({
        aiResponse: null,
        isLoading: false,
        error: null,
        generateAIResponse: mockGenerateAIResponse,
        clearResponse: jest.fn(),
      });

      render(<AIAssistant taskId={mockTaskId} />);

      const input = screen.getByPlaceholderText(
        "Ask AI for task assistance...",
      );
      const button = screen.getByText("Ask AI");

      fireEvent.change(input, { target: { value: "Test prompt" } });
      fireEvent.click(button);

      expect(mockGenerateAIResponse).toHaveBeenCalledWith("Test prompt");
    });
  });

  describe("AITaskSuggestions Component", () => {
    it("should render task suggestions component", () => {
      render(<AITaskSuggestions taskId={mockTaskId} />);

      expect(screen.getByText("AI Task Suggestions")).toBeInTheDocument();
      expect(screen.getByText("Loading suggestions...")).toBeInTheDocument();
    });

    it("should display suggestions when available", async () => {
      const mockSuggestions = ["Suggestion 1", "Suggestion 2", "Suggestion 3"];

      require("../../../hooks/useAITaskSuggestions").useAITaskSuggestions.mockReturnValue(
        {
          suggestions: mockSuggestions,
          loading: false,
          error: null,
          generateSuggestions: jest.fn(),
          refreshSuggestions: jest.fn(),
          clearSuggestions: jest.fn(),
        },
      );

      render(<AITaskSuggestions taskId={mockTaskId} />);

      await waitFor(() => {
        expect(screen.getByText("Suggestion 1")).toBeInTheDocument();
        expect(screen.getByText("Suggestion 2")).toBeInTheDocument();
        expect(screen.getByText("Suggestion 3")).toBeInTheDocument();
      });
    });

    it("should handle suggestion click", async () => {
      const mockOnSuggestionSelect = jest.fn();
      const mockSuggestions = ["Test suggestion"];

      require("../../../hooks/useAITaskSuggestions").useAITaskSuggestions.mockReturnValue(
        {
          suggestions: mockSuggestions,
          loading: false,
          error: null,
          generateSuggestions: jest.fn(),
          refreshSuggestions: jest.fn(),
          clearSuggestions: jest.fn(),
        },
      );

      render(
        <AITaskSuggestions
          taskId={mockTaskId}
          onSuggestionSelect={mockOnSuggestionSelect}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText("Test suggestion"));
        expect(mockOnSuggestionSelect).toHaveBeenCalledWith("Test suggestion");
      });
    });
  });

  describe("AITaskBreakdown Component", () => {
    it("should render task breakdown component", () => {
      render(
        <AITaskBreakdown
          taskId={mockTaskId}
          taskTitle={mockTaskTitle}
          taskDescription={mockTaskDescription}
        />,
      );

      expect(screen.getByText("AI Task Breakdown")).toBeInTheDocument();
      expect(
        screen.getByText("Analyzing task and generating breakdown..."),
      ).toBeInTheDocument();
    });

    it("should display breakdown sections when data is available", async () => {
      const mockBreakdown = AITestUtils.generateMockTaskBreakdown();

      // Mock the AI assistant hook to return breakdown data
      require("../../../hooks/useAIAssistant").useAIAssistant.mockReturnValue({
        aiResponse: JSON.stringify(mockBreakdown),
        isLoading: false,
        error: null,
        generateAIResponse: jest.fn(),
        clearResponse: jest.fn(),
      });

      render(
        <AITaskBreakdown
          taskId={mockTaskId}
          taskTitle={mockTaskTitle}
          taskDescription={mockTaskDescription}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Actionable Steps")).toBeInTheDocument();
        expect(screen.getByText("Dependencies")).toBeInTheDocument();
        expect(screen.getByText("Helpful Resources")).toBeInTheDocument();
      });
    });
  });

  describe("AITaskActionable Component", () => {
    it("should render actionable items component", () => {
      render(
        <AITaskActionable
          taskId={mockTaskId}
          taskTitle={mockTaskTitle}
          taskDescription={mockTaskDescription}
        />,
      );

      expect(screen.getByText("Actionable Items")).toBeInTheDocument();
      expect(
        screen.getByText("Generating actionable items..."),
      ).toBeInTheDocument();
    });

    it("should display actionable items when available", async () => {
      const mockItems = AITestUtils.generateMockActionableItems(2);

      // Mock the AI assistant hook to return actionable items data
      require("../../../hooks/useAIAssistant").useAIAssistant.mockReturnValue({
        aiResponse: JSON.stringify(mockItems),
        isLoading: false,
        error: null,
        generateAIResponse: jest.fn(),
        clearResponse: jest.fn(),
      });

      render(
        <AITaskActionable
          taskId={mockTaskId}
          taskTitle={mockTaskTitle}
          taskDescription={mockTaskDescription}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(mockItems[0].title)).toBeInTheDocument();
        expect(screen.getByText(mockItems[1].title)).toBeInTheDocument();
      });
    });

    it("should handle item selection", async () => {
      const mockOnActionSelect = jest.fn();
      const mockItems = AITestUtils.generateMockActionableItems(1);

      require("../../../hooks/useAIAssistant").useAIAssistant.mockReturnValue({
        aiResponse: JSON.stringify(mockItems),
        isLoading: false,
        error: null,
        generateAIResponse: jest.fn(),
        clearResponse: jest.fn(),
      });

      render(
        <AITaskActionable
          taskId={mockTaskId}
          taskTitle={mockTaskTitle}
          taskDescription={mockTaskDescription}
          onActionSelect={mockOnActionSelect}
        />,
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText(mockItems[0].title));
        expect(mockOnActionSelect).toHaveBeenCalledWith(mockItems[0].title);
      });
    });
  });
});
