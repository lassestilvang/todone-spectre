// @ts-nocheck
import { Task } from "../types/taskTypes";
import { Project } from "../types/projectTypes";
import { useTaskStore } from "../store/useTaskStore";
import { useProjectStore } from "../store/useProjectStore";
import { useAIStore } from "../store/useAIStore";

interface UserPatternData {
  taskCompletionPatterns: {
    byDayOfWeek: Record<string, { completionRate: number; avgTasks: number }>;
    byTimeOfDay: Record<string, { completionRate: number; avgTasks: number }>;
    byTaskType: Record<string, { completionRate: number; avgDuration: number }>;
  };
  productivityPatterns: {
    peakHours: string[];
    lowEnergyHours: string[];
    preferredTaskTypes: string[];
    avoidedTaskTypes: string[];
  };
  prioritizationPatterns: {
    priorityAdjustments: Record<string, number>;
    reprioritizationFrequency: number;
    urgencyResponseTime: number;
  };
  schedulingPatterns: {
    avgTaskDuration: number;
    schedulingAccuracy: number;
    bufferTimePreference: number;
  };
  collaborationPatterns: {
    delegationFrequency: number;
    teamworkPreference: number;
    communicationStyle: "brief" | "detailed" | "visual";
  };
  learningHistory: Array<{
    timestamp: Date;
    action:
      | "task_completed"
      | "task_created"
      | "priority_changed"
      | "suggestion_accepted"
      | "suggestion_rejected";
    taskId: string;
    context: any;
    confidenceImpact: number;
  }>;
}

interface PatternAnalysisResult {
  patternType: string;
  patternDescription: string;
  confidence: number;
  recommendations: string[];
  data: any;
}

interface LearningInsight {
  insightId: string;
  insightType:
    | "productivity"
    | "prioritization"
    | "scheduling"
    | "collaboration";
  description: string;
  confidence: number;
  actionableRecommendation: string;
  supportingData: any;
  timestamp: Date;
}

export class AIUserPatternService {
  private userPatterns: UserPatternData;
  private taskStore: any;
  private projectStore: any;
  private aiStore: any;

  constructor() {
    // Initialize with default patterns
    this.userPatterns = this.initializeDefaultPatterns();
  }

  public initializeWithStores(taskStore: any, projectStore: any, aiStore: any) {
    this.taskStore = taskStore;
    this.projectStore = projectStore;
    this.aiStore = aiStore;
  }

  public getCurrentUserPatterns(): UserPatternData {
    return { ...this.userPatterns };
  }

  public async recordUserAction(
    action:
      | "task_completed"
      | "task_created"
      | "priority_changed"
      | "suggestion_accepted"
      | "suggestion_rejected",
    taskId: string,
    context: any = {},
    confidenceImpact: number = 0,
  ): Promise<void> {
    if (!taskId) {
      throw new Error("Task ID is required for recording user actions");
    }

    const learningEntry = {
      timestamp: new Date(),
      action,
      taskId,
      context,
      confidenceImpact,
    };

    // Add to learning history
    this.userPatterns.learningHistory.push(learningEntry);

    // Update patterns based on action type
    await this.updatePatternsFromAction(learningEntry);

    // Record AI usage
    if (this.aiStore) {
      this.aiStore.recordAIUsage(true);
    }
  }

  public async analyzeUserPatterns(): Promise<PatternAnalysisResult[]> {
    if (!this.taskStore || !this.projectStore) {
      throw new Error("Stores not initialized");
    }

    const results: PatternAnalysisResult[] = [];

    // Analyze task completion patterns
    const completionAnalysis = await this.analyzeTaskCompletionPatterns();
    results.push(completionAnalysis);

    // Analyze productivity patterns
    const productivityAnalysis = await this.analyzeProductivityPatterns();
    results.push(productivityAnalysis);

    // Analyze prioritization patterns
    const prioritizationAnalysis = await this.analyzePrioritizationPatterns();
    results.push(prioritizationAnalysis);

    // Analyze scheduling patterns
    const schedulingAnalysis = await this.analyzeSchedulingPatterns();
    results.push(schedulingAnalysis);

    // Analyze collaboration patterns
    const collaborationAnalysis = await this.analyzeCollaborationPatterns();
    results.push(collaborationAnalysis);

    return results;
  }

  public async generateLearningInsights(): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];
    const now = new Date();

    // Generate productivity insights
    const productivityInsight = this.generateProductivityInsight();
    if (productivityInsight) insights.push(productivityInsight);

    // Generate prioritization insights
    const prioritizationInsight = this.generatePrioritizationInsight();
    if (prioritizationInsight) insights.push(prioritizationInsight);

    // Generate scheduling insights
    const schedulingInsight = this.generateSchedulingInsight();
    if (schedulingInsight) insights.push(schedulingInsight);

    // Generate collaboration insights
    const collaborationInsight = this.generateCollaborationInsight();
    if (collaborationInsight) insights.push(collaborationInsight);

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  public async getPersonalizedRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const insights = await this.generateLearningInsights();

    insights.forEach((insight) => {
      recommendations.push(insight.actionableRecommendation);
    });

    // Add general recommendations based on patterns
    if (this.userPatterns.productivityPatterns.peakHours.length > 0) {
      recommendations.push(
        `Schedule high-priority tasks during your peak hours: ${this.userPatterns.productivityPatterns.peakHours.join(", ")}`,
      );
    }

    if (
      this.userPatterns.prioritizationPatterns.reprioritizationFrequency > 0.3
    ) {
      recommendations.push(
        "You frequently adjust priorities. Consider using the AI prioritization assistant for more stable planning.",
      );
    }

    if (this.userPatterns.schedulingPatterns.avgTaskDuration > 2) {
      recommendations.push(
        "You tend to work on longer tasks. Consider breaking them down into smaller, more manageable pieces.",
      );
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private initializeDefaultPatterns(): UserPatternData {
    return {
      taskCompletionPatterns: {
        byDayOfWeek: {
          Monday: { completionRate: 0.7, avgTasks: 3 },
          Tuesday: { completionRate: 0.8, avgTasks: 4 },
          Wednesday: { completionRate: 0.75, avgTasks: 3 },
          Thursday: { completionRate: 0.85, avgTasks: 4 },
          Friday: { completionRate: 0.7, avgTasks: 2 },
          Saturday: { completionRate: 0.3, avgTasks: 1 },
          Sunday: { completionRate: 0.2, avgTasks: 0.5 },
        },
        byTimeOfDay: {
          "08-10": { completionRate: 0.6, avgTasks: 1 },
          "10-12": { completionRate: 0.9, avgTasks: 3 },
          "12-14": { completionRate: 0.4, avgTasks: 1 },
          "14-16": { completionRate: 0.8, avgTasks: 2 },
          "16-18": { completionRate: 0.7, avgTasks: 2 },
        },
        byTaskType: {
          development: { completionRate: 0.85, avgDuration: 2.5 },
          meeting: { completionRate: 0.95, avgDuration: 1.0 },
          documentation: { completionRate: 0.7, avgDuration: 1.5 },
          research: { completionRate: 0.6, avgDuration: 3.0 },
        },
      },
      productivityPatterns: {
        peakHours: ["10-12", "15-17"],
        lowEnergyHours: ["12-14"],
        preferredTaskTypes: ["development", "meeting"],
        avoidedTaskTypes: ["documentation"],
      },
      prioritizationPatterns: {
        priorityAdjustments: {
          high_to_medium: 0.2,
          medium_to_high: 0.3,
          low_to_medium: 0.1,
        },
        reprioritizationFrequency: 0.25,
        urgencyResponseTime: 1.5, // hours
      },
      schedulingPatterns: {
        avgTaskDuration: 1.8,
        schedulingAccuracy: 0.75,
        bufferTimePreference: 1.2,
      },
      collaborationPatterns: {
        delegationFrequency: 0.15,
        teamworkPreference: 0.6,
        communicationStyle: "detailed",
      },
      learningHistory: [],
    };
  }

  private async updatePatternsFromAction(learningEntry: {
    timestamp: Date;
    action: string;
    taskId: string;
    context: any;
    confidenceImpact: number;
  }) {
    const { action, taskId, timestamp } = learningEntry;

    // Get the task from store
    const task = this.taskStore?.tasks?.find((t: Task) => t.id === taskId);
    if (!task) return;

    // Update based on action type
    switch (action) {
      case "task_completed":
        await this.updateCompletionPatterns(task, timestamp);
        break;

      case "task_created":
        await this.updateCreationPatterns(task, timestamp);
        break;

      case "priority_changed":
        await this.updatePrioritizationPatterns(task, timestamp);
        break;

      case "suggestion_accepted":
        await this.updateSuggestionPatterns(task, true, timestamp);
        break;

      case "suggestion_rejected":
        await this.updateSuggestionPatterns(task, false, timestamp);
        break;
    }
  }

  private async updateCompletionPatterns(task: Task, timestamp: Date) {
    if (!task.completedAt) return;

    const dayOfWeek = timestamp.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const hours = timestamp.getHours();
    const timeSlot = this.getTimeSlot(hours);

    // Update day of week patterns
    if (this.userPatterns.taskCompletionPatterns.byDayOfWeek[dayOfWeek]) {
      const current =
        this.userPatterns.taskCompletionPatterns.byDayOfWeek[dayOfWeek];
      current.completionRate =
        (current.completionRate * current.avgTasks + 1) /
        (current.avgTasks + 1);
      current.avgTasks = (current.avgTasks * 4 + 1) / 5; // Moving average
    }

    // Update time of day patterns
    if (this.userPatterns.taskCompletionPatterns.byTimeOfDay[timeSlot]) {
      const current =
        this.userPatterns.taskCompletionPatterns.byTimeOfDay[timeSlot];
      current.completionRate =
        (current.completionRate * current.avgTasks + 1) /
        (current.avgTasks + 1);
      current.avgTasks = (current.avgTasks * 3 + 1) / 4; // Moving average
    }

    // Update task type patterns
    const taskType = this.inferTaskType(task);
    if (this.userPatterns.taskCompletionPatterns.byTaskType[taskType]) {
      const current =
        this.userPatterns.taskCompletionPatterns.byTaskType[taskType];
      const duration = this.calculateTaskDuration(task);

      current.completionRate = (current.completionRate * 5 + 1) / 6;
      current.avgDuration = (current.avgDuration * 4 + duration) / 5;
    }

    // Update productivity patterns
    if (this.userPatterns.productivityPatterns.peakHours.includes(timeSlot)) {
      // Already considered peak, no change needed
    } else if (
      this.userPatterns.productivityPatterns.lowEnergyHours.includes(timeSlot)
    ) {
      // If completing tasks during low energy hours, might need to reconsider
      const index =
        this.userPatterns.productivityPatterns.lowEnergyHours.indexOf(timeSlot);
      if (index > -1) {
        this.userPatterns.productivityPatterns.lowEnergyHours.splice(index, 1);
      }
    } else {
      // Consider adding to peak hours if multiple completions
      this.userPatterns.productivityPatterns.peakHours.push(timeSlot);
    }
  }

  private async updateCreationPatterns(task: Task, timestamp: Date) {
    const hours = timestamp.getHours();
    const timeSlot = this.getTimeSlot(hours);

    // Update task type preferences
    const taskType = this.inferTaskType(task);
    if (
      !this.userPatterns.productivityPatterns.preferredTaskTypes.includes(
        taskType,
      ) &&
      !this.userPatterns.productivityPatterns.avoidedTaskTypes.includes(
        taskType,
      )
    ) {
      // New task type - add to preferred if created during peak hours
      if (this.userPatterns.productivityPatterns.peakHours.includes(timeSlot)) {
        this.userPatterns.productivityPatterns.preferredTaskTypes.push(
          taskType,
        );
      }
    }

    // Update scheduling patterns
    if (task.estimatedDuration) {
      this.userPatterns.schedulingPatterns.avgTaskDuration =
        (this.userPatterns.schedulingPatterns.avgTaskDuration * 4 +
          task.estimatedDuration) /
        5;
    }
  }

  private async updatePrioritizationPatterns(task: Task, timestamp: Date) {
    // Track priority changes
    this.userPatterns.prioritizationPatterns.reprioritizationFrequency =
      (this.userPatterns.prioritizationPatterns.reprioritizationFrequency * 9 +
        1) /
      10;

    // Update urgency response time
    if (task.priority === "high") {
      const hoursSinceCreation = this.calculateHoursSinceCreation(task);
      this.userPatterns.prioritizationPatterns.urgencyResponseTime =
        (this.userPatterns.prioritizationPatterns.urgencyResponseTime * 3 +
          hoursSinceCreation) /
        4;
    }
  }

  private async updateSuggestionPatterns(
    task: Task,
    accepted: boolean,
    timestamp: Date,
  ) {
    // Update confidence based on suggestion acceptance
    const taskType = this.inferTaskType(task);
    const currentConfidence =
      this.userPatterns.taskCompletionPatterns.byTaskType[taskType]
        ?.completionRate || 0.7;

    if (accepted) {
      // Increase confidence for this task type
      this.userPatterns.taskCompletionPatterns.byTaskType[
        taskType
      ].completionRate = Math.min(1.0, currentConfidence + 0.05);
    } else {
      // Decrease confidence for this task type
      this.userPatterns.taskCompletionPatterns.byTaskType[
        taskType
      ].completionRate = Math.max(0.3, currentConfidence - 0.03);
    }
  }

  private async analyzeTaskCompletionPatterns(): Promise<PatternAnalysisResult> {
    const highestCompletionDay = Object.entries(
      this.userPatterns.taskCompletionPatterns.byDayOfWeek,
    ).sort((a, b) => b[1].completionRate - a[1].completionRate)[0];

    const highestCompletionTime = Object.entries(
      this.userPatterns.taskCompletionPatterns.byTimeOfDay,
    ).sort((a, b) => b[1].completionRate - a[1].completionRate)[0];

    const bestTaskType = Object.entries(
      this.userPatterns.taskCompletionPatterns.byTaskType,
    ).sort((a, b) => b[1].completionRate - a[1].completionRate)[0];

    return {
      patternType: "task_completion",
      patternDescription: "Task completion patterns by time and type",
      confidence: 85,
      recommendations: [
        `Schedule important tasks on ${highestCompletionDay[0]} for highest completion rates`,
        `Plan focused work during ${highestCompletionTime[0]} time slot`,
        `Prioritize ${bestTaskType[0]} tasks as you complete them most successfully`,
      ],
      data: {
        bestDay: highestCompletionDay,
        bestTime: highestCompletionTime,
        bestTaskType: bestTaskType,
      },
    };
  }

  private async analyzeProductivityPatterns(): Promise<PatternAnalysisResult> {
    const peakHoursCount =
      this.userPatterns.productivityPatterns.peakHours.length;
    const lowEnergyCount =
      this.userPatterns.productivityPatterns.lowEnergyHours.length;

    return {
      patternType: "productivity",
      patternDescription: "Productivity patterns and energy levels",
      confidence: 75,
      recommendations: [
        `Your peak productivity hours are: ${this.userPatterns.productivityPatterns.peakHours.join(", ")}`,
        `Consider scheduling breaks or lighter tasks during: ${this.userPatterns.productivityPatterns.lowEnergyHours.join(", ")}`,
        `You work best with these task types: ${this.userPatterns.productivityPatterns.preferredTaskTypes.join(", ")}`,
      ],
      data: {
        peakHours: this.userPatterns.productivityPatterns.peakHours,
        lowEnergyHours: this.userPatterns.productivityPatterns.lowEnergyHours,
        preferredTaskTypes:
          this.userPatterns.productivityPatterns.preferredTaskTypes,
      },
    };
  }

  private async analyzePrioritizationPatterns(): Promise<PatternAnalysisResult> {
    const reprioritizationRate =
      this.userPatterns.prioritizationPatterns.reprioritizationFrequency;
    const urgencyResponse =
      this.userPatterns.prioritizationPatterns.urgencyResponseTime;

    let reprioritizationLevel = "low";
    if (reprioritizationRate > 0.4) reprioritizationLevel = "high";
    else if (reprioritizationRate > 0.2) reprioritizationLevel = "medium";

    let responseSpeed = "quick";
    if (urgencyResponse > 4) responseSpeed = "slow";
    else if (urgencyResponse > 2) responseSpeed = "moderate";

    return {
      patternType: "prioritization",
      patternDescription: "Task prioritization and urgency response patterns",
      confidence: 70,
      recommendations: [
        `You have a ${reprioritizationLevel} rate of reprioritizing tasks`,
        `You respond to urgent tasks with ${responseSpeed} speed (${urgencyResponse.toFixed(1)} hours avg)`,
        reprioritizationRate > 0.3
          ? "Consider using AI prioritization to reduce frequent priority changes"
          : "Your prioritization approach is stable",
      ],
      data: {
        reprioritizationRate,
        urgencyResponse,
        reprioritizationLevel,
        responseSpeed,
      },
    };
  }

  private async analyzeSchedulingPatterns(): Promise<PatternAnalysisResult> {
    const avgDuration = this.userPatterns.schedulingPatterns.avgTaskDuration;
    const accuracy = this.userPatterns.schedulingPatterns.schedulingAccuracy;
    const bufferPreference =
      this.userPatterns.schedulingPatterns.bufferTimePreference;

    let durationCategory = "short";
    if (avgDuration > 3) durationCategory = "long";
    else if (avgDuration > 1.5) durationCategory = "medium";

    let accuracyLevel = "accurate";
    if (accuracy < 0.5) accuracyLevel = "inaccurate";
    else if (accuracy < 0.7) accuracyLevel = "moderately accurate";

    return {
      patternType: "scheduling",
      patternDescription: "Task scheduling and time estimation patterns",
      confidence: 65,
      recommendations: [
        `You typically work on ${durationCategory} tasks (avg: ${avgDuration.toFixed(1)} hours)`,
        `Your time estimates are ${accuracyLevel} (accuracy: ${(accuracy * 100).toFixed(0)}%)`,
        bufferPreference > 1.5
          ? "You prefer generous time buffers"
          : "You work well with tight schedules",
        avgDuration > 2
          ? "Consider breaking larger tasks into smaller subtasks"
          : "Your task sizing is optimal",
      ],
      data: {
        avgDuration,
        accuracy,
        bufferPreference,
        durationCategory,
        accuracyLevel,
      },
    };
  }

  private async analyzeCollaborationPatterns(): Promise<PatternAnalysisResult> {
    const delegationRate =
      this.userPatterns.collaborationPatterns.delegationFrequency;
    const teamworkPref =
      this.userPatterns.collaborationPatterns.teamworkPreference;
    const commStyle =
      this.userPatterns.collaborationPatterns.communicationStyle;

    let delegationLevel = "low";
    if (delegationRate > 0.3) delegationLevel = "high";
    else if (delegationRate > 0.15) delegationLevel = "moderate";

    let teamworkLevel = "individual";
    if (teamworkPref > 0.7) teamworkLevel = "collaborative";
    else if (teamworkPref > 0.4) teamworkLevel = "balanced";

    return {
      patternType: "collaboration",
      patternDescription: "Teamwork and collaboration patterns",
      confidence: 60,
      recommendations: [
        `You have a ${delegationLevel} delegation rate (${(delegationRate * 100).toFixed(0)}%)`,
        `Your work style is ${teamworkLevel} (teamwork preference: ${(teamworkPref * 100).toFixed(0)}%)`,
        `You prefer ${commStyle} communication in task descriptions`,
        delegationRate < 0.2
          ? "Consider delegating more tasks to team members"
          : "Your delegation approach is balanced",
      ],
      data: {
        delegationRate,
        teamworkPref,
        commStyle,
        delegationLevel,
        teamworkLevel,
      },
    };
  }

  private generateProductivityInsight(): LearningInsight | null {
    const peakHours = this.userPatterns.productivityPatterns.peakHours;
    const lowEnergyHours =
      this.userPatterns.productivityPatterns.lowEnergyHours;

    if (peakHours.length === 0) return null;

    return {
      insightId: `insight-${Date.now()}-1`,
      insightType: "productivity",
      description: `Your productivity peaks during ${peakHours.join(", ")} and is lower during ${lowEnergyHours.join(", ")}`,
      confidence: 80,
      actionableRecommendation: `Schedule high-focus tasks during ${peakHours[0]} and meetings/admin during ${lowEnergyHours[0] || "afternoon"}`,
      supportingData: {
        peakHours,
        lowEnergyHours,
        completionRates: this.userPatterns.taskCompletionPatterns.byTimeOfDay,
      },
      timestamp: new Date(),
    };
  }

  private generatePrioritizationInsight(): LearningInsight | null {
    const reprioritizationFreq =
      this.userPatterns.prioritizationPatterns.reprioritizationFrequency;

    if (reprioritizationFreq < 0.1) return null;

    let recommendation = "";
    if (reprioritizationFreq > 0.4) {
      recommendation =
        "You frequently change task priorities. Consider using the AI prioritization assistant for more stable planning.";
    } else if (reprioritizationFreq > 0.2) {
      recommendation =
        "You occasionally adjust priorities. Review your planning approach for better stability.";
    } else {
      recommendation =
        "Your prioritization approach is relatively stable. Keep up the good planning!";
    }

    return {
      insightId: `insight-${Date.now()}-2`,
      insightType: "prioritization",
      description: `You adjust task priorities at a rate of ${(reprioritizationFreq * 100).toFixed(0)}%`,
      confidence: 75,
      actionableRecommendation: recommendation,
      supportingData: {
        reprioritizationFrequency: reprioritizationFreq,
        priorityAdjustments:
          this.userPatterns.prioritizationPatterns.priorityAdjustments,
      },
      timestamp: new Date(),
    };
  }

  private generateSchedulingInsight(): LearningInsight | null {
    const avgDuration = this.userPatterns.schedulingPatterns.avgTaskDuration;

    if (avgDuration < 0.5) return null;

    let recommendation = "";
    if (avgDuration > 3) {
      recommendation =
        "You work on longer tasks. Consider breaking them into smaller, more manageable subtasks for better progress tracking.";
    } else if (avgDuration > 2) {
      recommendation =
        "Your tasks are moderately sized. Review if some could be broken down for better focus.";
    } else {
      recommendation =
        "Your task sizing is optimal for productivity. Maintain this approach.";
    }

    return {
      insightId: `insight-${Date.now()}-3`,
      insightType: "scheduling",
      description: `Your average task duration is ${avgDuration.toFixed(1)} hours`,
      confidence: 70,
      actionableRecommendation: recommendation,
      supportingData: {
        avgTaskDuration: avgDuration,
        schedulingAccuracy:
          this.userPatterns.schedulingPatterns.schedulingAccuracy,
      },
      timestamp: new Date(),
    };
  }

  private generateCollaborationInsight(): LearningInsight | null {
    const delegationFreq =
      this.userPatterns.collaborationPatterns.delegationFrequency;

    if (delegationFreq < 0.05) return null;

    let recommendation = "";
    if (delegationFreq > 0.3) {
      recommendation =
        "You delegate tasks frequently. Ensure you maintain a good balance between delegation and personal contribution.";
    } else if (delegationFreq > 0.15) {
      recommendation =
        "You have a healthy delegation approach. Consider mentoring team members on some of your specialized tasks.";
    } else {
      recommendation =
        "You could delegate more tasks to develop your team and free up your time for higher-value work.";
    }

    return {
      insightId: `insight-${Date.now()}-4`,
      insightType: "collaboration",
      description: `You delegate ${(delegationFreq * 100).toFixed(0)}% of tasks to team members`,
      confidence: 65,
      actionableRecommendation: recommendation,
      supportingData: {
        delegationFrequency: delegationFreq,
        teamworkPreference:
          this.userPatterns.collaborationPatterns.teamworkPreference,
      },
      timestamp: new Date(),
    };
  }

  private getTimeSlot(hours: number): string {
    if (hours >= 8 && hours < 10) return "08-10";
    if (hours >= 10 && hours < 12) return "10-12";
    if (hours >= 12 && hours < 14) return "12-14";
    if (hours >= 14 && hours < 16) return "14-16";
    if (hours >= 16 && hours < 18) return "16-18";
    return "other";
  }

  private calculateTaskDuration(task: Task): number {
    if (!task.createdAt || !task.completedAt) return 1.0;

    const created = new Date(task.createdAt);
    const completed = new Date(task.completedAt);
    const durationHours =
      (completed.getTime() - created.getTime()) / (1000 * 3600);

    return Math.max(0.5, Math.min(8, durationHours)); // Cap between 0.5 and 8 hours
  }

  private calculateHoursSinceCreation(task: Task): number {
    if (!task.createdAt) return 0;

    const created = new Date(task.createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) / (1000 * 3600);
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

  public async learnFromTaskCompletion(
    taskId: string,
    completionData: {
      actualDuration?: number;
      qualityRating?: number;
      difficultyRating?: number;
    },
  ) {
    // Record task completion and update patterns
    await this.recordUserAction("task_completed", taskId, {
      completionData,
      timestamp: new Date(),
    });

    // Additional learning from completion data
    if (completionData.actualDuration) {
      this.updateDurationPatterns(taskId, completionData.actualDuration);
    }

    return { success: true, message: "Task completion patterns updated" };
  }

  private updateDurationPatterns(taskId: string, actualDuration: number) {
    // Find the task
    const task = this.taskStore?.tasks?.find((t: Task) => t.id === taskId);
    if (!task) return;

    const taskType = this.inferTaskType(task);

    // Update average duration for this task type
    if (this.userPatterns.taskCompletionPatterns.byTaskType[taskType]) {
      const current =
        this.userPatterns.taskCompletionPatterns.byTaskType[taskType];
      current.avgDuration = (current.avgDuration * 4 + actualDuration) / 5;
    }

    // Update overall scheduling accuracy
    const estimatedDuration = task.estimatedDuration || 1;
    const accuracy =
      1 -
      Math.abs(actualDuration - estimatedDuration) /
        Math.max(estimatedDuration, actualDuration);
    this.userPatterns.schedulingPatterns.schedulingAccuracy =
      (this.userPatterns.schedulingPatterns.schedulingAccuracy * 9 + accuracy) /
      10;
  }
}

// Singleton instance
export const aiUserPatternService = new AIUserPatternService();
