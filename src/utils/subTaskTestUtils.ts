import { Task } from '../types/task';
import { faker } from '@faker-js/faker';

/**
 * Sub-task test utilities for generating test data and mocks
 */

/**
 * Generate a fake sub-task for testing
 */
export const generateFakeSubTask = (overrides: Partial<Task> = {}): Task => {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.sentences(2),
    status: faker.helpers.arrayElement(['todo', 'in-progress', 'completed', 'archived']),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
    dueDate: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    completed: faker.datatype.boolean(),
    parentTaskId: overrides.parentTaskId || faker.string.uuid(),
    projectId: overrides.projectId || faker.string.uuid(),
    order: overrides.order || faker.datatype.number({ min: 0, max: 100 }),
    ...overrides
  };
};

/**
 * Generate multiple fake sub-tasks for testing
 */
export const generateFakeSubTasks = (count: number = 5, parentTaskId: string): Task[] => {
  return Array.from({ length: count }, () => generateFakeSubTask({ parentTaskId }));
};

/**
 * Generate a task hierarchy for testing
 */
export const generateTaskHierarchy = (depth: number = 3, childrenPerNode: number = 2): Task => {
  const generateHierarchyNode = (currentDepth: number, parentId: string | null = null): Task => {
    const task: Task = {
      id: faker.string.uuid(),
      title: `Task ${currentDepth}${parentId ? ` (child of ${parentId.substring(0, 8)})` : ''}`,
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['todo', 'in-progress', 'completed']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      dueDate: faker.date.future(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      completed: currentDepth === depth, // Leaf nodes are completed
      parentTaskId: parentId || undefined,
      projectId: faker.string.uuid(),
      order: faker.datatype.number({ min: 0, max: 10 })
    };

    if (currentDepth < depth) {
      task.children = Array.from({ length: childrenPerNode }, () =>
        generateHierarchyNode(currentDepth + 1, task.id)
      );
    }

    return task;
  };

  return generateHierarchyNode(1);
};

/**
 * Generate mock sub-task service
 */
export const createMockSubTaskService = () => {
  const mockSubTasks: Task[] = [];

  return {
    getSubTasks: async (parentTaskId: string): Promise<Task[]> => {
      return mockSubTasks.filter(task => task.parentTaskId === parentTaskId);
    },

    createSubTask: async (subTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> => {
      const newSubTask: Task = {
        ...subTaskData,
        id: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false
      };
      mockSubTasks.push(newSubTask);
      return newSubTask;
    },

    updateSubTask: async (subTaskId: string, updates: Partial<Task>): Promise<Task> => {
      const index = mockSubTasks.findIndex(task => task.id === subTaskId);
      if (index === -1) {
        throw new Error('Sub-task not found');
      }

      const updatedSubTask = {
        ...mockSubTasks[index],
        ...updates,
        updatedAt: new Date()
      };

      mockSubTasks[index] = updatedSubTask;
      return updatedSubTask;
    },

    deleteSubTask: async (subTaskId: string): Promise<void> => {
      const index = mockSubTasks.findIndex(task => task.id === subTaskId);
      if (index === -1) {
        throw new Error('Sub-task not found');
      }
      mockSubTasks.splice(index, 1);
    },

    toggleSubTaskCompletion: async (subTaskId: string): Promise<Task> => {
      const index = mockSubTasks.findIndex(task => task.id === subTaskId);
      if (index === -1) {
        throw new Error('Sub-task not found');
      }

      const updatedSubTask = {
        ...mockSubTasks[index],
        completed: !mockSubTasks[index].completed,
        status: !mockSubTasks[index].completed ? 'completed' : 'todo',
        updatedAt: new Date(),
        completedAt: !mockSubTasks[index].completed ? new Date() : null
      };

      mockSubTasks[index] = updatedSubTask;
      return updatedSubTask;
    },

    getTaskCompletionPercentage: async (taskId: string): Promise<number> => {
      const subTasks = mockSubTasks.filter(task => task.parentTaskId === taskId);
      if (subTasks.length === 0) return 0;

      const completedCount = subTasks.filter(task => task.completed).length;
      return Math.round((completedCount / subTasks.length) * 100);
    },

    // Add test sub-tasks
    addTestSubTasks: (subTasks: Task[]) => {
      mockSubTasks.push(...subTasks);
    },

    // Clear all sub-tasks
    clearSubTasks: () => {
      mockSubTasks.length = 0;
    }
  };
};

/**
 * Generate mock task hierarchy service
 */
export const createMockTaskHierarchyService = () => {
  const mockTasks: Task[] = [];

  return {
    getSubTasks: async (parentTaskId: string): Promise<Task[]> => {
      return mockTasks.filter(task => task.parentTaskId === parentTaskId);
    },

    getTaskHierarchyTree: async (parentTaskId: string): Promise<Task[]> => {
      const buildHierarchy = (taskId: string): Task[] => {
        const children = mockTasks.filter(task => task.parentTaskId === taskId);
        return children.map(child => ({
          ...child,
          children: buildHierarchy(child.id)
        }));
      };

      return buildHierarchy(parentTaskId);
    },

    getFlatHierarchy: async (parentTaskId: string): Promise<Task[]> => {
      const hierarchy: Task[] = [];
      const collectHierarchy = (taskId: string) => {
        const task = mockTasks.find(t => t.id === taskId);
        if (task) {
          hierarchy.push(task);
          const children = mockTasks.filter(t => t.parentTaskId === taskId);
          children.forEach(child => collectHierarchy(child.id));
        }
      };

      collectHierarchy(parentTaskId);
      return hierarchy;
    },

    // Add test tasks
    addTestTasks: (tasks: Task[]) => {
      mockTasks.push(...tasks);
    },

    // Clear all tasks
    clearTasks: () => {
      mockTasks.length = 0;
    }
  };
};

/**
 * Create test task with sub-tasks
 */
export const createTestTaskWithSubTasks = (): Task => {
  const parentTask: Task = {
    id: faker.string.uuid(),
    title: 'Parent Task',
    description: 'This is a parent task with sub-tasks',
    status: 'in-progress',
    priority: 'high',
    dueDate: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    completed: false,
    projectId: faker.string.uuid(),
    order: 0
  };

  const subTasks: Task[] = [
    {
      id: faker.string.uuid(),
      title: 'Sub-task 1',
      description: 'First sub-task',
      status: 'todo',
      priority: 'medium',
      dueDate: faker.date.future(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      completed: false,
      parentTaskId: parentTask.id,
      projectId: parentTask.projectId,
      order: 1
    },
    {
      id: faker.string.uuid(),
      title: 'Sub-task 2',
      description: 'Second sub-task',
      status: 'completed',
      priority: 'low',
      dueDate: faker.date.future(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      completed: true,
      parentTaskId: parentTask.id,
      projectId: parentTask.projectId,
      order: 2
    }
  ];

  return {
    ...parentTask,
    children: subTasks
  };
};

/**
 * Generate sub-task test scenarios
 */
export const generateSubTaskTestScenarios = () => {
  return {
    emptySubTasks: {
      parentTaskId: faker.string.uuid(),
      subTasks: []
    },

    singleSubTask: {
      parentTaskId: faker.string.uuid(),
      subTasks: [generateFakeSubTask({ parentTaskId: faker.string.uuid() })]
    },

    multipleSubTasks: {
      parentTaskId: faker.string.uuid(),
      subTasks: generateFakeSubTasks(5, faker.string.uuid())
    },

    completedSubTasks: {
      parentTaskId: faker.string.uuid(),
      subTasks: generateFakeSubTasks(3, faker.string.uuid()).map(task => ({
        ...task,
        completed: true,
        status: 'completed'
      }))
    },

    mixedCompletionSubTasks: {
      parentTaskId: faker.string.uuid(),
      subTasks: generateFakeSubTasks(4, faker.string.uuid()).map((task, index) => ({
        ...task,
        completed: index % 2 === 0 // Every other task is completed
      }))
    }
  };
};