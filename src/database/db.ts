import Dexie, { Table } from "dexie";
import {
  User,
  Project,
  Section,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
} from "./models";
import { migrations } from "./migrations";

export class TodoneDatabase extends Dexie {
  users!: Table<User>;
  projects!: Table<Project>;
  sections!: Table<Section>;
  tasks!: Table<Task>;
  labels!: Table<Label>;
  filters!: Table<Filter>;
  comments!: Table<Comment>;
  attachments!: Table<Attachment>;

  constructor() {
    super("TodoneDatabase");
    this.version(3).stores({
      users: "++id,email,name",
      projects: "++id,name,color,viewType,favorite,shared,parentProjectId",
      sections: "++id,name,projectId,order",
      tasks:
        "++id,content,projectId,sectionId,priority,dueDate,completed,createdDate,parentTaskId,order",
      labels: "++id,name,color,isPersonal",
      filters: "++id,name,favorite",
      comments: "++id,taskId,timestamp",
      attachments: "++id,fileName,url,type",
    });

    // Apply migrations
    this.on("ready", () => {
      this.applyMigrations();
    });

    this.on("versionchange", (event) => {
      console.log("Database version change detected:", event);
    });

    this.on("blocked", () => {
      console.warn("Database is blocked by another connection");
    });
  }

  private async applyMigrations(): Promise<void> {
    try {
      const currentVersion = await this.getDatabaseVersion();
      console.log("Current database version:", currentVersion);

      for (const migration of migrations) {
        if (migration.version > currentVersion) {
          console.log(`Applying migration version ${migration.version}`);
          await migration.up(this);
        }
      }
    } catch (error) {
      console.error("Error applying migrations:", error);
    }
  }

  private async getDatabaseVersion(): Promise<number> {
    return this.vernum;
  }

  async initialize(): Promise<void> {
    try {
      await this.open();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.close();
      console.log("Database closed successfully");
    } catch (error) {
      console.error("Error closing database:", error);
      throw error;
    }
  }

  async transaction<T>(
    name: string,
    mode: "readwrite" | "readonly",
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.transaction(
      mode,
      [
        this.users,
        this.projects,
        this.sections,
        this.tasks,
        this.labels,
        this.filters,
        this.comments,
        this.attachments,
      ],
      callback,
    );
  }
}
