// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAITaskSuggestions } from "../../../hooks/useAITaskSuggestions";
import { useTaskStore } from "../../../store/useTaskStore";
import { useAIStore } from "../../../store/useAIStore";

interface AITaskSuggestionsEnhancedProps {
  taskId: string;
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
  showContext?: boolean;
}

interface EnhancedSuggestion {
  id: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  confidence: number;
  context: string;
  estimatedTime: string;
}

export const AITaskSuggestionsEnhanced: React.FC<
  AITaskSuggestionsEnhancedProps
> = ({
  taskId,
  onSuggestionSelect,
  maxSuggestions = 5,
  showContext = false,
}) => {
  const { suggestions, loading, error, generateSuggestions } =
    useAITaskSuggestions();
  const { tasks } = useTaskStore();
  const { aiUsageStatistics } = useAIStore();
  const [expanded, setExpanded] = useState(false);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<
    EnhancedSuggestion[]
  >([]);
  const [showStats, setShowStats] = useState(false);

  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (taskId) {
      generateSuggestions(taskId);
    }
  }, [taskId, generateSuggestions]);

  useEffect(() => {
    if (suggestions.length > 0 && task) {
      // Enhance suggestions with context and priority
      const enhanced = suggestions.map(
        (suggestion, index): EnhancedSuggestion => {
          // Calculate priority based on suggestion content and position
          let priority: "low" | "medium" | "high" = "medium";
          if (
            index === 0 ||
            suggestion.includes("urgent") ||
            suggestion.includes("priority")
          ) {
            priority = "high";
          } else if (
            index >= suggestions.length - 2 ||
            suggestion.includes("optional")
          ) {
            priority = "low";
          }

          // Calculate confidence based on suggestion specificity
          let confidence = 70;
          if (
            suggestion.includes(task.title) ||
            suggestion.includes(task.description || "")
          ) {
            confidence += 15;
          }
          if (suggestion.length > 50) {
            confidence += 10;
          }

          // Estimate time based on suggestion complexity
          let estimatedTime = "15-30 min";
          if (
            suggestion.length > 80 ||
            suggestion.includes("research") ||
            suggestion.includes("complex")
          ) {
            estimatedTime = "1-2 hours";
          } else if (suggestion.length < 30) {
            estimatedTime = "5-15 min";
          }

          return {
            id: `${taskId}-suggestion-${index}`,
            suggestion,
            priority,
            confidence: Math.min(100, confidence),
            context: `Based on task: "${task.title}" and your productivity patterns`,
            estimatedTime,
          };
        },
      );

      setEnhancedSuggestions(enhanced);
    }
  }, [suggestions, task, taskId]);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffbb33";
      case "low":
        return "#00C851";
      default:
        return "#cccccc";
    }
  };

  const visibleSuggestions = expanded
    ? enhancedSuggestions
    : enhancedSuggestions.slice(0, maxSuggestions);

  if (loading && enhancedSuggestions.length === 0) {
    return (
      <div className="ai-task-suggestions-enhanced">
        <div className="suggestions-header">
          <h3 className="suggestions-title">🤖 Intelligent Task Suggestions</h3>
          <div className="suggestions-subtitle">
            Analyzing your task and generating smart suggestions...
          </div>
        </div>
        <div className="loading-indicator">
          <div className="ai-spinner" />
          <div>Generating context-aware suggestions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-task-suggestions-enhanced">
        <div className="suggestions-header">
          <h3 className="suggestions-title">🤖 Intelligent Task Suggestions</h3>
        </div>
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div>Error generating suggestions: {error}</div>
          <button
            onClick={() => generateSuggestions(taskId)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-task-suggestions-enhanced">
      <div className="suggestions-header">
        <h3 className="suggestions-title">🤖 Intelligent Task Suggestions</h3>
        <div className="suggestions-subtitle">
          {task
            ? `Smart suggestions for "${task.title}" based on your work patterns`
            : "Personalized task recommendations"}
        </div>
        <div className="suggestions-controls">
          <button
            className="stats-button"
            onClick={() => setShowStats(!showStats)}
            title="Show AI usage statistics"
          >
            📊
          </button>
          <button
            className="refresh-button"
            onClick={() => generateSuggestions(taskId)}
            title="Refresh suggestions"
          >
            🔄
          </button>
        </div>
      </div>

      {showStats && (
        <div className="ai-stats">
          <div className="stat-item">
            <span className="stat-label">Total AI Requests:</span>
            <span className="stat-value">
              {aiUsageStatistics.totalRequests}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate:</span>
            <span className="stat-value">
              {aiUsageStatistics.totalRequests > 0
                ? `${Math.round((aiUsageStatistics.successfulRequests / aiUsageStatistics.totalRequests) * 100)}%`
                : "N/A"}
            </span>
          </div>
        </div>
      )}

      {enhancedSuggestions.length === 0 ? (
        <div className="no-suggestions">
          <div className="no-suggestions-icon">💡</div>
          <div className="no-suggestions-text">
            No intelligent suggestions available for this task.
            {task && (
              <div className="no-suggestions-subtext">
                Try providing more details in the task description for better
                suggestions.
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="suggestions-grid">
            {visibleSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`suggestion-card ${suggestion.priority}`}
                onClick={() => handleSuggestionClick(suggestion.suggestion)}
              >
                <div
                  className="suggestion-priority-indicator"
                  style={{
                    backgroundColor: getPriorityColor(suggestion.priority),
                  }}
                  title={`Priority: ${suggestion.priority}`}
                >
                  {suggestion.priority === "high"
                    ? "⬆️"
                    : suggestion.priority === "medium"
                      ? "→"
                      : "⬇️"}
                </div>

                <div className="suggestion-content">
                  <div className="suggestion-text">{suggestion.suggestion}</div>

                  {showContext && (
                    <div className="suggestion-context">
                      <small>{suggestion.context}</small>
                    </div>
                  )}

                  <div className="suggestion-meta">
                    <span
                      className="confidence-badge"
                      title={`Confidence: ${suggestion.confidence}%`}
                    >
                      🎯 {suggestion.confidence}%
                    </span>
                    <span className="time-estimate" title="Estimated time">
                      ⏱️ {suggestion.estimatedTime}
                    </span>
                  </div>
                </div>

                <button
                  className="use-suggestion-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(suggestion.suggestion);
                  }}
                  title="Use this suggestion"
                >
                  ✅ Use
                </button>
              </div>
            ))}
          </div>

          {enhancedSuggestions.length > maxSuggestions && (
            <button
              className="show-more-button"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? "Show Less"
                : `Show ${enhancedSuggestions.length - maxSuggestions} More`}
              {expanded ? " ↑" : " ↓"}
            </button>
          )}
        </>
      )}
    </div>
  );
};
