import {
  createDefaultTeam,
  createDefaultMember,
  createDefaultActivity,
  isTeamOwner,
  isTeamAdmin,
  isTeamMember,
  hasAdminPrivileges,
  getTeamMemberStats,
  getUserRoleInTeam,
  formatTeamName,
  formatMemberRole,
  validateTeamName,
  validateMemberRole,
  getTeamHealthScore,
  getTeamHealthStatus
} from '../collaborationUtils';

import {
  formatActivityForDisplay,
  getActivityTypeLabel,
  getActivityIcon,
  getActivityColor,
  sortActivitiesByTimestamp,
  groupActivitiesByDate,
  getActivityStatistics,
  isRecentActivity,
  getActivityAge
} from '../collaborationActivityUtils';

describe('Collaboration Utilities', () => {
  const testUserId = 'user_123';
  const testTeamId = 'team_456';

  describe('Team Utilities', () => {
    it('should create a default team', () => {
      const team = createDefaultTeam({
        name: 'Test Team',
        ownerId: testUserId,
        description: 'Test Description'
      });

      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.name).toBe('Test Team');
      expect(team.ownerId).toBe(testUserId);
      expect(team.description).toBe('Test Description');
      expect(team.privacySetting).toBe('team-only');
      expect(team.createdAt).toBeInstanceOf(Date);
      expect(team.updatedAt).toBeInstanceOf(Date);
      expect(team.memberCount).toBe(0);
      expect(team.activityCount).toBe(0);
    });

    it('should create a default member', () => {
      const member = createDefaultMember({
        teamId: testTeamId,
        userId: testUserId,
        role: 'member'
      });

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.teamId).toBe(testTeamId);
      expect(member.userId).toBe(testUserId);
      expect(member.role).toBe('member');
      expect(member.status).toBe('active');
      expect(member.joinedAt).toBeInstanceOf(Date);
    });

    it('should check team ownership', () => {
      const team = createDefaultTeam({
        name: 'Test Team',
        ownerId: testUserId
      });

      expect(isTeamOwner(team, testUserId)).toBe(true);
      expect(isTeamOwner(team, 'other_user')).toBe(false);
    });

    it('should check admin privileges', () => {
      const team = createDefaultTeam({
        name: 'Test Team',
        ownerId: testUserId
      });

      // Add admin member
      const adminMember = createDefaultMember({
        teamId: team.id,
        userId: 'admin_user',
        role: 'admin'
      });

      team.members = [adminMember];

      expect(hasAdminPrivileges(team, testUserId)).toBe(true); // Owner
      expect(hasAdminPrivileges(team, 'admin_user')).toBe(true); // Admin
      expect(hasAdminPrivileges(team, 'regular_user')).toBe(false); // Not a member
    });

    it('should get team member statistics', () => {
      const team = createDefaultTeam({
        name: 'Test Team',
        ownerId: testUserId
      });

      const members = [
        createDefaultMember({ teamId: team.id, userId: 'user1', role: 'admin', status: 'active' }),
        createDefaultMember({ teamId: team.id, userId: 'user2', role: 'member', status: 'active' }),
        createDefaultMember({ teamId: team.id, userId: 'user3', role: 'guest', status: 'pending' }),
        createDefaultMember({ teamId: team.id, userId: 'user4', role: 'member', status: 'inactive' })
      ];

      team.members = members;

      const stats = getTeamMemberStats(team);

      expect(stats.totalMembers).toBe(4);
      expect(stats.activeMembers).toBe(2);
      expect(stats.pendingMembers).toBe(1);
      expect(stats.adminCount).toBe(1);
      expect(stats.memberCount).toBe(2);
      expect(stats.guestCount).toBe(1);
    });

    it('should validate team name', () => {
      expect(validateTeamName('Valid Team Name')).toEqual({ valid: true });
      expect(validateTeamName('')).toEqual({ valid: false, message: 'Team name is required' });
      expect(validateTeamName('A'.repeat(101))).toEqual({ valid: false, message: 'Team name cannot exceed 100 characters' });
    });

    it('should validate member role', () => {
      expect(validateMemberRole('admin')).toEqual({ valid: true });
      expect(validateMemberRole('member')).toEqual({ valid: true });
      expect(validateMemberRole('guest')).toEqual({ valid: true });
      expect(validateMemberRole('invalid')).toEqual({ valid: false, message: 'Invalid member role' });
    });

    it('should format team name', () => {
      expect(formatTeamName({ name: 'Short Name' } as any)).toBe('Short Name');
      expect(formatTeamName({ name: 'Very Long Team Name That Exceeds Thirty Characters Limit' } as any))
        .toBe('Very Long Team Name That Exceeds...');
    });

    it('should format member role', () => {
      expect(formatMemberRole('admin')).toBe('Admin');
      expect(formatMemberRole('member')).toBe('Member');
      expect(formatMemberRole('guest')).toBe('Guest');
    });
  });

  describe('Activity Utilities', () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const activities = [
      createDefaultActivity({
        teamId: testTeamId,
        userId: testUserId,
        action: 'Created a new task',
        type: 'task',
        timestamp: now
      }),
      createDefaultActivity({
        teamId: testTeamId,
        userId: 'user_456',
        action: 'Uploaded a file',
        type: 'file',
        timestamp: pastDate
      }),
      createDefaultActivity({
        teamId: testTeamId,
        userId: testUserId,
        action: 'Sent a message',
        type: 'message',
        timestamp: now
      })
    ];

    it('should format activity for display', () => {
      const formatted = formatActivityForDisplay(activities[0]);
      expect(formatted).toContain('User');
      expect(formatted).toContain('Created a new task');
    });

    it('should get activity type label', () => {
      expect(getActivityTypeLabel('task')).toBe('Task');
      expect(getActivityTypeLabel('file')).toBe('File');
      expect(getActivityTypeLabel('message')).toBe('Message');
    });

    it('should get activity icon', () => {
      expect(getActivityIcon('task')).toBe('📋');
      expect(getActivityIcon('file')).toBe('📁');
      expect(getActivityIcon('message')).toBe('💬');
    });

    it('should get activity color', () => {
      expect(getActivityColor('task')).toBe('#FBBC05');
      expect(getActivityColor('file')).toBe('#34A853');
      expect(getActivityColor('message')).toBe('#4285F4');
    });

    it('should sort activities by timestamp', () => {
      const sorted = sortActivitiesByTimestamp(activities);
      expect(sorted[0].action).toBe('Created a new task'); // Most recent
      expect(sorted[2].action).toBe('Uploaded a file'); // Oldest
    });

    it('should group activities by date', () => {
      const grouped = groupActivitiesByDate(activities);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      expect(grouped[now.toDateString()].length).toBe(2); // Two activities today
    });

    it('should get activity statistics', () => {
      const stats = getActivityStatistics(activities);

      expect(stats.total).toBe(3);
      expect(stats.byType['task']).toBe(1);
      expect(stats.byType['file']).toBe(1);
      expect(stats.byType['message']).toBe(1);
      expect(stats.byUser[testUserId]).toBe(2);
      expect(stats.recent.length).toBe(5); // Top 5
    });

    it('should check if activity is recent', () => {
      const recentActivity = createDefaultActivity({
        teamId: testTeamId,
        userId: testUserId,
        action: 'Recent activity',
        timestamp: now
      });

      const oldActivity = createDefaultActivity({
        teamId: testTeamId,
        userId: testUserId,
        action: 'Old activity',
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000) // 48 hours ago
      });

      expect(isRecentActivity(recentActivity)).toBe(true);
      expect(isRecentActivity(oldActivity)).toBe(false);
    });

    it('should get activity age', () => {
      const recentActivity = createDefaultActivity({
        teamId: testTeamId,
        userId: testUserId,
        action: 'Recent activity',
        timestamp: now
      });

      const age = getActivityAge(recentActivity);
      expect(age).toContain('seconds ago');
    });
  });
});