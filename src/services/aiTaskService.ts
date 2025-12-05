import { Task } from "../types/taskTypes";
import { aiService } from "./aiService";

interface TaskAnalysisResult {
  taskId: string;
  complexityScore: number;
  complexityLevel: string;
  suggestedActions: string[];
  estimatedTime: string;
  dependencies: string[];
  resources: string[];
  timestamp: Date;
}

interface TaskSuggestion {
  id: string;
  taskId: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

class AITaskService {
  private taskCache: Map<string, TaskAnalysisResult>;
  private suggestionCache: Map<string, TaskSuggestion[]>;

  constructor() {
    this.taskCache = new Map();
    this.suggestionCache = new Map();
  }

  async analyzeTask(task: Task): Promise<TaskAnalysisResult> {
    // Check cache first
    const cachedResult = this.taskCache.get(task.id);
    if (cachedResult) {
      return cachedResult;
    }

    // Analyze task complexity
    const complexityAnalysis = await aiService.analyzeTaskComplexity(task);

    // Generate task suggestions
    const suggestions = await aiService.generateTaskSuggestions(
      task.id,
      task.title,
      task.description,
    );

    // Generate task breakdown for estimated time and dependencies
    const breakdown = await aiService.generateTaskBreakdown(task);

    const result: TaskAnalysisResult = {
      taskId: task.id,
      complexityScore: complexityAnalysis.complexityScore,
      complexityLevel: complexityAnalysis.complexityLevel,
      suggestedActions: suggestions,
      estimatedTime: breakdown.estimatedTime,
      dependencies: breakdown.dependencies,
      resources: breakdown.resources,
      timestamp: new Date(),
    };

    // Cache the result
    this.taskCache.set(task.id, result);

    return result;
  }

  async getTaskSuggestions(
    taskId: string,
    limit: number = 5,
  ): Promise<TaskSuggestion[]> {
    // Check cache first
    const cachedSuggestions = this.suggestionCache.get(taskId);
    if (cachedSuggestions) {
      return cachedSuggestions.slice(0, limit);
    }

    // Generate new suggestions
    const suggestions = await aiService.generateTaskSuggestions(
      taskId,
      "", // Would get actual task title in real implementation
      "",
    );

    const taskSuggestions: TaskSuggestion[] = suggestions.map(
      (suggestion, index) => ({
        id: `${taskId}-suggestion-${index}`,
        taskId,
        suggestion,
        priority: this.determineSuggestionPriority(index, suggestions.length),
        createdAt: new Date(),
      }),
    );

    // Cache the suggestions
    this.suggestionCache.set(taskId, taskSuggestions);

    return taskSuggestions.slice(0, limit);
  }

  async getActionableItems(
    taskId: string,
    taskTitle: string,
    taskDescription?: string,
  ): Promise<TaskSuggestion[]> {
    const prompt = `Generate actionable items for task: ${taskTitle}\nDescription: ${taskDescription || "No description"}`;

    try {
      const response = await aiService.generateAIResponse(prompt);

      // Parse actionable items from response
      const items = this.parseActionableItems(response.response, taskId);

      return items;
    } catch (error) {
      console.error("Error generating actionable items:", error);
      return [];
    }
  }

  async getTaskBreakdown(
    taskId: string,
    taskTitle: string,
    taskDescription?: string,
  ): Promise<{
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
    resources: string[];
  }> {
    try {
      const breakdown = await aiService.generateTaskBreakdown({
        id: taskId,
        title: taskTitle,
        description: taskDescription || "",
        // Other required task fields would be populated here
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return breakdown;
    } catch (error) {
      console.error("Error generating task breakdown:", error);
      return {
        steps: [
          "Research task requirements",
          "Plan implementation",
          "Execute task",
          "Test and review",
        ],
        estimatedTime: "2-4 hours",
        dependencies: [],
        resources: ["Documentation", "Development tools"],
      };
    }
  }

  private determineSuggestionPriority(
    index: number,
    total: number,
  ): "low" | "medium" | "high" {
    if (index === 0) return "high";
    if (index < Math.ceil(total / 2)) return "medium";
    return "low";
  }

  private parseActionableItems(
    response: string,
    taskId: string,
  ): TaskSuggestion[] {
    // Parse actionable items from AI response
    const lines = response.split("\n");
    const items: TaskSuggestion[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
        const itemText = line.replace(/^[-\\•]\s*/, "").trim();
        if (itemText) {
          items.push({
            id: `${taskId}-action-${index}`,
            taskId,
            suggestion: itemText,
            priority: this.determineSuggestionPriority(index, lines.length),
            createdAt: new Date(),
          });
        }
      }
    });

    return items.slice(0, 5); // Return top 5 actionable items
  }

  clearCache(): void {
    this.taskCache.clear();
    this.suggestionCache.clear();
  }

  clearTaskCache(taskId: string): void {
    this.taskCache.delete(taskId);
    this.suggestionCache.delete(taskId);
  }
}

// Singleton instance
const aiTaskServiceInstance = new AITaskService();

export { AITaskService, aiTaskServiceInstance as aiTaskService };
