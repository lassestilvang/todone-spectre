import React, { useState, useEffect } from 'react';
import { useAITaskSuggestions } from '../../../hooks/useAITaskSuggestions';
import { Task } from '../../../types/taskTypes';

interface AITaskSuggestionsProps {
  taskId: string;
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
}

export const AITaskSuggestions: React.FC<AITaskSuggestionsProps> = ({
  taskId,
  onSuggestionSelect,
  maxSuggestions = 5
}) => {
  const { suggestions, loading, error, generateSuggestions } = useAITaskSuggestions();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (taskId) {
      generateSuggestions(taskId);
    }
  }, [taskId, generateSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  const visibleSuggestions = expanded ? suggestions : suggestions.slice(0, maxSuggestions);

  return (
    <div className="ai-task-suggestions">
      <h3 className="suggestions-title">AI Task Suggestions</h3>

      {loading ? (
        <div className="loading-indicator">Loading suggestions...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : suggestions.length === 0 ? (
        <div className="no-suggestions">No suggestions available for this task</div>
      ) : (
        <>
          <ul className="suggestions-list">
            {visibleSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="suggestion-text">{suggestion}</span>
                <button
                  className="use-suggestion-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(suggestion);
                  }}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>

          {suggestions.length > maxSuggestions && (
            <button
              className="show-more-button"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : `Show ${suggestions.length - maxSuggestions} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
};