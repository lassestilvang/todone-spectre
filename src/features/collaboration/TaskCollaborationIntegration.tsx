import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useTasks } from '../../hooks/useTasks';
import { Task } from '../../types/task';
import { CollaborationActivity } from '../../types/collaboration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Activity, Settings, Check, X, Edit, Trash2 } from 'lucide-react';

interface TaskCollaborationIntegrationProps {
  teamId: string;
  projectId?: string;
  showTaskCreation?: boolean;
  showActivityFeed?: boolean;
  onTaskCreated?: (task: Task) => void;
}

export const TaskCollaborationIntegration: React.FC<TaskCollaborationIntegrationProps> = ({
  teamId,
  projectId,
  showTaskCreation = true,
  showActivityFeed = true,
  onTaskCreated
}) => {
  const { teams, members, createTeam, addMemberToTeam, updateTeamSettings } = useCollaboration();
  const { tasks, createTask, updateTask, deleteTask, toggleCompletion } = useTasks(projectId);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<CollaborationActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current team
  const currentTeam = teams.find(team => team.id === teamId);
  const teamMembers = members.filter(member => member.teamId === teamId);

  // Create a new task with collaboration context
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the task
      const newTaskData: Omit<Task, 'id'> = {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        status: 'todo',
        priority: 'medium',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: projectId || undefined,
        assigneeId: selectedAssigneeId || undefined
      };

      const createdTask = await createTask(newTaskData);

      // Create collaboration activity
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: 'current-user', // This would be the current user ID in a real app
        action: `created task "${createdTask.title}"`,
        type: 'task',
        timestamp: new Date(),
        entityId: createdTask.id,
        entityType: 'task'
      };

      // In a real implementation, we would call the collaboration API to create this activity
      // For now, we'll just add it to our local state
      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);

      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedAssigneeId(null);

      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      setLoading(false);
    }
  };

  // Handle task completion with collaboration tracking
  const handleTaskCompletion = async (task: Task) => {
    try {
      await toggleCompletion(task.id);

      // Create collaboration activity for task completion
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: 'current-user',
        action: task.completed ? `completed task "${task.title}"` : `reopened task "${task.title}"`,
        type: 'task',
        timestamp: new Date(),
        entityId: task.id,
        entityType: 'task'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  // Handle task deletion with collaboration tracking
  const handleTaskDeletion = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      await deleteTask(taskId);

      // Create collaboration activity for task deletion
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: 'current-user',
        action: `deleted task "${taskToDelete.title}"`,
        type: 'task',
        timestamp: new Date(),
        entityId: taskId,
        entityType: 'task'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Filter tasks by team context
  const teamTasks = tasks.filter(task => {
    if (projectId) {
      return task.projectId === projectId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Task Creation Section */}
      {showTaskCreation && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Create tasks for your team collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Input
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assign to Team Member</Label>
              <Select
                value={selectedAssigneeId || ''}
                onValueChange={(value) => setSelectedAssigneeId(value)}
                disabled={loading}
              >
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.userId || member.id}>
                      {member.user?.name || member.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateTask}
              disabled={loading || !newTaskTitle.trim()}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Task List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Tasks</CardTitle>
          <CardDescription>Tasks assigned to this team</CardDescription>
        </CardHeader>
        <CardContent>
          {teamTasks.length === 0 ? (
            <p className="text-gray-500">No tasks found for this team.</p>
          ) : (
            <div className="space-y-4">
              {teamTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskCompletion(task)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 truncate">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {task.assigneeId && (
                          <Badge variant="secondary" className="text-xs">
                            Assigned to: {task.assigneeId}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskCompletion(task)}
                      title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskDeletion(task.id)}
                      title="Delete task"
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
            <CardTitle>Task Activity Feed</CardTitle>
            <CardDescription>Recent task-related collaboration activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-gray-500">No recent task activities.</p>
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