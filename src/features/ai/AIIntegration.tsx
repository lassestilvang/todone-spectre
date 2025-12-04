import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../store/useAIStore';
import { useTaskStore } from '../../store/useTaskStore';
import { AIAssistant } from './AIAssistant';
import { AITaskSuggestions } from './AITaskSuggestions';
import { AITaskBreakdown } from './AITaskBreakdown';
import { AITaskActionable } from './AITaskActionable';
import { Task } from '../../types/taskTypes';

interface AIIntegrationProps {
  taskId: string;
  mode?: 'full' | 'suggestions' | 'breakdown' | 'actionable';
  onAIAssistanceToggle?: (enabled: boolean) => void;
}

export const AIIntegration: React.FC<AIIntegrationProps> = ({
  taskId,
  mode = 'full',
  onAIAssistanceToggle
}) => {
  const { aiAssistantEnabled, enableAIAssistant, disableAIAssistant } = useAIStore();
  const { tasks } = useTaskStore();
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  useEffect(() => {
    if (onAIAssistanceToggle) {
      onAIAssistanceToggle(aiAssistantEnabled);
    }
  }, [aiAssistantEnabled, onAIAssistanceToggle]);

  if (!task) {
    return <div className="ai-integration-error">Task not found</div>;
  }

  const toggleAIAssistant = () => {
    if (aiAssistantEnabled) {
      disableAIAssistant();
    } else {
      enableAIAssistant();
    }
  };

  const toggleShowAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  if (mode === 'suggestions') {
    return (
      <div className="ai-integration-suggestions">
        <AITaskSuggestions taskId={taskId} />
      </div>
    );
  }

  if (mode === 'breakdown') {
    return (
      <div className="ai-integration-breakdown">
        <AITaskBreakdown
          taskId={taskId}
          taskTitle={task.title}
          taskDescription={task.description}
        />
      </div>
    );
  }

  if (mode === 'actionable') {
    return (
      <div className="ai-integration-actionable">
        <AITaskActionable
          taskId={taskId}
          taskTitle={task.title}
          taskDescription={task.description}
        />
      </div>
    );
  }

  // Full mode
  return (
    <div className="ai-integration-container">
      <div className="ai-integration-header">
        <h3>AI Task Assistance</h3>
        <div className="ai-controls">
          <button
            className="ai-toggle-button"
            onClick={toggleAIAssistant}
          >
            {aiAssistantEnabled ? 'Disable AI' : 'Enable AI'}
          </button>
          <button
            className="ai-show-button"
            onClick={toggleShowAIAssistant}
          >
            {showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </button>
        </div>
      </div>

      {aiAssistantEnabled && showAIAssistant && (
        <div className="ai-assistant-full">
          <AIAssistant taskId={taskId} />

          <div className="ai-components-grid">
            <div className="ai-component">
              <AITaskSuggestions taskId={taskId} maxSuggestions={3} />
            </div>

            <div className="ai-component">
              <AITaskBreakdown
                taskId={taskId}
                taskTitle={task.title}
                taskDescription={task.description}
              />
            </div>

            <div className="ai-component">
              <AITaskActionable
                taskId={taskId}
                taskTitle={task.title}
                taskDescription={task.description}
              />
            </div>
          </div>
        </div>
      )}

      {!aiAssistantEnabled && (
        <div className="ai-disabled-message">
          AI assistance is currently disabled. Enable it to get intelligent task suggestions and breakdowns.
        </div>
      )}
    </div>
  );
};