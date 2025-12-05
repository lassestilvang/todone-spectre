import React from "react";
import { useNavigate } from "react-router-dom";
import { TodayView } from "../features/views/TodayView";
import { useToday } from "../hooks/useToday";

export const TodayPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, getProcessedTasks, getStatistics } = useToday();

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <TodayView onTaskClick={handleTaskClick} />
    </div>
  );
};
