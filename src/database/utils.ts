import { TodoneDatabase } from './db';
import { DatabaseError, QueryOptions, QueryResult, TransactionOptions } from '../types/database';

export class DatabaseUtils {
  private db: TodoneDatabase;

  constructor(db: TodoneDatabase) {
    this.db = db;
  }

  // Error handling utilities
  static handleDatabaseError(error: unknown): DatabaseError {
    if (error instanceof Error) {
      return {
        type: 'database_error',
        message: error.message,
        code: error.name,
        details: error.stack
      };
    }

    return {
      type: 'database_error',
      message: 'Unknown database error',
      details: error
    };
  }

  // Transaction management
  async withTransaction<T>(options: TransactionOptions, callback: () => Promise<T>): Promise<T> {
    try {
      return await this.db.transaction(options.mode, this.getTablesForTransaction(options), callback);
    } catch (error) {
      const dbError = DatabaseUtils.handleDatabaseError(error);
      console.error('Transaction failed:', dbError);
      throw dbError;
    }
  }

  private getTablesForTransaction(options: TransactionOptions): any[] {
    if (!options.tables || options.tables.length === 0) {
      // Return all tables if none specified
      return [
        this.db.users,
        this.db.projects,
        this.db.sections,
        this.db.tasks,
        this.db.labels,
        this.db.filters,
        this.db.comments,
        this.db.attachments
      ];
    }

    // Return only the specified tables
    return options.tables.map(tableName => {
      switch (tableName.toLowerCase()) {
        case 'users': return this.db.users;
        case 'projects': return this.db.projects;
        case 'sections': return this.db.sections;
        case 'tasks': return this.db.tasks;
        case 'labels': return this.db.labels;
        case 'filters': return this.db.filters;
        case 'comments': return this.db.comments;
        case 'attachments': return this.db.attachments;
        default: throw new Error(`Unknown table: ${tableName}`);
      }
    });
  }

  // Query builders
  async query<T>(tableName: string, options: QueryOptions = {}): Promise<QueryResult<T>> {
    const table = this.getTable(tableName);
    let query = table;

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.filter((item: any) => {
          if (value === null || value === undefined) {
            return item[key] === null || item[key] === undefined;
          }
          return item[key] === value;
        });
      }
    }

    // Apply sorting
    if (options.sortBy) {
      const sortDirection = options.sortDirection || 'asc';
      query = query.sortBy(options.sortBy);
    }

    // Get total count before applying limit/offset
    const total = await query.count();

    // Apply limit and offset
    if (options.offset) {
      query = query.offset(options.offset);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const data = await query.toArray();

    return {
      data,
      total,
      limit: options.limit || total,
      offset: options.offset || 0
    };
  }

  private getTable(tableName: string): any {
    switch (tableName.toLowerCase()) {
      case 'users': return this.db.users;
      case 'projects': return this.db.projects;
      case 'sections': return this.db.sections;
      case 'tasks': return this.db.tasks;
      case 'labels': return this.db.labels;
      case 'filters': return this.db.filters;
      case 'comments': return this.db.comments;
      case 'attachments': return this.db.attachments;
      default: throw new Error(`Unknown table: ${tableName}`);
    }
  }

  // Index management
  async getIndexInfo(tableName: string): Promise<IndexDefinition[]> {
    const table = this.getTable(tableName);
    const schema = this.db._dbSchema;

    if (!schema[tableName]) {
      throw new Error(`Table ${tableName} not found in schema`);
    }

    return schema[tableName].indexes.map((index: any) => ({
      name: index.name,
      keyPath: index.keyPath,
      options: {
        unique: index.unique,
        multiEntry: index.multiEntry
      }
    }));
  }

  async createIndex(tableName: string, indexDefinition: IndexDefinition): Promise<void> {
    // Note: In Dexie, indexes are defined in the schema and cannot be added dynamically
    // This method is a placeholder for potential future implementation
    console.warn('Dexie does not support dynamic index creation. Indexes must be defined in the schema.');
  }

  // Database health check
  async checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
    try {
      // Check if database is open
      const isOpen = this.db.isOpen();

      // Get storage information
      const storageInfo = await this.getStorageInfo();

      return {
        isHealthy: isOpen,
        lastChecked: new Date(),
        storageUsage: storageInfo.usage || 0,
        storageQuota: storageInfo.quota || 0
      };
    } catch (error) {
      const dbError = DatabaseUtils.handleDatabaseError(error);
      return {
        isHealthy: false,
        lastError: dbError.message,
        lastChecked: new Date(),
        storageUsage: 0,
        storageQuota: 0
      };
    }
  }

  private async getStorageInfo(): Promise<{ usage: number; quota: number }> {
    // This is a simplified implementation
    // In a real app, you would use navigator.storage.estimate() or similar
    return {
      usage: 1024 * 1024, // 1MB (simulated)
      quota: 50 * 1024 * 1024 // 50MB (simulated)
    };
  }

  // Data validation
  async validateDataBeforeInsert(tableName: string, data: any): Promise<boolean> {
    // Basic validation - can be extended per table
    if (!data) {
      throw new Error('Data cannot be null or undefined');
    }

    // Table-specific validation
    switch (tableName.toLowerCase()) {
      case 'users':
        if (!data.email) {
          throw new Error('User email is required');
        }
        break;

      case 'tasks':
        if (!data.content) {
          throw new Error('Task content is required');
        }
        break;

      // Add more table-specific validations as needed
    }

    return true;
  }
}