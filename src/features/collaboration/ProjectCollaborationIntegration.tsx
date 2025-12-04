import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../types/project';
import { CollaborationActivity } from '../../types/collaboration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Activity, Settings, Check, X, Edit, Trash2, Folder, File } from 'lucide-react';

interface ProjectCollaborationIntegrationProps {
  teamId: string;
  showProjectCreation?: boolean;
  showActivityFeed?: boolean;
  onProjectCreated?: (project: Project) => void;
}

export const ProjectCollaborationIntegration: React.FC<ProjectCollaborationIntegrationProps> = ({
  teamId,
  showProjectCreation = true,
  showActivityFeed = true,
  onProjectCreated
}) => {
  const { teams, members, createTeam, addMemberToTeam, updateTeamSettings } = useCollaboration();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [activityFeed, setActivityFeed] = useState<CollaborationActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current team
  const currentTeam = teams.find(team => team.id === teamId);
  const teamMembers = members.filter(member => member.teamId === teamId);

  // Create a new project with collaboration context
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the project
      const newProjectData: Omit<Project, 'id'> = {
        name: newProjectName,
        description: newProjectDescription || undefined,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        teamId,
        memberIds: selectedTeamMembers.length > 0 ? selectedTeamMembers : undefined
      };

      const createdProject = await createProject(newProjectData);

      // Create collaboration activity
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: 'current-user', // This would be the current user ID in a real app
        action: `created project "${createdProject.name}"`,
        type: 'project',
        timestamp: new Date(),
        entityId: createdProject.id,
        entityType: 'project'
      };

      // In a real implementation, we would call the collaboration API to create this activity
      // For now, we'll just add it to our local state
      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);

      // Reset form
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTeamMembers([]);

      if (onProjectCreated) {
        onProjectCreated(createdProject);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setLoading(false);
    }
  };

  // Handle project deletion with collaboration tracking
  const handleProjectDeletion = async (projectId: string) => {
    try {
      const projectToDelete = projects.find(p => p.id === projectId);
      if (!projectToDelete) return;

      await deleteProject(projectId);

      // Create collaboration activity for project deletion
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: 'current-user',
        action: `deleted project "${projectToDelete.name}"`,
        type: 'project',
        timestamp: new Date(),
        entityId: projectId,
        entityType: 'project'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  // Filter projects by team context
  const teamProjects = projects.filter(project => project.teamId === teamId);

  // Toggle team member selection for project
  const toggleTeamMemberSelection = (memberId: string) => {
    setSelectedTeamMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Creation Section */}
      {showProjectCreation && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Create projects for team collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Input
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="grid grid-cols-2 gap-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedTeamMembers.includes(member.userId || member.id)}
                      onCheckedChange={() => toggleTeamMemberSelection(member.userId || member.id)}
                    />
                    <Label htmlFor={`member-${member.id}`} className="text-sm">
                      {member.user?.name || member.id}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateProject}
              disabled={loading || !newProjectName.trim()}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Project List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Projects</CardTitle>
          <CardDescription>Projects managed by this team</CardDescription>
        </CardHeader>
        <CardContent>
          {teamProjects.length === 0 ? (
            <p className="text-gray-500">No projects found for this team.</p>
          ) : (
            <div className="space-y-4">
              {teamProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {project.status}
                        </Badge>
                        {project.memberIds && project.memberIds.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {project.memberIds.length} members
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProjectDeletion(project.id)}
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed Section */}
      {showActivityFeed && (
        <Card>
          <CardHeader>
            <CardTitle>Project Activity Feed</CardTitle>
            <CardDescription>Recent project-related collaboration activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-gray-500">No recent project activities.</p>
            ) : (
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">Team Member</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleString()}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};