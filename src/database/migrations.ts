import { TodoneDatabase } from './db';
import { User, Task } from './models';

interface Migration {
  version: number;
  up: (db: TodoneDatabase) => Promise<void>;
  down?: (db: TodoneDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      console.log('Running migration v1: Initial schema');
      // Initial schema is already defined in db.ts
      // No additional setup needed for v1
    }
  },
  {
    version: 2,
    up: async (db) => {
      console.log('Running migration v2: Add karma stats to user');

      // Add karma stats to existing users
      const users = await db.users.toArray();
      for (const user of users) {
        if (!user.karmaStats) {
          await db.users.update(user.id!, {
            karmaStats: {
              completedTasks: 0,
              streakDays: 0,
              totalPoints: 0,
              level: 1
            }
          });
        }
      }
    },
    down: async (db) => {
      console.log('Reverting migration v2: Remove karma stats from user');

      const users = await db.users.toArray();
      for (const user of users) {
        if (user.karmaStats) {
          await db.users.update(user.id!, {
            karmaStats: undefined
          });
        }
      }
    }
  },
  {
    version: 3,
    up: async (db) => {
      console.log('Running migration v3: Add recurring pattern to tasks');

      // Add recurring pattern field to existing tasks
      const tasks = await db.tasks.toArray();
      for (const task of tasks) {
        if (!task.recurringPattern) {
          await db.tasks.update(task.id!, {
            recurringPattern: undefined
          });
        }
      }
    },
    down: async (db) => {
      console.log('Reverting migration v3: Remove recurring pattern from tasks');

      const tasks = await db.tasks.toArray();
      for (const task of tasks) {
        if (task.recurringPattern) {
          await db.tasks.update(task.id!, {
            recurringPattern: undefined
          });
        }
      }
    }
  }
];

// Migration strategy for future updates
export async function applyMigrationStrategy(db: TodoneDatabase, targetVersion: number): Promise<void> {
  const currentVersion = db.vernum;

  if (targetVersion === currentVersion) {
    console.log('Already at target version');
    return;
  }

  if (targetVersion > currentVersion) {
    // Upgrade path
    for (let i = currentVersion + 1; i <= targetVersion; i++) {
      const migration = migrations.find(m => m.version === i);
      if (migration) {
        await migration.up(db);
      }
    }
  } else {
    // Downgrade path (if supported)
    for (let i = currentVersion; i > targetVersion; i--) {
      const migration = migrations.find(m => m.version === i);
      if (migration?.down) {
        await migration.down(db);
      }
    }
  }
}