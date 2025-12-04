import React, { useState, useEffect } from 'react';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useAITaskSuggestions } from '../../../hooks/useAITaskSuggestions';
import { Task } from '../../../types/taskTypes';

interface AIAssistantProps {
  taskId?: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ taskId, onSuggestionSelect }) => {
  const { aiResponse, isLoading, error, generateAIResponse } = useAIAssistant();
  const { suggestions, loading: suggestionsLoading, generateSuggestions } = useAITaskSuggestions();
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'assistant' | 'suggestions'>('assistant');

  useEffect(() => {
    if (taskId) {
      generateSuggestions(taskId);
    }
  }, [taskId, generateSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      generateAIResponse(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setInputValue(suggestion);
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-tabs">
        <button
          className={`tab-button ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          AI Assistant
        </button>
        <button
          className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Task Suggestions
        </button>
      </div>

      {activeTab === 'assistant' ? (
        <div className="ai-assistant-content">
          <form onSubmit={handleSubmit} className="ai-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AI for task assistance..."
              className="ai-input"
              disabled={isLoading}
            />
            <button type="submit" className="ai-submit-button" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {error && <div className="ai-error">{error}</div>}

          {aiResponse && (
            <div className="ai-response">
              <div className="ai-response-header">AI Response:</div>
              <div className="ai-response-content">{aiResponse}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="ai-suggestions-content">
          {suggestionsLoading ? (
            <div className="loading">Loading suggestions...</div>
          ) : (
            <>
              {suggestions.length > 0 ? (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-suggestions">No suggestions available</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};