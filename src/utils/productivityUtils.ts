import { Task } from '../database/models';

interface ProductivityCalculationOptions {
  taskCompletionWeight?: number;
  streakWeight?: number;
  consistencyWeight?: number;
  speedWeight?: number;
}

export class ProductivityUtils {
  public static calculateProductivityScore(
    tasksCompleted: number,
    streak: number,
    options: ProductivityCalculationOptions = {}
  ): number {
    const {
      taskCompletionWeight = 0.5,
      streakWeight = 0.3,
      consistencyWeight = 0.1,
      speedWeight = 0.1,
    } = options;

    // Base score from task completion (0-100)
    const completionScore = Math.min(100, tasksCompleted * 2);

    // Streak bonus (0-50)
    const streakBonus = Math.min(50, streak * 5);

    // Consistency score (0-20) - based on regular task completion
    const consistencyScore = tasksCompleted > 0 ? Math.min(20, Math.log(tasksCompleted) * 5) : 0;

    // Speed score (0-10) - placeholder for task completion speed
    const speedScore = 5; // Placeholder

    // Calculate weighted score
    const weightedScore =
      completionScore * taskCompletionWeight +
      streakBonus * streakWeight +
      consistencyScore * consistencyWeight +
      speedScore * speedWeight;

    // Return as percentage (0-100)
    return Math.min(100, Math.round(weightedScore));
  }

  public static calculateTaskCompletionRate(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === 'completed');
    return (completedTasks.length / tasks.length) * 100;
  }

  public static calculateAverageCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter(task =>
      task.status === 'completed' &&
      task.completedAt &&
      task.createdAt
    );

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = task.completedAt.getTime() - task.createdAt.getTime();
      return sum + completionTime;
    }, 0);

    return totalTime / completedTasks.length; // in milliseconds
  }

  public static calculateProductivityTrend(
    currentScore: number,
    previousScores: number[] = []
  ): number {
    if (previousScores.length === 0) return 0;

    const averagePrevious = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
    const improvement = currentScore - averagePrevious;

    // Return percentage improvement
    return averagePrevious > 0
      ? Math.round((improvement / averagePrevious) * 100)
      : improvement;
  }

  public static getProductivityLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Below Average';
    return 'Needs Improvement';
  }

  public static calculateXPForTask(
    task: Task,
    baseXP: number = 25
  ): number {
    // Base XP
    let xp = baseXP;

    // Bonus for priority
    switch (task.priority) {
      case 'high':
        xp += 10;
        break;
      case 'medium':
        xp += 5;
        break;
      case 'low':
        xp += 2;
        break;
    }

    // Bonus for timely completion
    if (task.dueDate && task.completedAt) {
      const timeLeft = task.dueDate.getTime() - task.completedAt.getTime();
      const hoursLeft = timeLeft / (1000 * 60 * 60);

      if (hoursLeft > 24) {
        xp += 5; // Early completion bonus
      } else if (hoursLeft > 0) {
        xp += 3; // On-time completion bonus
      }
    }

    return xp;
  }
}