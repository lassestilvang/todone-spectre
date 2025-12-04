/**
 * Integration test for collaboration hooks
 * This test verifies that the hooks can be imported and used correctly
 */

import { useCollaboration } from "../useCollaboration";
import { useCollaborationActivity } from "../useCollaborationActivity";
import { renderHook } from "@testing-library/react";

// Mock the dependencies
jest.mock("../../store/useCollaborationStore");
jest.mock("../../services/collaborationService");
jest.mock("../../services/collaborationActivityService");

describe("Collaboration Hooks Integration", () => {
  it("should import and render useCollaboration hook without errors", () => {
    expect(() => {
      const { result } = renderHook(() => useCollaboration());
      expect(result.current).toBeDefined();
      expect(typeof result.current.createTeam).toBe("function");
      expect(typeof result.current.fetchTeams).toBe("function");
      expect(typeof result.current.updateTeamWithState).toBe("function");
    }).not.toThrow();
  });

  it("should import and render useCollaborationActivity hook without errors", () => {
    expect(() => {
      const { result } = renderHook(() => useCollaborationActivity());
      expect(result.current).toBeDefined();
      expect(typeof result.current.createActivity).toBe("function");
      expect(typeof result.current.fetchActivities).toBe("function");
      expect(typeof result.current.updateActivityWithState).toBe("function");
    }).not.toThrow();
  });

  it("should import and render useCollaborationActivity hook with teamId without errors", () => {
    expect(() => {
      const { result } = renderHook(() =>
        useCollaborationActivity("test-team-id"),
      );
      expect(result.current).toBeDefined();
      expect(typeof result.current.createActivity).toBe("function");
      expect(typeof result.current.fetchActivities).toBe("function");
    }).not.toThrow();
  });
});
