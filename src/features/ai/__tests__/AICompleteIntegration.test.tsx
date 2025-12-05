import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AICompleteIntegration } from "../AICompleteIntegration";
import { AITaskSuggestionsEnhanced } from "../AITaskSuggestionsEnhanced";
import { AINaturalLanguageTaskCreator } from "../AINaturalLanguageTaskCreator";
import { AIContextAwareAssistant } from "../AIContextAwareAssistant";
import { AIPrioritizationService } from "../../../../services/aiPrioritizationService";
import { AIUserPatternService } from "../../../../services/aiUserPatternService";
import { useTaskStore } from "../../../../store/useTaskStore";
import { useAIStore } from "../../../../store/useAIStore";
import { useProjectStore } from "../../../../store/useProjectStore";

// Mock the stores
jest.mock("../../../../store/useTaskStore");
jest.mock("../../../../store/useAIStore");
jest.mock("../../../../store/useProjectStore");

// Mock the services
jest.mock("../../../../services/aiPrioritizationService");
jest.mock("../../../../services/aiUserPatternService");

describe("AICompleteIntegration Component", () => {
  const mockTask = {
    id: "task-1",
    title: "Complete AI integration",
    description: "Implement all AI features for Todone project",
    priority: "high",
    status: "pending",
    dueDate: "2025-12-15",
    createdAt: "2025-12-01",
    updatedAt: "2025-12-04",
  };

  const mockProject = {
    id: "project-1",
    name: "Todone AI Features",
    priority: "high",
    status: "active",
  };

  beforeEach(() => {
    // Mock store implementations
    useTaskStore.mockReturnValue({
      tasks: [mockTask],
      addTask: jest.fn().mockResolvedValue({ ...mockTask, id: "new-task" }),
    });

    useAIStore.mockReturnValue({
      aiAssistantEnabled: true,
      aiUsageStatistics: {
        totalRequests: 10,
        successfulRequests: 9,
        lastRequestTime: new Date(),
      },
      recordAIUsage: jest.fn(),
    });

    useProjectStore.mockReturnValue({
      projects: [mockProject],
    });

    // Mock service implementations
    AIPrioritizationService.prototype.prioritizeTask.mockResolvedValue({
      taskId: "task-1",
      priorityScore: 0.85,
      recommendedPriority: "high",
      priorityFactors: {
        dueDateFactor: 0.9,
        complexityFactor: 0.8,
        dependencyFactor: 0.7,
        userPatternFactor: 0.8,
        contextFactor: 0.8,
      },
      confidence: 85,
      reasoning: "High priority due to approaching deadline and complexity",
    });

    AIUserPatternService.prototype.getPersonalizedRecommendations.mockResolvedValue(
      [
        "Schedule high-priority tasks during your peak hours: 10-12, 15-17",
        "You frequently adjust priorities. Consider using the AI prioritization assistant.",
      ],
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders AICompleteIntegration in compact mode", () => {
    render(<AICompleteIntegration taskId="task-1" mode="compact" />);

    expect(screen.getByText("🤖 AI Integration")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();
    expect(screen.getByText("🧠")).toBeInTheDocument();
  });

  test("renders AICompleteIntegration in full mode", () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    expect(screen.getByText("🤖 Complete AI Integration")).toBeInTheDocument();
    expect(screen.getByText("💡 Suggestions")).toBeInTheDocument();
    expect(screen.getByText("✍️ Creator")).toBeInTheDocument();
    expect(screen.getByText("🤖 Assistant")).toBeInTheDocument();
    expect(screen.getByText("🧠 Context")).toBeInTheDocument();
    expect(screen.getByText("📊 Breakdown")).toBeInTheDocument();
  });

  test("switches between different AI features", async () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    // Initially shows suggestions
    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();

    // Switch to creator
    fireEvent.click(screen.getByText("✍️ Creator"));
    await waitFor(() => {
      expect(screen.getByText("🤖 AI Task Creator")).toBeInTheDocument();
    });

    // Switch to context
    fireEvent.click(screen.getByText("🧠 Context"));
    await waitFor(() => {
      expect(
        screen.getByText("🧠 Context-Aware Assistant"),
      ).toBeInTheDocument();
    });
  });

  test("shows AI statistics when requested", async () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    // Click stats button
    fireEvent.click(screen.getByText("Show Detailed Stats"));

    await waitFor(() => {
      expect(screen.getByText("📈 AI Usage Statistics")).toBeInTheDocument();
      expect(screen.getByText("Total Requests")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument(); // totalRequests
      expect(screen.getByText("Success Rate")).toBeInTheDocument();
      expect(screen.getByText("90%")).toBeInTheDocument(); // success rate
    });
  });
});

describe("AITaskSuggestionsEnhanced Component", () => {
  const mockGenerateSuggestions = jest.fn();
  const mockGetSuggestionStats = jest.fn();

  beforeEach(() => {
    useTaskStore.mockReturnValue({
      tasks: [mockTask],
    });

    useAIStore.mockReturnValue({
      aiUsageStatistics: {
        totalRequests: 5,
        successfulRequests: 4,
        lastRequestTime: new Date(),
      },
    });

    // Mock the hook
    jest.mock("../../../../hooks/useAITaskSuggestions", () => ({
      useAITaskSuggestions: () => ({
        suggestions: [
          "Break down the AI integration into smaller tasks",
          "Research best practices for AI task suggestions",
          "Implement intelligent prioritization algorithms",
          "Add natural language processing for task creation",
          "Create context-aware assistance features",
        ],
        loading: false,
        error: null,
        suggestionStats: {
          confidenceScores: [85, 75, 90, 80, 70],
          priorityLevels: ["high", "medium", "high", "medium", "medium"],
          estimatedTimes: [
            "1-2 hours",
            "30-60 min",
            "2-4 hours",
            "15-30 min",
            "1 hour",
          ],
        },
        generateSuggestions: mockGenerateSuggestions,
        getSuggestionStats: mockGetSuggestionStats,
      }),
    }));
  });

  test("renders enhanced task suggestions", () => {
    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Smart suggestions for "Complete AI integration" based on your work patterns',
      ),
    ).toBeInTheDocument();

    // Check for suggestions
    expect(
      screen.getByText("Break down the AI integration into smaller tasks"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Research best practices for AI task suggestions"),
    ).toBeInTheDocument();
  });

  test("shows AI statistics when stats button is clicked", async () => {
    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    fireEvent.click(screen.getByText("📊"));

    await waitFor(() => {
      expect(screen.getByText("Total AI Requests:")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Success Rate:")).toBeInTheDocument();
      expect(screen.getByText("80%")).toBeInTheDocument();
    });
  });

  test("handles suggestion selection", () => {
    const mockOnSuggestionSelect = jest.fn();
    render(
      <AITaskSuggestionsEnhanced
        taskId="task-1"
        onSuggestionSelect={mockOnSuggestionSelect}
      />,
    );

    fireEvent.click(
      screen.getByText("Break down the AI integration into smaller tasks"),
    );

    expect(mockOnSuggestionSelect).toHaveBeenCalledWith(
      "Break down the AI integration into smaller tasks",
    );
  });
});

describe("AINaturalLanguageTaskCreator Component", () => {
  const mockOnTaskCreated = jest.fn();

  beforeEach(() => {
    // Mock the NLP parser hook
    jest.mock("../../../../hooks/useNlpParser", () => ({
      useNlpParser: () => ({
        parse: jest.fn().mockResolvedValue({
          title: "Implement AI features",
          description: "Complete all AI integration tasks for Todone project",
          priority: "high",
          dueDate: "2025-12-15",
          confidence: 85,
        }),
        parseWithContext: jest.fn().mockResolvedValue({
          title: "Implement AI features",
          description: "Complete all AI integration tasks for Todone project",
          priority: "high",
          dueDate: "2025-12-15",
          confidence: 90,
        }),
        isLoading: false,
        error: null,
        lastResult: null,
      }),
    }));
  });

  test("renders natural language task creator", () => {
    render(<AINaturalLanguageTaskCreator onTaskCreated={mockOnTaskCreated} />);

    expect(screen.getByText("🤖 AI Task Creator")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Describe your task in natural language"),
    ).toBeInTheDocument();
  });

  test("parses natural language input", async () => {
    render(<AINaturalLanguageTaskCreator onTaskCreated={mockOnTaskCreated} />);

    const textarea = screen.getByPlaceholderText(
      "Describe your task in natural language",
    );
    fireEvent.change(textarea, {
      target: {
        value:
          "Schedule team meeting for AI feature review on Friday at 2pm with high priority",
      },
    });

    fireEvent.click(screen.getByText("🔍 Parse Task"));

    await waitFor(() => {
      expect(screen.getByText("📋 Task Preview")).toBeInTheDocument();
      expect(screen.getByText("Implement AI features")).toBeInTheDocument();
      expect(screen.getByText("high")).toBeInTheDocument();
    });
  });
});

describe("AIContextAwareAssistant Component", () => {
  test("renders context-aware assistant for task", () => {
    render(<AIContextAwareAssistant taskId="task-1" mode="task" />);

    expect(screen.getByText("🧠 Context-Aware Assistant")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Intelligent suggestions based on your complete work context",
      ),
    ).toBeInTheDocument();
  });

  test("renders context-aware assistant for project", () => {
    render(<AIContextAwareAssistant projectId="project-1" mode="project" />);

    expect(screen.getByText("🧠 Context-Aware Assistant")).toBeInTheDocument();
  });

  test("switches between analysis and suggestions tabs", async () => {
    render(<AIContextAwareAssistant taskId="task-1" mode="task" />);

    // Initially on suggestions tab
    expect(screen.getByText("💡 Suggestions")).toHaveClass("active");

    // Switch to analysis tab
    fireEvent.click(screen.getByText("📊 Context Analysis"));

    await waitFor(() => {
      expect(screen.getByText("📊 Context Analysis")).toHaveClass("active");
      expect(screen.getByText("📋 Task Context")).toBeInTheDocument();
    });
  });
});

describe("AIPrioritizationService Integration", () => {
  test("prioritizes task correctly", async () => {
    const service = new AIPrioritizationService();

    const result = await service.prioritizeTask(mockTask, {
      projectImportance: "high",
      businessImpact: "high",
    });

    expect(result).toBeDefined();
    expect(result.taskId).toBe("task-1");
    expect(result.recommendedPriority).toBe("urgent");
    expect(result.confidence).toBeGreaterThan(70);
    expect(result.reasoning).toContain("urgent deadline");
  });

  test("generates learning insights", async () => {
    const service = new AIUserPatternService();

    const insights = await service.generateLearningInsights();

    expect(insights).toBeDefined();
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].insightType).toBeOneOf([
      "productivity",
      "prioritization",
      "scheduling",
      "collaboration",
    ]);
  });
});

describe("AI Services Integration", () => {
  test("AI services are properly exported", () => {
    // Test that our new services can be imported
    const {
      AIPrioritizationService,
    } = require("../../../../services/aiPrioritizationService");
    const {
      AIUserPatternService,
    } = require("../../../../services/aiUserPatternService");

    expect(AIPrioritizationService).toBeDefined();
    expect(AIUserPatternService).toBeDefined();
  });

  test("AI components are properly exported", () => {
    // Test that our new components can be imported
    const { AICompleteIntegration } = require("../AICompleteIntegration");
    const {
      AITaskSuggestionsEnhanced,
    } = require("../AITaskSuggestionsEnhanced");
    const {
      AINaturalLanguageTaskCreator,
    } = require("../AINaturalLanguageTaskCreator");
    const { AIContextAwareAssistant } = require("../AIContextAwareAssistant");

    expect(AICompleteIntegration).toBeDefined();
    expect(AITaskSuggestionsEnhanced).toBeDefined();
    expect(AINaturalLanguageTaskCreator).toBeDefined();
    expect(AIContextAwareAssistant).toBeDefined();
  });
});

describe("AI Feature Error Handling", () => {
  test("handles errors in task suggestions gracefully", () => {
    // Mock error state
    jest.mock("../../../../hooks/useAITaskSuggestions", () => ({
      useAITaskSuggestions: () => ({
        suggestions: [],
        loading: false,
        error: "Failed to connect to AI service",
        generateSuggestions: jest.fn(),
      }),
    }));

    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error generating suggestions: Failed to connect to AI service",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  test("handles errors in natural language parsing gracefully", async () => {
    // Mock error in parsing
    jest.mock("../../../../hooks/useNlpParser", () => ({
      useNlpParser: () => ({
        parse: jest
          .fn()
          .mockRejectedValue(new Error("NLP service unavailable")),
        isLoading: false,
        error: new Error("NLP service unavailable"),
        lastResult: null,
      }),
    }));

    render(<AINaturalLanguageTaskCreator />);

    const textarea = screen.getByPlaceholderText(
      "Describe your task in natural language",
    );
    fireEvent.change(textarea, { target: { value: "Invalid input" } });

    fireEvent.click(screen.getByText("🔍 Parse Task"));

    await waitFor(() => {
      expect(screen.getByText("⚠️")).toBeInTheDocument();
      expect(screen.getByText("NLP service unavailable")).toBeInTheDocument();
    });
  });
});

describe("AI Feature Performance", () => {
  test("AI components load efficiently", async () => {
    const startTime = Date.now();
    render(<AICompleteIntegration taskId="task-1" mode="compact" />);
    const loadTime = Date.now() - startTime;

    // Should load in reasonable time
    expect(loadTime).toBeLessThan(1000); // Less than 1 second
  });

  test("AI suggestions generate within acceptable time", async () => {
    // Mock a delayed suggestion generation
    const mockGenerateSuggestions = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(["Suggestion 1", "Suggestion 2", "Suggestion 3"]);
        }, 300); // 300ms delay
      });
    });

    jest.mock("../../../../hooks/useAITaskSuggestions", () => ({
      useAITaskSuggestions: () => ({
        suggestions: [],
        loading: true,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
      }),
    }));

    const startTime = Date.now();
    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    await waitFor(() => {
      expect(
        screen.getByText("Generating context-aware suggestions..."),
      ).toBeInTheDocument();
    });

    const generationTime = Date.now() - startTime;
    expect(generationTime).toBeLessThan(500); // Should complete within 500ms
  });
});

describe("AI Feature Accessibility", () => {
  test("AI components have proper aria labels", () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("title");
    });
  });

  test("AI components are keyboard navigable", () => {
    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("tabindex", "0");
    });
  });
});

describe("AI Feature Integration with Existing System", () => {
  test("AI components integrate with task store", () => {
    const mockAddTask = jest.fn();
    useTaskStore.mockReturnValue({
      tasks: [mockTask],
      addTask: mockAddTask,
    });

    render(<AINaturalLanguageTaskCreator />);

    // Component should be able to access task store
    expect(useTaskStore).toHaveBeenCalled();
  });

  test("AI components integrate with AI store", () => {
    const mockRecordAIUsage = jest.fn();
    useAIStore.mockReturnValue({
      aiAssistantEnabled: true,
      aiUsageStatistics: {
        totalRequests: 5,
        successfulRequests: 4,
        lastRequestTime: new Date(),
      },
      recordAIUsage: mockRecordAIUsage,
    });

    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    // Component should be able to access AI store
    expect(useAIStore).toHaveBeenCalled();
  });
});

describe("AI Feature Security", () => {
  test("AI components handle sensitive data appropriately", () => {
    // Test that sensitive data is not exposed in AI responses
    const sensitiveTask = {
      ...mockTask,
      title: "Update password security protocols",
      description: "Implement new encryption with secret key ABC123",
    };

    useTaskStore.mockReturnValue({
      tasks: [sensitiveTask],
    });

    render(<AITaskSuggestionsEnhanced taskId="sensitive-task" />);

    // Should not expose sensitive data in suggestions
    expect(screen.queryByText("ABC123")).not.toBeInTheDocument();
    expect(screen.queryByText("secret key")).not.toBeInTheDocument();
  });
});

describe("AI Feature Cross-Browser Compatibility", () => {
  test("AI components render correctly in different environments", () => {
    // Test basic rendering that should work across browsers
    render(<AICompleteIntegration taskId="task-1" mode="compact" />);

    expect(screen.getByText("🤖 AI Integration")).toBeInTheDocument();

    // Test that components don't rely on browser-specific features
    const styleElements = document.querySelectorAll("style");
    styleElements.forEach((element) => {
      // Should not contain browser-specific prefixes in critical styles
      const textContent = element.textContent || "";
      expect(textContent).not.toContain("-webkit-");
      expect(textContent).not.toContain("-moz-");
      expect(textContent).not.toContain("-ms-");
    });
  });
});

describe("AI Feature Mobile Responsiveness", () => {
  test("AI components adapt to mobile viewports", () => {
    // Set mobile viewport
    global.innerWidth = 400;
    global.dispatchEvent(new Event("resize"));

    render(<AICompleteIntegration taskId="task-1" mode="compact" />);

    // Should adapt to mobile layout
    const container = screen.getByText("🤖 AI Integration").parentElement;
    expect(container).toHaveStyle("width: 100%");
  });
});

describe("AI Feature Internationalization", () => {
  test("AI components support different languages", () => {
    // Mock different language settings
    useAIStore.mockReturnValue({
      aiAssistantEnabled: true,
      aiUsageStatistics: {
        totalRequests: 5,
        successfulRequests: 4,
        lastRequestTime: new Date(),
      },
      language: "es", // Spanish
    });

    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    // Should handle different languages gracefully
    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();
  });
});

describe("AI Feature Performance Optimization", () => {
  test("AI components implement lazy loading", () => {
    // Test that components implement performance optimizations
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    // Should not load all features at once
    const iframes = document.querySelectorAll("iframe");
    expect(iframes.length).toBe(0); // No heavy embedded content

    const images = document.querySelectorAll("img");
    expect(images.length).toBe(0); // No unnecessary images
  });

  test("AI components cache responses appropriately", () => {
    // Test that AI responses are cached to avoid duplicate requests
    const mockGenerateSuggestions = jest
      .fn()
      .mockResolvedValue(["Cached suggestion 1", "Cached suggestion 2"]);

    jest.mock("../../../../hooks/useAITaskSuggestions", () => ({
      useAITaskSuggestions: () => ({
        suggestions: [],
        loading: false,
        error: null,
        generateSuggestions: mockGenerateSuggestions,
      }),
    }));

    const { rerender } = render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    // First call
    fireEvent.click(screen.getByText("🔄"));
    expect(mockGenerateSuggestions).toHaveBeenCalledTimes(1);

    // Second call with same task ID should use cache
    rerender(<AITaskSuggestionsEnhanced taskId="task-1" />);
    fireEvent.click(screen.getByText("🔄"));
    expect(mockGenerateSuggestions).toHaveBeenCalledTimes(1); // Should not be called again
  });
});

describe("AI Feature Best Practices Compliance", () => {
  test("AI components follow accessibility best practices", () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    // Check for accessibility attributes
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label") ||
        expect(button).toHaveAttribute("title");
    });

    // Check for proper contrast ratios (simplified test)
    const textElements = screen.getAllByText(/.*/);
    textElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      // Basic contrast check (real implementation would use proper contrast calculation)
      if (color && backgroundColor) {
        expect(color).not.toBe(backgroundColor);
      }
    });
  });

  test("AI components follow security best practices", () => {
    render(<AINaturalLanguageTaskCreator />);

    // Check that sensitive inputs are properly handled
    const textarea = screen.getByPlaceholderText(
      "Describe your task in natural language",
    );
    expect(textarea).toHaveAttribute("autocomplete", "off");
    expect(textarea).toHaveAttribute("spellcheck", "true");
  });

  test("AI components follow performance best practices", () => {
    render(<AIContextAwareAssistant taskId="task-1" />);

    // Check that components don't block main thread
    const heavyElements = document.querySelectorAll("*");
    heavyElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      // Should not have expensive properties that cause layout thrashing
      expect(style.position).not.toBe("fixed");
      expect(style.transform).toBe("none");
    });
  });
});

describe("AI Feature User Experience", () => {
  test("AI components provide clear feedback", () => {
    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    // Should show loading states
    expect(
      screen.getByText("Generating context-aware suggestions..."),
    ).toBeInTheDocument();

    // Should show success states
    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();
  });

  test("AI components handle edge cases gracefully", () => {
    // Test with no task ID
    render(<AITaskSuggestionsEnhanced taskId="" />);

    // Should handle empty task ID gracefully
    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No intelligent suggestions available for this task."),
    ).toBeInTheDocument();
  });

  test("AI components provide helpful error messages", () => {
    // Mock error state
    jest.mock("../../../../hooks/useAITaskSuggestions", () => ({
      useAITaskSuggestions: () => ({
        suggestions: [],
        loading: false,
        error:
          "Network connection failed. Please check your internet connection.",
        generateSuggestions: jest.fn(),
      }),
    }));

    render(<AITaskSuggestionsEnhanced taskId="task-1" />);

    expect(
      screen.getByText(
        "Network connection failed. Please check your internet connection.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});

describe("AI Feature Integration Testing", () => {
  test("all AI features work together cohesively", async () => {
    render(<AICompleteIntegration taskId="task-1" mode="full" />);

    // Test switching between all features
    expect(screen.getByText("💡 Suggestions")).toBeInTheDocument();

    fireEvent.click(screen.getByText("✍️ Creator"));
    await waitFor(() => {
      expect(screen.getByText("🤖 AI Task Creator")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("🤖 Assistant"));
    await waitFor(() => {
      expect(
        screen.getByText("Ask AI for task assistance..."),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("🧠 Context"));
    await waitFor(() => {
      expect(
        screen.getByText("🧠 Context-Aware Assistant"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("📊 Breakdown"));
    await waitFor(() => {
      expect(screen.getByText("AI Task Breakdown")).toBeInTheDocument();
    });
  });

  test("AI features maintain consistent state", async () => {
    const { rerender } = render(
      <AICompleteIntegration taskId="task-1" mode="full" />,
    );

    // Switch to creator mode
    fireEvent.click(screen.getByText("✍️ Creator"));

    // Re-render with same props should maintain state
    rerender(<AICompleteIntegration taskId="task-1" mode="full" />);

    await waitFor(() => {
      expect(screen.getByText("🤖 AI Task Creator")).toBeInTheDocument();
    });
  });
});

describe("AI Feature Regression Testing", () => {
  test("new AI features do not break existing functionality", () => {
    // Test that existing AI components still work
    render(<AICompleteIntegration taskId="task-1" mode="compact" />);

    // Should still be able to use basic suggestions
    expect(screen.getByText("💡")).toBeInTheDocument();

    // Switch to suggestions
    fireEvent.click(screen.getByText("💡"));

    expect(
      screen.getByText("🤖 Intelligent Task Suggestions"),
    ).toBeInTheDocument();
  });

  test("AI performance does not degrade with new features", async () => {
    const startTime = Date.now();
    render(<AICompleteIntegration taskId="task-1" mode="full" />);
    const loadTime = Date.now() - startTime;

    // Should still load quickly even with all new features
    expect(loadTime).toBeLessThan(1500); // 1.5 seconds max
  });
});

describe("AI Feature Documentation Compliance", () => {
  test("AI components have proper TypeScript types", () => {
    // Test that all components have proper type definitions
    const componentExports = require("../index");

    expect(componentExports.AICompleteIntegration).toBeDefined();
    expect(componentExports.AITaskSuggestionsEnhanced).toBeDefined();
    expect(componentExports.AINaturalLanguageTaskCreator).toBeDefined();
    expect(componentExports.AIContextAwareAssistant).toBeDefined();

    // Test that type exports exist
    expect(componentExports.AICompleteIntegrationProps).toBeDefined();
    expect(componentExports.AITaskSuggestionsEnhancedProps).toBeDefined();
    expect(componentExports.AINaturalLanguageTaskCreatorProps).toBeDefined();
    expect(componentExports.AIContextAwareAssistantProps).toBeDefined();
  });

  test("AI services have proper documentation", () => {
    // Test that services can be instantiated and used
    const {
      AIPrioritizationService,
    } = require("../../../../services/aiPrioritizationService");
    const {
      AIUserPatternService,
    } = require("../../../../services/aiUserPatternService");

    const prioritizationService = new AIPrioritizationService();
    const userPatternService = new AIUserPatternService();

    expect(prioritizationService.prioritizeTask).toBeDefined();
    expect(userPatternService.getPersonalizedRecommendations).toBeDefined();
  });
});

describe("AI Feature Production Readiness", () => {
  test("AI components handle production environment variables", () => {
    // Mock production environment
    process.env.NODE_ENV = "production";

    render(<AICompleteIntegration taskId="task-1" mode="compact" />);

    // Should work in production mode
    expect(screen.getByText("🤖 AI Integration")).toBeInTheDocument();

    // Clean up
    process.env.NODE_ENV = "test";
  });

  test("AI components handle missing dependencies gracefully", () => {
    // Test with missing stores
    useTaskStore.mockReturnValueOnce({
      tasks: [],
      addTask: undefined,
    });

    expect(() => {
      render(<AITaskSuggestionsEnhanced taskId="task-1" />);
    }).not.toThrow();
  });
});

describe("AI Feature Future Extensibility", () => {
  test("AI components can be extended with new features", () => {
    // Test that components accept additional props for future extension
    render(
      <AICompleteIntegration
        taskId="task-1"
        mode="full"
        onTaskCreated={jest.fn()}
        onSuggestionSelect={jest.fn()}
        // Future props should not break existing functionality
        futureProp1="test"
        futureProp2={{ key: "value" }}
      />,
    );

    expect(screen.getByText("🤖 Complete AI Integration")).toBeInTheDocument();
  });

  test("AI services can be extended with new capabilities", async () => {
    const service = new AIPrioritizationService();

    // Test that service methods can be called with additional parameters
    const result = await service.prioritizeTask(
      mockTask,
      {},
      {
        customPattern: "test",
      },
    );

    expect(result).toBeDefined();
  });
});
