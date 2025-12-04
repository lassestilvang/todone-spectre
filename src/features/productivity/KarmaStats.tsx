import React from 'react';
import { useKarma } from '../../../hooks/useKarma';

export const KarmaStats: React.FC = () => {
  const { karma, level, tasksCompleted, streak, productivityScore } = useKarma();

  return (
    <div className="karma-stats">
      <h3>Productivity Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{karma}</div>
          <div className="stat-label">Total Karma</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{level}</div>
          <div className="stat-label">Current Level</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{tasksCompleted}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Daily Streak</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{productivityScore}%</div>
          <div className="stat-label">Productivity Score</div>
        </div>
      </div>
    </div>
  );
};