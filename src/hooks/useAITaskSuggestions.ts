// @ts-nocheck
import { useState, useCallback } from "react";
import { aiTaskService } from "../services/aiTaskService";
import { useAIStore } from "../store/useAIStore";
import { useTaskStore } from "../store/useTaskStore";

interface AITaskSuggestionsState {
  suggestions: string[];
  loading: boolean;
  error: string | null;
  suggestionStats: {
    confidenceScores: number[];
    priorityLevels: ("low" | "medium" | "high")[];
    estimatedTimes: string[];
  } | null;
}

interface GenerateSuggestionsOptions {
  useContext?: boolean;
  maxSuggestions?: number;
  priorityFilter?: "low" | "medium" | "high" | "all";
}

export const useAITaskSuggestions = (): AITaskSuggestionsState & {
  generateSuggestions: (
    taskId: string,
    options?: GenerateSuggestionsOptions,
  ) => Promise<void>;
  refreshSuggestions: () => void;
  clearSuggestions: () => void;
  getSuggestionStats: (taskId: string) => Promise<{
    confidenceScores: number[];
    priorityLevels: ("low" | "medium" | "high")[];
    estimatedTimes: string[];
  }>;
} => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionStats, setSuggestionStats] = useState<{
    confidenceScores: number[];
    priorityLevels: ("low" | "medium" | "high")[];
    estimatedTimes: string[];
  } | null>(null);

  const { recordAIUsage } = useAIStore();
  const { tasks } = useTaskStore();

  const generateSuggestions = useCallback(
    async (taskId: string, options?: GenerateSuggestionsOptions) => {
      try {
        setLoading(true);
        setError(null);
        setSuggestions([]);

        if (!taskId || taskId.trim() === "") {
          throw new Error("Task ID cannot be empty");
        }

        const taskSuggestions = await aiTaskService.getTaskSuggestions(
          taskId,
          options?.maxSuggestions || 5,
        );

        const suggestionsText = taskSuggestions.map(
          (suggestion) => suggestion.suggestion,
        );
        setSuggestions(suggestionsText);

        // Generate enhanced stats for suggestions
        const stats = generateSuggestionStats(taskSuggestions, taskId);
        setSuggestionStats(stats);

        // Record AI usage
        recordAIUsage(true);
      } catch (err) {
        console.error("Task suggestions error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate task suggestions",
        );
        setSuggestions([]);
        setSuggestionStats(null);
        recordAIUsage(false);
      } finally {
        setLoading(false);
      }
    },
    [recordAIUsage],
  );

  const generateSuggestionStats = useCallback(
    (taskSuggestions: any[], taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);

      const confidenceScores = taskSuggestions.map((_, index) => {
        // Higher confidence for suggestions that match task content
        let confidence = 70;
        if (task) {
          const suggestion = taskSuggestions[index].suggestion;
          if (
            suggestion.includes(task.title) ||
            (task.description && suggestion.includes(task.description))
          ) {
            confidence += 20;
          }
        }
        return Math.min(100, confidence);
      });

      const priorityLevels = taskSuggestions.map((suggestion, index) => {
        // First suggestion is high priority, last ones are low
        if (index === 0) return "high";
        if (index >= taskSuggestions.length - 2) return "low";
        return "medium";
      });

      const estimatedTimes = taskSuggestions.map((suggestion) => {
        const text = suggestion.suggestion;
        if (
          text.length > 80 ||
          text.includes("research") ||
          text.includes("complex")
        ) {
          return "1-2 hours";
        } else if (text.length < 30) {
          return "5-15 min";
        } else {
          return "15-30 min";
        }
      });

      return {
        confidenceScores,
        priorityLevels,
        estimatedTimes,
      };
    },
    [tasks],
  );

  const getSuggestionStats = useCallback(
    async (taskId: string) => {
      if (!taskId) {
        throw new Error("Task ID cannot be empty");
      }

      try {
        const taskSuggestions = await aiTaskService.getTaskSuggestions(
          taskId,
          5,
        );
        return generateSuggestionStats(taskSuggestions, taskId);
      } catch (err) {
        console.error("Error getting suggestion stats:", err);
        throw new Error("Failed to get suggestion statistics");
      }
    },
    [generateSuggestionStats],
  );

  const refreshSuggestions = useCallback(() => {
    // Clear cache and regenerate suggestions
    aiTaskService.clearCache();
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setSuggestionStats(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    suggestionStats,
    generateSuggestions,
    refreshSuggestions,
    clearSuggestions,
    getSuggestionStats,
  };
};
