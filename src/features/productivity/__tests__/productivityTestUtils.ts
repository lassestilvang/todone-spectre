import { Task } from '../../../database/models';
import { ProductivityService } from '../../../services/productivityService';
import { KarmaService } from '../../../services/karmaService';

export class ProductivityTestUtils {
  public static createMockTask(overrides: Partial<Task> = {}): Task {
    return {
      id: 'test-task-' + Math.random().toString(36).substr(2, 9),
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      completedAt: null,
      userId: 'test-user',
      projectId: 'test-project',
      tags: [],
      recurringPattern: null,
      parentTaskId: null,
      position: 0,
      ...overrides,
    };
  }

  public static createCompletedTask(overrides: Partial<Task> = {}): Task {
    const now = new Date();
    return this.createMockTask({
      status: 'completed',
      completedAt: now,
      ...overrides,
    });
  }

  public static resetProductivityService(): void {
    const productivityService = ProductivityService.getInstance();
    productivityService['productivityData'] = {
      tasksCompleted: 0,
      tasksCreated: 0,
      averageCompletionTime: 0,
      productivityScore: 0,
      streak: 0,
      lastActiveDate: new Date(),
    };

    productivityService['productivityMetrics'] = {
      dailyProductivity: Array(7).fill(0),
      weeklyProductivity: Array(4).fill(0),
      monthlyProductivity: Array(12).fill(0),
      productivityTrends: {
        improvement: 0,
        consistency: 0,
      },
    };
  }

  public static resetKarmaService(): void {
    const karmaService = KarmaService.getInstance();
    karmaService['karmaState'] = {
      karma: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      achievements: [
        {
          id: 'first_task',
          name: 'First Step',
          description: 'Complete your first task',
          unlocked: false,
          icon: '🏆',
          xpReward: 50,
        },
        {
          id: 'five_tasks',
          name: 'Productive Start',
          description: 'Complete 5 tasks',
          unlocked: false,
          icon: '🚀',
          xpReward: 100,
        },
        {
          id: 'ten_tasks',
          name: 'Task Master',
          description: 'Complete 10 tasks',
          unlocked: false,
          icon: '💪',
          xpReward: 200,
        },
        {
          id: 'streak_3',
          name: 'Consistent Effort',
          description: '3 day streak',
          unlocked: false,
          icon: '🔥',
          xpReward: 150,
        },
        {
          id: 'streak_7',
          name: 'Weekly Warrior',
          description: '7 day streak',
          unlocked: false,
          icon: '🌟',
          xpReward: 300,
        },
      ],
      tasksCompleted: 0,
      streak: 0,
      productivityScore: 0,
    };
  }

  public static simulateTaskCompletion(count: number = 1): void {
    const productivityService = ProductivityService.getInstance();
    const karmaService = KarmaService.getInstance();

    for (let i = 0; i < count; i++) {
      const task = this.createCompletedTask();
      productivityService.updateTaskCompletion(task);
      karmaService.completeTask();
    }
  }

  public static simulateStreak(days: number): void {
    const karmaService = KarmaService.getInstance();
    karmaService.updateStreak(days);
  }

  public static getTestProductivityData(): any {
    return ProductivityService.getInstance().getProductivityData();
  }

  public static getTestKarmaState(): any {
    return KarmaService.getInstance().getKarmaState();
  }
}