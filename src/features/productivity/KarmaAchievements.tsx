import React from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

interface KarmaAchievementsProps {
  achievements: Achievement[];
}

export const KarmaAchievements: React.FC<KarmaAchievementsProps> = ({
  achievements,
}) => {
  return (
    <div className="karma-achievements">
      <h3>Achievements</h3>
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-item ${achievement.unlocked ? "unlocked" : "locked"}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-description">
                {achievement.description}
              </div>
            </div>
            {!achievement.unlocked && (
              <div className="achievement-locked-overlay">🔒</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
