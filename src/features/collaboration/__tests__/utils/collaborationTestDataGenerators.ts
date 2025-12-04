import { CollaborationTeam, CollaborationMember, CollaborationSettings, CollaborationActivity, CollaborationEvent } from '../../../types/collaboration';
import { User } from '../../../../types/user';

/**
 * Collaboration Test Data Generators
 * Comprehensive utilities for generating test data for collaboration features
 */

export class CollaborationTestDataGenerators {
  /**
   * Generate a mock user for testing
   */
  static generateMockUser(overrides: Partial<User> = {}): User {
    return {
      id: overrides.id || `user-${Math.random().toString(36).substr(2, 9)}`,
      name: overrides.name || `Test User ${Math.floor(Math.random() * 1000)}`,
      email: overrides.email || `test${Math.floor(Math.random() * 1000)}@example.com`,
      role: overrides.role || 'user',
      status: overrides.status || 'active',
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
      ...overrides
    };
  }

  /**
   * Generate a mock team for testing
   */
  static generateMockTeam(overrides: Partial<CollaborationTeam> = {}): CollaborationTeam {
    const mockUser = this.generateMockUser();

    return {
      id: overrides.id || `team-${Math.random().toString(36).substr(2, 9)}`,
      name: overrides.name || `Test Team ${Math.floor(Math.random() * 1000)}`,
      description: overrides.description || `Test team description for ${Math.floor(Math.random() * 1000)}`,
      privacySetting: overrides.privacySetting || 'team-only',
      ownerId: overrides.ownerId || mockUser.id,
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
      memberCount: overrides.memberCount || 1,
      activityCount: overrides.activityCount || 0,
      members: overrides.members || [this.generateMockMember({ teamId: overrides.id || `team-${Math.random().toString(36).substr(2, 9)}`, user: mockUser })],
      projectIds: overrides.projectIds || [],
      settings: overrides.settings || this.generateMockSettings({ teamId: overrides.id || `team-${Math.random().toString(36).substr(2, 9)}` }),
      ...overrides
    };
  }

  /**
   * Generate a mock member for testing
   */
  static generateMockMember(overrides: Partial<CollaborationMember> = {}): CollaborationMember {
    const mockUser = this.generateMockUser();

    return {
      id: overrides.id || `member-${Math.random().toString(36).substr(2, 9)}`,
      teamId: overrides.teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      userId: overrides.userId || mockUser.id,
      user: overrides.user || mockUser,
      role: overrides.role || 'member',
      status: overrides.status || 'active',
      joinedAt: overrides.joinedAt || new Date(),
      lastActive: overrides.lastActive || new Date(),
      ...overrides
    };
  }

  /**
   * Generate mock settings for testing
   */
  static generateMockSettings(overrides: Partial<CollaborationSettings> = {}): CollaborationSettings {
    return {
      teamId: overrides.teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      notificationSettings: {
        emailNotifications: overrides.notificationSettings?.emailNotifications || true,
        pushNotifications: overrides.notificationSettings?.pushNotifications || true,
        mentionNotifications: overrides.notificationSettings?.mentionNotifications || true,
        dailyDigest: overrides.notificationSettings?.dailyDigest || false,
        ...overrides.notificationSettings
      },
      permissionSettings: {
        allowGuestInvites: overrides.permissionSettings?.allowGuestInvites || false,
        allowPublicSharing: overrides.permissionSettings?.allowPublicSharing || false,
        requireAdminApproval: overrides.permissionSettings?.requireAdminApproval || true,
        allowMemberInvites: overrides.permissionSettings?.allowMemberInvites || false,
        ...overrides.permissionSettings
      },
      privacySettings: {
        visibleToPublic: overrides.privacySettings?.visibleToPublic || false,
        searchable: overrides.privacySettings?.searchable || false,
        allowExternalAccess: overrides.privacySettings?.allowExternalAccess || false,
        ...overrides.privacySettings
      },
      integrationSettings: {
        calendarIntegration: overrides.integrationSettings?.calendarIntegration || false,
        taskIntegration: overrides.integrationSettings?.taskIntegration || false,
        fileIntegration: overrides.integrationSettings?.fileIntegration || false,
        ...overrides.integrationSettings
      },
      updatedAt: overrides.updatedAt || new Date(),
      ...overrides
    };
  }

  /**
   * Generate mock activity for testing
   */
  static generateMockActivity(overrides: Partial<CollaborationActivity> = {}): CollaborationActivity {
    const mockUser = this.generateMockUser();

    return {
      id: overrides.id || `activity-${Math.random().toString(36).substr(2, 9)}`,
      teamId: overrides.teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      userId: overrides.userId || mockUser.id,
      user: overrides.user || mockUser,
      action: overrides.action || `Test activity action ${Math.floor(Math.random() * 1000)}`,
      type: overrides.type || 'other',
      timestamp: overrides.timestamp || new Date(),
      details: overrides.details || `Test activity details for ${Math.floor(Math.random() * 1000)}`,
      entityId: overrides.entityId || `entity-${Math.random().toString(36).substr(2, 9)}`,
      entityType: overrides.entityType || 'task',
      ...overrides
    };
  }

  /**
   * Generate mock collaboration event for testing
   */
  static generateMockEvent(overrides: Partial<CollaborationEvent> = {}): CollaborationEvent {
    return {
      type: overrides.type || 'team_created',
      timestamp: overrides.timestamp || new Date(),
      data: overrides.data || { message: 'Test event data' },
      teamId: overrides.teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      userId: overrides.userId || `user-${Math.random().toString(36).substr(2, 9)}`,
      ...overrides
    };
  }

  /**
   * Generate a complete team with members, settings, and activities
   */
  static generateCompleteTeam(teamId?: string): {
    team: CollaborationTeam;
    members: CollaborationMember[];
    settings: CollaborationSettings;
    activities: CollaborationActivity[];
  } {
    const teamIdToUse = teamId || `team-${Math.random().toString(36).substr(2, 9)}`;
    const owner = this.generateMockUser({ name: 'Team Owner' });
    const admin = this.generateMockUser({ name: 'Team Admin' });
    const member1 = this.generateMockUser({ name: 'Team Member 1' });
    const member2 = this.generateMockUser({ name: 'Team Member 2' });

    const team = this.generateMockTeam({
      id: teamIdToUse,
      name: 'Complete Test Team',
      description: 'A complete team with members, settings, and activities for testing',
      ownerId: owner.id,
      memberCount: 4,
      activityCount: 3
    });

    const members = [
      this.generateMockMember({
        teamId: teamIdToUse,
        userId: owner.id,
        user: owner,
        role: 'admin',
        status: 'active'
      }),
      this.generateMockMember({
        teamId: teamIdToUse,
        userId: admin.id,
        user: admin,
        role: 'admin',
        status: 'active'
      }),
      this.generateMockMember({
        teamId: teamIdToUse,
        userId: member1.id,
        user: member1,
        role: 'member',
        status: 'active'
      }),
      this.generateMockMember({
        teamId: teamIdToUse,
        userId: member2.id,
        user: member2,
        role: 'member',
        status: 'pending'
      })
    ];

    const settings = this.generateMockSettings({
      teamId: teamIdToUse,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        dailyDigest: false
      },
      permissionSettings: {
        allowGuestInvites: false,
        allowPublicSharing: true,
        requireAdminApproval: true,
        allowMemberInvites: true
      }
    });

    const activities = [
      this.generateMockActivity({
        teamId: teamIdToUse,
        userId: owner.id,
        user: owner,
        action: 'Created team',
        type: 'team_created',
        entityType: 'team'
      }),
      this.generateMockActivity({
        teamId: teamIdToUse,
        userId: admin.id,
        user: admin,
        action: 'Added new member',
        type: 'member_added',
        entityType: 'member'
      }),
      this.generateMockActivity({
        teamId: teamIdToUse,
        userId: member1.id,
        user: member1,
        action: 'Created new task',
        type: 'task',
        entityType: 'task'
      })
    ];

    return { team, members, settings, activities };
  }

  /**
   * Generate multiple teams for testing
   */
  static generateMultipleTeams(count: number = 3): CollaborationTeam[] {
    return Array.from({ length: count }, (_, i) =>
      this.generateMockTeam({
        name: `Test Team ${i + 1}`,
        description: `Description for test team ${i + 1}`,
        memberCount: Math.floor(Math.random() * 5) + 1,
        activityCount: Math.floor(Math.random() * 10)
      })
    );
  }

  /**
   * Generate multiple members for testing
   */
  static generateMultipleMembers(count: number = 3, teamId?: string): CollaborationMember[] {
    const teamIdToUse = teamId || `team-${Math.random().toString(36).substr(2, 9)}`;

    return Array.from({ length: count }, (_, i) =>
      this.generateMockMember({
        teamId: teamIdToUse,
        role: i === 0 ? 'admin' : i === 1 ? 'member' : 'guest',
        status: i % 2 === 0 ? 'active' : 'pending'
      })
    );
  }

  /**
   * Generate multiple activities for testing
   */
  static generateMultipleActivities(count: number = 5, teamId?: string): CollaborationActivity[] {
    const teamIdToUse = teamId || `team-${Math.random().toString(36).substr(2, 9)}`;
    const activityTypes: CollaborationActivity['type'][] = ['message', 'file', 'task', 'member_added', 'member_removed', 'settings_updated'];

    return Array.from({ length: count }, (_, i) =>
      this.generateMockActivity({
        teamId: teamIdToUse,
        type: activityTypes[i % activityTypes.length],
        action: `Activity ${i + 1} of type ${activityTypes[i % activityTypes.length]}`,
        timestamp: new Date(Date.now() - i * 3600000) // Activities spread over time
      })
    );
  }

  /**
   * Generate team with specific privacy settings
   */
  static generateTeamWithPrivacy(privacy: CollaborationTeam['privacySetting']): CollaborationTeam {
    return this.generateMockTeam({
      privacySetting: privacy,
      name: `${privacy.charAt(0).toUpperCase() + privacy.slice(1)} Team`,
      description: `Team with ${privacy} privacy setting`
    });
  }

  /**
   * Generate member with specific role
   */
  static generateMemberWithRole(role: CollaborationMember['role'], teamId?: string): CollaborationMember {
    return this.generateMockMember({
      role,
      teamId: teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active'
    });
  }

  /**
   * Generate activity with specific type
   */
  static generateActivityWithType(type: CollaborationActivity['type'], teamId?: string): CollaborationActivity {
    return this.generateMockActivity({
      type,
      teamId: teamId || `team-${Math.random().toString(36).substr(2, 9)}`,
      action: `Activity of type: ${type}`
    });
  }
}