import { ProjectApi } from "../../api/projectApi";
import { Project } from "../../types/project";

// Mock global fetch
global.fetch = jest.fn();

describe("ProjectApi", () => {
  let projectApi: ProjectApi;
  const mockProject: Project = {
    id: "test-project-1",
    name: "Test Project",
    description: "Test Description",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    isActive: true,
    color: "blue",
    order: 0,
  };

  beforeEach(() => {
    projectApi = new ProjectApi();
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should create a project successfully", async () => {
      const mockProjectData = {
        name: "New Project",
        description: "New Description",
        userId: "user-1",
      };

      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "new-project-1",
          ...mockProjectData,
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
          isActive: true,
          color: "blue",
          order: 0,
        }),
      });

      const result = await projectApi.createProject(mockProjectData as any);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("new-project-1");
    });
  });

  describe("getProject", () => {
    it("should get a project by ID successfully", async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-project-1",
          name: "Test Project",
          description: "Test Description",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
          userId: "user-1",
          isActive: true,
          color: "blue",
          order: 0,
        }),
      });

      const result = await projectApi.getProject("test-project-1");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("test-project-1");
    });
  });

  describe("getProjects", () => {
    it("should get all projects successfully", async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "project-1",
            name: "Project 1",
            description: "Description 1",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-02T00:00:00.000Z",
            userId: "user-1",
            isActive: true,
            color: "blue",
            order: 0,
          },
          {
            id: "project-2",
            name: "Project 2",
            description: "Description 2",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-02T00:00:00.000Z",
            userId: "user-1",
            isActive: true,
            color: "red",
            order: 1,
          },
        ],
      });

      const result = await projectApi.getProjects();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
    });
  });

  describe("updateProject", () => {
    it("should update a project successfully", async () => {
      const updateData = {
        name: "Updated Project",
        description: "Updated Description",
      };

      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test-project-1",
          name: "Updated Project",
          description: "Updated Description",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-03T00:00:00.000Z",
          userId: "user-1",
          isActive: true,
          color: "blue",
          order: 0,
        }),
      });

      const result = await projectApi.updateProject(
        "test-project-1",
        updateData as any,
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("Updated Project");
    });
  });

  describe("deleteProject", () => {
    it("should delete a project successfully", async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await projectApi.deleteProject("test-project-1");
      expect(result.success).toBe(true);
    });
  });
});
