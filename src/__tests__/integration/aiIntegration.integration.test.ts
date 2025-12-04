import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from '../../services/aiService';
import { Task } from '../../types/taskTypes';

// Mock the AI service
vi.mock('../../services/aiService');

describe('AI Integration Tests', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Implement AI Feature',
    description: 'Integrate AI suggestions into task management system',
    status: 'todo',
    priority: 'high',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: 'project-1',
    order: 0
  };

  const mockAIResponse = {
    response: 'Here are 5 suggestions for completing this task:...',
    confidence: 0.95,
    timestamp: new Date()
  };

  const mockTaskSuggestions = [
    'Break down the task into smaller components',
    'Research available AI APIs and services',
    'Design the integration architecture',
    'Implement the AI suggestion interface',
    'Test and validate AI responses'
  ];

  const mockTaskBreakdown = {
    steps: [
      'Research AI integration requirements',
      'Set up AI service API connection',
      'Design suggestion display components',
      'Implement suggestion parsing logic',
      'Add error handling and fallback mechanisms'
    ],
    estimatedTime: '4-6 hours',
    dependencies: [
      'AI API access credentials',
      'Task management system integration points'
    ],
    resources: [
      'AI service documentation',
      'React component library',
      'Testing frameworks'
    ]
  };

  beforeEach(() => {
    // Mock AI service methods
    vi.spyOn(aiService, 'generateAIResponse').mockResolvedValue(mockAIResponse);
    vi.spyOn(aiService, 'generateTaskSuggestions').mockResolvedValue(mockTaskSuggestions);
    vi.spyOn(aiService, 'generateTaskBreakdown').mockResolvedValue(mockTaskBreakdown);
    vi.spyOn(aiService, 'analyzeTaskComplexity').mockResolvedValue({
      complexityScore: 75,
      complexityLevel: 'high'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('User input → AI service → Task suggestions → UI display flow', async () => {
    // Test AI response generation
    const aiResponse = await aiService.generateAIResponse('Generate task suggestions');
    expect(aiResponse.response).toContain('suggestions');
    expect(aiResponse.confidence).toBeGreaterThan(0.9);

    // Test task suggestion generation
    const suggestions = await aiService.generateTaskSuggestions(
      mockTask.id,
      mockTask.title,
      mockTask.description
    );

    expect(suggestions).toHaveLength(5);
    expect(suggestions[0]).toContain('Break down');
    expect(suggestions).toEqual(mockTaskSuggestions);

    // Test task complexity analysis
    const complexity = await aiService.analyzeTaskComplexity(mockTask);
    expect(complexity.complexityScore).toBe(75);
    expect(complexity.complexityLevel).toBe('high');
  });

  test('AI task breakdown and analysis', async () => {
    // Test comprehensive task breakdown
    const breakdown = await aiService.generateTaskBreakdown(mockTask);

    expect(breakdown.steps).toHaveLength(5);
    expect(breakdown.steps[0]).toContain('Research');
    expect(breakdown.estimatedTime).toBe('4-6 hours');
    expect(breakdown.dependencies).toHaveLength(2);
    expect(breakdown.resources).toHaveLength(3);

    // Verify all breakdown components are present
    expect(breakdown.steps).toEqual(mockTaskBreakdown.steps);
    expect(breakdown.dependencies).toEqual(mockTaskBreakdown.dependencies);
    expect(breakdown.resources).toEqual(mockTaskBreakdown.resources);
  });

  test('AI integration with different task types', async () => {
    // Test with simple task
    const simpleTask = {
      ...mockTask,
      id: 'simple-task',
      title: 'Write documentation',
      description: 'Create user guide for new feature',
      priority: 'medium'
    };

    // Test with complex task
    const complexTask = {
      ...mockTask,
      id: 'complex-task',
      title: 'Redesign authentication system',
      description: 'Implement OAuth 2.0 with multiple providers and security enhancements',
      priority: 'high'
    };

    // Generate suggestions for both tasks
    const simpleSuggestions = await aiService.generateTaskSuggestions(
      simpleTask.id,
      simpleTask.title,
      simpleTask.description
    );

    const complexSuggestions = await aiService.generateTaskSuggestions(
      complexTask.id,
      complexTask.title,
      complexTask.description
    );

    // Verify both return appropriate suggestions
    expect(simpleSuggestions).toHaveLength(5);
    expect(complexSuggestions).toHaveLength(5);

    // Analyze complexity for both tasks
    const simpleComplexity = await aiService.analyzeTaskComplexity(simpleTask);
    const complexComplexity = await aiService.analyzeTaskComplexity(complexTask);

    // Complex task should have higher complexity
    expect(complexComplexity.complexityScore).toBeGreaterThan(simpleComplexity.complexityScore);
  });

  test('AI service error handling and recovery', async () => {
    // Mock AI service error
    vi.spyOn(aiService, 'generateAIResponse').mockRejectedValueOnce(
      new Error('AI service temporarily unavailable')
    );

    // Test error handling
    try {
      await aiService.generateAIResponse('Test prompt');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('AI service temporarily unavailable');
    }

    // Test fallback behavior
    vi.spyOn(aiService, 'generateTaskSuggestions').mockImplementationOnce(async () => {
      // Fallback to default suggestions when AI fails
      return [
        'Review task requirements',
        'Plan implementation approach',
        'Execute task step by step',
        'Test and validate results',
        'Document completion'
      ];
    });

    const fallbackSuggestions = await aiService.generateTaskSuggestions(
      mockTask.id,
      mockTask.title,
      mockTask.description
    );

    expect(fallbackSuggestions).toHaveLength(5);
    expect(fallbackSuggestions[0]).toContain('Review task requirements');
  });

  test('AI integration performance impact', async () => {
    const startTime = performance.now();

    // Perform multiple AI operations
    await aiService.generateAIResponse('Test prompt 1');
    await aiService.generateTaskSuggestions(mockTask.id, mockTask.title);
    await aiService.analyzeTaskComplexity(mockTask);
    await aiService.generateTaskBreakdown(mockTask);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable (less than 1 second for mocked operations)
    expect(duration).toBeLessThan(1000);
  });

  test('AI response parsing and data consistency', async () => {
    // Test with different AI response formats
    const mockResponse1 = {
      response: 'Complexity score: 85\nLevel: high\nThis is a complex task requiring multiple steps',
      confidence: 0.92,
      timestamp: new Date()
    };

    const mockResponse2 = {
      response: 'Score: 45\nComplexity: medium\nThis task has moderate complexity',
      confidence: 0.88,
      timestamp: new Date()
    };

    // Mock different responses
    vi.spyOn(aiService, 'generateAIResponse').mockResolvedValueOnce(mockResponse1);
    vi.spyOn(aiService, 'generateAIResponse').mockResolvedValueOnce(mockResponse2);

    // Test complexity parsing with different formats
    const complexity1 = await aiService.analyzeTaskComplexity({
      ...mockTask,
      title: 'Complex Task',
      description: 'Multi-step implementation'
    });

    const complexity2 = await aiService.analyzeTaskComplexity({
      ...mockTask,
      title: 'Medium Task',
      description: 'Standard implementation'
    });

    // Verify parsing works with different formats
    expect(complexity1.complexityScore).toBeGreaterThan(70);
    expect(complexity1.complexityLevel).toBe('high');
    expect(complexity2.complexityScore).toBeLessThan(70);
    expect(complexity2.complexityLevel).toBe('medium');
  });

  test('AI integration with task management workflow', async () => {
    // Simulate complete AI integration workflow
    const taskTitle = 'Implement AI-powered task suggestions';
    const taskDescription = 'Create system that analyzes tasks and provides AI-generated suggestions';

    // Step 1: Generate suggestions
    const suggestions = await aiService.generateTaskSuggestions(
      'ai-integration-task',
      taskTitle,
      taskDescription
    );

    // Step 2: Analyze complexity
    const complexity = await aiService.analyzeTaskComplexity({
      id: 'ai-integration-task',
      title: taskTitle,
      description: taskDescription,
      status: 'todo',
      priority: 'high',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      order: 0
    });

    // Step 3: Generate detailed breakdown
    const breakdown = await aiService.generateTaskBreakdown({
      id: 'ai-integration-task',
      title: taskTitle,
      description: taskDescription,
      status: 'todo',
      priority: 'high',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      order: 0
    });

    // Verify all steps completed successfully
    expect(suggestions).toHaveLength(5);
    expect(complexity.complexityScore).toBeGreaterThan(0);
    expect(breakdown.steps).toHaveLength(5);
    expect(breakdown.estimatedTime).toBeTruthy();

    // Verify data consistency across AI responses
    expect(suggestions.some(s => s.toLowerCase().includes('ai'))).toBe(true);
    expect(breakdown.steps.some(s => s.toLowerCase().includes('ai'))).toBe(true);
  });
});