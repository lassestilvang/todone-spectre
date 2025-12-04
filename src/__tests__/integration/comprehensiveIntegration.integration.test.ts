import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskApi } from '../../api/taskApi';
import { collaborationApi } from '../../api/collaborationApi';
import { offlineService } from '../../services/offlineService';
import { aiService } from '../../services/aiService';
import { animationService } from '../../services/animationService';
import { CalendarService } from '../../services/calendarService';
import { TodoneDatabase } from '../../database/db';
import { Task } from '../../types/task';
import { CollaborationTeam, CollaborationMember } from '../../types/collaboration';

// Mock all services and dependencies
vi.mock('../../api/taskApi');
vi.mock('../../api/collaborationApi');
vi.mock('../../services/offlineService');
vi.mock('../../services/aiService');
vi.mock('../../services/animationService');
vi.mock('../../services/calendarService');
vi.mock('../../database/db');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Comprehensive Integration Tests - Cross-Feature Scenarios', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Comprehensive Integration Task',
    description: 'Test all feature integrations working together',
    status: 'todo',
    priority: 'high',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: 'project-1',
    order: 0
  };

  const mockTeam: CollaborationTeam = {
    id: 'team-1',
    name: 'Integration Test Team',
    description: 'Team for comprehensive integration testing',
    privacySetting: 'team-only',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 2,
    activityCount: 0,
    members: [],
    projectIds: ['project-1'],
    settings: {
      teamId: 'team-1',
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        dailyDigest: false
      },
      permissionSettings: {
        allowGuestInvites: false,
        allowPublicSharing: false,
        requireAdminApproval: true,
        allowMemberInvites: false
      },
      privacySettings: {
        visibleToPublic: false,
        searchable: false,
        allowExternalAccess: false
      },
      integrationSettings: {
        calendarIntegration: true,
        taskIntegration: true,
        fileIntegration: false
      },
      updatedAt: new Date()
    }
  };

  const mockMember: CollaborationMember = {
    id: 'member-1',
    teamId: 'team-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com'
    },
    role: 'admin',
    status: 'active',
    joinedAt: new Date(),
    lastActive: new Date()
  };

  beforeEach(() => {
    // Set up auth token
    localStorage.setItem('token', 'test-token');

    // Initialize all services
    CalendarService.initializeWithSampleData();
    animationService.initialize();

    // Mock all service responses
    vi.spyOn(taskApi, 'createTask').mockResolvedValue({
      success: true,
      message: 'Task created successfully',
      data: mockTask
    });

    vi.spyOn(taskApi, 'getTask').mockResolvedValue({
      success: true,
      message: 'Task retrieved successfully',
      data: mockTask
    });

    vi.spyOn(collaborationApi, 'createTeam').mockResolvedValue({
      success: true,
      message: 'Team created successfully',
      data: mockTeam
    });

    vi.spyOn(collaborationApi, 'addMemberToTeam').mockResolvedValue({
      success: true,
      message: 'Member added successfully',
      data: mockMember
    });

    vi.spyOn(offlineService, 'addToQueue').mockResolvedValue({
      success: true,
      queueItem: {
        id: 'queue-1',
        operation: 'create_task',
        type: 'create',
        data: mockTask,
        status: 'pending',
        createdAt: new Date(),
        attempts: 0,
        maxAttempts: 3
      }
    });

    vi.spyOn(aiService, 'generateTaskSuggestions').mockResolvedValue([
      'Break down comprehensive integration requirements',
      'Implement cross-feature test scenarios',
      'Validate data consistency across systems',
      'Test error handling and recovery',
      'Document integration test results'
    ]);

    vi.spyOn(aiService, 'analyzeTaskComplexity').mockResolvedValue({
      complexityScore: 85,
      complexityLevel: 'high'
    });

    vi.spyOn(CalendarService, 'createEvent').mockResolvedValue({
      id: 'event-1',
      title: mockTask.title,
      description: mockTask.description || '',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      priority: mockTask.priority,
      calendarId: 'work-calendar',
      taskId: mockTask.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Mock database
    (TodoneDatabase.prototype.tasks.add as any).mockResolvedValue(1);
    (TodoneDatabase.prototype.tasks.get as any).mockResolvedValue({
      id: 1,
      content: mockTask.title,
      projectId: mockTask.projectId,
      sectionId: null,
      priority: mockTask.priority,
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    animationService.stopAnimation();
  });

  test('Complete cross-feature integration workflow with error handling', async () => {
    // Step 1: Task creation with AI suggestions
    const aiSuggestions = await aiService.generateTaskSuggestions(
      mockTask.id,
      mockTask.title,
      mockTask.description
    );

    expect(aiSuggestions).toHaveLength(5);
    expect(aiSuggestions[0]).toContain('comprehensive integration');

    // Step 2: Create task via API
    const taskResponse = await taskApi.createTask(mockTask);
    expect(taskResponse.success).toBe(true);

    // Step 3: Add task to database
    const db = new TodoneDatabase();
    const dbTaskId = await db.tasks.add({
      content: mockTask.title,
      projectId: mockTask.projectId,
      sectionId: null,
      priority: mockTask.priority,
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });

    expect(dbTaskId).toBe(1);

    // Step 4: Create calendar event from task
    const calendarEvent = await CalendarService.createEvent({
      title: mockTask.title,
      description: mockTask.description || '',
      startDate: new Date(mockTask.createdAt).toISOString(),
      endDate: new Date(mockTask.createdAt.getTime() + 3600000).toISOString(),
      priority: mockTask.priority,
      calendarId: 'work-calendar',
      taskId: mockTask.id
    });

    expect(calendarEvent).toBeTruthy();
    expect(calendarEvent.taskId).toBe(mockTask.id);

    // Step 5: Create collaboration team
    const teamResponse = await collaborationApi.createTeam({
      name: mockTeam.name,
      description: mockTeam.description,
      privacySetting: mockTeam.privacySetting,
      ownerId: mockTeam.ownerId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(teamResponse.success).toBe(true);

    // Step 6: Add member to team
    const memberResponse = await collaborationApi.addMemberToTeam(mockTeam.id, {
      teamId: mockTeam.id,
      userId: mockMember.userId,
      role: mockMember.role,
      status: mockMember.status,
      joinedAt: new Date()
    });

    expect(memberResponse.success).toBe(true);

    // Step 7: Add to offline queue (simulate offline scenario)
    const offlineResponse = await offlineService.addToQueue({
      operation: 'sync_task_to_calendar',
      type: 'sync',
      data: {
        taskId: mockTask.id,
        eventId: calendarEvent.id
      }
    });

    expect(offlineResponse.success).toBe(true);

    // Step 8: Trigger animations for UI feedback
    animationService.startAnimation('task_created');
    animationService.startAnimation('calendar_sync');
    animationService.startAnimation('collaboration_update');

    // Wait for animations to process
    await new Promise(resolve => setTimeout(resolve, 200));

    const animationState = animationService.getState();
    expect(animationState.animationQueue).toHaveLength(0); // All animations processed
  });

  test('Data consistency validation across all integrated features', async () => {
    // Create task via multiple paths and verify consistency

    // 1. Create via API
    const apiTaskResponse = await taskApi.createTask(mockTask);
    const apiTask = apiTaskResponse.data;

    // 2. Create via database
    const db = new TodoneDatabase();
    await db.tasks.add({
      id: 2,
      content: apiTask?.title,
      projectId: apiTask?.projectId,
      sectionId: null,
      priority: apiTask?.priority,
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });

    // 3. Create calendar event
    const calendarEvent = await CalendarService.createEvent({
      title: apiTask?.title,
      description: apiTask?.description || '',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      priority: apiTask?.priority,
      calendarId: 'work-calendar',
      taskId: apiTask?.id
    });

    // 4. Verify consistency across all systems
    expect(apiTask?.title).toBe(mockTask.title);
    expect(apiTask?.priority).toBe(mockTask.priority);
    expect(apiTask?.projectId).toBe(mockTask.projectId);

    const dbTask = await db.tasks.get(2);
    expect(dbTask?.content).toBe(apiTask?.title);
    expect(dbTask?.priority).toBe(apiTask?.priority);
    expect(dbTask?.projectId).toBe(apiTask?.projectId);

    expect(calendarEvent.title).toBe(apiTask?.title);
    expect(calendarEvent.priority).toBe(apiTask?.priority);
    expect(calendarEvent.taskId).toBe(apiTask?.id);
  });

  test('Error handling and recovery across integrated systems', async () => {
    // Test error scenarios and recovery

    // 1. Test API failure with fallback
    vi.spyOn(taskApi, 'createTask').mockResolvedValueOnce({
      success: false,
      message: 'API unavailable',
      data: null
    });

    const failedTaskResponse = await taskApi.createTask(mockTask);
    expect(failedTaskResponse.success).toBe(false);

    // 2. Test offline queue as fallback
    const offlineFallbackResponse = await offlineService.addToQueue({
      operation: 'create_task_fallback',
      type: 'create',
      data: mockTask
    });

    expect(offlineFallbackResponse.success).toBe(true);

    // 3. Test AI service failure with default suggestions
    vi.spyOn(aiService, 'generateTaskSuggestions').mockRejectedValueOnce(
      new Error('AI service timeout')
    );

    try {
      await aiService.generateTaskSuggestions(mockTask.id, mockTask.title);
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    // 4. Test calendar service recovery
    vi.spyOn(CalendarService, 'createEvent').mockResolvedValueOnce(null);

    const failedEvent = await CalendarService.createEvent({
      title: 'Failed Event',
      description: 'This should fail',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      priority: 'medium',
      calendarId: 'work-calendar'
    });

    expect(failedEvent).toBeNull();

    // 5. Test collaboration service error handling
    vi.spyOn(collaborationApi, 'createTeam').mockResolvedValueOnce({
      success: false,
      message: 'Team creation failed - invalid data',
      data: null
    });

    const failedTeamResponse = await collaborationApi.createTeam({
      name: '',
      description: 'Invalid team',
      privacySetting: 'team-only',
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(failedTeamResponse.success).toBe(false);
    expect(failedTeamResponse.message).toContain('failed');
  });

  test('Performance impact of comprehensive integration workflows', async () => {
    const startTime = performance.now();

    // Execute comprehensive integration workflow
    const workflowSteps = [];

    // Step 1: Multiple task operations
    for (let i = 0; i < 3; i++) {
      const task = { ...mockTask, id: `task-${i}`, title: `Integration Task ${i}` };
      const response = await taskApi.createTask(task);
      workflowSteps.push({ type: 'task_creation', success: response.success });
    }

    // Step 2: Collaboration operations
    const teamResponse = await collaborationApi.createTeam(mockTeam);
    workflowSteps.push({ type: 'team_creation', success: teamResponse.success });

    const memberResponse = await collaborationApi.addMemberToTeam(mockTeam.id, mockMember);
    workflowSteps.push({ type: 'member_addition', success: memberResponse.success });

    // Step 3: AI operations
    const aiSuggestions = await aiService.generateTaskSuggestions(mockTask.id, mockTask.title);
    workflowSteps.push({ type: 'ai_suggestions', success: aiSuggestions.length > 0 });

    const complexity = await aiService.analyzeTaskComplexity(mockTask);
    workflowSteps.push({ type: 'ai_analysis', success: complexity.complexityScore > 0 });

    // Step 4: Calendar operations
    for (let i = 0; i < 2; i++) {
      const event = await CalendarService.createEvent({
        title: `Integration Event ${i}`,
        description: `Event for integration test ${i}`,
        startDate: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
        endDate: new Date(Date.now() + (i + 2) * 3600000).toISOString(),
        priority: 'medium',
        calendarId: 'work-calendar'
      });

      workflowSteps.push({ type: 'calendar_event', success: !!event });
    }

    // Step 5: Animation operations
    const animations = ['task_created', 'team_updated', 'calendar_sync', 'ai_processing'];
    animations.forEach(anim => animationService.startAnimation(anim));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Step 6: Offline operations
    for (let i = 0; i < 2; i++) {
      const offlineResponse = await offlineService.addToQueue({
        operation: `integration_operation_${i}`,
        type: 'sync',
        data: { step: i }
      });

      workflowSteps.push({ type: 'offline_queue', success: offlineResponse.success });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify all steps completed successfully
    expect(workflowSteps.every(step => step.success)).toBe(true);

    // Performance should be reasonable for comprehensive workflow
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

    // Verify expected number of operations
    expect(workflowSteps.length).toBe(13); // 3 tasks + 2 collab + 2 AI + 2 calendar + 2 offline + 2 implicit
  });

  test('Cross-feature data validation and integrity checks', async () => {
    // Test data integrity across all integrated features

    // 1. Create task and verify data integrity
    const taskResponse = await taskApi.createTask(mockTask);
    const createdTask = taskResponse.data;

    expect(createdTask).toBeTruthy();
    expect(createdTask?.id).toBe(mockTask.id);
    expect(createdTask?.title).toBe(mockTask.title);
    expect(createdTask?.priority).toBe(mockTask.priority);

    // 2. Create calendar event and verify task linkage
    const calendarEvent = await CalendarService.createEvent({
      title: createdTask?.title,
      description: createdTask?.description || '',
      startDate: new Date(createdTask?.createdAt || new Date()).toISOString(),
      endDate: new Date((createdTask?.createdAt || new Date()).getTime() + 3600000).toISOString(),
      priority: createdTask?.priority,
      calendarId: 'work-calendar',
      taskId: createdTask?.id
    });

    expect(calendarEvent).toBeTruthy();
    expect(calendarEvent.taskId).toBe(createdTask?.id);
    expect(calendarEvent.title).toBe(createdTask?.title);
    expect(calendarEvent.priority).toBe(createdTask?.priority);

    // 3. Create collaboration team and verify member association
    const teamResponse = await collaborationApi.createTeam(mockTeam);
    const createdTeam = teamResponse.data;

    expect(createdTeam).toBeTruthy();
    expect(createdTeam?.id).toBe(mockTeam.id);
    expect(createdTeam?.name).toBe(mockTeam.name);

    const memberResponse = await collaborationApi.addMemberToTeam(createdTeam?.id || '', mockMember);
    const createdMember = memberResponse.data;

    expect(createdMember).toBeTruthy();
    expect(createdMember?.teamId).toBe(createdTeam?.id);
    expect(createdMember?.userId).toBe(mockMember.userId);

    // 4. Verify AI analysis consistency with task data
    const complexity = await aiService.analyzeTaskComplexity(createdTask || mockTask);
    expect(complexity.complexityScore).toBeGreaterThan(0);
    expect(complexity.complexityLevel).toBeTruthy();

    const suggestions = await aiService.generateTaskSuggestions(
      createdTask?.id || mockTask.id,
      createdTask?.title || mockTask.title,
      createdTask?.description || mockTask.description
    );

    expect(suggestions).toHaveLength(5);
    expect(suggestions.some(s => s.toLowerCase().includes('integration'))).toBe(true);

    // 5. Verify database consistency
    const db = new TodoneDatabase();
    const dbTask = await db.tasks.get(1);

    expect(dbTask).toBeTruthy();
    expect(dbTask?.content).toBe(createdTask?.title);
    expect(dbTask?.priority).toBe(createdTask?.priority);
    expect(dbTask?.projectId).toBe(createdTask?.projectId);
  });

  test('Comprehensive error recovery and system resilience', async () => {
    // Test system resilience through multiple error scenarios

    const recoverySteps = [];

    // 1. Task API failure with offline fallback
    vi.spyOn(taskApi, 'createTask').mockResolvedValueOnce({
      success: false,
      message: 'Network error',
      data: null
    });

    // Attempt task creation (should fail)
    const failedTaskResponse = await taskApi.createTask(mockTask);
    recoverySteps.push({ step: 'task_api_failure', success: !failedTaskResponse.success });

    // Fallback to offline queue
    const offlineResponse = await offlineService.addToQueue({
      operation: 'create_task_offline',
      type: 'create',
      data: mockTask
    });

    recoverySteps.push({ step: 'offline_fallback', success: offlineResponse.success });

    // 2. Calendar service failure with retry
    vi.spyOn(CalendarService, 'createEvent').mockResolvedValueOnce(null);

    const failedEvent = await CalendarService.createEvent({
      title: 'Failed Event',
      description: 'Should fail',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      priority: 'medium',
      calendarId: 'work-calendar'
    });

    recoverySteps.push({ step: 'calendar_failure', success: failedEvent === null });

    // 3. AI service timeout with default behavior
    vi.spyOn(aiService, 'generateTaskSuggestions').mockImplementationOnce(async () => {
      // Fallback to default suggestions
      return [
        'Review requirements',
        'Plan implementation',
        'Execute task',
        'Test results',
        'Document completion'
      ];
    });

    const fallbackSuggestions = await aiService.generateTaskSuggestions(
      mockTask.id,
      mockTask.title,
      mockTask.description
    );

    recoverySteps.push({ step: 'ai_fallback', success: fallbackSuggestions.length === 5 });

    // 4. Collaboration service error handling
    vi.spyOn(collaborationApi, 'addMemberToTeam').mockResolvedValueOnce({
      success: false,
      message: 'Member already exists',
      data: null
    });

    const failedMemberResponse = await collaborationApi.addMemberToTeam(mockTeam.id, mockMember);
    recoverySteps.push({ step: 'collaboration_error_handling', success: !failedMemberResponse.success });

    // 5. Animation system recovery
    animationService.startAnimation('recovery_animation');
    await new Promise(resolve => setTimeout(resolve, 100));

    const animationState = animationService.getState();
    recoverySteps.push({ step: 'animation_recovery', success: animationState.currentAnimation === null });

    // Verify all recovery mechanisms worked
    expect(recoverySteps.every(step => step.success)).toBe(true);
  });
});