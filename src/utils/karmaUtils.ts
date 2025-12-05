interface KarmaCalculationOptions {
  levelMultiplier?: number;
  achievementBonus?: number;
  streakBonus?: number;
}

export class KarmaUtils {
  public static calculateXPRequiredForLevel(level: number): number {
    // Exponential growth formula: base * multiplier^(level-1)
    const baseXP = 100;
    const multiplier = 1.5;

    return Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  public static calculateKarmaFromXP(xp: number): number {
    // Convert XP to karma points
    return Math.floor(xp / 20); // 20 XP = 1 karma point
  }

  public static calculateLevelFromXP(xp: number): number {
    let level = 1;
    let xpRequired = 100;

    while (xp >= xpRequired) {
      xp -= xpRequired;
      level++;
      xpRequired = Math.floor(xpRequired * 1.5);
    }

    return level;
  }

  public static calculateXPForAchievement(
    achievementId: string,
    baseXP: number = 50,
  ): number {
    // Different achievements have different XP rewards
    const achievementXPMap: Record<string, number> = {
      first_task: 50,
      five_tasks: 100,
      ten_tasks: 200,
      streak_3: 150,
      streak_7: 300,
    };

    return achievementXPMap[achievementId] || baseXP;
  }

  public static calculateKarmaBonus(
    level: number,
    streak: number,
    options: KarmaCalculationOptions = {},
  ): number {
    const {
      levelMultiplier = 0.1,
      achievementBonus = 0.2,
      streakBonus = 0.3,
    } = options;

    // Base karma bonus
    let bonus = level * levelMultiplier;

    // Add streak bonus
    bonus += streak * streakBonus;

    // Add achievement bonus (placeholder)
    bonus += 2 * achievementBonus;

    return Math.round(bonus);
  }

  public static getLevelName(level: number): string {
    const levelNames = [
      "Novice",
      "Apprentice",
      "Journeyman",
      "Expert",
      "Master",
      "Grandmaster",
      "Legend",
      "Myth",
      "Titan",
      "Deity",
    ];

    // Cycle through level names
    const index = Math.min(levelNames.length - 1, Math.floor((level - 1) / 5));
    return levelNames[index];
  }

  public static calculateXPForTaskCompletion(
    taskPriority: string,
    options: KarmaCalculationOptions = {},
  ): number {
    const {
      levelMultiplier = 0.1,
      achievementBonus = 0.05,
      streakBonus = 0.05,
    } = options;

    // Base XP for task completion
    let xp = 25;

    // Priority bonus
    switch (taskPriority) {
      case "high":
        xp += 15;
        break;
      case "medium":
        xp += 10;
        break;
      case "low":
        xp += 5;
        break;
    }

    // Apply multipliers
    xp = Math.round(
      xp * (1 + levelMultiplier + achievementBonus + streakBonus),
    );

    return xp;
  }

  public static calculateProgressToNextLevel(
    currentXP: number,
    currentLevel: number,
  ): { xpToNextLevel: number; progressPercentage: number } {
    const xpRequired = this.calculateXPRequiredForLevel(currentLevel);
    const progressPercentage = Math.min(
      100,
      Math.round((currentXP / xpRequired) * 100),
    );

    return {
      xpToNextLevel: xpRequired,
      progressPercentage,
    };
  }
}
