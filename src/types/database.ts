// @ts-nocheck
import { TodoneDatabase } from "../database/db";
import {
  User,
  Project,
  Section,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
  SyncQueueItem,
  SyncStatus,
} from "../database/models";

export {
  User,
  Project,
  Section,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
  SyncQueueItem,
  SyncStatus,
  TodoneDatabase,
};

// Database error types
export interface DatabaseError {
  type: "database_error";
  message: string;
  code?: string;
  details?: any;
}

export interface MigrationError {
  type: "migration_error";
  message: string;
  version?: number;
  details?: any;
}

export interface SyncError {
  type: "sync_error";
  message: string;
  operation?: string;
  table?: string;
  recordId?: number;
  details?: any;
}

// Query builder types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Transaction types
export interface TransactionOptions {
  mode: "readwrite" | "readonly";
  tables?: string[];
  timeout?: number;
}

// Index management types
export interface IndexDefinition {
  name: string;
  keyPath: string;
  options?: {
    unique: boolean;
    multiEntry: boolean;
  };
}

// Database utility types
export interface DatabaseHealthCheck {
  isHealthy: boolean;
  lastError?: string;
  lastChecked: Date;
  storageUsage: number;
  storageQuota: number;
}
