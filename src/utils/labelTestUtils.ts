import { Label } from '../types/models';
import { LabelModel } from '../types/models';

/**
 * Label Test Utilities
 * Helper functions for testing label functionality
 */
export class LabelTestUtils {
  /**
   * Generate mock label data
   * @param overrides - Partial label data to override defaults
   * @returns Mock label object
   */
  static generateMockLabel(overrides: Partial<Label> = {}): Label {
    return new LabelModel({
      name: 'Test Label',
      color: '#10B981',
      isPersonal: false,
      ...overrides
    });
  }

  /**
   * Generate array of mock labels
   * @param count - Number of labels to generate
   * @returns Array of mock labels
   */
  static generateMockLabels(count: number = 5): Label[] {
    const labels: Label[] = [];
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const names = ['Urgent', 'Work', 'Personal', 'Important', 'Review', 'Bug'];

    for (let i = 0; i < count; i++) {
      labels.push(new LabelModel({
        id: `label-${i + 1}`,
        name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
        color: colors[i % colors.length],
        isPersonal: i % 2 === 0,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24), // Each label created a day apart
        updatedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24)
      }));
    }

    return labels;
  }

  /**
   * Create mock label service
   * @returns Mock label service with test data
   */
  static createMockLabelService() {
    return {
      labels: this.generateMockLabels(10),
      getAllLabels: async () => ({
        success: true,
        data: this.generateMockLabels(10)
      }),
      getLabelById: async (id: string) => {
        const label = this.generateMockLabels(10).find(l => l.id === id);
        return {
          success: true,
          data: label || null
        };
      },
      createLabel: async (labelData: Partial<Label>) => {
        const newLabel = this.generateMockLabel(labelData);
        return {
          success: true,
          data: newLabel
        };
      },
      updateLabel: async (id: string, labelData: Partial<Label>) => {
        const updatedLabel = this.generateMockLabel({
          ...labelData,
          id
        });
        return {
          success: true,
          data: updatedLabel
        };
      },
      deleteLabel: async (id: string) => ({
        success: true,
        data: true
      }),
      searchLabels: async (query: string) => {
        const allLabels = this.generateMockLabels(10);
        const results = allLabels.filter(label =>
          label.name.toLowerCase().includes(query.toLowerCase())
        );
        return {
          success: true,
          data: results
        };
      },
      getPersonalLabels: async () => {
        const allLabels = this.generateMockLabels(10);
        const personalLabels = allLabels.filter(label => label.isPersonal);
        return {
          success: true,
          data: personalLabels
        };
      },
      getSharedLabels: async () => {
        const allLabels = this.generateMockLabels(10);
        const sharedLabels = allLabels.filter(label => !label.isPersonal);
        return {
          success: true,
          data: sharedLabels
        };
      }
    };
  }

  /**
   * Generate label test scenarios
   * @returns Array of test scenarios with input and expected output
   */
  static generateLabelTestScenarios() {
    return [
      {
        name: 'Personal label creation',
        input: {
          isPersonal: true
        },
        expected: {
          shouldBePersonal: true
        }
      },
      {
        name: 'Shared label creation',
        input: {
          isPersonal: false
        },
        expected: {
          shouldBePersonal: false
        }
      },
      {
        name: 'Label with custom color',
        input: {
          color: '#FF00FF'
        },
        expected: {
          shouldHaveColor: '#FF00FF'
        }
      }
    ];
  }

  /**
   * Validate label data
   * @param label - Label to validate
   * @returns Validation result
   */
  static validateLabelData(label: Label): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!label.name || label.name.trim() === '') {
      errors.push('Label name is required');
    }

    if (label.name && label.name.length > 50) {
      errors.push('Label name exceeds maximum length of 50 characters');
    }

    if (!label.color || !label.color.startsWith('#')) {
      errors.push('Label color must be a valid hex color');
    }

    if (typeof label.isPersonal !== 'boolean') {
      errors.push('Label must specify if it is personal or shared');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test label assignment to tasks
   * @param label - Label to test
   * @param taskIds - Array of task IDs to assign
   * @returns Test result
   */
  static testLabelAssignment(label: Label, taskIds: string[]): { success: boolean; message: string } {
    if (!taskIds || !Array.isArray(taskIds)) {
      return {
        success: false,
        message: 'Task IDs must be provided as an array'
      };
    }

    if (taskIds.length === 0) {
      return {
        success: false,
        message: 'No task IDs provided for assignment'
      };
    }

    return {
      success: true,
      message: `Successfully assigned label "${label.name}" to ${taskIds.length} tasks`
    };
  }
}