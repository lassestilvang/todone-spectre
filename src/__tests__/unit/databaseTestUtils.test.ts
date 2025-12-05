import { DatabaseTestUtils } from "../../database/test-utils";

// Mock TodoneDatabase
const mockDb = {
  users: {
    add: vi.fn().mockResolvedValue("user-1"),
    bulkAdd: vi.fn().mockResolvedValue(["user-1", "user-2"]),
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  projects: {
    bulkAdd: vi.fn().mockResolvedValue(["project-1", "project-2"]),
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  sections: {
    bulkAdd: vi.fn().mockResolvedValue(["section-1", "section-2"]),
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  tasks: {
    bulkAdd: vi.fn().mockResolvedValue(["task-1", "task-2"]),
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  labels: {
    bulkAdd: vi.fn().mockResolvedValue(["label-1", "label-2"]),
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  filters: {
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  comments: {
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  attachments: {
    clear: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
  },
  isOpen: vi.fn().mockReturnValue(true),
  close: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  initialize: vi.fn().mockResolvedValue(undefined),
};

describe("DatabaseTestUtils", () => {
  let testUtils: DatabaseTestUtils;

  beforeEach(() => {
    testUtils = new DatabaseTestUtils(mockDb as any);
    jest.clearAllMocks();
  });

  describe("initializeTestDatabase", () => {
    it("should initialize test database", async () => {
      await testUtils.initializeTestDatabase();
      expect(mockDb.close).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.initialize).toHaveBeenCalled();
    });
  });

  describe("seedTestData", () => {
    it("should seed test data successfully", async () => {
      // Mock section creation to return objects with id
      mockDb.sections.bulkAdd.mockResolvedValueOnce([
        { id: "section-1", name: "Todo" },
        { id: "section-2", name: "In Progress" },
      ]);

      await testUtils.seedTestData();

      expect(mockDb.users.add).toHaveBeenCalled();
      expect(mockDb.projects.bulkAdd).toHaveBeenCalled();
      expect(mockDb.sections.bulkAdd).toHaveBeenCalled();
      expect(mockDb.tasks.bulkAdd).toHaveBeenCalled();
      expect(mockDb.labels.bulkAdd).toHaveBeenCalled();
    });
  });

  describe("clearTestData", () => {
    it("should clear all test data", async () => {
      await testUtils.clearTestData();
      expect(mockDb.users.clear).toHaveBeenCalled();
      expect(mockDb.projects.clear).toHaveBeenCalled();
      expect(mockDb.sections.clear).toHaveBeenCalled();
      expect(mockDb.tasks.clear).toHaveBeenCalled();
      expect(mockDb.labels.clear).toHaveBeenCalled();
      expect(mockDb.filters.clear).toHaveBeenCalled();
      expect(mockDb.comments.clear).toHaveBeenCalled();
      expect(mockDb.attachments.clear).toHaveBeenCalled();
    });
  });

  describe("verifyDatabaseStructure", () => {
    it("should verify database structure successfully", async () => {
      // Mock count to return valid numbers
      mockDb.users.count.mockResolvedValueOnce(1);
      mockDb.projects.count.mockResolvedValueOnce(2);
      mockDb.sections.count.mockResolvedValueOnce(3);
      mockDb.tasks.count.mockResolvedValueOnce(4);
      mockDb.labels.count.mockResolvedValueOnce(5);
      mockDb.filters.count.mockResolvedValueOnce(6);
      mockDb.comments.count.mockResolvedValueOnce(7);
      mockDb.attachments.count.mockResolvedValueOnce(8);

      const result = await testUtils.verifyDatabaseStructure();
      expect(result).toBe(true);
    });

    it("should return false when table count fails", async () => {
      // Mock one count to return invalid data
      mockDb.users.count.mockResolvedValueOnce(1);
      mockDb.projects.count.mockResolvedValueOnce(2);
      mockDb.sections.count.mockResolvedValueOnce("invalid"); // Invalid count

      const result = await testUtils.verifyDatabaseStructure();
      expect(result).toBe(false);
    });
  });

  describe("createTestSnapshot", () => {
    it("should create database snapshot", async () => {
      // Mock toArray to return test data
      mockDb.users.toArray.mockResolvedValue([
        { id: "user-1", name: "Test User" },
      ]);
      mockDb.projects.toArray.mockResolvedValue([
        { id: "project-1", name: "Test Project" },
      ]);
      mockDb.sections.toArray.mockResolvedValue([
        { id: "section-1", name: "Test Section" },
      ]);
      mockDb.tasks.toArray.mockResolvedValue([
        { id: "task-1", content: "Test Task" },
      ]);
      mockDb.labels.toArray.mockResolvedValue([
        { id: "label-1", name: "Test Label" },
      ]);
      mockDb.filters.toArray.mockResolvedValue([
        { id: "filter-1", name: "Test Filter" },
      ]);
      mockDb.comments.toArray.mockResolvedValue([
        { id: "comment-1", text: "Test Comment" },
      ]);
      mockDb.attachments.toArray.mockResolvedValue([
        { id: "attachment-1", name: "Test Attachment" },
      ]);

      const snapshot = await testUtils.createTestSnapshot();
      expect(snapshot.users).toEqual([{ id: "user-1", name: "Test User" }]);
      expect(snapshot.projects).toEqual([
        { id: "project-1", name: "Test Project" },
      ]);
    });
  });

  describe("compareSnapshots", () => {
    it("should return true for identical snapshots", async () => {
      const snapshot1 = {
        users: [{ id: "user-1", name: "Test User" }],
        projects: [{ id: "project-1", name: "Test Project" }],
      };

      const snapshot2 = {
        users: [{ id: "user-1", name: "Test User" }],
        projects: [{ id: "project-1", name: "Test Project" }],
      };

      const result = await testUtils.compareSnapshots(snapshot1, snapshot2);
      expect(result).toBe(true);
    });

    it("should return false for different snapshots", async () => {
      const snapshot1 = {
        users: [{ id: "user-1", name: "Test User" }],
        projects: [{ id: "project-1", name: "Test Project" }],
      };

      const snapshot2 = {
        users: [{ id: "user-2", name: "Different User" }],
        projects: [{ id: "project-1", name: "Test Project" }],
      };

      const result = await testUtils.compareSnapshots(snapshot1, snapshot2);
      expect(result).toBe(false);
    });
  });

  describe("static methods", () => {
    it("should create test database", async () => {
      const mockDbConstructor = {
        initialize: jest.fn().mockResolvedValue(undefined),
      };

      // Mock the TodoneDatabase constructor
      jest
        .spyOn(require("../../database/db"), "TodoneDatabase")
        .mockReturnValue(mockDbConstructor);

      const db = await DatabaseTestUtils.createTestDatabase();
      expect(db).toBeDefined();
      expect(mockDbConstructor.initialize).toHaveBeenCalled();
    });

    it("should cleanup test database", async () => {
      const mockDb = {
        isOpen: jest.fn().mockReturnValue(true),
        close: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      await DatabaseTestUtils.cleanupTestDatabase(mockDb as any);
      expect(mockDb.close).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
