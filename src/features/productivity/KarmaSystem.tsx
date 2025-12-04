import React from 'react';
import { useKarma } from '../../../hooks/useKarma';
import { KarmaProgress } from './KarmaProgress';
import { KarmaStats } from './KarmaStats';
import { KarmaAchievements } from './KarmaAchievements';

export const KarmaSystem: React.FC = () => {
  const { karma, level, xp, achievements } = useKarma();

  return (
    <div className="karma-system">
      <h2>Productivity Karma System</h2>
      <div className="karma-overview">
        <div className="karma-level">Level: {level}</div>
        <div className="karma-points">Karma: {karma}</div>
        <div className="karma-xp">XP: {xp}</div>
      </div>

      <div className="karma-components">
        <KarmaProgress />
        <KarmaStats />
        <KarmaAchievements achievements={achievements} />
      </div>
    </div>
  );
};