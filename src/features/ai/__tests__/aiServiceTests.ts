import { AIService } from '../../../services/aiService';
import { AITaskService } from '../../../services/aiTaskService';
import { AITestUtils } from './aiTestUtils';
import { Task } from '../../../types/taskTypes';

describe('AI Service Tests', () => {
  let aiService: AIService;
  let aiTaskService: AITaskService;
  let mockTask: Task;

  beforeAll(() => {
    // Initialize services
    aiService = new AIService('test-api-key');
    aiTaskService = new AITaskService();
    mockTask = AITestUtils.createComplexTask();
  });

  describe('AIService Tests', () => {
    it('should be initialized with correct API key', () => {
      expect(aiService).toBeInstanceOf(AIService);
      // Note: We can't test the actual API key due to encapsulation
    });

    it('should have all required methods', () => {
      expect(typeof aiService.generateAIResponse).toBe('function');
      expect(typeof aiService.analyzeTaskComplexity).toBe('function');
      expect(typeof aiService.generateTaskSuggestions).toBe('function');
      expect(typeof aiService.generateTaskBreakdown).toBe('function');
    });
  });

  describe('AITaskService Tests', () => {
    it('should be initialized correctly', () => {
      expect(aiTaskService).toBeInstanceOf(AITaskService);
    });

    it('should have all required methods', () => {
      expect(typeof aiTaskService.analyzeTask).toBe('function');
      expect(typeof aiTaskService.getTaskSuggestions).toBe('function');
      expect(typeof aiTaskService.getActionableItems).toBe('function');
      expect(typeof aiTaskService.getTaskBreakdown).toBe('function');
      expect(typeof aiTaskService.clearCache).toBe('function');
    });
  });

  describe('AI Utility Functions Tests', () => {
    it('should analyze task complexity correctly', () => {
      const simpleTask = AITestUtils.createSimpleTask();
      const complexTask = AITestUtils.createComplexTask();

      const simpleAnalysis = AITestUtils.testAIUtilsWithTask(simpleTask);
      const complexAnalysis = AITestUtils.testAIUtilsWithTask(complexTask);

      expect(simpleAnalysis.complexityLevel).toBeDefined();
      expect(complexAnalysis.complexityLevel).toBeDefined();
      expect(complexAnalysis.complexityScore).toBeGreaterThan(simpleAnalysis.complexityScore);
    });

    it('should generate task suggestions', () => {
      const task = AITestUtils.createMockTask();
      const result = AITestUtils.testAIUtilsWithTask(task);

      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should generate task breakdown', () => {
      const task = AITestUtils.createMockTask();
      const result = AITestUtils.testAITaskUtilsWithTask(task);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.steps).toBeInstanceOf(Array);
      expect(result.breakdown.steps.length).toBeGreaterThan(0);
      expect(result.breakdown.estimatedTime).toBeDefined();
    });

    it('should generate actionable items', () => {
      const task = AITestUtils.createMockTask();
      const result = AITestUtils.testAITaskUtilsWithTask(task);

      expect(result.actionableItems).toBeInstanceOf(Array);
      expect(result.actionableItems.length).toBeGreaterThan(0);
    });
  });

  describe('Mock Service Tests', () => {
    it('should create AI service mock with correct methods', () => {
      const mockAIService = AITestUtils.createAIServiceMock();

      expect(mockAIService.generateAIResponse).toBeDefined();
      expect(mockAIService.analyzeTaskComplexity).toBeDefined();
      expect(mockAIService.generateTaskSuggestions).toBeDefined();
      expect(mockAIService.generateTaskBreakdown).toBeDefined();
    });

    it('should create AI task service mock with correct methods', () => {
      const mockAITaskService = AITestUtils.createAITaskServiceMock();

      expect(mockAITaskService.analyzeTask).toBeDefined();
      expect(mockAITaskService.getTaskSuggestions).toBeDefined();
      expect(mockAITaskService.getActionableItems).toBeDefined();
      expect(mockAITaskService.getTaskBreakdown).toBeDefined();
    });

    it('should generate mock task breakdown', () => {
      const breakdown = AITestUtils.generateMockTaskBreakdown();

      expect(breakdown.steps).toBeInstanceOf(Array);
      expect(breakdown.steps.length).toBeGreaterThan(0);
      expect(breakdown.estimatedTime).toBeDefined();
      expect(breakdown.dependencies).toBeInstanceOf(Array);
      expect(breakdown.resources).toBeInstanceOf(Array);
    });

    it('should generate mock actionable items', () => {
      const items = AITestUtils.generateMockActionableItems(3);

      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBe(3);
      items.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.priority).toBeDefined();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle task analysis flow', async () => {
      const task = AITestUtils.createComplexTask();

      // Test AI utility analysis
      const aiAnalysis = AITestUtils.testAIUtilsWithTask(task);
      expect(aiAnalysis.complexityLevel).toBeDefined();

      // Test task utility breakdown
      const taskBreakdown = AITestUtils.testAITaskUtilsWithTask(task);
      expect(taskBreakdown.breakdown.steps.length).toBeGreaterThan(0);
    });

    it('should generate consistent results for similar tasks', () => {
      const task1 = AITestUtils.createMockTask({ title: 'Development Task' });
      const task2 = AITestUtils.createMockTask({ title: 'Another Development Task' });

      const result1 = AITestUtils.testAIUtilsWithTask(task1);
      const result2 = AITestUtils.testAIUtilsWithTask(task2);

      // Both should generate suggestions since they contain "Development"
      expect(result1.suggestions.length).toBeGreaterThan(0);
      expect(result2.suggestions.length).toBeGreaterThan(0);
    });
  });
});