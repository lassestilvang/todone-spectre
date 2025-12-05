import { renderHook, act } from "@testing-library/react";
import { useCollaboration } from "../useCollaboration";
import { useCollaborationActivity } from "../useCollaborationActivity";
import { useCollaborationStore } from "../../store/useCollaborationStore";
import { collaborationService } from "../../services/collaborationService";
import { collaborationActivityService } from "../../services/collaborationActivityService";

// Mock the services
jest.mock("../../services/collaborationService");
jest.mock("../../services/collaborationActivityService");
jest.mock("../../store/useCollaborationStore");

describe("useCollaboration Hook", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock the store
    (useCollaborationStore as jest.Mock).mockReturnValue({
      teams: [],
      members: [],
      settings: [],
      filteredTeams: [],
      currentFilter: {},
      sortBy: "name",
      sortDirection: "asc",
      collaborationError: null,
      selectedTeamIds: [],
      selectedMemberIds: [],
      addTeam: jest.fn(),
      updateTeam: jest.fn(),
      deleteTeam: jest.fn(),
      addMember: jest.fn(),
      updateMember: jest.fn(),
      deleteMember: jest.fn(),
      updateSettings: jest.fn(),
      setFilter: jest.fn(),
      setSort: jest.fn(),
      applyFilters: jest.fn(),
      setSelectedTeamIds: jest.fn(),
      setSelectedMemberIds: jest.fn(),
      getTeamStatistics: jest.fn(),
      setCollaborationError: jest.fn(),
      initializeWithSampleData: jest.fn(),
    });

    // Mock the service methods
    (collaborationService.getTeams as jest.Mock).mockResolvedValue([]);
    (collaborationService.createTeam as jest.Mock).mockResolvedValue({
      id: "test-team",
      name: "Test Team",
      description: "Test Description",
      privacySetting: "private",
      ownerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: 0,
      activityCount: 0,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCollaboration());

    expect(result.current.teams).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.createTeam).toBe("function");
    expect(typeof result.current.fetchTeams).toBe("function");
  });

  it("should fetch teams on mount", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCollaboration());

    // Wait for the initial fetch to complete
    await waitForNextUpdate();

    expect(collaborationService.getTeams).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("should create a team", async () => {
    const { result } = renderHook(() => useCollaboration());

    await act(async () => {
      const team = await result.current.createTeam({
        name: "Test Team",
        description: "Test Description",
        privacySetting: "private",
        ownerId: "user-1",
      });

      expect(team).toBeDefined();
      expect(team.id).toBe("test-team");
      expect(collaborationService.createTeam).toHaveBeenCalled();
    });
  });

  it("should handle errors when creating a team", async () => {
    const errorMessage = "Failed to create team";
    (collaborationService.createTeam as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useCollaboration());

    await act(async () => {
      try {
        await result.current.createTeam({
          name: "Test Team",
          description: "Test Description",
          privacySetting: "private",
          ownerId: "user-1",
        });
      } catch (error) {
        // Expected error
      }

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });
});

describe("useCollaborationActivity Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the store
    (useCollaborationStore as jest.Mock).mockReturnValue({
      activities: [],
      addActivity: jest.fn(),
      updateActivity: jest.fn(),
      deleteActivity: jest.fn(),
      selectedActivityIds: [],
      setSelectedActivityIds: jest.fn(),
    });

    // Mock the service methods
    (
      collaborationActivityService.getActivitiesByTeam as jest.Mock
    ).mockResolvedValue([]);
    (
      collaborationActivityService.createActivity as jest.Mock
    ).mockResolvedValue({
      id: "test-activity",
      teamId: "team-1",
      userId: "user-1",
      action: "Test action",
      type: "message",
      timestamp: new Date(),
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCollaborationActivity());

    expect(result.current.activities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.createActivity).toBe("function");
  });

  it("should fetch activities when teamId is provided", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useCollaborationActivity("team-1"),
    );

    // Wait for the initial fetch to complete
    await waitForNextUpdate();

    expect(
      collaborationActivityService.getActivitiesByTeam,
    ).toHaveBeenCalledWith("team-1");
    expect(result.current.loading).toBe(false);
  });

  it("should create an activity", async () => {
    const { result } = renderHook(() => useCollaborationActivity());

    await act(async () => {
      const activity = await result.current.createActivity({
        teamId: "team-1",
        userId: "user-1",
        action: "Test action",
        type: "message",
      });

      expect(activity).toBeDefined();
      expect(activity.id).toBe("test-activity");
      expect(collaborationActivityService.createActivity).toHaveBeenCalled();
    });
  });

  it("should filter activities by type", () => {
    const mockActivities = [
      {
        id: "1",
        type: "message",
        action: "Test message",
        teamId: "team-1",
        userId: "user-1",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "task",
        action: "Test task",
        teamId: "team-1",
        userId: "user-1",
        timestamp: new Date(),
      },
    ];

    (useCollaborationStore as jest.Mock).mockReturnValue({
      activities: mockActivities,
      addActivity: jest.fn(),
      updateActivity: jest.fn(),
      deleteActivity: jest.fn(),
      selectedActivityIds: [],
      setSelectedActivityIds: jest.fn(),
    });

    const { result } = renderHook(() => useCollaborationActivity());

    const filtered = result.current.filterActivitiesByType("message");
    expect(filtered.length).toBe(1);
    expect(filtered[0].type).toBe("message");
  });
});
