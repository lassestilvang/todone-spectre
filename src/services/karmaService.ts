interface KarmaState {
  karma: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  tasksCompleted: number;
  streak: number;
  productivityScore: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  xpReward: number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_task",
    name: "First Step",
    description: "Complete your first task",
    unlocked: false,
    icon: "🏆",
    xpReward: 50,
  },
  {
    id: "five_tasks",
    name: "Productive Start",
    description: "Complete 5 tasks",
    unlocked: false,
    icon: "🚀",
    xpReward: 100,
  },
  {
    id: "ten_tasks",
    name: "Task Master",
    description: "Complete 10 tasks",
    unlocked: false,
    icon: "💪",
    xpReward: 200,
  },
  {
    id: "streak_3",
    name: "Consistent Effort",
    description: "3 day streak",
    unlocked: false,
    icon: "🔥",
    xpReward: 150,
  },
  {
    id: "streak_7",
    name: "Weekly Warrior",
    description: "7 day streak",
    unlocked: false,
    icon: "🌟",
    xpReward: 300,
  },
];

export class KarmaService {
  private static instance: KarmaService;
  private karmaState: KarmaState;

  private constructor() {
    this.karmaState = {
      karma: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      achievements: [...DEFAULT_ACHIEVEMENTS],
      tasksCompleted: 0,
      streak: 0,
      productivityScore: 0,
    };
  }

  public static getInstance(): KarmaService {
    if (!KarmaService.instance) {
      KarmaService.instance = new KarmaService();
    }
    return KarmaService.instance;
  }

  public getKarmaState(): KarmaState {
    return this.karmaState;
  }

  public addXP(amount: number): void {
    this.karmaState.xp += amount;
    this.checkLevelUp();
    this.checkAchievements();
  }

  public completeTask(): void {
    this.karmaState.tasksCompleted++;
    this.addXP(25); // Base XP for completing a task
  }

  public updateStreak(streak: number): void {
    this.karmaState.streak = streak;
    this.checkAchievements();
  }

  public updateProductivityScore(score: number): void {
    this.karmaState.productivityScore = score;
  }

  private checkLevelUp(): void {
    while (this.karmaState.xp >= this.karmaState.xpToNextLevel) {
      this.karmaState.xp -= this.karmaState.xpToNextLevel;
      this.karmaState.level++;
      this.karmaState.karma += 10; // Karma points for leveling up

      // Increase XP required for next level (exponential growth)
      this.karmaState.xpToNextLevel = Math.floor(
        this.karmaState.xpToNextLevel * 1.5,
      );
    }
  }

  private checkAchievements(): void {
    // Check first task achievement
    if (
      this.karmaState.tasksCompleted >= 1 &&
      !this.isAchievementUnlocked("first_task")
    ) {
      this.unlockAchievement("first_task");
    }

    // Check 5 tasks achievement
    if (
      this.karmaState.tasksCompleted >= 5 &&
      !this.isAchievementUnlocked("five_tasks")
    ) {
      this.unlockAchievement("five_tasks");
    }

    // Check 10 tasks achievement
    if (
      this.karmaState.tasksCompleted >= 10 &&
      !this.isAchievementUnlocked("ten_tasks")
    ) {
      this.unlockAchievement("ten_tasks");
    }

    // Check 3 day streak achievement
    if (
      this.karmaState.streak >= 3 &&
      !this.isAchievementUnlocked("streak_3")
    ) {
      this.unlockAchievement("streak_3");
    }

    // Check 7 day streak achievement
    if (
      this.karmaState.streak >= 7 &&
      !this.isAchievementUnlocked("streak_7")
    ) {
      this.unlockAchievement("streak_7");
    }
  }

  private isAchievementUnlocked(achievementId: string): boolean {
    const achievement = this.karmaState.achievements.find(
      (a) => a.id === achievementId,
    );
    return achievement ? achievement.unlocked : false;
  }

  private unlockAchievement(achievementId: string): void {
    const achievementIndex = this.karmaState.achievements.findIndex(
      (a) => a.id === achievementId,
    );
    if (achievementIndex !== -1) {
      this.karmaState.achievements[achievementIndex].unlocked = true;
      this.addXP(this.karmaState.achievements[achievementIndex].xpReward);
      this.karmaState.karma += 5; // Bonus karma for achievements
    }
  }

  public resetKarma(): void {
    this.karmaState = {
      karma: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      achievements: [...DEFAULT_ACHIEVEMENTS],
      tasksCompleted: 0,
      streak: 0,
      productivityScore: 0,
    };
  }
}
