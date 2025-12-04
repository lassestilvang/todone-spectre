import { Task } from '../types/task';
import { ViewType } from '../types/enums';
import { faker } from '@faker-js/faker';

/**
 * View Test Utilities
 * Test data generators and utilities for view layouts
 */
export class ViewTestUtils {
  /**
   * Generate mock tasks for testing
   */
  static generateMockTasks(count: number = 10): Task[] {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'completed', 'archived'];
    const priorities: Task['priority'][] = ['low', 'medium', 'high', 'critical'];

    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      title: faker.lorem.words({ min: 2, max: 5 }),
      description: faker.lorem.sentences({ min: 1, max: 3 }),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dueDate: faker.date.future(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      projectId: Math.random() > 0.5 ? faker.string.uuid() : undefined,
      completed: Math.random() > 0.7
    }));
  }

  /**
   * Generate tasks with specific dates for calendar testing
   */
  static generateTasksWithSpecificDates(count: number = 7): Task[] {
    const today = new Date();
    const tasks: Task[] = [];

    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      tasks.push({
        id: faker.string.uuid(),
        title: `Task for ${date.toDateString()}`,
        description: faker.lorem.sentence(),
        status: 'todo',
        priority: 'medium',
        dueDate: date,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        projectId: faker.string.uuid(),
        completed: false
      });
    }

    return tasks;
  }

  /**
   * Generate tasks grouped by project for list view testing
   */
  static generateTasksByProject(projectCount: number = 3, tasksPerProject: number = 5): Task[] {
    const tasks: Task[] = [];
    const statuses: Task['status'][] = ['todo', 'in-progress', 'completed'];
    const priorities: Task['priority'][] = ['low', 'medium', 'high'];

    for (let p = 0; p < projectCount; p++) {
      const projectId = faker.string.uuid();

      for (let t = 0; t < tasksPerProject; t++) {
        tasks.push({
          id: faker.string.uuid(),
          title: `Project ${p + 1} Task ${t + 1}`,
          description: faker.lorem.sentence(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: faker.date.future(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          projectId,
          completed: Math.random() > 0.8
        });
      }
    }

    return tasks;
  }

  /**
   * Generate tasks for board view testing with specific status distribution
   */
  static generateTasksForBoardView(): Task[] {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'completed'];
    const priorities: Task['priority'][] = ['low', 'medium', 'high', 'critical'];

    const tasks: Task[] = [];

    // Generate tasks with balanced status distribution
    statuses.forEach(status => {
      for (let i = 0; i < 5; i++) {
        tasks.push({
          id: faker.string.uuid(),
          title: `${status} task ${i + 1}`,
          description: faker.lorem.sentence(),
          status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          dueDate: faker.date.future(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          projectId: faker.string.uuid(),
          completed: status === 'completed'
        });
      }
    });

    return tasks;
  }

  /**
   * Generate view configuration for testing
   */
  static generateViewConfig(viewType: ViewType = ViewType.LIST) {
    switch (viewType) {
      case ViewType.LIST:
        return {
          sortBy: 'dueDate',
          groupBy: 'project',
          showTaskCount: false
        };

      case ViewType.BOARD:
        return {
          columns: ['To Do', 'In Progress', 'Done'],
          showTaskCount: true
        };

      case ViewType.CALENDAR:
        return {
          viewMode: 'week',
          showWeekends: true,
          currentDate: new Date()
        };

      default:
        return {
          sortBy: 'dueDate',
          groupBy: 'project'
        };
    }
  }

  /**
   * Create mock view state for testing
   */
  static createMockViewState() {
    return {
      currentView: ViewType.LIST,
      listViewConfig: {
        sortBy: 'dueDate',
        groupBy: 'project'
      },
      boardViewConfig: {
        columns: ['To Do', 'In Progress', 'Done'],
        showTaskCount: true
      },
      calendarViewConfig: {
        viewMode: 'week',
        showWeekends: true
      }
    };
  }
}