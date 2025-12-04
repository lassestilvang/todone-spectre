import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UpcomingView } from '../features/views/UpcomingView';
import { useUpcoming } from '../hooks/useUpcoming';

export const UpcomingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    getProcessedTasks,
    getStatistics
  } = useUpcoming();

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <UpcomingView
        onTaskClick={handleTaskClick}
      />
    </div>
  );
};