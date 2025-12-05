import { Task } from "../database/models";

interface ProductivityData {
  tasksCompleted: number;
  tasksCreated: number;
  averageCompletionTime: number;
  productivityScore: number;
  streak: number;
  lastActiveDate: Date;
}

interface ProductivityMetrics {
  dailyProductivity: number[];
  weeklyProductivity: number[];
  monthlyProductivity: number[];
  productivityTrends: {
    improvement: number;
    consistency: number;
  };
}

export class ProductivityService {
  private static instance: ProductivityService;
  private productivityData: ProductivityData;
  private productivityMetrics: ProductivityMetrics;

  private constructor() {
    // Initialize with default values
    this.productivityData = {
      tasksCompleted: 0,
      tasksCreated: 0,
      averageCompletionTime: 0,
      productivityScore: 0,
      streak: 0,
      lastActiveDate: new Date(),
    };

    this.productivityMetrics = {
      dailyProductivity: Array(7).fill(0),
      weeklyProductivity: Array(4).fill(0),
      monthlyProductivity: Array(12).fill(0),
      productivityTrends: {
        improvement: 0,
        consistency: 0,
      },
    };
  }

  public static getInstance(): ProductivityService {
    if (!ProductivityService.instance) {
      ProductivityService.instance = new ProductivityService();
    }
    return ProductivityService.instance;
  }

  public updateTaskCompletion(task: Task): void {
    this.productivityData.tasksCompleted++;
    this.productivityData.productivityScore = this.calculateProductivityScore();
    this.updateStreak();
    this.updateMetrics();
  }

  public updateTaskCreation(): void {
    this.productivityData.tasksCreated++;
  }

  public getProductivityData(): ProductivityData {
    return this.productivityData;
  }

  public getProductivityMetrics(): ProductivityMetrics {
    return this.productivityMetrics;
  }

  private calculateProductivityScore(): number {
    // Simple productivity score calculation
    const baseScore = this.productivityData.tasksCompleted * 10;
    const streakBonus = this.productivityData.streak * 5;
    return Math.min(100, baseScore + streakBonus);
  }

  private updateStreak(): void {
    const today = new Date();
    const lastActive = new Date(this.productivityData.lastActiveDate);

    // Check if it's a new day
    if (
      today.getDate() !== lastActive.getDate() ||
      today.getMonth() !== lastActive.getMonth() ||
      today.getFullYear() !== lastActive.getFullYear()
    ) {
      // Check if streak should continue (completed tasks yesterday)
      if (this.productivityData.tasksCompleted > 0) {
        this.productivityData.streak++;
      } else {
        this.productivityData.streak = 0;
      }

      this.productivityData.lastActiveDate = today;
    }
  }

  private updateMetrics(): void {
    // Update daily metrics (simplified)
    const todayIndex = new Date().getDay();
    this.productivityMetrics.dailyProductivity[todayIndex] =
      this.productivityData.productivityScore;

    // Update trends
    this.productivityMetrics.productivityTrends.improvement =
      this.calculateImprovement();
    this.productivityMetrics.productivityTrends.consistency =
      this.calculateConsistency();
  }

  private calculateImprovement(): number {
    // Simple improvement calculation
    const completedTasks = this.productivityData.tasksCompleted;
    if (completedTasks <= 1) return 0;
    return Math.min(100, (completedTasks - 1) * 5);
  }

  private calculateConsistency(): number {
    // Simple consistency calculation based on streak
    return Math.min(100, this.productivityData.streak * 10);
  }

  public resetProductivity(): void {
    this.productivityData = {
      tasksCompleted: 0,
      tasksCreated: 0,
      averageCompletionTime: 0,
      productivityScore: 0,
      streak: 0,
      lastActiveDate: new Date(),
    };
  }
}
