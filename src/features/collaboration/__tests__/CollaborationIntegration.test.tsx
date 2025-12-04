import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollaborationIntegrationSystem } from '../CollaborationIntegrationSystem';
import { TaskCollaborationIntegration } from '../TaskCollaborationIntegration';
import { ProjectCollaborationIntegration } from '../ProjectCollaborationIntegration';
import { UserProfileCollaborationIntegration } from '../UserProfileCollaborationIntegration';
import { useCollaboration } from '../../../hooks/useCollaboration';
import { useTasks } from '../../../hooks/useTasks';
import { useProjects } from '../../../hooks/useProjects';
import { useUsers } from '../../../hooks/useUsers';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
jest.mock('../../../hooks/useCollaboration');
jest.mock('../../../hooks/useTasks');
jest.mock('../../../hooks/useProjects');
jest.mock('../../../hooks/useUsers');
jest.mock('../../../hooks/useAuth');

describe('Collaboration Integration Tests', () => {
  const mockTeamId = 'team-1';
  const mockUserId = 'user-1';

  const mockTeam = {
    id: mockTeamId,
    name: 'Test Team',
    description: 'Test team for collaboration',
    privacySetting: 'team-only',
    ownerId: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 2,
    activityCount: 0
  };

  const mockMembers = [
    {
      id: 'member-1',
      teamId: mockTeamId,
      userId: mockUserId,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(),
      user: {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    {
      id: 'member-2',
      teamId: mockTeamId,
      userId: 'user-2',
      role: 'member',
      status: 'active',
      joinedAt: new Date(),
      user: {
        id: 'user-2',
        name: 'Team Member',
        email: 'member@example.com'
      }
    }
  ];

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test task description',
      status: 'todo',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      assigneeId: mockUserId
    }
  ];

  const mockProjects = [
    {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test project description',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      teamId: mockTeamId,
      memberIds: [mockUserId, 'user-2']
    }
  ];

  const mockUsers = [
    {
      id: mockUserId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'user-2',
      name: 'Team Member',
      email: 'member@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockCurrentUser = {
    id: mockUserId,
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Mock collaboration hook
    (useCollaboration as jest.Mock).mockReturnValue({
      teams: [mockTeam],
      members: mockMembers,
      settings: {},
      loading: false,
      error: null
    });

    // Mock tasks hook
    (useTasks as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null
    });

    // Mock projects hook
    (useProjects as jest.Mock).mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null
    });

    // Mock users hook
    (useUsers as jest.Mock).mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
      getUserById: jest.fn().mockResolvedValue(mockCurrentUser)
    });

    // Mock auth hook
    (useAuth as jest.Mock).mockReturnValue({
      user: mockCurrentUser
    });
  });

  test('CollaborationIntegrationSystem renders correctly', () => {
    render(<CollaborationIntegrationSystem teamId={mockTeamId} />);

    // Check if team name is displayed
    expect(screen.getByText('Test Team Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Team collaboration workspace')).toBeInTheDocument();

    // Check if tabs are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();

    // Check if team stats are displayed
    expect(screen.getByText('2 members')).toBeInTheDocument();
    expect(screen.getByText('1 projects')).toBeInTheDocument();
    expect(screen.getByText('1 tasks')).toBeInTheDocument();
  });

  test('TaskCollaborationIntegration renders correctly', () => {
    render(
      <TaskCollaborationIntegration
        teamId={mockTeamId}
        showTaskCreation={true}
        showActivityFeed={true}
      />
    );

    // Check if task creation section is rendered
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task title')).toBeInTheDocument();

    // Check if team tasks section is rendered
    expect(screen.getByText('Team Tasks')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('ProjectCollaborationIntegration renders correctly', () => {
    render(
      <ProjectCollaborationIntegration
        teamId={mockTeamId}
        showProjectCreation={true}
        showActivityFeed={true}
      />
    );

    // Check if project creation section is rendered
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument();

    // Check if team projects section is rendered
    expect(screen.getByText('Team Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  test('UserProfileCollaborationIntegration renders correctly', () => {
    render(
      <UserProfileCollaborationIntegration
        teamId={mockTeamId}
        showProfileManagement={true}
        showActivityFeed={true}
      />
    );

    // Check if user profile section is rendered
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage user profile and team membership')).toBeInTheDocument();

    // Check if team members section is rendered
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  test('CollaborationIntegrationSystem handles tab switching', () => {
    render(<CollaborationIntegrationSystem teamId={mockTeamId} />);

    // Initially should show overview
    expect(screen.getByText('Team Statistics')).toBeInTheDocument();

    // Click on tasks tab
    fireEvent.click(screen.getByText('Tasks'));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    // Click on projects tab
    fireEvent.click(screen.getByText('Projects'));
    expect(screen.getByText('Create New Project')).toBeInTheDocument();

    // Click on users tab
    fireEvent.click(screen.getByText('Users'));
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  test('CollaborationIntegrationSystem shows loading state', () => {
    // Mock loading state
    (useCollaboration as jest.Mock).mockReturnValue({
      teams: [],
      members: [],
      settings: {},
      loading: true,
      error: null
    });

    render(<CollaborationIntegrationSystem teamId={mockTeamId} />);

    expect(screen.getByText('Loading collaboration integration...')).toBeInTheDocument();
  });

  test('CollaborationIntegrationSystem shows error state for missing team', () => {
    // Mock empty teams
    (useCollaboration as jest.Mock).mockReturnValue({
      teams: [],
      members: [],
      settings: {},
      loading: false,
      error: null
    });

    render(<CollaborationIntegrationSystem teamId="non-existent-team" />);

    expect(screen.getByText('Team not found')).toBeInTheDocument();
  });
});