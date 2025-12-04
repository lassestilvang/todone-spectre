import { Task } from '../../../types/taskTypes';
import { AIUtils } from '../../../utils/aiUtils';
import { AITaskUtils } from '../../../utils/aiTaskUtils';

export class AITestUtils {
  static createMockTask(overrides: Partial<Task> = {}): Task {
    return {
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Task',
      description: 'This is a test task for AI assistance',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      ...overrides
    };
  }

  static createComplexTask(): Task {
    return this.createMockTask({
      title: 'Complex Development Task with Multiple Components',
      description: 'Implement a comprehensive AI assistance system with multiple components including task analysis, suggestion generation, and actionable item creation. This requires integration with existing task management system and UI components.',
      priority: 'high'
    });
  }

  static createSimpleTask(): Task {
    return this.createMockTask({
      title: 'Quick Review',
      description: 'Review the documentation',
      priority: 'low'
    });
  }

  static generateMockAISuggestions(count: number = 3): string[] {
    const suggestions = [
      'Break down task into smaller components',
      'Research required technologies and tools',
      'Create implementation plan with milestones',
      'Set up development environment',
      'Write unit tests for each component',
      'Document the implementation process',
      'Review and refine the solution',
      'Get stakeholder feedback'
    ];

    return suggestions.slice(0, count);
  }

  static generateMockTaskBreakdown(): {
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
    resources: string[];
  } {
    return {
      steps: [
        'Analyze task requirements and scope',
        'Research necessary technologies and tools',
        'Create detailed implementation plan',
        'Set up development environment',
        'Implement core functionality',
        'Write comprehensive tests',
        'Review and debug implementation',
        'Document the solution'
      ],
      estimatedTime: '4-6 hours',
      dependencies: [
        'API documentation',
        'Development environment setup',
        'Design system guidelines'
      ],
      resources: [
        'Development tools and IDE',
        'Testing frameworks',
        'Documentation templates'
      ]
    };
  }

  static generateMockActionableItems(count: number = 3): {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedTime: string;
  }[] {
    return [
      {
        id: 'action-1',
        title: 'Research AI technologies',
        description: 'Investigate available AI technologies and frameworks for task assistance',
        priority: 'high',
        estimatedTime: '1-2 hours'
      },
      {
        id: 'action-2',
        title: 'Create implementation plan',
        description: 'Develop step-by-step plan for AI integration',
        priority: 'medium',
        estimatedTime: '1 hour'
      },
      {
        id: 'action-3',
        title: 'Set up testing environment',
        description: 'Configure testing framework and environment',
        priority: 'medium',
        estimatedTime: '30-60 minutes'
      },
      {
        id: 'action-4',
        title: 'Document findings',
        description: 'Create comprehensive documentation of research and implementation',
        priority: 'low',
        estimatedTime: '1 hour'
      }
    ].slice(0, count);
  }

  static testAIUtilsWithTask(task: Task) {
    const analysis = AIUtils.analyzeTaskForAIAssistance(task);
    const suggestions = AIUtils.generateTaskSuggestions(task, 3);

    return {
      analysis,
      suggestions,
      complexityLevel: analysis.complexityLevel,
      priorityRecommendation: analysis.priorityRecommendation
    };
  }

  static testAITaskUtilsWithTask(task: Task) {
    const breakdown = AITaskUtils.generateTaskBreakdown(task);
    const actionableItems = AITaskUtils.generateActionableItems(task, 2);

    return {
      breakdown,
      actionableItems,
      estimatedTime: breakdown.estimatedTime,
      stepCount: breakdown.steps.length
    };
  }

  static createAIServiceMock() {
    return {
      generateAIResponse: jest.fn().mockImplementation((prompt: string) => {
        return Promise.resolve({
          response: `Mock AI response for: ${prompt}`,
          confidence: 0.9,
          timestamp: new Date()
        });
      }),
      analyzeTaskComplexity: jest.fn().mockImplementation((task: Task) => {
        return Promise.resolve({
          complexityScore: task.description?.length > 50 ? 75 : 40,
          complexityLevel: task.description?.length > 50 ? 'high' : 'medium'
        });
      }),
      generateTaskSuggestions: jest.fn().mockImplementation((taskId: string, taskTitle: string) => {
        return Promise.resolve([
          `Suggestion 1 for ${taskTitle}`,
          `Suggestion 2 for ${taskTitle}`,
          `Suggestion 3 for ${taskTitle}`
        ]);
      }),
      generateTaskBreakdown: jest.fn().mockImplementation((task: Task) => {
        return Promise.resolve({
          steps: ['Step 1', 'Step 2', 'Step 3'],
          estimatedTime: '2-3 hours',
          dependencies: ['Dependency 1'],
          resources: ['Resource 1']
        });
      })
    };
  }

  static createAITaskServiceMock() {
    return {
      analyzeTask: jest.fn().mockImplementation((task: Task) => {
        return Promise.resolve({
          taskId: task.id,
          complexityScore: 65,
          complexityLevel: 'medium',
          suggestedActions: ['Action 1', 'Action 2'],
          estimatedTime: '2-4 hours',
          dependencies: ['Dep 1'],
          resources: ['Res 1'],
          timestamp: new Date()
        });
      }),
      getTaskSuggestions: jest.fn().mockImplementation((taskId: string) => {
        return Promise.resolve([
          { id: 'sug-1', taskId, suggestion: 'Suggestion 1', priority: 'high', createdAt: new Date() },
          { id: 'sug-2', taskId, suggestion: 'Suggestion 2', priority: 'medium', createdAt: new Date() }
        ]);
      }),
      getActionableItems: jest.fn().mockImplementation((taskId: string, taskTitle: string) => {
        return Promise.resolve([
          { id: 'action-1', taskId, title: 'Action 1', description: 'Desc 1', priority: 'high', estimatedTime: '1 hour', category: 'implementation' },
          { id: 'action-2', taskId, title: 'Action 2', description: 'Desc 2', priority: 'medium', estimatedTime: '30 min', category: 'testing' }
        ]);
      }),
      getTaskBreakdown: jest.fn().mockImplementation((taskId: string, taskTitle: string) => {
        return Promise.resolve({
          steps: ['Step 1', 'Step 2'],
          estimatedTime: '1-2 hours',
          dependencies: [],
          resources: ['Basic tools']
        });
      })
    };
  }
}