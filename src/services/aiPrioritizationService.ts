import { Task } from "../types/taskTypes";
import { useTaskStore } from "../store/useTaskStore";
import { useAIStore } from "../store/useAIStore";

interface PrioritizationResult {
  taskId: string;
  priorityScore: number;
  recommendedPriority: "low" | "medium" | "high" | "urgent";
  priorityFactors: {
    dueDateFactor: number;
    complexityFactor: number;
    dependencyFactor: number;
    userPatternFactor: number;
    contextFactor: number;
  };
  confidence: number;
  reasoning: string;
}

interface UserPatternData {
  taskCompletionRate: number;
  averageTaskDuration: number;
  preferredWorkingHours: string[];
  productivityPeaks: string[];
  taskTypePreferences: Record<string, number>;
}

interface TaskContext {
  projectImportance?: "low" | "medium" | "high";
  teamDependencies?: number;
  businessImpact?: "low" | "medium" | "high";
  timeSensitivity?: "low" | "medium" | "high";
}

export class AIPrioritizationService {
  private userPatterns: UserPatternData;
  private taskStore: any; // Will be initialized with actual store
  private aiStore: any; // Will be initialized with actual store

  constructor() {
    // Initialize with default user patterns
    this.userPatterns = {
      taskCompletionRate: 0.85, // 85% completion rate
      averageTaskDuration: 1.5, // 1.5 hours average
      preferredWorkingHours: ["9-12", "13-17"], // 9AM-12PM, 1PM-5PM
      productivityPeaks: ["10-12", "15-17"], // 10AM-12PM, 3PM-5PM
      taskTypePreferences: {
        development: 0.9,
        meeting: 0.6,
        documentation: 0.7,
        research: 0.8,
      },
    };
  }

  public initializeWithStores(taskStore: any, aiStore: any) {
    this.taskStore = taskStore;
    this.aiStore = aiStore;
  }

  public updateUserPatterns(newPatterns: Partial<UserPatternData>) {
    this.userPatterns = { ...this.userPatterns, ...newPatterns };
  }

  public async prioritizeTask(
    task: Task,
    context: TaskContext = {},
    userPatternsOverride?: Partial<UserPatternData>,
  ): Promise<PrioritizationResult> {
    if (!task || !task.id) {
      throw new Error("Invalid task provided for prioritization");
    }

    // Merge user patterns
    const userPatterns = userPatternsOverride
      ? { ...this.userPatterns, ...userPatternsOverride }
      : this.userPatterns;

    // Calculate individual priority factors
    const dueDateFactor = this.calculateDueDateFactor(task);
    const complexityFactor = await this.calculateComplexityFactor(task);
    const dependencyFactor = this.calculateDependencyFactor(task);
    const userPatternFactor = this.calculateUserPatternFactor(
      task,
      userPatterns,
    );
    const contextFactor = this.calculateContextFactor(context);

    // Calculate overall priority score (weighted average)
    const priorityScore = this.calculateWeightedPriorityScore({
      dueDateFactor,
      complexityFactor,
      dependencyFactor,
      userPatternFactor,
      contextFactor,
    });

    // Determine recommended priority
    const recommendedPriority = this.determinePriorityLevel(priorityScore);

    // Generate reasoning for the prioritization
    const reasoning = this.generatePrioritizationReasoning({
      task,
      context,
      factors: {
        dueDateFactor,
        complexityFactor,
        dependencyFactor,
        userPatternFactor,
        contextFactor,
      },
      recommendedPriority,
    });

    return {
      taskId: task.id,
      priorityScore,
      recommendedPriority,
      priorityFactors: {
        dueDateFactor,
        complexityFactor,
        dependencyFactor,
        userPatternFactor,
        contextFactor,
      },
      confidence: this.calculateConfidence(priorityScore),
      reasoning,
    };
  }

  public async prioritizeMultipleTasks(
    tasks: Task[],
    contextMap: Record<string, TaskContext> = {},
    userPatternsOverride?: Partial<UserPatternData>,
  ): Promise<PrioritizationResult[]> {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    return Promise.all(
      tasks.map((task) =>
        this.prioritizeTask(
          task,
          contextMap[task.id] || {},
          userPatternsOverride,
        ),
      ),
    );
  }

  private calculateDueDateFactor(task: Task): number {
    if (!task.dueDate) {
      return 0.3; // Low factor if no due date
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysUntilDue = timeDiff / (1000 * 3600 * 24);

    // Higher factor for tasks due sooner
    if (daysUntilDue <= 0) {
      return 1.0; // Overdue - maximum priority
    } else if (daysUntilDue <= 1) {
      return 0.9; // Due today
    } else if (daysUntilDue <= 3) {
      return 0.7; // Due in 1-3 days
    } else if (daysUntilDue <= 7) {
      return 0.5; // Due in 3-7 days
    } else {
      return 0.3; // Due in more than a week
    }
  }

  private async calculateComplexityFactor(task: Task): Promise<number> {
    // Base complexity from task properties
    let complexity = 0.4; // Default medium complexity

    // Adjust based on task properties
    if (task.description && task.description.length > 200) {
      complexity += 0.2; // Long description indicates complexity
    }

    if (
      task.title &&
      (task.title.includes("complex") ||
        task.title.includes("advanced") ||
        task.title.includes("comprehensive"))
    ) {
      complexity += 0.1;
    }

    // Get complexity analysis from AI service if available
    try {
      if (this.aiStore) {
        const aiAnalysis = await this.aiStore.analyzeTaskComplexity(task);
        // Convert complexity score (0-100) to factor (0-1)
        complexity = aiAnalysis.complexityScore / 100;
      }
    } catch (error) {
      console.warn("Could not get AI complexity analysis, using fallback");
    }

    return Math.min(1.0, Math.max(0.1, complexity));
  }

  private calculateDependencyFactor(task: Task): number {
    // Check if task has dependencies or is blocked by other tasks
    let dependencyFactor = 0.3;

    // If task is blocked by other tasks
    if (task.dependencies && task.dependencies.length > 0) {
      dependencyFactor = 0.7 + 0.2 * Math.min(3, task.dependencies.length / 2);
    }

    // If other tasks depend on this task
    if (this.taskStore && this.taskStore.tasks) {
      const dependentTasks = this.taskStore.tasks.filter(
        (t: Task) => t.dependencies && t.dependencies.includes(task.id),
      );
      if (dependentTasks.length > 0) {
        dependencyFactor = Math.min(
          1.0,
          dependencyFactor + 0.2 + 0.1 * dependentTasks.length,
        );
      }
    }

    return Math.min(1.0, dependencyFactor);
  }

  private calculateUserPatternFactor(
    task: Task,
    userPatterns: UserPatternData,
  ): number {
    let patternFactor = 0.5; // Default

    // Adjust based on task type preferences
    const taskType = this.inferTaskType(task);
    if (userPatterns.taskTypePreferences[taskType]) {
      patternFactor = userPatterns.taskTypePreferences[taskType];
    }

    // Adjust based on completion rate
    patternFactor *= userPatterns.taskCompletionRate;

    // Adjust based on estimated duration vs user's average
    if (task.estimatedDuration) {
      const durationRatio =
        task.estimatedDuration / userPatterns.averageTaskDuration;
      if (durationRatio > 2) {
        patternFactor *= 0.8; // User might avoid long tasks
      } else if (durationRatio < 0.5) {
        patternFactor *= 1.1; // User might prefer quick tasks
      }
    }

    return Math.min(1.0, Math.max(0.1, patternFactor));
  }

  private calculateContextFactor(context: TaskContext): number {
    let contextFactor = 0.5; // Default

    // Adjust based on project importance
    if (context.projectImportance === "high") {
      contextFactor += 0.3;
    } else if (context.projectImportance === "medium") {
      contextFactor += 0.1;
    } else if (context.projectImportance === "low") {
      contextFactor -= 0.1;
    }

    // Adjust based on business impact
    if (context.businessImpact === "high") {
      contextFactor += 0.2;
    } else if (context.businessImpact === "medium") {
      contextFactor += 0.1;
    }

    // Adjust based on time sensitivity
    if (context.timeSensitivity === "high") {
      contextFactor += 0.2;
    } else if (context.timeSensitivity === "medium") {
      contextFactor += 0.1;
    }

    // Adjust based on team dependencies
    if (context.teamDependencies && context.teamDependencies > 2) {
      contextFactor += 0.1 * Math.min(3, context.teamDependencies);
    }

    return Math.min(1.0, Math.max(0.2, contextFactor));
  }

  private calculateWeightedPriorityScore(factors: {
    dueDateFactor: number;
    complexityFactor: number;
    dependencyFactor: number;
    userPatternFactor: number;
    contextFactor: number;
  }): number {
    // Weighted average with different importance for each factor
    const weights = {
      dueDate: 0.3,
      complexity: 0.2,
      dependency: 0.2,
      userPattern: 0.15,
      context: 0.15,
    };

    const weightedScore =
      factors.dueDateFactor * weights.dueDate +
      factors.complexityFactor * weights.complexity +
      factors.dependencyFactor * weights.dependency +
      factors.userPatternFactor * weights.userPattern +
      factors.contextFactor * weights.context;

    return Math.min(1.0, Math.max(0.0, weightedScore));
  }

  private determinePriorityLevel(
    score: number,
  ): "low" | "medium" | "high" | "urgent" {
    if (score >= 0.85) {
      return "urgent";
    } else if (score >= 0.65) {
      return "high";
    } else if (score >= 0.4) {
      return "medium";
    } else {
      return "low";
    }
  }

  private calculateConfidence(score: number): number {
    // Higher confidence for scores that are clearly in one category
    if (score >= 0.9) return 95;
    if (score >= 0.8) return 90;
    if (score >= 0.7) return 85;
    if (score >= 0.6) return 80;
    if (score >= 0.5) return 75;
    if (score >= 0.4) return 70;
    if (score >= 0.3) return 65;
    return 60;
  }

  private generatePrioritizationReasoning(params: {
    task: Task;
    context: TaskContext;
    factors: {
      dueDateFactor: number;
      complexityFactor: number;
      dependencyFactor: number;
      userPatternFactor: number;
      contextFactor: number;
    };
    recommendedPriority: string;
  }): string {
    const { task, context, factors, recommendedPriority } = params;
    const lines: string[] = [];

    lines.push(
      `Task "${task.title}" has been prioritized as "${recommendedPriority}" based on:`,
    );

    // Due date reasoning
    if (factors.dueDateFactor > 0.7) {
      lines.push(
        `- ⏰ Urgent deadline (due date factor: ${(factors.dueDateFactor * 100).toFixed(0)}%)`,
      );
    } else if (factors.dueDateFactor > 0.4) {
      lines.push(
        `- ⏳ Approaching deadline (due date factor: ${(factors.dueDateFactor * 100).toFixed(0)}%)`,
      );
    }

    // Complexity reasoning
    if (factors.complexityFactor > 0.7) {
      lines.push(
        `- 🧠 High complexity task (complexity factor: ${(factors.complexityFactor * 100).toFixed(0)}%)`,
      );
    } else if (factors.complexityFactor > 0.4) {
      lines.push(
        `- 📚 Moderate complexity (complexity factor: ${(factors.complexityFactor * 100).toFixed(0)}%)`,
      );
    }

    // Dependency reasoning
    if (factors.dependencyFactor > 0.7) {
      lines.push(
        `- 🔗 Critical dependencies (dependency factor: ${(factors.dependencyFactor * 100).toFixed(0)}%)`,
      );
    } else if (factors.dependencyFactor > 0.4) {
      lines.push(
        `- 🔄 Some dependencies (dependency factor: ${(factors.dependencyFactor * 100).toFixed(0)}%)`,
      );
    }

    // User pattern reasoning
    if (factors.userPatternFactor > 0.7) {
      lines.push(
        `- 👤 Aligns well with your work patterns (user pattern factor: ${(factors.userPatternFactor * 100).toFixed(0)}%)`,
      );
    } else if (factors.userPatternFactor < 0.4) {
      lines.push(
        `- 😕 Doesn't match your typical work patterns (user pattern factor: ${(factors.userPatternFactor * 100).toFixed(0)}%)`,
      );
    }

    // Context reasoning
    if (context.projectImportance === "high") {
      lines.push(`- 🚀 High importance project context`);
    }
    if (context.businessImpact === "high") {
      lines.push(`- 💼 High business impact`);
    }
    if (context.timeSensitivity === "high") {
      lines.push(`- ⏱️ Time-sensitive task`);
    }

    lines.push(
      `\nOverall priority score: ${(
        factors.dueDateFactor * 0.3 +
        factors.complexityFactor * 0.2 +
        factors.dependencyFactor * 0.2 +
        factors.userPatternFactor * 0.15 +
        factors.contextFactor * 0.15
      ).toFixed(2)}`,
    );

    return lines.join("\n");
  }

  private inferTaskType(task: Task): string {
    const title = task.title.toLowerCase();
    const description = task.description ? task.description.toLowerCase() : "";

    if (title.includes("meeting") || description.includes("meeting")) {
      return "meeting";
    } else if (
      title.includes("develop") ||
      title.includes("code") ||
      title.includes("implement") ||
      description.includes("development")
    ) {
      return "development";
    } else if (
      title.includes("document") ||
      title.includes("write") ||
      title.includes("report") ||
      description.includes("documentation")
    ) {
      return "documentation";
    } else if (
      title.includes("research") ||
      title.includes("investigate") ||
      title.includes("study") ||
      description.includes("research")
    ) {
      return "research";
    } else {
      return "general";
    }
  }

  public async learnFromUserPatterns(
    taskId: string,
    userAction: "accepted" | "rejected" | "modified",
  ) {
    // This would be implemented to learn from user behavior
    // For now, it's a placeholder for the learning capability
    console.log(`Learning from user action: ${userAction} for task ${taskId}`);

    // In a real implementation, this would:
    // 1. Track which suggestions users accept/reject
    // 2. Adjust future prioritization based on patterns
    // 3. Learn user preferences for task types, timing, etc.
    // 4. Store this data in userPatterns for future use

    return { success: true, message: "User pattern learning recorded" };
  }
}

// Singleton instance
export const aiPrioritizationService = new AIPrioritizationService();
