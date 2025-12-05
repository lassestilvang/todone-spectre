import { Task } from "../types/taskTypes";

interface AITaskAnalysis {
  complexityScore: number;
  complexityLevel: string;
  suggestedTags: string[];
  priorityRecommendation: string;
}

interface AISuggestion {
  id: string;
  text: string;
  confidence: number;
  category: string;
}

export class AIUtils {
  static analyzeTaskForAIAssistance(task: Task): AITaskAnalysis {
    // Simple heuristic analysis for AI assistance
    const complexityScore = this.calculateComplexityScore(task);
    const complexityLevel = this.getComplexityLevel(complexityScore);
    const suggestedTags = this.generateSuggestedTags(task);
    const priorityRecommendation = this.recommendPriority(task);

    return {
      complexityScore,
      complexityLevel,
      suggestedTags,
      priorityRecommendation,
    };
  }

  static calculateComplexityScore(task: Task): number {
    let score = 0;

    // Base score based on title length
    score += Math.min(task.title.length / 10, 20);

    // Add score based on description length
    if (task.description) {
      score += Math.min(task.description.length / 20, 30);
    }

    // Add score for priority
    switch (task.priority) {
      case "high":
        score += 20;
        break;
      case "medium":
        score += 10;
        break;
      case "low":
        score += 5;
        break;
    }

    // Cap at 100
    return Math.min(score, 100);
  }

  static getComplexityLevel(score: number): string {
    if (score < 30) return "low";
    if (score < 70) return "medium";
    return "high";
  }

  static generateSuggestedTags(task: Task): string[] {
    const tags: string[] = [];
    const titleWords = task.title.toLowerCase().split(/\s+/);
    const descWords = task.description?.toLowerCase().split(/\s+/) || [];

    // Combine all words
    const allWords = [...titleWords, ...descWords];

    // Simple tag generation based on common keywords
    if (
      allWords.some((word) =>
        ["urgent", "important", "critical"].includes(word),
      )
    ) {
      tags.push("urgent");
    }

    if (
      allWords.some((word) =>
        ["development", "code", "programming", "coding"].includes(word),
      )
    ) {
      tags.push("development");
    }

    if (
      allWords.some((word) =>
        ["design", "ui", "ux", "interface"].includes(word),
      )
    ) {
      tags.push("design");
    }

    if (
      allWords.some((word) =>
        ["meeting", "call", "discussion", "sync"].includes(word),
      )
    ) {
      tags.push("meeting");
    }

    if (
      allWords.some((word) =>
        ["research", "investigate", "explore", "study"].includes(word),
      )
    ) {
      tags.push("research");
    }

    // Add default tag if no specific tags found
    if (tags.length === 0) {
      tags.push("general");
    }

    return tags;
  }

  static recommendPriority(task: Task): string {
    // Simple priority recommendation based on task content
    const content = (task.title + " " + (task.description || "")).toLowerCase();

    if (
      content.includes("urgent") ||
      content.includes("critical") ||
      content.includes("immediately") ||
      content.includes("asap")
    ) {
      return "high";
    }

    if (
      content.includes("important") ||
      content.includes("priority") ||
      content.includes("soon") ||
      content.includes("deadline")
    ) {
      return "medium";
    }

    return "low";
  }

  static generateTaskSuggestions(
    task: Task,
    count: number = 3,
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Generate suggestions based on task content
    const content = task.title.toLowerCase();

    if (content.includes("development") || content.includes("code")) {
      suggestions.push({
        id: "sug-1",
        text: "Set up development environment",
        confidence: 0.85,
        category: "setup",
      });

      suggestions.push({
        id: "sug-2",
        text: "Write unit tests for the implementation",
        confidence: 0.75,
        category: "testing",
      });
    }

    if (content.includes("design") || content.includes("ui")) {
      suggestions.push({
        id: "sug-3",
        text: "Create wireframes and mockups",
        confidence: 0.8,
        category: "design",
      });

      suggestions.push({
        id: "sug-4",
        text: "Get stakeholder feedback on design",
        confidence: 0.7,
        category: "feedback",
      });
    }

    if (content.includes("meeting") || content.includes("call")) {
      suggestions.push({
        id: "sug-5",
        text: "Prepare meeting agenda and materials",
        confidence: 0.9,
        category: "preparation",
      });

      suggestions.push({
        id: "sug-6",
        text: "Send meeting invitation to participants",
        confidence: 0.8,
        category: "communication",
      });
    }

    // Add generic suggestions if none were added
    if (suggestions.length === 0) {
      suggestions.push({
        id: "sug-generic-1",
        text: "Break task into smaller subtasks",
        confidence: 0.7,
        category: "planning",
      });

      suggestions.push({
        id: "sug-generic-2",
        text: "Set clear deadlines for completion",
        confidence: 0.65,
        category: "time-management",
      });
    }

    return suggestions.slice(0, count);
  }

  static formatAIResponseForDisplay(response: string): string {
    // Format AI response for better display
    return response
      .trim()
      .replace(/\n\n+/g, "\n\n") // Normalize multiple newlines
      .replace(/\\*\\*(.*?)\\*\\*/g, "**$1**") // Bold formatting
      .replace(/\\*(.*?)\\*/g, "*$1*") // Italic formatting
      .replace(/^- /g, "• "); // Convert markdown lists to bullets
  }

  static validateAISuggestion(suggestion: string): boolean {
    // Validate AI suggestion content
    if (!suggestion || suggestion.trim() === "") {
      return false;
    }

    // Check for inappropriate content (simple check)
    const inappropriateWords = ["hate", "violent", "illegal", "harm"];
    const lowerSuggestion = suggestion.toLowerCase();

    return !inappropriateWords.some((word) => lowerSuggestion.includes(word));
  }
}
