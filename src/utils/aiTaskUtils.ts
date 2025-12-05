import { Task } from "../types/taskTypes";
import { AIUtils } from "./aiUtils";

interface TaskBreakdownResult {
  steps: string[];
  estimatedTime: string;
  dependencies: string[];
  resources: string[];
  complexity: number;
}

interface ActionableItem {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedTime: string;
  category: string;
}

export class AITaskUtils {
  static generateTaskBreakdown(task: Task): TaskBreakdownResult {
    const analysis = AIUtils.analyzeTaskForAIAssistance(task);

    // Generate breakdown based on task complexity
    const breakdown: TaskBreakdownResult = {
      steps: this.generateStepsForTask(task, analysis.complexityLevel),
      estimatedTime: this.estimateTaskTime(task, analysis.complexityScore),
      dependencies: this.identifyDependencies(task),
      resources: this.suggestResources(task),
      complexity: analysis.complexityScore,
    };

    return breakdown;
  }

  static generateActionableItems(
    task: Task,
    count: number = 3,
  ): ActionableItem[] {
    const suggestions = AIUtils.generateTaskSuggestions(task, count);

    return suggestions.map((suggestion, index) => ({
      id: `action-${task.id}-${index}`,
      title: suggestion.text,
      description: `Action item generated from task analysis: ${suggestion.text}`,
      priority: this.mapConfidenceToPriority(suggestion.confidence),
      estimatedTime: this.estimateActionTime(suggestion.text),
      category: suggestion.category,
    }));
  }

  static generateTaskSuggestions(task: Task, count: number = 5): string[] {
    const suggestions = AIUtils.generateTaskSuggestions(task, count);
    return suggestions.map((suggestion) => suggestion.text);
  }

  static analyzeTaskForAIIntegration(task: Task): {
    needsAIAssistance: boolean;
    assistanceLevel: "low" | "medium" | "high";
    reason: string;
  } {
    const analysis = AIUtils.analyzeTaskForAIAssistance(task);

    const needsAIAssistance = analysis.complexityScore > 40;
    const assistanceLevel = this.getAssistanceLevel(analysis.complexityLevel);

    return {
      needsAIAssistance,
      assistanceLevel,
      reason: needsAIAssistance
        ? `Task complexity (${analysis.complexityLevel}) suggests AI assistance would be beneficial`
        : "Task appears simple enough for manual handling",
    };
  }

  private static generateStepsForTask(
    task: Task,
    complexityLevel: string,
  ): string[] {
    const baseSteps = [
      "Understand task requirements",
      "Plan implementation approach",
      "Execute task",
      "Review and test results",
    ];

    if (complexityLevel === "high") {
      return [
        ...baseSteps,
        "Break down into subtasks",
        "Identify potential roadblocks",
        "Research required tools/technologies",
        "Create detailed implementation plan",
        "Implement with regular checkpoints",
        "Thorough testing and validation",
      ];
    }

    if (complexityLevel === "medium") {
      return [
        ...baseSteps,
        "Break down into manageable parts",
        "Research if needed",
        "Implement step by step",
        "Test each component",
      ];
    }

    // Low complexity
    return baseSteps;
  }

  private static estimateTaskTime(task: Task, complexityScore: number): string {
    const titleLengthFactor = Math.min(task.title.length / 10, 3);
    const descLengthFactor = task.description
      ? Math.min(task.description.length / 20, 2)
      : 0;

    const timeMultiplier =
      1 + titleLengthFactor + descLengthFactor + complexityScore / 50;

    const baseTime = 1; // 1 hour base
    const estimatedHours = Math.round(baseTime * timeMultiplier);

    if (estimatedHours <= 1) return "30-60 minutes";
    if (estimatedHours <= 2) return "1-2 hours";
    if (estimatedHours <= 4) return "2-4 hours";
    if (estimatedHours <= 8) return "4-8 hours";
    return "8+ hours";
  }

  private static identifyDependencies(task: Task): string[] {
    const dependencies: string[] = [];
    const content = (task.title + " " + (task.description || "")).toLowerCase();

    if (content.includes("api") || content.includes("backend")) {
      dependencies.push("API documentation");
      dependencies.push("Backend service access");
    }

    if (content.includes("database") || content.includes("data")) {
      dependencies.push("Database access");
      dependencies.push("Data schema documentation");
    }

    if (content.includes("design") || content.includes("ui")) {
      dependencies.push("Design system guidelines");
      dependencies.push("UI component library");
    }

    if (content.includes("team") || content.includes("collaboration")) {
      dependencies.push("Team member availability");
      dependencies.push("Collaboration tools setup");
    }

    if (dependencies.length === 0) {
      dependencies.push("Basic task requirements");
    }

    return dependencies;
  }

  private static suggestResources(task: Task): string[] {
    const resources: string[] = [];
    const content = (task.title + " " + (task.description || "")).toLowerCase();

    if (content.includes("development") || content.includes("code")) {
      resources.push("Development environment");
      resources.push("Code documentation");
      resources.push("Version control system");
    }

    if (content.includes("design") || content.includes("ui")) {
      resources.push("Design tools (Figma, Sketch)");
      resources.push("Design system documentation");
      resources.push("UI component library");
    }

    if (content.includes("meeting") || content.includes("presentation")) {
      resources.push("Meeting scheduling tools");
      resources.push("Presentation software");
      resources.push("Video conferencing setup");
    }

    if (content.includes("research") || content.includes("study")) {
      resources.push("Research databases");
      resources.push("Industry reports");
      resources.push("Analytical tools");
    }

    if (resources.length === 0) {
      resources.push("Basic productivity tools");
      resources.push("Task management system");
    }

    return resources;
  }

  private static mapConfidenceToPriority(
    confidence: number,
  ): "low" | "medium" | "high" {
    if (confidence >= 0.7) return "high";
    if (confidence >= 0.4) return "medium";
    return "low";
  }

  private static estimateActionTime(actionText: string): string {
    const wordCount = actionText.split(/\s+/).length;

    if (wordCount <= 3) return "15-30 minutes";
    if (wordCount <= 6) return "30-60 minutes";
    if (wordCount <= 10) return "1-2 hours";
    return "2+ hours";
  }

  private static getAssistanceLevel(
    complexityLevel: string,
  ): "low" | "medium" | "high" {
    switch (complexityLevel) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      default:
        return "low";
    }
  }
}
