import { collaborationService } from '../collaborationService';
import { collaborationActivityService } from '../collaborationActivityService';
import { CollaborationTeam, CollaborationMember, CollaborationActivity, CollaborationSettings } from '../../types/collaboration';

describe('Collaboration Services', () => {
  // Mock data
  const mockTeam: Omit<CollaborationTeam, 'id'> = {
    name: 'Test Team',
    description: 'Test team for validation',
    privacySetting: 'team-only',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 0,
    activityCount: 0
  };

  const mockMember: Omit<CollaborationMember, 'id' | 'teamId' | 'joinedAt'> = {
    userId: 'user-2',
    role: 'member',
    status: 'active'
  };

  const mockActivity: Omit<CollaborationActivity, 'id' | 'timestamp'> = {
    teamId: 'team-1',
    userId: 'user-1',
    action: 'Test activity',
    type: 'task'
  };

  const mockSettings: Partial<CollaborationSettings> = {
    teamId: 'team-1',
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false,
      mentionNotifications: true,
      dailyDigest: false
    }
  };

  describe('CollaborationService', () => {
    it('should be a singleton instance', () => {
      const instance1 = collaborationService;
      const instance2 = collaborationService;
      expect(instance1).toBe(instance2);
    });

    it('should validate team data correctly', () => {
      // Test valid team
      expect(() => {
        collaborationService['validateTeam'](mockTeam);
      }).not.toThrow();

      // Test invalid team name
      expect(() => {
        collaborationService['validateTeam']({ ...mockTeam, name: '' });
      }).toThrow('Team name is required');

      // Test team name too long
      expect(() => {
        collaborationService['validateTeam']({ ...mockTeam, name: 'a'.repeat(101) });
      }).toThrow('Team name cannot exceed 100 characters');

      // Test invalid privacy setting
      expect(() => {
        collaborationService['validateTeam']({ ...mockTeam, privacySetting: 'invalid' as any });
      }).toThrow('Invalid privacy setting');
    });

    it('should validate member data correctly', () => {
      // Test valid member
      expect(() => {
        collaborationService['validateMember'](mockMember);
      }).not.toThrow();

      // Test invalid user ID
      expect(() => {
        collaborationService['validateMember']({ ...mockMember, userId: '' });
      }).toThrow('User ID is required');

      // Test invalid role
      expect(() => {
        collaborationService['validateMember']({ ...mockMember, role: 'invalid' as any });
      }).toThrow('Invalid member role');
    });
  });

  describe('CollaborationActivityService', () => {
    it('should be a singleton instance', () => {
      const instance1 = collaborationActivityService;
      const instance2 = collaborationActivityService;
      expect(instance1).toBe(instance2);
    });

    it('should validate activity data correctly', () => {
      // Test valid activity
      expect(() => {
        collaborationActivityService['validateActivity'](mockActivity);
      }).not.toThrow();

      // Test invalid user ID
      expect(() => {
        collaborationActivityService['validateActivity']({ ...mockActivity, userId: '' });
      }).toThrow('User ID is required');

      // Test invalid team ID
      expect(() => {
        collaborationActivityService['validateActivity']({ ...mockActivity, teamId: '' });
      }).toThrow('Team ID is required');

      // Test invalid action
      expect(() => {
        collaborationActivityService['validateActivity']({ ...mockActivity, action: '' });
      }).toThrow('Activity action is required');
    });

    it('should filter activities by type', () => {
      const activities: CollaborationActivity[] = [
        {
          id: '1',
          teamId: 'team-1',
          userId: 'user-1',
          action: 'Created task',
          type: 'task',
          timestamp: new Date()
        },
        {
          id: '2',
          teamId: 'team-1',
          userId: 'user-2',
          action: 'Sent message',
          type: 'message',
          timestamp: new Date()
        }
      ];

      const taskActivities = collaborationActivityService.filterActivitiesByType(activities, 'task');
      expect(taskActivities.length).toBe(1);
      expect(taskActivities[0].type).toBe('task');
    });

    it('should sort activities by timestamp', () => {
      const now = new Date();
      const activities: CollaborationActivity[] = [
        {
          id: '1',
          teamId: 'team-1',
          userId: 'user-1',
          action: 'Old activity',
          type: 'task',
          timestamp: new Date(now.getTime() - 1000) // 1 second ago
        },
        {
          id: '2',
          teamId: 'team-1',
          userId: 'user-2',
          action: 'New activity',
          type: 'message',
          timestamp: new Date() // Now
        }
      ];

      const sorted = collaborationActivityService.sortActivitiesByTimestamp(activities);
      expect(sorted[0].id).toBe('2'); // Newest first
      expect(sorted[1].id).toBe('1');
    });
  });

  describe('Service Integration', () => {
    it('should have all required methods', () => {
      // Check collaborationService methods
      expect(typeof collaborationService.createTeam).toBe('function');
      expect(typeof collaborationService.getTeam).toBe('function');
      expect(typeof collaborationService.getTeams).toBe('function');
      expect(typeof collaborationService.updateTeam).toBe('function');
      expect(typeof collaborationService.deleteTeam).toBe('function');
      expect(typeof collaborationService.addMemberToTeam).toBe('function');
      expect(typeof collaborationService.removeMemberFromTeam).toBe('function');
      expect(typeof collaborationService.updateMemberRole).toBe('function');
      expect(typeof collaborationService.getTeamMembers).toBe('function');
      expect(typeof collaborationService.updateTeamSettings).toBe('function');
      expect(typeof collaborationService.getTeamSettings).toBe('function');

      // Check collaborationActivityService methods
      expect(typeof collaborationActivityService.createActivity).toBe('function');
      expect(typeof collaborationActivityService.getActivitiesByTeam).toBe('function');
      expect(typeof collaborationActivityService.getRecentActivities).toBe('function');
      expect(typeof collaborationActivityService.getActivitiesByUser).toBe('function');
      expect(typeof collaborationActivityService.deleteActivity).toBe('function');
    });
  });
});