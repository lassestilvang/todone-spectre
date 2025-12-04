import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../store/useAIStore';
import { useTaskStore } from '../../store/useTaskStore';
import { AIIntegration } from './AIIntegration';
import { AIAssistant } from './AIAssistant';
import { AITaskSuggestions } from './AITaskSuggestions';
import { Task } from '../../types/taskTypes';

interface AIFeatureImplementationProps {
  taskId: string;
  integrationMode?: 'full' | 'compact' | 'minimal';
  showHeader?: boolean;
}

export const AIFeatureImplementation: React.FC<AIFeatureImplementationProps> = ({
  taskId,
  integrationMode = 'compact',
  showHeader = true
}) => {
  const { aiAssistantEnabled, setAILoading, setAIError } = useAIStore();
  const { tasks } = useTaskStore();
  const [aiFeatureReady, setAIFeatureReady] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');

  const task = tasks.find(t => t.id === taskId);

  useEffect(() => {
    const initializeAIFeature = async () => {
      try {
        setAILoading(true);

        // Simulate AI feature initialization
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if task exists and is valid for AI assistance
        if (!task) {
          throw new Error('Task not found for AI assistance');
        }

        setIntegrationStatus('ready');
        setAIFeatureReady(true);
      } catch (error) {
        console.error('AI Feature initialization error:', error);
        setAIError(error instanceof Error ? error.message : 'Failed to initialize AI feature');
        setIntegrationStatus('error');
      } finally {
        setAILoading(false);
      }
    };

    initializeAIFeature();
  }, [taskId, task, setAILoading, setAIError]);

  const getAIFeatureContent = () => {
    if (integrationStatus === 'initializing') {
      return <div className="ai-feature-initializing">Initializing AI assistance...</div>;
    }

    if (integrationStatus === 'error') {
      return <div className="ai-feature-error">AI feature failed to initialize</div>;
    }

    if (!aiAssistantEnabled) {
      return (
        <div className="ai-feature-disabled">
          <p>AI assistance is disabled for this task.</p>
          <button onClick={() => useAIStore.getState().enableAIAssistant()}>
            Enable AI Assistance
          </button>
        </div>
      );
    }

    if (integrationMode === 'full') {
      return <AIIntegration taskId={taskId} mode="full" />;
    }

    if (integrationMode === 'minimal') {
      return (
        <div className="ai-feature-minimal">
          <AITaskSuggestions taskId={taskId} maxSuggestions={3} />
        </div>
      );
    }

    // Compact mode (default)
    return (
      <div className="ai-feature-compact">
        <div className="ai-feature-section">
          <AITaskSuggestions taskId={taskId} maxSuggestions={2} />
        </div>
        <div className="ai-feature-section">
          <AIAssistant taskId={taskId} />
        </div>
      </div>
    );
  };

  if (!aiFeatureReady) {
    return (
      <div className="ai-feature-loading">
        <div className="ai-spinner" />
        <p>Preparing AI assistance...</p>
      </div>
    );
  }

  return (
    <div className="ai-feature-implementation">
      {showHeader && (
        <div className="ai-feature-header">
          <h3>AI Task Assistance</h3>
          <p>Intelligent suggestions and breakdowns for your task</p>
        </div>
      )}

      <div className="ai-feature-content">
        {getAIFeatureContent()}
      </div>

      <div className="ai-feature-footer">
        <small>AI assistance helps you break down tasks and get actionable suggestions</small>
      </div>
    </div>
  );
};

// AI Feature Integration Hook
export const useAIFeatureIntegration = (taskId: string) => {
  const { aiAssistantEnabled, setAILoading, setAIError, recordAIUsage } = useAIStore();
  const { tasks } = useTaskStore();

  const [aiIntegrationStatus, setAIIntegrationStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [aiFeatureData, setAIFeatureData] = useState<{
    suggestions: string[];
    breakdownAvailable: boolean;
    actionableItemsAvailable: boolean;
  }>({
    suggestions: [],
    breakdownAvailable: false,
    actionableItemsAvailable: false
  });

  const task = tasks.find(t => t.id === taskId);

  const initializeAIIntegration = async () => {
    if (!task || !aiAssistantEnabled) return;

    try {
      setAIIntegrationStatus('loading');
      setAILoading(true);

      // Simulate AI data fetching
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data - in real implementation would come from AI services
      const mockSuggestions = [
        `Break down "${task.title}" into smaller tasks`,
        `Research required tools for "${task.title}"`,
        `Set realistic timeline for "${task.title}"`
      ];

      setAIFeatureData({
        suggestions: mockSuggestions,
        breakdownAvailable: true,
        actionableItemsAvailable: true
      });

      setAIIntegrationStatus('ready');
      recordAIUsage(true);
    } catch (error) {
      console.error('AI Integration error:', error);
      setAIError('Failed to integrate AI assistance');
      setAIIntegrationStatus('error');
      recordAIUsage(false);
    } finally {
      setAILoading(false);
    }
  };

  const refreshAIData = async () => {
    await initializeAIIntegration();
  };

  return {
    aiIntegrationStatus,
    aiFeatureData,
    aiAssistantEnabled,
    initializeAIIntegration,
    refreshAIData,
    isAIReady: aiIntegrationStatus === 'ready',
    isAILoading: aiIntegrationStatus === 'loading',
    hasAIError: aiIntegrationStatus === 'error'
  };
};