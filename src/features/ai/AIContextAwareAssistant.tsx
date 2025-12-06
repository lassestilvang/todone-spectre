import React, { useState, useEffect } from "react";
import { useTaskStore } from "../../../store/useTaskStore";
import { useAIStore } from "../../../store/useAIStore";
import { useProjectStore } from "../../../store/useProjectStore";
import { Task } from "../../../types/taskTypes";
import { Project } from "../../../types/projectTypes";
import { aiPrioritizationService } from "../../../services/aiPrioritizationService";

interface AIContextAwareAssistantProps {
  taskId?: string;
  projectId?: string;
  mode?: "task" | "project" | "global";
  onContextSuggestion?: (suggestion: string) => void;
}

interface ContextAnalysis {
  currentTaskContext: {
    task: Task | null;
    relatedTasks: Task[];
    taskDependencies: Task[];
    dependentTasks: Task[];
  };
  projectContext: {
    project: Project | null;
    projectTasks: Task[];
    projectPriority: string;
    projectStatus: string;
  };
  userContext: {
    currentFocus: string;
    productivityPattern: string;
    recentActivity: string[];
    preferredWorkTimes: string[];
  };
  systemContext: {
    currentTime: string;
    dayOfWeek: string;
    systemLoad: "low" | "medium" | "high";
  };
}

interface ContextAwareSuggestion {
  id: string;
  suggestion: string;
  contextType: "task" | "project" | "user" | "system" | "cross-context";
  priority: "low" | "medium" | "high";
  confidence: number;
  reasoning: string;
  actionType: "reminder" | "suggestion" | "warning" | "optimization";
}

export const AIContextAwareAssistant: React.FC<
  AIContextAwareAssistantProps
> = ({ taskId, projectId, mode = "task", onContextSuggestion }) => {
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { aiUsageStatistics } = useAIStore();

  const [contextAnalysis, setContextAnalysis] =
    useState<ContextAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ContextAwareSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "suggestions">(
    "suggestions",
  );

  useEffect(() => {
    if (mode === "task" && taskId) {
      analyzeTaskContext(taskId);
    } else if (mode === "project" && projectId) {
      analyzeProjectContext(projectId);
    } else {
      analyzeGlobalContext();
    }
  }, [taskId, projectId, mode, tasks, projects]);

  const analyzeTaskContext = async (taskId: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const task = tasks.find((t) => t.id === taskId) || null;

      if (!task) {
        throw new Error("Task not found");
      }

      // Analyze related tasks
      const relatedTasks = findRelatedTasks(task);
      const taskDependencies = findTaskDependencies(task);
      const dependentTasks = findDependentTasks(task);

      // Analyze project context
      const project = task.projectId
        ? projects.find((p) => p.id === task.projectId) || null
        : null;

      const projectTasks = project
        ? tasks.filter((t) => t.projectId === project.id)
        : [];

      // Get user context
      const userContext = getUserContextData();

      // Get system context
      const systemContext = getSystemContextData();

      const analysis: ContextAnalysis = {
        currentTaskContext: {
          task,
          relatedTasks,
          taskDependencies,
          dependentTasks,
        },
        projectContext: {
          project,
          projectTasks,
          projectPriority: project?.priority || "medium",
          projectStatus: project?.status || "active",
        },
        userContext,
        systemContext,
      };

      setContextAnalysis(analysis);

      // Generate context-aware suggestions
      const generatedSuggestions =
        await generateContextAwareSuggestions(analysis);
      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error("Context analysis error:", error);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze context",
      );
      setContextAnalysis(null);
      setSuggestions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProjectContext = async (projectId: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const project = projects.find((p) => p.id === projectId) || null;

      if (!project) {
        throw new Error("Project not found");
      }

      const projectTasks = tasks.filter((t) => t.projectId === project.id);

      // Get user context
      const userContext = getUserContextData();

      // Get system context
      const systemContext = getSystemContextData();

      const analysis: ContextAnalysis = {
        currentTaskContext: {
          task: null,
          relatedTasks: [],
          taskDependencies: [],
          dependentTasks: [],
        },
        projectContext: {
          project,
          projectTasks,
          projectPriority: project.priority,
          projectStatus: project.status,
        },
        userContext,
        systemContext,
      };

      setContextAnalysis(analysis);

      // Generate context-aware suggestions
      const generatedSuggestions =
        await generateContextAwareSuggestions(analysis);
      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error("Project context analysis error:", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to analyze project context",
      );
      setContextAnalysis(null);
      setSuggestions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeGlobalContext = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      // Get user context
      const userContext = getUserContextData();

      // Get system context
      const systemContext = getSystemContextData();

      // Find high-priority tasks across all projects
      const highPriorityTasks = tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed",
      );

      const analysis: ContextAnalysis = {
        currentTaskContext: {
          task: null,
          relatedTasks: highPriorityTasks,
          taskDependencies: [],
          dependentTasks: [],
        },
        projectContext: {
          project: null,
          projectTasks: highPriorityTasks,
          projectPriority: "high",
          projectStatus: "active",
        },
        userContext,
        systemContext,
      };

      setContextAnalysis(analysis);

      // Generate context-aware suggestions
      const generatedSuggestions =
        await generateContextAwareSuggestions(analysis);
      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error("Global context analysis error:", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to analyze global context",
      );
      setContextAnalysis(null);
      setSuggestions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findRelatedTasks = (task: Task): Task[] => {
    if (!task || !task.title) return [];

    return tasks
      .filter(
        (t) =>
          t.id !== task.id &&
          (t.title.toLowerCase().includes(task.title.toLowerCase()) ||
            (t.description &&
              t.description.toLowerCase().includes(task.title.toLowerCase())) ||
            (task.description &&
              t.description &&
              t.description
                .toLowerCase()
                .includes(task.description.toLowerCase()))),
      )
      .slice(0, 3); // Limit to top 3 related tasks
  };

  const findTaskDependencies = (task: Task): Task[] => {
    if (!task || !task.dependencies) return [];

    return tasks.filter((t) => task.dependencies?.includes(t.id)).slice(0, 3);
  };

  const findDependentTasks = (task: Task): Task[] => {
    if (!task || !task.id) return [];

    return tasks.filter((t) => t.dependencies?.includes(task.id)).slice(0, 3);
  };

  const getUserContextData = (): ContextAnalysis["userContext"] => {
    // In a real implementation, this would come from user data and activity tracking
    const now = new Date();
    const hours = now.getHours();
    let currentFocus = "general";

    // Determine current focus based on time of day
    if (hours >= 9 && hours < 12) {
      currentFocus = "morning focus work";
    } else if (hours >= 12 && hours < 14) {
      currentFocus = "lunch break";
    } else if (hours >= 14 && hours < 17) {
      currentFocus = "afternoon deep work";
    } else {
      currentFocus = "flexible time";
    }

    return {
      currentFocus,
      productivityPattern: "morning person", // Would be learned from user behavior
      recentActivity: ["task review", "email check", "planning"], // Would be from recent actions
      preferredWorkTimes: ["9-12", "14-17"], // Would be from user preferences
    };
  };

  const getSystemContextData = (): ContextAnalysis["systemContext"] => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const hours = now.getHours();

    // Simulate system load (in real app, this would be actual system metrics)
    let systemLoad: "low" | "medium" | "high" = "medium";
    if (hours >= 8 && hours < 10) {
      systemLoad = "high"; // Morning rush
    } else if (hours >= 17) {
      systemLoad = "low"; // Evening
    }

    return {
      currentTime: now.toLocaleTimeString(),
      dayOfWeek: days[now.getDay()],
      systemLoad,
    };
  };

  const generateContextAwareSuggestions = async (
    analysis: ContextAnalysis,
  ): Promise<ContextAwareSuggestion[]> => {
    const suggestions: ContextAwareSuggestion[] = [];

    // Task-specific suggestions
    if (analysis.currentTaskContext.task) {
      const taskSuggestions = generateTaskContextSuggestions(analysis);
      suggestions.push(...taskSuggestions);
    }

    // Project-specific suggestions
    if (analysis.projectContext.project) {
      const projectSuggestions = generateProjectContextSuggestions(analysis);
      suggestions.push(...projectSuggestions);
    }

    // User pattern suggestions
    const userSuggestions = generateUserContextSuggestions(analysis);
    suggestions.push(...userSuggestions);

    // System/environment suggestions
    const systemSuggestions = generateSystemContextSuggestions(analysis);
    suggestions.push(...systemSuggestions);

    // Cross-context optimizations
    const crossContextSuggestions = generateCrossContextSuggestions(analysis);
    suggestions.push(...crossContextSuggestions);

    // Sort by priority and confidence
    return suggestions
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Then by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, 8); // Return top 8 suggestions
  };

  const generateTaskContextSuggestions = (
    analysis: ContextAnalysis,
  ): ContextAwareSuggestion[] => {
    const task = analysis.currentTaskContext.task;
    if (!task) return [];

    const suggestions: ContextAwareSuggestion[] = [];

    // Suggestion: Complete dependent tasks first
    if (analysis.currentTaskContext.taskDependencies.length > 0) {
      suggestions.push({
        id: `suggest-${Date.now()}-1`,
        suggestion: `Complete dependent tasks first: ${analysis.currentTaskContext.taskDependencies.map((t) => t.title).join(", ")}`,
        contextType: "task",
        priority: "high",
        confidence: 85,
        reasoning: `This task depends on ${analysis.currentTaskContext.taskDependencies.length} other tasks being completed first`,
        actionType: "warning",
      });
    }

    // Suggestion: Consider task complexity and time required
    if (task.description && task.description.length > 150) {
      suggestions.push({
        id: `suggest-${Date.now()}-2`,
        suggestion:
          "This appears to be a complex task. Consider breaking it down into smaller subtasks.",
        contextType: "task",
        priority: "medium",
        confidence: 75,
        reasoning:
          "Task description is quite long, indicating potential complexity",
        actionType: "suggestion",
      });
    }

    // Suggestion: Time estimation based on similar tasks
    const similarTasks = tasks.filter(
      (t) =>
        t.id !== task.id &&
        t.title.toLowerCase().includes("task") &&
        t.description &&
        t.description.length > 100,
    );

    if (similarTasks.length > 0) {
      const avgDuration =
        similarTasks.reduce((sum, t) => {
          return sum + (t.estimatedDuration || 1);
        }, 0) / similarTasks.length;

      suggestions.push({
        id: `suggest-${Date.now()}-3`,
        suggestion: `Based on similar tasks, this might take approximately ${Math.round(avgDuration)} hours to complete`,
        contextType: "task",
        priority: "medium",
        confidence: 70,
        reasoning: `Analysis of ${similarTasks.length} similar completed tasks`,
        actionType: "suggestion",
      });
    }

    // Suggestion: Priority adjustment based on dependencies
    if (analysis.currentTaskContext.dependentTasks.length > 2) {
      suggestions.push({
        id: `suggest-${Date.now()}-4`,
        suggestion:
          "This task is blocking multiple other tasks. Consider increasing its priority.",
        contextType: "task",
        priority: "high",
        confidence: 80,
        reasoning: `${analysis.currentTaskContext.dependentTasks.length} tasks depend on this one`,
        actionType: "optimization",
      });
    }

    return suggestions;
  };

  const generateProjectContextSuggestions = (
    analysis: ContextAnalysis,
  ): ContextAwareSuggestion[] => {
    const project = analysis.projectContext.project;
    if (!project) return [];

    const suggestions: ContextAwareSuggestion[] = [];

    // Project priority suggestion
    if (
      project.priority === "high" &&
      analysis.projectContext.projectTasks.length > 5
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-5`,
        suggestion: `This is a high-priority project with ${analysis.projectContext.projectTasks.length} tasks. Focus on completing project tasks first.`,
        contextType: "project",
        priority: "high",
        confidence: 85,
        reasoning: "High-priority project with significant task load",
        actionType: "reminder",
      });
    }

    // Project status suggestion
    if (project.status === "behind" || project.status === "at risk") {
      suggestions.push({
        id: `suggest-${Date.now()}-6`,
        suggestion: `Project "${project.name}" is marked as "${project.status}". Consider allocating more time to this project.`,
        contextType: "project",
        priority: "high",
        confidence: 90,
        reasoning: "Project health indicator shows potential issues",
        actionType: "warning",
      });
    }

    // Resource allocation suggestion
    if (
      analysis.projectContext.projectTasks.length > 10 &&
      analysis.projectContext.projectTasks.filter((t) => t.status === "pending")
        .length > 5
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-7`,
        suggestion: `Project has many pending tasks. Consider delegating some tasks or adjusting timelines.`,
        contextType: "project",
        priority: "medium",
        confidence: 75,
        reasoning: "High volume of pending tasks detected",
        actionType: "optimization",
      });
    }

    return suggestions;
  };

  const generateUserContextSuggestions = (
    analysis: ContextAnalysis,
  ): ContextAwareSuggestion[] => {
    const suggestions: ContextAwareSuggestion[] = [];
    const now = new Date();
    const hours = now.getHours();

    // Time-based productivity suggestion
    if (
      analysis.userContext.currentFocus === "morning focus work" &&
      hours >= 9 &&
      hours < 12
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-8`,
        suggestion:
          "Morning is your peak productivity time. Focus on high-priority tasks now.",
        contextType: "user",
        priority: "medium",
        confidence: 80,
        reasoning: "User productivity patterns show morning peak performance",
        actionType: "reminder",
      });
    }

    // Work pattern suggestion
    if (
      analysis.userContext.productivityPattern === "morning person" &&
      hours >= 14
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-9`,
        suggestion:
          "Afternoon is typically lower productivity for you. Consider scheduling meetings or lighter tasks.",
        contextType: "user",
        priority: "low",
        confidence: 70,
        reasoning: "User productivity patterns indicate afternoon slowdown",
        actionType: "suggestion",
      });
    }

    // Recent activity suggestion
    if (analysis.userContext.recentActivity.includes("planning")) {
      suggestions.push({
        id: `suggest-${Date.now()}-10`,
        suggestion:
          "You were recently planning tasks. This might be a good time to execute some of those plans.",
        contextType: "user",
        priority: "medium",
        confidence: 65,
        reasoning: "Recent user activity indicates planning phase",
        actionType: "suggestion",
      });
    }

    return suggestions;
  };

  const generateSystemContextSuggestions = (
    analysis: ContextAnalysis,
  ): ContextAwareSuggestion[] => {
    const suggestions: ContextAwareSuggestion[] = [];
    const now = new Date();
    const hours = now.getHours();

    // System load suggestion
    if (analysis.systemContext.systemLoad === "high") {
      suggestions.push({
        id: `suggest-${Date.now()}-11`,
        suggestion:
          "System is currently under high load. Consider saving complex tasks for later.",
        contextType: "system",
        priority: "medium",
        confidence: 75,
        reasoning: "High system load detected during peak hours",
        actionType: "warning",
      });
    }

    // Time of day suggestion
    if (hours >= 17 || hours < 8) {
      suggestions.push({
        id: `suggest-${Date.now()}-12`,
        suggestion:
          "Outside normal working hours. Consider if this task can wait until tomorrow.",
        contextType: "system",
        priority: "low",
        confidence: 60,
        reasoning: "Task creation during off-hours",
        actionType: "suggestion",
      });
    }

    // Weekend suggestion
    if (
      analysis.systemContext.dayOfWeek === "Saturday" ||
      analysis.systemContext.dayOfWeek === "Sunday"
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-13`,
        suggestion:
          "Weekend detected. Consider if this task should wait until the work week.",
        contextType: "system",
        priority: "low",
        confidence: 55,
        reasoning: "Weekend context detected",
        actionType: "suggestion",
      });
    }

    return suggestions;
  };

  const generateCrossContextSuggestions = (
    analysis: ContextAnalysis,
  ): ContextAwareSuggestion[] => {
    const suggestions: ContextAwareSuggestion[] = [];
    const now = new Date();
    const hours = now.getHours();

    // Combined task + user context suggestion
    if (
      analysis.currentTaskContext.task &&
      analysis.userContext.currentFocus === "morning focus work" &&
      analysis.currentTaskContext.task.priority === "high"
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-14`,
        suggestion: `Perfect timing! You're in your morning focus period and this is a high-priority task. Ideal conditions for productivity.`,
        contextType: "cross-context",
        priority: "high",
        confidence: 90,
        reasoning:
          "Alignment of high-priority task with user peak productivity time",
        actionType: "optimization",
      });
    }

    // Combined project + system context suggestion
    if (
      analysis.projectContext.project &&
      analysis.projectContext.project.priority === "high" &&
      analysis.systemContext.systemLoad === "low"
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-15`,
        suggestion: `High-priority project with low system load. Excellent opportunity to make significant progress.`,
        contextType: "cross-context",
        priority: "high",
        confidence: 85,
        reasoning:
          "High-priority project aligned with optimal system conditions",
        actionType: "optimization",
      });
    }

    // Combined task + project context suggestion
    if (
      analysis.currentTaskContext.task &&
      analysis.projectContext.project &&
      analysis.currentTaskContext.task.priority !==
        analysis.projectContext.project.priority
    ) {
      suggestions.push({
        id: `suggest-${Date.now()}-16`,
        suggestion: `Task priority (${analysis.currentTaskContext.task.priority}) doesn't match project priority (${analysis.projectContext.project.priority}). Consider aligning priorities.`,
        contextType: "cross-context",
        priority: "medium",
        confidence: 75,
        reasoning: "Priority mismatch between task and project levels",
        actionType: "warning",
      });
    }

    return suggestions;
  };

  const handleSuggestionClick = (suggestion: ContextAwareSuggestion) => {
    if (onContextSuggestion) {
      onContextSuggestion(suggestion.suggestion);
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

  const getContextTypeColor = (contextType: string) => {
    switch (contextType) {
    case "task":
        return "#4285F4"; // Blue
    case "project":
        return "#0F9D58"; // Green
    case "user":
        return "#DB4437"; // Red
    case "system":
        return "#F4B400"; // Yellow
    case "cross-context":
        return "#9C27B0"; // Purple
    default:
        return "#757575";
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
    case "reminder":
        return "🔔";
    case "suggestion":
        return "💡";
    case "warning":
        return "⚠️";
    case "optimization":
        return "⚡";
    default:
        return "ℹ️";
    }
  };

  if (isAnalyzing && !contextAnalysis) {
    return (
      <div className="ai-context-assistant">
        <div className="context-header">
          <h3>🧠 Context-Aware Assistant</h3>
          <p>Analyzing your work context for intelligent suggestions...</p>
        </div>
        <div className="loading-indicator">
          <div className="context-spinner" />
          <div>
            Gathering context from tasks, projects, user patterns, and system
            status...
          </div>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="ai-context-assistant">
        <div className="context-header">
          <h3>🧠 Context-Aware Assistant</h3>
        </div>
        <div className="error-message">
          <div className="error-icon">❌</div>
          <div>Context analysis error: {analysisError}</div>
          <button
            onClick={() => {
              if (mode === "task" && taskId) analyzeTaskContext(taskId);
              else if (mode === "project" && projectId)
                analyzeProjectContext(projectId);
              else analyzeGlobalContext();
            }}
            className="retry-button"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-context-assistant">
      <div className="context-header">
        <h3>🧠 Context-Aware Assistant</h3>
        <p>Intelligent suggestions based on your complete work context</p>

        <div className="context-tabs">
          <button
            className={`tab-button ${activeTab === "suggestions" ? "active" : ""}`}
            onClick={() => setActiveTab("suggestions")}
          >
            💡 Suggestions
          </button>
          <button
            className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("analysis")}
          >
            📊 Context Analysis
          </button>
        </div>
      </div>

      {activeTab === "suggestions" ? (
        <div className="context-suggestions">
          {suggestions.length === 0 ? (
            <div className="no-suggestions">
              <div className="no-suggestions-icon">🤷</div>
              <div className="no-suggestions-text">
                No context-aware suggestions available
              </div>
              <div className="no-suggestions-subtext">
                {mode === "task"
                  ? "Task appears to be well-aligned with current context"
                  : mode === 'project' ? 'Project is properly contextualized' : 'Global context looks good'}
              </div>
            </div>
          ) : (
            <div className="suggestions-grid">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`context-suggestion-card ${suggestion.priority}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-header">
                    <div
                      className="context-type-indicator"
                      style={{
                        backgroundColor: getContextTypeColor(
                          suggestion.contextType,
                        ),
                      }}
                      title={`Context: ${suggestion.contextType}`}
                    >
                      {suggestion.contextType === "task"
                        ? "📋"
                        : suggestion.contextType === "project"
                          ? "🗂️"
                          : suggestion.contextType === "user"
                            ? "👤"
                            : suggestion.contextType === "system"
                              ? "🖥️"
                              : "🔗"}
                    </div>

                    <div
                      className="priority-indicator"
                      style={{
                        backgroundColor: getPriorityColor(suggestion.priority),
                      }}
                      title={`Priority: ${suggestion.priority}`}
                    >
                      {getActionTypeIcon(suggestion.actionType)}
                    </div>
                  </div>

                  <div className="suggestion-content">
                    <div className="suggestion-text">
                      {suggestion.suggestion}
                    </div>

                    <div className="suggestion-meta">
                      <span
                        className="confidence-badge"
                        title={`Confidence: ${suggestion.confidence}%`}
                      >
                        🎯 {suggestion.confidence}%
                      </span>

                      <span
                        className="context-type-badge"
                        style={{
                          color: getContextTypeColor(suggestion.contextType),
                        }}
                      >
                        {suggestion.contextType}
                      </span>
                    </div>

                    {suggestion.reasoning && (
                      <div className="suggestion-reasoning">
                        <small>Reason: {suggestion.reasoning}</small>
                      </div>
                    )}
                  </div>

                  <button
                    className="use-suggestion-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    title="Apply this suggestion"
                  >
                    ✅ Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="context-analysis">
          <div className="analysis-section">
            <h4>📋 Task Context</h4>
            {contextAnalysis?.currentTaskContext.task ? (
              <div className="analysis-content">
                <div className="analysis-item">
                  <span className="item-label">Current Task:</span>
                  <span className="item-value">
                    {contextAnalysis.currentTaskContext.task.title}
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Priority:</span>
                  <span className="item-value">
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(
                          contextAnalysis.currentTaskContext.task.priority,
                        ),
                      }}
                    >
                      {contextAnalysis.currentTaskContext.task.priority}
                    </span>
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Status:</span>
                  <span className="item-value">
                    {contextAnalysis.currentTaskContext.task.status}
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Dependencies:</span>
                  <span className="item-value">
                    {contextAnalysis.currentTaskContext.taskDependencies.length}{" "}
                    blocking,
                    {
                      contextAnalysis.currentTaskContext.dependentTasks.length
                    }{" "}
                    depending
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-task-context">No specific task context</div>
            )}
          </div>

          <div className="analysis-section">
            <h4>🗂️ Project Context</h4>
            {contextAnalysis?.projectContext.project ? (
              <div className="analysis-content">
                <div className="analysis-item">
                  <span className="item-label">Project:</span>
                  <span className="item-value">
                    {contextAnalysis.projectContext.project.name}
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Priority:</span>
                  <span className="item-value">
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(
                          contextAnalysis.projectContext.project.priority,
                        ),
                      }}
                    >
                      {contextAnalysis.projectContext.project.priority}
                    </span>
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Status:</span>
                  <span className="item-value">
                    {contextAnalysis.projectContext.project.status}
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="item-label">Project Tasks:</span>
                  <span className="item-value">
                    {contextAnalysis.projectContext.projectTasks.length} total,
                    {
                      contextAnalysis.projectContext.projectTasks.filter(
                        (t) => t.status === "pending",
                      ).length
                    }{" "}
                    pending
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-project-context">
                No specific project context
              </div>
            )}
          </div>

          <div className="analysis-section">
            <h4>👤 User Context</h4>
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="item-label">Current Focus:</span>
                <span className="item-value">
                  {contextAnalysis?.userContext.currentFocus}
                </span>
              </div>

              <div className="analysis-item">
                <span className="item-label">Productivity Pattern:</span>
                <span className="item-value">
                  {contextAnalysis?.userContext.productivityPattern}
                </span>
              </div>

              <div className="analysis-item">
                <span className="item-label">Recent Activity:</span>
                <span className="item-value">
                  {contextAnalysis?.userContext.recentActivity.join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="analysis-section">
            <h4>🖥️ System Context</h4>
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="item-label">Current Time:</span>
                <span className="item-value">
                  {contextAnalysis?.systemContext.currentTime}
                </span>
              </div>

              <div className="analysis-item">
                <span className="item-label">Day of Week:</span>
                <span className="item-value">
                  {contextAnalysis?.systemContext.dayOfWeek}
                </span>
              </div>

              <div className="analysis-item">
                <span className="item-label">System Load:</span>
                <span className="item-value">
                  <span
                    className="load-badge"
                    style={{
                      backgroundColor:
                        contextAnalysis?.systemContext.systemLoad === "high"
                          ? "#ff4444"
                          : contextAnalysis?.systemContext.systemLoad ===
                              "medium"
                            ? "#ffbb33"
                            : "#00C851",
                    }}
                  >
                    {contextAnalysis?.systemContext.systemLoad}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
