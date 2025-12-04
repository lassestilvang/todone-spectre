import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useCollaborationActivity } from '../../hooks/useCollaborationActivity';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import { CollaborationDashboard } from './CollaborationDashboard';
import { CollaborationActivity } from './CollaborationActivity';
import { CollaborationMembers } from './CollaborationMembers';
import { CollaborationSettings } from './CollaborationSettings';
import { CollaborationTeam, CollaborationMember, CollaborationActivity, CollaborationSettings } from '../../types/collaboration';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, Users, Task, Project, Activity, Plus, RefreshCw, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface CollaborationIntegrationSystemProps {
  teamId: string;
  initialTab?: 'dashboard' | 'activity' | 'members' | 'settings';
  showHeader?: boolean;
  showNavigation?: boolean;
  onTeamCreated?: (team: CollaborationTeam) => void;
  onActivityCreated?: (activity: CollaborationActivity) => void;
}

export const CollaborationIntegrationSystem: React.FC<CollaborationIntegrationSystemProps> = ({
  teamId,
  initialTab = 'dashboard',
  showHeader = true,
  showNavigation = true,
  onTeamCreated,
  onActivityCreated
}) => {
  const {
    teams,
    members,
    settings,
    loading: collaborationLoading,
    error: collaborationError,
    createTeam,
    updateTeamSettings,
    addMemberToTeam,
    updateMemberRole,
    removeMemberFromTeam
  } = useCollaboration();

  const {
    activities,
    loading: activityLoading,
    error: activityError,
    createActivity,
    getActivityStats
  } = useCollaborationActivity(teamId);

  const { tasks, loading: tasksLoading } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [teamStats, setTeamStats] = useState({
    taskCount: 0,
    projectCount: 0,
    memberCount: 0,
    activityCount: 0,
    completionRate: 0
  });
  const [collaborationActivities, setCollaborationActivities] = useState<CollaborationActivity[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Get current team
  const currentTeam = teams.find(team => team.id === teamId);
  const teamMembers = members.filter(member => member.teamId === teamId);
  const teamSettings = settings.find(setting => setting.teamId === teamId);
  const teamTasks = tasks.filter(task => teamMembers.some(member => member.userId === task.assigneeId));
  const teamProjects = projects.filter(project => project.teamId === teamId);

  // Calculate team statistics
  useEffect(() => {
    if (currentTeam) {
      const activityStats = getActivityStats();
      const completionRate = teamTasks.length > 0
        ? Math.min(100, (teamTasks.filter(t => t.completed).length / teamTasks.length) * 100)
        : 0;

      setTeamStats({
        taskCount: teamTasks.length,
        projectCount: teamProjects.length,
        memberCount: teamMembers.length,
        activityCount: activityStats.total,
        completionRate: parseFloat(completionRate.toFixed(1))
      });
    }
  }, [currentTeam, teamTasks, teamProjects, teamMembers, getActivityStats]);

  // Handle activity creation from child components
  const handleActivityCreated = async (activity: CollaborationActivity) => {
    try {
      if (onActivityCreated) {
        onActivityCreated(activity);
      }

      // Create activity via API
      const createdActivity = await createActivity(activity);
      setCollaborationActivities(prev => [createdActivity, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error('Failed to create activity:', err);
    }
  };

  // Handle task creation
  const handleTaskCreated = async (task: Task) => {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      teamId,
      userId: currentUser?.id || 'system',
      action: `created task "${task.title}"`,
      type: 'task',
      timestamp: new Date(),
      entityId: task.id,
      entityType: 'task',
      user: currentUser || undefined
    };
    await handleActivityCreated(activity);
  };

  // Handle project creation
  const handleProjectCreated = async (project: Project) => {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      teamId,
      userId: currentUser?.id || 'system',
      action: `created project "${project.name}"`,
      type: 'project',
      timestamp: new Date(),
      entityId: project.id,
      entityType: 'project',
      user: currentUser || undefined
    };
    await handleActivityCreated(activity);
  };

  // Handle user profile update
  const handleProfileUpdated = async (user: User) => {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      teamId,
      userId: user.id,
      action: `updated their profile`,
      type: 'member_updated',
      timestamp: new Date(),
      entityId: user.id,
      entityType: 'user',
      user
    };
    await handleActivityCreated(activity);
  };

  // Handle member added
  const handleMemberAdded = async (member: CollaborationMember) => {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      teamId,
      userId: currentUser?.id || 'system',
      action: `added ${member.user?.name || 'a new member'} to the team`,
      type: 'member_added',
      timestamp: new Date(),
      entityId: member.id,
      entityType: 'member',
      user: currentUser || undefined
    };
    await handleActivityCreated(activity);
  };

  // Handle member removed
  const handleMemberRemoved = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}`,
      teamId,
      userId: currentUser?.id || 'system',
      action: `removed ${member?.user?.name || 'a member'} from the team`,
      type: 'member_removed',
      timestamp: new Date(),
      entityId: memberId,
      entityType: 'member',
      user: currentUser || undefined
    };
    await handleActivityCreated(activity);
  };

  // Handle settings updated
  const handleSettingsUpdated = async (updatedSettings: CollaborationSettings) => {
    try {
      setIsSavingSettings(true);
      setSettingsSaveError(null);
      setSettingsSaveSuccess(false);

      await updateTeamSettings(teamId, updatedSettings);

      const activity: CollaborationActivity = {
        id: `activity-${Date.now()}`,
        teamId,
        userId: currentUser?.id || 'system',
        action: `updated team settings`,
        type: 'settings_updated',
        timestamp: new Date(),
        entityId: teamId,
        entityType: 'settings',
        user: currentUser || undefined
      };
      await handleActivityCreated(activity);

      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err) {
      setSettingsSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: CollaborationMember['role']) => {
    try {
      await updateMemberRole(teamId, memberId, newRole);

      const member = teamMembers.find(m => m.id === memberId);
      const activity: CollaborationActivity = {
        id: `activity-${Date.now()}`,
        teamId,
        userId: currentUser?.id || 'system',
        action: `changed ${member?.user?.name || 'a member'}'s role to ${newRole}`,
        type: 'member_updated',
        timestamp: new Date(),
        entityId: memberId,
        entityType: 'member',
        user: currentUser || undefined
      };
      await handleActivityCreated(activity);
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  const isLoading = collaborationLoading || activityLoading || tasksLoading || projectsLoading;

  if (isLoading && !currentTeam) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground mb-2" />
        <p>Loading collaboration integration...</p>
      </div>
    );
  }

  if (collaborationError || activityError) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p>Failed to load collaboration data</p>
        <Button variant="outline" size="sm" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Info className="h-6 w-6 mx-auto mb-2" />
        <p>Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{currentTeam.name} Collaboration</span>
                </CardTitle>
                <CardDescription>{currentTeam.description || 'Team collaboration workspace'}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {teamStats.memberCount} members
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Project className="h-3 w-3 mr-1" />
                  {teamStats.projectCount} projects
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Task className="h-3 w-3 mr-1" />
                  {teamStats.taskCount} tasks
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Main Navigation Tabs */}
      {showNavigation && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <CollaborationDashboard
              teamId={teamId}
              showSettings={true}
              showMemberManagement={true}
              onSettingsClick={() => setActiveTab('settings')}
              onAddMemberClick={() => setActiveTab('members')}
            />
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity">
            <CollaborationActivity
              teamId={teamId}
              title="Team Activity Feed"
              showFilters={true}
              showExport={true}
              maxActivities={20}
            />
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <CollaborationMembers
              teamId={teamId}
              title="Team Member Management"
              showAddMember={true}
              showRoleManagement={true}
              showStatusManagement={true}
              onAddMember={handleMemberAdded}
              onRemoveMember={handleMemberRemoved}
              onChangeRole={handleRoleChange}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            {settingsSaveSuccess && (
              <Alert variant="success" className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Settings saved successfully!</AlertTitle>
                <AlertDescription>
                  Your collaboration settings have been updated.
                </AlertDescription>
              </Alert>
            )}

            {settingsSaveError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Failed to save settings</AlertTitle>
                <AlertDescription>{settingsSaveError}</AlertDescription>
              </Alert>
            )}

            <CollaborationSettings
              teamId={teamId}
              initialSettings={teamSettings}
              onSave={handleSettingsUpdated}
              onCancel={() => setActiveTab('dashboard')}
              showAdvanced={true}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
          <Users className="h-4 w-4 mr-2" /> Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('activity')}>
          <Activity className="h-4 w-4 mr-2" /> Activity Feed
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('members')}>
          <Users className="h-4 w-4 mr-2" /> Team Members
        </Button>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
          <Settings className="h-4 w-4 mr-2" /> Settings
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activityCount}</div>
            <p className="text-xs text-muted-foreground">Total Activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Engagement</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <Project className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.projectCount}</div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};