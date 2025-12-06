import { DatabaseUtils } from "../../database/utils";

// Mock TodoneDatabase
const mockDb = {
  users: {
    filter: vi.fn().mockReturnThis(),
    sortBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    count: vi.fn().mockResolvedValue(10),
    toArray: vi.fn().mockResolvedValue([{ id: "user-1", name: "Test User" }]),
    clear: vi.fn().mockResolvedValue(undefined),
  },
  projects: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(5),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "project-1", name: "Test Project" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  sections: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(3),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "section-1", name: "Test Section" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  tasks: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(20),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "task-1", content: "Test Task" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  labels: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(8),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "label-1", name: "Test Label" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  filters: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(2),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "filter-1", name: "Test Filter" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  comments: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(15),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "comment-1", text: "Test Comment" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  attachments: {
    filter: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(4),
    toArray: jest
      .fn()
      .mockResolvedValue([{ id: "attachment-1", name: "Test Attachment" }]),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  transaction: jest
    .fn()
    .mockImplementation((mode, tables, callback) => callback()),
  isOpen: jest.fn().mockReturnValue(true),
  _dbSchema: {
    users: { indexes: [{ name: "email", keyPath: "email", unique: true }] },
    projects: { indexes: [{ name: "userId", keyPath: "userId" }] },
    tasks: { indexes: [{ name: "projectId", keyPath: "projectId" }] },
  },
};

describe("DatabaseUtils", () => {
  let dbUtils: DatabaseUtils;

  beforeEach(() => {
    dbUtils = new DatabaseUtils(mockDb as any);
    vi.clearAllMocks();
  });

  describe("handleDatabaseError", () => {
    it("should handle Error objects correctly", () => {
      const error = new Error("Test database error");
      const result = DatabaseUtils.handleDatabaseError(error);
      expect(result.type).toBe("database_error");
      expect(result.message).toBe("Test database error");
      expect(result.code).toBe("Error");
      expect(result.details).toBe(error.stack);
    });

    it("should handle non-Error objects", () => {
      const result = DatabaseUtils.handleDatabaseError("Unknown error");
      expect(result.type).toBe("database_error");
      expect(result.message).toBe("Unknown database error");
      expect(result.details).toBe("Unknown error");
    });
  });

  describe("withTransaction", () => {
    it("should execute transaction successfully", async () => {
      const testResult = { success: true };
      const callback = vi.fn().mockResolvedValue(testResult);

      const result = await dbUtils.withTransaction(
        { mode: "readwrite", tables: ["users"] },
        callback,
      );

      expect(result).toEqual(testResult);
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it("should handle transaction errors", async () => {
      const error = new Error("Transaction failed");
      const callback = vi.fn().mockRejectedValue(error);

      await expect(
        dbUtils.withTransaction(
          { mode: "readwrite", tables: ["users"] },
          callback,
        ),
      ).rejects.toThrow("Transaction failed");
    });
  });

  describe("getTablesForTransaction", () => {
    it("should return all tables when none specified", () => {
      // @ts-expect-error - testing private method
      const tables = dbUtils.getTablesForTransaction({ mode: "readwrite" });
      expect(tables.length).toBe(8); // All tables
    });

    it("should return only specified tables", () => {
      // @ts-expect-error - testing private method
      const tables = dbUtils.getTablesForTransaction({
        mode: "readwrite",
        tables: ["users", "projects"],
      });
      expect(tables.length).toBe(2);
    });

    it("should throw error for unknown table", () => {
      expect(() => {
        // @ts-expect-error - testing private method
        dbUtils.getTablesForTransaction({
          mode: "readwrite",
          tables: ["unknown-table"],
        });
      }).toThrow("Unknown table: unknown-table");
    });
  });

  describe("query", () => {
    it("should execute basic query", async () => {
      const result = await dbUtils.query("users", {});
      expect(result.data).toEqual([{ id: "user-1", name: "Test User" }]);
      expect(result.total).toBe(10);
    });

    it("should apply filters", async () => {
      await dbUtils.query("users", {
        filters: { name: "Test User" },
      });
      expect(mockDb.users.filter).toHaveBeenCalled();
    });

    it("should apply sorting", async () => {
      await dbUtils.query("users", {
        sortBy: "name",
        sortDirection: "asc",
      });
      expect(mockDb.users.sortBy).toHaveBeenCalledWith("name");
    });

    it("should apply limit and offset", async () => {
      await dbUtils.query("users", {
        limit: 5,
        offset: 10,
      });
      expect(mockDb.users.limit).toHaveBeenCalledWith(5);
      expect(mockDb.users.offset).toHaveBeenCalledWith(10);
    });
  });

  describe("getTable", () => {
    it("should return correct table for valid table names", () => {
      // @ts-expect-error - testing private method
      const usersTable = dbUtils.getTable("users");
      expect(usersTable).toBe(mockDb.users);
    });

    it("should throw error for unknown table", () => {
      expect(() => {
        // @ts-expect-error - testing private method
        dbUtils.getTable("unknown-table");
      }).toThrow("Unknown table: unknown-table");
    });
  });

  describe("getIndexInfo", () => {
    it("should return index information for valid table", async () => {
      const result = await dbUtils.getIndexInfo("users");
      expect(result).toEqual([
        {
          name: "email",
          keyPath: "email",
          options: { unique: true, multiEntry: undefined },
        },
      ]);
    });

    it("should throw error for unknown table", async () => {
      await expect(dbUtils.getIndexInfo("unknown-table")).rejects.toThrow(
        "Table unknown-table not found in schema",
      );
    });
  });

  describe("createIndex", () => {
    it("should warn about dynamic index creation", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      await dbUtils.createIndex("users", {
        name: "test-index",
        keyPath: "test",
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Dexie does not support dynamic index creation. Indexes must be defined in the schema.",
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe("checkDatabaseHealth", () => {
    it("should return healthy status when database is open", async () => {
      const result = await dbUtils.checkDatabaseHealth();
      expect(result.isHealthy).toBe(true);
      expect(result.storageUsage).toBeGreaterThan(0);
      expect(result.storageQuota).toBeGreaterThan(0);
    });
  });

  describe("validateDataBeforeInsert", () => {
    it("should validate user data", async () => {
      const userData = { email: "test@example.com", name: "Test User" };
      const result = await dbUtils.validateDataBeforeInsert("users", userData);
      expect(result).toBe(true);
    });

    it("should throw error for invalid user data", async () => {
      const invalidUserData = { name: "Test User" }; // Missing email
      await expect(
        dbUtils.validateDataBeforeInsert("users", invalidUserData),
      ).rejects.toThrow("User email is required");
    });

    it("should throw error for null data", async () => {
      await expect(
        dbUtils.validateDataBeforeInsert("users", null),
      ).rejects.toThrow("Data cannot be null or undefined");
    });
  });
});
