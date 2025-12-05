import { useState, useEffect } from "react";
import { KarmaService } from "../services/karmaService";

export const useKarma = () => {
  const [karmaState, setKarmaState] = useState(
    KarmaService.getInstance().getKarmaState(),
  );

  useEffect(() => {
    const karmaService = KarmaService.getInstance();

    // Set up a listener or interval to update karma state
    const interval = setInterval(() => {
      setKarmaState(karmaService.getKarmaState());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const addXP = (amount: number) => {
    KarmaService.getInstance().addXP(amount);
  };

  const completeTask = () => {
    KarmaService.getInstance().completeTask();
  };

  const updateStreak = (streak: number) => {
    KarmaService.getInstance().updateStreak(streak);
  };

  const updateProductivityScore = (score: number) => {
    KarmaService.getInstance().updateProductivityScore(score);
  };

  return {
    ...karmaState,
    addXP,
    completeTask,
    updateStreak,
    updateProductivityScore,
  };
};
