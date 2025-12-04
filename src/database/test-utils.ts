import { TodoneDatabase } from './db';
import { User, Project, Task, Label, Section } from './models';

export class DatabaseTestUtils {
  private db: TodoneDatabase;

  constructor(db: TodoneDatabase) {
    this.db = db;
  }

  async initializeTestDatabase(): Promise<void> {
    // Close existing database if open
    if (this.db.isOpen()) {
      await this.db.close();
    }

    // Delete existing database
    await this.db.delete();

    // Reinitialize with test data
    await this.db.initialize();
  }

  async seedTestData(): Promise<void> {
    // Create test user
    const user: User = {
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      settings: {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      preferences: {
        defaultView: 'list',
        taskSorting: 'dueDate'
      },
      karmaStats: {
        completedTasks: 5,
        streakDays: 3,
        totalPoints: 150,
        level: 2
      }
    };

    const userId = await this.db.users.add(user);

    // Create test projects
    const project1: Project = {
      name: 'Work Project',
      color: '#4285F4',
      viewType: 'list',
      favorite: true,
      shared: false
    };

    const project2: Project = {
      name: 'Personal Project',
      color: '#34A853',
      viewType: 'board',
      favorite: false,
      shared: true
    };

    const [project1Id, project2Id] = await this.db.projects.bulkAdd([project1, project2]);

    // Create test sections
    const section1: Section = {
      name: 'Todo',
      projectId: project1Id,
      order: 1
    };

    const section2: Section = {
      name: 'In Progress',
      projectId: project1Id,
      order: 2
    };

    await this.db.sections.bulkAdd([section1, section2]);

    // Create test tasks
    const task1: Task = {
      content: 'Complete project documentation',
      description: 'Write comprehensive documentation for the project',
      projectId: project1Id,
      sectionId: section1.id!,
      priority: 'high',
      labels: ['documentation', 'important'],
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      completed: false,
      createdDate: new Date(),
      order: 1
    };

    const task2: Task = {
      content: 'Review code changes',
      description: 'Review recent code changes and provide feedback',
      projectId: project1Id,
      sectionId: section2.id!,
      priority: 'medium',
      labels: ['code', 'review'],
      completed: false,
      createdDate: new Date(),
      order: 2
    };

    await this.db.tasks.bulkAdd([task1, task2]);

    // Create test labels
    const label1: Label = {
      name: 'Important',
      color: '#EA4335',
      isPersonal: false
    };

    const label2: Label = {
      name: 'Work',
      color: '#4285F4',
      isPersonal: true
    };

    await this.db.labels.bulkAdd([label1, label2]);
  }

  async clearTestData(): Promise<void> {
    // Clear all data from all tables
    await this.db.users.clear();
    await this.db.projects.clear();
    await this.db.sections.clear();
    await this.db.tasks.clear();
    await this.db.labels.clear();
    await this.db.filters.clear();
    await this.db.comments.clear();
    await this.db.attachments.clear();
  }

  async verifyDatabaseStructure(): Promise<boolean> {
    try {
      // Check if all tables exist and are accessible
      const tables = [
        this.db.users,
        this.db.projects,
        this.db.sections,
        this.db.tasks,
        this.db.labels,
        this.db.filters,
        this.db.comments,
        this.db.attachments
      ];

      for (const table of tables) {
        const count = await table.count();
        if (typeof count !== 'number') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Database structure verification failed:', error);
      return false;
    }
  }

  async createTestSnapshot(): Promise<any> {
    // Create a snapshot of current database state for comparison
    return {
      users: await this.db.users.toArray(),
      projects: await this.db.projects.toArray(),
      sections: await this.db.sections.toArray(),
      tasks: await this.db.tasks.toArray(),
      labels: await this.db.labels.toArray(),
      filters: await this.db.filters.toArray(),
      comments: await this.db.comments.toArray(),
      attachments: await this.db.attachments.toArray()
    };
  }

  async compareSnapshots(snapshot1: any, snapshot2: any): Promise<boolean> {
    // Compare two database snapshots
    const tables = ['users', 'projects', 'sections', 'tasks', 'labels', 'filters', 'comments', 'attachments'];

    for (const table of tables) {
      const data1 = snapshot1[table];
      const data2 = snapshot2[table];

      if (data1.length !== data2.length) {
        return false;
      }

      // Simple comparison - can be enhanced for more complex scenarios
      for (let i = 0; i < data1.length; i++) {
        if (JSON.stringify(data1[i]) !== JSON.stringify(data2[i])) {
          return false;
        }
      }
    }

    return true;
  }

  // Test helper methods
  static async createTestDatabase(): Promise<TodoneDatabase> {
    const db = new TodoneDatabase();
    await db.initialize();
    return db;
  }

  static async cleanupTestDatabase(db: TodoneDatabase): Promise<void> {
    if (db.isOpen()) {
      await db.close();
    }
    await db.delete();
  }
}