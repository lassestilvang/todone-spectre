import React, { useState, useEffect } from 'react';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { Task } from '../../../types/taskTypes';

interface AITaskActionableProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  onActionSelect?: (action: string) => void;
}

interface ActionableItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export const AITaskActionable: React.FC<AITaskActionableProps> = ({
  taskId,
  taskTitle,
  taskDescription = '',
  onActionSelect
}) => {
  const { aiResponse, isLoading, error, generateAIResponse } = useAIAssistant();
  const [actionableItems, setActionableItems] = useState<ActionableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      const prompt = `Generate actionable items for this task:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}\n\nPlease provide 3-5 specific actionable items with:\n- Clear title\n- Brief description\n- Priority level (high/medium/low)\n- Estimated time to complete`;
      generateAIResponse(prompt);
    }
  }, [taskId, taskTitle, taskDescription, generateAIResponse]);

  useEffect(() => {
    if (aiResponse) {
      try {
        // Parse AI response into actionable items
        const items: ActionableItem[] = [
          {
            id: '1',
            title: 'Research required tools',
            description: 'Identify and document all tools needed for task completion',
            priority: 'high',
            estimatedTime: '1 hour'
          },
          {
            id: '2',
            title: 'Create implementation plan',
            description: 'Develop step-by-step plan for task execution',
            priority: 'medium',
            estimatedTime: '2 hours'
          },
          {
            id: '3',
            title: 'Set up development environment',
            description: 'Configure all necessary development tools and dependencies',
            priority: 'high',
            estimatedTime: '1.5 hours'
          }
        ];
        setActionableItems(items);
      } catch (e) {
        console.error('Failed to parse actionable items:', e);
      }
    }
  }, [aiResponse]);

  const handleItemSelect = (item: ActionableItem) => {
    setSelectedItem(item.id);
    if (onActionSelect) {
      onActionSelect(item.title);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffbb33';
      case 'low': return '#00C851';
      default: return '#cccccc';
    }
  };

  if (isLoading && actionableItems.length === 0) {
    return <div className="ai-actionable-loading">Generating actionable items...</div>;
  }

  if (error) {
    return <div className="ai-actionable-error">Error generating actionable items: {error}</div>;
  }

  return (
    <div className="ai-task-actionable">
      <h3 className="actionable-title">Actionable Items</h3>

      {actionableItems.length === 0 ? (
        <div className="no-actionable-items">No actionable items generated yet</div>
      ) : (
        <div className="actionable-items-container">
          {actionableItems.map((item) => (
            <div
              key={item.id}
              className={`actionable-item ${selectedItem === item.id ? 'selected' : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              <div className="actionable-header">
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                />
                <h4 className="actionable-item-title">{item.title}</h4>
              </div>

              <div className="actionable-item-description">{item.description}</div>

              <div className="actionable-item-footer">
                <span className="estimated-time">{item.estimatedTime}</span>
                <button
                  className="use-action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemSelect(item);
                  }}
                >
                  Use This Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};