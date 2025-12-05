import React from "react";
import { useKarma } from "../../../hooks/useKarma";

export const KarmaProgress: React.FC = () => {
  const { level, xp, xpToNextLevel } = useKarma();

  // Calculate progress percentage
  const progressPercentage =
    xpToNextLevel > 0
      ? Math.min(100, Math.round((xp / xpToNextLevel) * 100))
      : 0;

  return (
    <div className="karma-progress">
      <h3>Level Progress</h3>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-text">
          Level {level} - {xp}/{xpToNextLevel} XP ({progressPercentage}%)
        </div>
      </div>
    </div>
  );
};
