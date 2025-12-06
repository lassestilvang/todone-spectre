// @ts-nocheck
import React, { useState, useEffect } from "react";
import { AIAssistant } from "./AIAssistant";
import { AITaskSuggestionsEnhanced } from "./AITaskSuggestionsEnhanced";
import { AINaturalLanguageTaskCreator } from "./AINaturalLanguageTaskCreator";
import { AIContextAwareAssistant } from "./AIContextAwareAssistant";
import { AITaskBreakdown } from "./AITaskBreakdown";
import { useTaskStore } from "../../../store/useTaskStore";
import { useAIStore } from "../../../store/useAIStore";
import { useProjectStore } from "../../../store/useProjectStore";

interface AICompleteIntegrationProps {
  taskId?: string;
  projectId?: string;
  mode?: "compact" | "full" | "creator" | "assistant";
  onTaskCreated?: (task: Partial<Task>) => void;
  onSuggestionSelect?: (suggestion: string) => void;
}

export const AICompleteIntegration: React.FC<AICompleteIntegrationProps> = ({
  taskId,
  projectId,
  mode = "compact",
  onTaskCreated,
  onSuggestionSelect,
}) => {
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { aiAssistantEnabled, aiUsageStatistics } = useAIStore();

  const [activeFeature, setActiveFeature] = useState<
    "suggestions" | "creator" | "assistant" | "context" | "breakdown"
  >("suggestions");
  const [showStats, setShowStats] = useState(false);

  const task = taskId ? tasks.find((t) => t.id === taskId) : null;
  const project = projectId ? projects.find((p) => p.id === projectId) : null;

  useEffect(() => {
    // Set default active feature based on mode
    if (mode === "creator") {
      setActiveFeature("creator");
    } else if (mode === "assistant") {
      setActiveFeature("assistant");
    }
  }, [mode]);

  const getFeatureContent = () => {
    switch (activeFeature) {
      case "suggestions":
        return (
          <AITaskSuggestionsEnhanced
            taskId={taskId || ""}
            onSuggestionSelect={onSuggestionSelect}
            maxSuggestions={5}
            showContext={true}
          />
        );

      case "creator":
        return (
          <AINaturalLanguageTaskCreator
            onTaskCreated={onTaskCreated}
            showAdvancedOptions={true}
            defaultContext={{
              defaultProject: project?.id,
              defaultPriority: task?.priority || "medium",
            }}
          />
        );

      case "assistant":
        return (
          <AIAssistant
            taskId={taskId}
            onSuggestionSelect={onSuggestionSelect}
          />
        );

      case "context":
        return (
          <AIContextAwareAssistant
            taskId={taskId}
            projectId={projectId}
            mode={projectId ? "project" : taskId ? "task" : "global"}
          />
        );

      case "breakdown":
        return taskId ? (
          <AITaskBreakdown
            taskId={taskId}
            taskTitle={task?.title || "Untitled Task"}
            taskDescription={task?.description || ""}
          />
        ) : null;

      default:
        return null;
    }
  };

  if (mode === "full") {
    return (
      <div className="ai-complete-integration">
        <div className="ai-integration-header">
          <h2>🤖 Complete AI Integration</h2>
          <p>All AI features in one comprehensive interface</p>

          <div className="ai-stats-summary">
            <span className="stat-item">
              📊 AI Requests: {aiUsageStatistics.totalRequests}
            </span>
            <span className="stat-item">
              ✅ Success Rate:{" "}
              {aiUsageStatistics.totalRequests > 0
                ? `${Math.round((aiUsageStatistics.successfulRequests / aiUsageStatistics.totalRequests) * 100)}%`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="ai-feature-tabs">
          <button
            className={`feature-tab ${activeFeature === "suggestions" ? "active" : ""}`}
            onClick={() => setActiveFeature("suggestions")}
            title="Intelligent task suggestions"
          >
            💡 Suggestions
          </button>

          <button
            className={`feature-tab ${activeFeature === "creator" ? "active" : ""}`}
            onClick={() => setActiveFeature("creator")}
            title="Natural language task creation"
          >
            ✍️ Creator
          </button>

          <button
            className={`feature-tab ${activeFeature === "assistant" ? "active" : ""}`}
            onClick={() => setActiveFeature("assistant")}
            title="AI task assistant"
          >
            🤖 Assistant
          </button>

          <button
            className={`feature-tab ${activeFeature === "context" ? "active" : ""}`}
            onClick={() => setActiveFeature("context")}
            title="Context-aware assistance"
          >
            🧠 Context
          </button>

          <button
            className={`feature-tab ${activeFeature === "breakdown" ? "active" : ""}`}
            onClick={() => setActiveFeature("breakdown")}
            title="Task breakdown and analysis"
          >
            📊 Breakdown
          </button>
        </div>

        <div className="ai-feature-content">{getFeatureContent()}</div>

        <div className="ai-integration-footer">
          <div className="ai-status">
            {aiAssistantEnabled ? (
              <span className="ai-enabled">🟢 AI Assistant Enabled</span>
            ) : (
              <span className="ai-disabled">🔴 AI Assistant Disabled</span>
            )}
          </div>

          <button
            className="ai-feedback-button"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Hide Stats" : "Show Detailed Stats"}
          </button>
        </div>

        {showStats && (
          <div className="ai-detailed-stats">
            <h4>📈 AI Usage Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Requests</div>
                <div className="stat-value">
                  {aiUsageStatistics.totalRequests}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Successful Requests</div>
                <div className="stat-value">
                  {aiUsageStatistics.successfulRequests}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Success Rate</div>
                <div className="stat-value">
                  {aiUsageStatistics.totalRequests > 0
                    ? `${Math.round((aiUsageStatistics.successfulRequests / aiUsageStatistics.totalRequests) * 100)}%`
                    : "N/A"}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Last Request</div>
                <div className="stat-value">
                  {aiUsageStatistics.lastRequestTime
                    ? new Date(
                        aiUsageStatistics.lastRequestTime,
                      ).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === "creator") {
    return (
      <div className="ai-creator-mode">
        <AINaturalLanguageTaskCreator
          onTaskCreated={onTaskCreated}
          showAdvancedOptions={true}
          defaultContext={{
            defaultProject: project?.id,
            defaultPriority: "medium",
          }}
        />
      </div>
    );
  }

  if (mode === "assistant") {
    return (
      <div className="ai-assistant-mode">
        <AIAssistant taskId={taskId} onSuggestionSelect={onSuggestionSelect} />
      </div>
    );
  }

  // Compact mode (default)
  return (
    <div className="ai-compact-integration">
      <div className="ai-compact-header">
        <h3>🤖 AI Integration</h3>
        <div className="ai-compact-controls">
          <button
            className="compact-control-button"
            onClick={() => setActiveFeature("suggestions")}
            title="Task suggestions"
          >
            💡
          </button>
          <button
            className="compact-control-button"
            onClick={() => setActiveFeature("context")}
            title="Context-aware assistance"
          >
            🧠
          </button>
        </div>
      </div>

      <div className="ai-compact-content">
        {activeFeature === "suggestions" ? (
          <AITaskSuggestionsEnhanced
            taskId={taskId || ""}
            onSuggestionSelect={onSuggestionSelect}
            maxSuggestions={3}
            showContext={false}
          />
        ) : (
          <AIContextAwareAssistant
            taskId={taskId}
            projectId={projectId}
            mode={projectId ? "project" : taskId ? "task" : "global"}
          />
        )}
      </div>
    </div>
  );
};
