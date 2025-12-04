import React, { useState, useEffect } from 'react';
import { useNlpParser } from '../../../hooks/useNlpParser';
import { useNaturalLanguage } from '../../../hooks/useNaturalLanguage';
import { useTaskStore } from '../../../store/useTaskStore';
import { useAIStore } from '../../../store/useAIStore';
import { Task } from '../../../types/taskTypes';

interface AINaturalLanguageTaskCreatorProps {
  onTaskCreated?: (task: Partial<Task>) => void;
  onCancel?: () => void;
  showAdvancedOptions?: boolean;
  defaultContext?: any;
}

interface ParsedTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence: number;
}

interface NLPParseResult extends ParsedTaskData {
  suggestedNextSteps?: string[];
  estimatedDuration?: string;
  relatedTasks?: string[];
}

export const AINaturalLanguageTaskCreator: React.FC<AINaturalLanguageTaskCreatorProps> = ({
  onTaskCreated,
  onCancel,
  showAdvancedOptions = false,
  defaultContext = {}
}) => {
  const { parse, parseWithContext, isLoading, error, lastResult } = useNlpParser({
    debug: true,
    fallbackToBasic: true
  });

  const { parseNaturalLanguage } = useNaturalLanguage({
    debug: true
  });

  const { addTask } = useTaskStore();
  const { recordAIUsage } = useAIStore();

  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState<NLPParseResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contextOptions, setContextOptions] = useState<any>(defaultContext);
  const [suggestedImprovements, setSuggestedImprovements] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);

  useEffect(() => {
    if (lastResult) {
      setParseResult(this.enhanceParseResult(lastResult));
      recordAIUsage(true);
    }
  }, [lastResult, recordAIUsage]);

  useEffect(() => {
    if (parseResult && parseResult.confidence < confidenceThreshold) {
      generateSuggestedImprovements(parseResult);
    }
  }, [parseResult, confidenceThreshold]);

  const enhanceParseResult = (baseResult: ParsedTaskData): NLPParseResult => {
    // Add additional AI-generated suggestions
    const enhanced: NLPParseResult = {
      ...baseResult,
      suggestedNextSteps: this.generateNextSteps(baseResult),
      estimatedDuration: this.estimateDuration(baseResult),
      relatedTasks: this.suggestRelatedTasks(baseResult)
    };

    return enhanced;
  };

  const generateNextSteps = (parsedData: ParsedTaskData): string[] => {
    const steps: string[] = [];

    // Generate context-aware next steps
    if (parsedData.title.toLowerCase().includes('meeting')) {
      steps.push('Schedule meeting time');
      steps.push('Prepare meeting agenda');
      steps.push('Invite participants');
    } else if (parsedData.title.toLowerCase().includes('develop') ||
               parsedData.title.toLowerCase().includes('code')) {
      steps.push('Set up development environment');
      steps.push('Create implementation plan');
      steps.push('Write unit tests');
    } else {
      steps.push('Break down task into smaller steps');
      steps.push('Identify required resources');
      steps.push('Set realistic timeline');
    }

    // Add priority-specific steps
    if (parsedData.priority === 'high') {
      steps.push('Clear calendar for focused work time');
      steps.push('Notify team about priority task');
    }

    return steps.slice(0, 3); // Return top 3 suggestions
  };

  const estimateDuration = (parsedData: ParsedTaskData): string => {
    // Estimate based on task type and content
    if (parsedData.title.toLowerCase().includes('research')) {
      return '2-4 hours';
    } else if (parsedData.title.toLowerCase().includes('meeting')) {
      return '30-60 minutes';
    } else if (parsedData.description && parsedData.description.length > 200) {
      return '1-2 hours';
    } else {
      return '30-60 minutes';
    }
  };

  const suggestRelatedTasks = (parsedData: ParsedTaskData): string[] => {
    const related: string[] = [];

    if (parsedData.title.toLowerCase().includes('documentation')) {
      related.push('Review existing documentation');
      related.push('Update documentation templates');
    } else if (parsedData.title.toLowerCase().includes('development')) {
      related.push('Set up testing environment');
      related.push('Create technical specifications');
    }

    return related.slice(0, 2);
  };

  const generateSuggestedImprovements = (parseResult: NLPParseResult) => {
    const improvements: string[] = [];

    if (!parseResult.title || parseResult.title.length < 3) {
      improvements.push('Provide a more descriptive task title');
    }

    if (!parseResult.dueDate) {
      improvements.push('Consider adding a due date for better planning');
    }

    if (!parseResult.priority || parseResult.priority === 'medium') {
      improvements.push('Specify priority level (high/medium/low)');
    }

    if (parseResult.confidence < 50) {
      improvements.push('Add more details to improve parsing accuracy');
    }

    setSuggestedImprovements(improvements);
  };

  const handleParse = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to parse');
      return;
    }

    try {
      setIsCreating(true);
      setShowPreview(false);

      if (showAdvancedOptions && Object.keys(contextOptions).length > 0) {
        await parseWithContext(inputText, contextOptions);
      } else {
        await parse(inputText);
      }
    } catch (error) {
      console.error('NLP parsing error:', error);
      alert(`Error parsing task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!parseResult) {
      alert('No parsed task data available');
      return;
    }

    try {
      setIsCreating(true);

      const taskData: Partial<Task> = {
        title: parseResult.title || 'Untitled Task',
        description: parseResult.description || '',
        dueDate: parseResult.dueDate,
        priority: parseResult.priority as any || 'medium',
        labels: parseResult.labels || [],
        project: parseResult.project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        // Add AI-generated metadata
        aiGenerated: true,
        aiConfidence: parseResult.confidence,
        aiSuggestedNextSteps: parseResult.suggestedNextSteps,
        aiEstimatedDuration: parseResult.estimatedDuration,
        aiRelatedTasks: parseResult.relatedTasks,
        source: 'natural_language'
      };

      // Add task to store
      const createdTask = await addTask(taskData);

      // Call callback if provided
      if (onTaskCreated) {
        onTaskCreated(taskData);
      }

      // Reset form
      setInputText('');
      setParseResult(null);
      setShowPreview(false);

      alert(`Task created successfully: "${taskData.title}"`);

      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setInputText('');
    setParseResult(null);
    setShowPreview(false);
    if (onCancel) {
      onCancel();
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return '#cccccc';
    switch (priority.toLowerCase()) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffbb33';
      case 'low': return '#00C851';
      default: return '#cccccc';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4CAF50'; // Green
    if (confidence >= 60) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  return (
    <div className="ai-natural-language-task-creator">
      <div className="nlp-creator-header">
        <h3>🤖 AI Task Creator</h3>
        <p>Create tasks using natural language - just describe what you need to do!</p>
      </div>

      <div className="nlp-input-section">
        <textarea
          className="nlp-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe your task in natural language, for example:
- 'Schedule team meeting for project review on Friday at 2pm'
- 'Write documentation for the new API endpoints with high priority'
- 'Research React performance optimization techniques due next Wednesday'
- 'Create marketing campaign for product launch with John and Sarah'"
          rows={6}
          disabled={isCreating}
        />

        {showAdvancedOptions && (
          <div className="advanced-options">
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={contextOptions.defaultProject || false}
                  onChange={(e) => setContextOptions({
                    ...contextOptions,
                    defaultProject: e.target.checked ? 'current-project' : undefined
                  })}
                />
                Use current project context
              </label>
            </div>

            <div className="option-group">
              <label>
                Priority bias:
                <select
                  value={contextOptions.defaultPriority || ''}
                  onChange={(e) => setContextOptions({
                    ...contextOptions,
                    defaultPriority: e.target.value || undefined
                  })}
                >
                  <option value="">None</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <div className="nlp-actions">
          <button
            className="parse-button"
            onClick={handleParse}
            disabled={isCreating || !inputText.trim()}
          >
            {isCreating ? '🤔 Analyzing...' : '🔍 Parse Task'}
          </button>

          {parseResult && !showPreview && (
            <button
              className="preview-button"
              onClick={() => setShowPreview(true)}
              disabled={isCreating}
            >
              👁️ Preview Task
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="nlp-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error.message}</div>
          <button onClick={() => parse(inputText)} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {parseResult && showPreview && (
        <div className="nlp-preview-section">
          <div className="preview-header">
            <h4>📋 Task Preview</h4>
            <div className="confidence-indicator">
              <span>Confidence: </span>
              <span
                className="confidence-value"
                style={{ color: getConfidenceColor(parseResult.confidence) }}
              >
                {parseResult.confidence}%
              </span>
              <span className="confidence-description">
                {parseResult.confidence >= 80 ? 'High' :
                 parseResult.confidence >= 60 ? 'Medium' : 'Low'} confidence
              </span>
            </div>
          </div>

          <div className="preview-content">
            <div className="preview-field">
              <span className="field-label">Title:</span>
              <span className="field-value">{parseResult.title || 'Untitled Task'}</span>
            </div>

            {parseResult.description && (
              <div className="preview-field">
                <span className="field-label">Description:</span>
                <span className="field-value">{parseResult.description}</span>
              </div>
            )}

            <div className="preview-field">
              <span className="field-label">Priority:</span>
              <span className="field-value">
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(parseResult.priority) }}
                >
                  {parseResult.priority || 'medium'}
                </span>
              </span>
            </div>

            {parseResult.dueDate && (
              <div className="preview-field">
                <span className="field-label">Due Date:</span>
                <span className="field-value">{parseResult.dueDate}</span>
              </div>
            )}

            {parseResult.labels && parseResult.labels.length > 0 && (
              <div className="preview-field">
                <span className="field-label">Labels:</span>
                <span className="field-value">
                  {parseResult.labels.map((label, index) => (
                    <span key={index} className="label-badge">{label}</span>
                  ))}
                </span>
              </div>
            )}

            {parseResult.project && (
              <div className="preview-field">
                <span className="field-label">Project:</span>
                <span className="field-value">{parseResult.project}</span>
              </div>
            )}

            {parseResult.estimatedDuration && (
              <div className="preview-field">
                <span className="field-label">Estimated Duration:</span>
                <span className="field-value">{parseResult.estimatedDuration}</span>
              </div>
            )}
          </div>

          {suggestedImprovements.length > 0 && (
            <div className="improvement-suggestions">
              <h5>💡 Suggested Improvements:</h5>
              <ul>
                {suggestedImprovements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}

          {parseResult.suggestedNextSteps && parseResult.suggestedNextSteps.length > 0 && (
            <div className="next-steps">
              <h5>🚀 Suggested Next Steps:</h5>
              <ul>
                {parseResult.suggestedNextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="preview-actions">
            <button
              className="create-task-button"
              onClick={handleCreateTask}
              disabled={isCreating}
            >
              {isCreating ? '🔄 Creating...' : '✅ Create Task'}
            </button>

            <button
              className="edit-task-button"
              onClick={() => setShowPreview(false)}
              disabled={isCreating}
            >
              ⬅️ Back to Edit
            </button>

            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={isCreating}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};