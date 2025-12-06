import React from "react";
import { useNavigate } from "react-router-dom";
import { InboxView } from "../features/views/InboxView";
import { useInbox } from "../hooks/useInbox";

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, getProcessedTasks, getStatistics } = useInbox();

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <InboxView onTaskClick={handleTaskClick} />
    </div>
  );
};

export { InboxPage };
export default InboxPage;
