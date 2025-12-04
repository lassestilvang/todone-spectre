import React from "react";
import { render, screen } from "@testing-library/react";
import { KarmaSystem } from "../KarmaSystem";
import { KarmaProgress } from "../KarmaProgress";
import { KarmaStats } from "../KarmaStats";
import { KarmaAchievements } from "../KarmaAchievements";
import { KarmaService } from "../../../services/karmaService";
import { ProductivityTestUtils } from "./productivityTestUtils";

// Mock the useKarma hook
jest.mock("../../../hooks/useKarma", () => ({
  useKarma: () => ({
    karma: 150,
    level: 3,
    xp: 250,
    xpToNextLevel: 400,
    achievements: [
      {
        id: "first_task",
        name: "First Step",
        description: "Complete your first task",
        unlocked: true,
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
    ],
    tasksCompleted: 8,
    streak: 2,
    productivityScore: 65,
  }),
}));

describe("Karma Components", () => {
  beforeEach(() => {
    // Reset services before each test
    ProductivityTestUtils.resetKarmaService();
  });

  test("KarmaSystem renders correctly", () => {
    render(<KarmaSystem />);

    expect(screen.getByText("Productivity Karma System")).toBeInTheDocument();
    expect(screen.getByText("Level: 3")).toBeInTheDocument();
    expect(screen.getByText("Karma: 150")).toBeInTheDocument();
    expect(screen.getByText("XP: 250")).toBeInTheDocument();
  });

  test("KarmaProgress shows correct progress", () => {
    render(<KarmaProgress />);

    expect(screen.getByText("Level Progress")).toBeInTheDocument();
    expect(screen.getByText("Level 3 - 250/400 XP (63%)")).toBeInTheDocument();

    // Check that progress bar has correct width
    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveStyle("width: 63%");
  });

  test("KarmaStats displays all statistics", () => {
    render(<KarmaStats />);

    expect(screen.getByText("Productivity Statistics")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument(); // Total Karma
    expect(screen.getByText("3")).toBeInTheDocument(); // Current Level
    expect(screen.getByText("8")).toBeInTheDocument(); // Tasks Completed
    expect(screen.getByText("2")).toBeInTheDocument(); // Daily Streak
    expect(screen.getByText("65%")).toBeInTheDocument(); // Productivity Score
  });

  test("KarmaAchievements shows achievements correctly", () => {
    const achievements = [
      {
        id: "first_task",
        name: "First Step",
        description: "Complete your first task",
        unlocked: true,
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
    ];

    render(<KarmaAchievements achievements={achievements} />);

    expect(screen.getByText("Achievements")).toBeInTheDocument();
    expect(screen.getByText("First Step")).toBeInTheDocument();
    expect(screen.getByText("Productive Start")).toBeInTheDocument();

    // Check that unlocked achievement doesn't have lock overlay
    const unlockedAchievement = screen
      .getByText("First Step")
      .closest(".achievement-item");
    expect(unlockedAchievement).not.toHaveClass("locked");

    // Check that locked achievement has lock overlay
    const lockedAchievement = screen
      .getByText("Productive Start")
      .closest(".achievement-item");
    expect(lockedAchievement).toHaveClass("locked");
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  test("Karma service updates correctly", () => {
    const karmaService = KarmaService.getInstance();

    // Initial state
    let state = karmaService.getKarmaState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);

    // Complete a task
    karmaService.completeTask();
    state = karmaService.getKarmaState();
    expect(state.tasksCompleted).toBe(1);
    expect(state.xp).toBeGreaterThan(0);

    // Update streak
    karmaService.updateStreak(3);
    state = karmaService.getKarmaState();
    expect(state.streak).toBe(3);
  });
});
