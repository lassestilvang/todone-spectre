import {
  CollaborationTeam,
  CollaborationMember,
  CollaborationSettings,
  CollaborationActivity,
} from "../../../types/collaboration";
import { CollaborationTestDataGenerators } from "./collaborationTestDataGenerators";

/**
 * Collaboration Service Mocks
 * Mock implementations of collaboration services for testing
 */

export class MockCollaborationService {
  private teams: CollaborationTeam[] = [];
  private members: CollaborationMember[] = [];
  private settings: CollaborationSettings[] = [];
  private activities: CollaborationActivity[] = [];

  constructor() {
    // Initialize with some default test data
    const { team, members, settings, activities } =
      CollaborationTestDataGenerators.generateCompleteTeam();
    this.teams.push(team);
    this.members.push(...members);
    this.settings.push(settings);
    this.activities.push(...activities);
  }

  /**
   * Reset all mock data
   */
  reset(): void {
    this.teams = [];
    this.members = [];
    this.settings = [];
    this.activities = [];
  }

  /**
   * Add test data to mock service
   */
  addTestData(data: {
    teams?: CollaborationTeam[];
    members?: CollaborationMember[];
    settings?: CollaborationSettings[];
    activities?: CollaborationActivity[];
  }): void {
    if (data.teams) this.teams.push(...data.teams);
    if (data.members) this.members.push(...data.members);
    if (data.settings) this.settings.push(...data.settings);
    if (data.activities) this.activities.push(...data.activities);
  }

  /**
   * Mock implementation of createTeam
   */
  async createTeam(
    teamData: Omit<CollaborationTeam, "id">,
  ): Promise<CollaborationTeam> {
    const newTeam: CollaborationTeam = {
      ...teamData,
      id: `team-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: teamData.members?.length || 0,
      activityCount: 0,
    };

    this.teams.push(newTeam);
    return newTeam;
  }

  /**
   * Mock implementation of getTeam
   */
  async getTeam(teamId: string): Promise<CollaborationTeam> {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    return team;
  }

  /**
   * Mock implementation of getTeams
   */
  async getTeams(): Promise<CollaborationTeam[]> {
    return this.teams;
  }

  /**
   * Mock implementation of updateTeam
   */
  async updateTeam(
    teamId: string,
    updates: Partial<CollaborationTeam>,
  ): Promise<CollaborationTeam> {
    const teamIndex = this.teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error("Team not found");
    }

    const updatedTeam = {
      ...this.teams[teamIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.teams[teamIndex] = updatedTeam;
    return updatedTeam;
  }

  /**
   * Mock implementation of deleteTeam
   */
  async deleteTeam(teamId: string): Promise<void> {
    const teamIndex = this.teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error("Team not found");
    }

    // Remove related members and settings
    this.members = this.members.filter((m) => m.teamId !== teamId);
    this.settings = this.settings.filter((s) => s.teamId !== teamId);
    this.activities = this.activities.filter((a) => a.teamId !== teamId);

    this.teams.splice(teamIndex, 1);
  }

  /**
   * Mock implementation of addMemberToTeam
   */
  async addMemberToTeam(
    teamId: string,
    memberData: Omit<CollaborationMember, "id" | "teamId" | "joinedAt">,
  ): Promise<CollaborationMember> {
    const team = await this.getTeam(teamId);

    const newMember: CollaborationMember = {
      ...memberData,
      id: `member-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      joinedAt: new Date(),
      status: memberData.status || "active",
      role: memberData.role || "member",
    };

    this.members.push(newMember);

    // Update team member count
    const teamIndex = this.teams.findIndex((t) => t.id === teamId);
    if (teamIndex !== -1) {
      this.teams[teamIndex] = {
        ...this.teams[teamIndex],
        memberCount: (this.teams[teamIndex].memberCount || 0) + 1,
      };
    }

    return newMember;
  }

  /**
   * Mock implementation of removeMemberFromTeam
   */
  async removeMemberFromTeam(teamId: string, memberId: string): Promise<void> {
    const memberIndex = this.members.findIndex(
      (m) => m.id === memberId && m.teamId === teamId,
    );
    if (memberIndex === -1) {
      throw new Error("Member not found");
    }

    this.members.splice(memberIndex, 1);

    // Update team member count
    const teamIndex = this.teams.findIndex((t) => t.id === teamId);
    if (teamIndex !== -1) {
      this.teams[teamIndex] = {
        ...this.teams[teamIndex],
        memberCount: Math.max((this.teams[teamIndex].memberCount || 0) - 1, 0),
      };
    }
  }

  /**
   * Mock implementation of updateMemberRole
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    newRole: CollaborationMember["role"],
  ): Promise<CollaborationMember> {
    const memberIndex = this.members.findIndex(
      (m) => m.id === memberId && m.teamId === teamId,
    );
    if (memberIndex === -1) {
      throw new Error("Member not found");
    }

    const updatedMember = {
      ...this.members[memberIndex],
      role: newRole,
    };

    this.members[memberIndex] = updatedMember;
    return updatedMember;
  }

  /**
   * Mock implementation of getTeamMembers
   */
  async getTeamMembers(teamId: string): Promise<CollaborationMember[]> {
    return this.members.filter((m) => m.teamId === teamId);
  }

  /**
   * Mock implementation of updateTeamSettings
   */
  async updateTeamSettings(
    teamId: string,
    settings: Partial<CollaborationSettings>,
  ): Promise<CollaborationSettings> {
    const existingSettingsIndex = this.settings.findIndex(
      (s) => s.teamId === teamId,
    );

    const updatedSettings: CollaborationSettings = {
      ...(existingSettingsIndex !== -1
        ? this.settings[existingSettingsIndex]
        : { teamId }),
      ...settings,
      updatedAt: new Date(),
    };

    if (existingSettingsIndex !== -1) {
      this.settings[existingSettingsIndex] = updatedSettings;
    } else {
      this.settings.push(updatedSettings);
    }

    return updatedSettings;
  }

  /**
   * Mock implementation of getTeamSettings
   */
  async getTeamSettings(teamId: string): Promise<CollaborationSettings> {
    const settings = this.settings.find((s) => s.teamId === teamId);
    if (!settings) {
      // Return default settings if none exist
      return CollaborationTestDataGenerators.generateMockSettings({ teamId });
    }
    return settings;
  }

  /**
   * Mock implementation of createActivity
   */
  async createActivity(
    activityData: Omit<CollaborationActivity, "id">,
  ): Promise<CollaborationActivity> {
    const newActivity: CollaborationActivity = {
      ...activityData,
      id: `activity-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.activities.push(newActivity);

    // Update team activity count
    const teamIndex = this.teams.findIndex((t) => t.id === activityData.teamId);
    if (teamIndex !== -1) {
      this.teams[teamIndex] = {
        ...this.teams[teamIndex],
        activityCount: (this.teams[teamIndex].activityCount || 0) + 1,
      };
    }

    return newActivity;
  }

  /**
   * Mock implementation of getActivitiesByTeam
   */
  async getActivitiesByTeam(teamId: string): Promise<CollaborationActivity[]> {
    return this.activities.filter((a) => a.teamId === teamId);
  }

  /**
   * Mock implementation of getRecentActivities
   */
  async getRecentActivities(
    limit: number = 10,
  ): Promise<CollaborationActivity[]> {
    return this.activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Mock implementation of getActivitiesByUser
   */
  async getActivitiesByUser(userId: string): Promise<CollaborationActivity[]> {
    return this.activities.filter((a) => a.userId === userId);
  }

  /**
   * Mock implementation of deleteActivity
   */
  async deleteActivity(activityId: string): Promise<void> {
    const activityIndex = this.activities.findIndex((a) => a.id === activityId);
    if (activityIndex === -1) {
      throw new Error("Activity not found");
    }

    this.activities.splice(activityIndex, 1);
  }

  /**
   * Filter teams by privacy setting
   */
  filterTeamsByPrivacy(
    privacy: CollaborationTeam["privacySetting"],
  ): CollaborationTeam[] {
    return this.teams.filter((team) => team.privacySetting === privacy);
  }

  /**
   * Search teams by name
   */
  searchTeamsByName(searchTerm: string): CollaborationTeam[] {
    return this.teams.filter((team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(teamId: string): {
    memberCount: number;
    activityCount: number;
    adminCount: number;
  } {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) return { memberCount: 0, activityCount: 0, adminCount: 0 };

    const teamMembers = this.members.filter((m) => m.teamId === teamId);
    const adminCount = teamMembers.filter((m) => m.role === "admin").length;

    return {
      memberCount: teamMembers.length,
      activityCount: this.activities.filter((a) => a.teamId === teamId).length,
      adminCount,
    };
  }

  /**
   * Get all members
   */
  getAllMembers(): CollaborationMember[] {
    return this.members;
  }

  /**
   * Get all activities
   */
  getAllActivities(): CollaborationActivity[] {
    return this.activities;
  }

  /**
   * Get all settings
   */
  getAllSettings(): CollaborationSettings[] {
    return this.settings;
  }
}

/**
 * Create a pre-configured mock service with specific test data
 */
export function createMockCollaborationServiceWithData(data: {
  teams?: CollaborationTeam[];
  members?: CollaborationMember[];
  settings?: CollaborationSettings[];
  activities?: CollaborationActivity[];
}): MockCollaborationService {
  const service = new MockCollaborationService();
  service.reset();
  service.addTestData(data);
  return service;
}

/**
 * Create a mock service with default test data
 */
export function createDefaultMockCollaborationService(): MockCollaborationService {
  return new MockCollaborationService();
}
