/**
 * Core data models for Todone application
 * Implements comprehensive data models with proper TypeScript interfaces
 */

import {
  PriorityLevel,
  TaskStatus,
  ViewType,
  RecurringPattern,
  ProjectColor,
  LabelColor,
  UserRole,
  AuthProvider,
  UserStatus,
  ProjectVisibility,
  TaskDependencyType,
  TaskRepeatFrequency,
  TaskRepeatEnd
} from './enums';

import {
  User,
  Project,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
  Section
} from './common';

/**
 * User Model Implementation
 * Comprehensive user model with all required fields
 */
export class UserModel implements User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  settings?: any;
  preferences?: any;
  stats?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User> = {}) {
    this.id = data.id || this.generateId();
    this.email = data.email || '';
    this.name = data.name || '';
    this.avatar = data.avatar || null;
    this.settings = data.settings || {};
    this.preferences = data.preferences || {};
    this.stats = data.stats || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update user data
   */
  update(data: Partial<User>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Get user display name
   */
  getDisplayName(): string {
    return this.name || this.email.split('@')[0];
  }

  /**
   * Get user initials
   */
  getInitials(): string {
    const names = this.name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  /**
   * Validate user data
   */
  validate(): boolean {
    return !!this.email && !!this.name;
  }

  /**
   * Convert to JSON
   */
  toJSON(): User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      settings: this.settings,
      preferences: this.preferences,
      stats: this.stats,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Project Model Implementation
 * Comprehensive project model with hierarchical structure
 */
export class ProjectModel implements Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  viewType: ViewType;
  favorite: boolean;
  shared: boolean;
  parentProjectId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Extended properties
  childProjectIds?: string[];
  sectionIds?: string[];
  taskIds?: string[];
  labelIds?: string[];
  memberIds?: string[];
  ownerId?: string;
  status?: 'active' | 'archived' | 'completed';
  visibility?: ProjectVisibility;
  settings?: {
    allowComments: boolean;
    allowAttachments: boolean;
    taskCreationRestricted: boolean;
    maxTaskSize: number;
  };
  customFields?: Record<string, any>;
  metadata?: {
    createdBy?: string;
    lastUpdatedBy?: string;
    version?: number;
    source?: string;
  };

  constructor(data: Partial<Project> = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || 'Untitled Project';
    this.description = data.description || '';
    this.color = data.color || 'blue';
    this.viewType = data.viewType || ViewType.LIST;
    this.favorite = data.favorite || false;
    this.shared = data.shared || false;
    this.parentProjectId = data.parentProjectId || null;
    this.childProjectIds = data.childProjectIds || [];
    this.sectionIds = data.sectionIds || [];
    this.taskIds = data.taskIds || [];
    this.labelIds = data.labelIds || [];
    this.memberIds = data.memberIds || [];
    this.ownerId = data.ownerId;
    this.status = data.status || 'active';
    this.visibility = data.visibility || ProjectVisibility.PRIVATE;
    this.settings = data.settings || {
      allowComments: true,
      allowAttachments: true,
      taskCreationRestricted: false,
      maxTaskSize: 100
    };
    this.customFields = data.customFields || {};
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'project_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update project data
   */
  update(data: Partial<Project>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Add child project
   */
  addChildProject(projectId: string): void {
    if (!this.childProjectIds.includes(projectId)) {
      this.childProjectIds.push(projectId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove child project
   */
  removeChildProject(projectId: string): void {
    this.childProjectIds = this.childProjectIds.filter(id => id !== projectId);
    this.updatedAt = new Date();
  }

  /**
   * Add section
   */
  addSection(sectionId: string): void {
    if (!this.sectionIds.includes(sectionId)) {
      this.sectionIds.push(sectionId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove section
   */
  removeSection(sectionId: string): void {
    this.sectionIds = this.sectionIds.filter(id => id !== sectionId);
    this.updatedAt = new Date();
  }

  /**
   * Add task
   */
  addTask(taskId: string): void {
    if (!this.taskIds.includes(taskId)) {
      this.taskIds.push(taskId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove task
   */
  removeTask(taskId: string): void {
    this.taskIds = this.taskIds.filter(id => id !== taskId);
    this.updatedAt = new Date();
  }

  /**
   * Add label
   */
  addLabel(labelId: string): void {
    if (!this.labelIds.includes(labelId)) {
      this.labelIds.push(labelId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove label
   */
  removeLabel(labelId: string): void {
    this.labelIds = this.labelIds.filter(id => id !== labelId);
    this.updatedAt = new Date();
  }

  /**
   * Add member
   */
  addMember(userId: string): void {
    if (!this.memberIds.includes(userId)) {
      this.memberIds.push(userId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove member
   */
  removeMember(userId: string): void {
    this.memberIds = this.memberIds.filter(id => id !== userId);
    this.updatedAt = new Date();
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(): void {
    this.favorite = !this.favorite;
    this.updatedAt = new Date();
  }

  /**
   * Validate project data
   */
  validate(): boolean {
    return !!this.name && this.name.length <= 100;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Project {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      viewType: this.viewType,
      favorite: this.favorite,
      shared: this.shared,
      parentProjectId: this.parentProjectId,
      childProjectIds: this.childProjectIds,
      sectionIds: this.sectionIds,
      taskIds: this.taskIds,
      labelIds: this.labelIds,
      memberIds: this.memberIds,
      ownerId: this.ownerId,
      status: this.status,
      visibility: this.visibility,
      settings: this.settings,
      customFields: this.customFields,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Section Model Implementation
 * Section model with ordering capabilities
 */
export class SectionModel implements Section {
  id: string;
  name: string;
  projectId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  taskIds?: string[];
  collapsed?: boolean;
  color?: string;
  description?: string;

  constructor(data: Partial<Section> = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || 'Untitled Section';
    this.projectId = data.projectId || '';
    this.order = data.order || 0;
    this.taskIds = data.taskIds || [];
    this.collapsed = data.collapsed || false;
    this.color = data.color;
    this.description = data.description;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'section_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update section data
   */
  update(data: Partial<Section>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Add task to section
   */
  addTask(taskId: string): void {
    if (!this.taskIds.includes(taskId)) {
      this.taskIds.push(taskId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove task from section
   */
  removeTask(taskId: string): void {
    this.taskIds = this.taskIds.filter(id => id !== taskId);
    this.updatedAt = new Date();
  }

  /**
   * Toggle collapsed state
   */
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.updatedAt = new Date();
  }

  /**
   * Validate section data
   */
  validate(): boolean {
    return !!this.name && !!this.projectId;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Section {
    return {
      id: this.id,
      name: this.name,
      projectId: this.projectId,
      order: this.order,
      taskIds: this.taskIds,
      collapsed: this.collapsed,
      color: this.color,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Task Model Implementation
 * Comprehensive task model with all properties
 */
export class TaskModel implements Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate?: Date | null;
  dueTime?: string | null;
  duration?: number | null;
  recurringPattern?: RecurringPattern | null;
  parentTaskId?: string | null;
  order: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  projectId?: string | null;
  sectionId?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
  attachmentIds?: string[];
  commentIds?: string[];
  dependencies?: string[];
  tags?: string[];
  customFields?: Record<string, any>;

  // Extended properties for recurring tasks
  recurring?: {
    frequency: TaskRepeatFrequency;
    interval: number;
    end: TaskRepeatEnd;
    endDate?: Date;
    occurrences?: number;
    weekdays?: number[];
    monthDay?: number;
    monthWeek?: number;
    monthWeekDay?: number;
  };

  // Extended properties for task relationships
  relationships?: {
    blockedBy?: string[];
    blocks?: string[];
    relatedTo?: string[];
    duplicates?: string[];
  };

  constructor(data: Partial<Task> = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || 'Untitled Task';
    this.description = data.description || '';
    this.status = data.status || TaskStatus.ACTIVE;
    this.priority = data.priority || PriorityLevel.P3;
    this.dueDate = data.dueDate || null;
    this.dueTime = data.dueTime || null;
    this.duration = data.duration || null;
    this.recurringPattern = data.recurringPattern || null;
    this.parentTaskId = data.parentTaskId || null;
    this.order = data.order || 0;
    this.completed = data.completed || false;
    this.completedAt = data.completedAt || null;
    this.projectId = data.projectId || null;
    this.sectionId = data.sectionId || null;
    this.assigneeId = data.assigneeId || null;
    this.labelIds = data.labelIds || [];
    this.attachmentIds = data.attachmentIds || [];
    this.commentIds = data.commentIds || [];
    this.dependencies = data.dependencies || [];
    this.tags = data.tags || [];
    this.customFields = data.customFields || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'task_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update task data
   */
  update(data: Partial<Task>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Complete task
   */
  complete(): void {
    this.completed = true;
    this.completedAt = new Date();
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  /**
   * Reopen task
   */
  reopen(): void {
    this.completed = false;
    this.completedAt = null;
    this.status = TaskStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Archive task
   */
  archive(): void {
    this.status = TaskStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  /**
   * Add label
   */
  addLabel(labelId: string): void {
    if (!this.labelIds.includes(labelId)) {
      this.labelIds.push(labelId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove label
   */
  removeLabel(labelId: string): void {
    this.labelIds = this.labelIds.filter(id => id !== labelId);
    this.updatedAt = new Date();
  }

  /**
   * Add attachment
   */
  addAttachment(attachmentId: string): void {
    if (!this.attachmentIds.includes(attachmentId)) {
      this.attachmentIds.push(attachmentId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove attachment
   */
  removeAttachment(attachmentId: string): void {
    this.attachmentIds = this.attachmentIds.filter(id => id !== attachmentId);
    this.updatedAt = new Date();
  }

  /**
   * Add comment
   */
  addComment(commentId: string): void {
    if (!this.commentIds.includes(commentId)) {
      this.commentIds.push(commentId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove comment
   */
  removeComment(commentId: string): void {
    this.commentIds = this.commentIds.filter(id => id !== commentId);
    this.updatedAt = new Date();
  }

  /**
   * Add dependency
   */
  addDependency(taskId: string, type: TaskDependencyType = 'depends_on'): void {
    if (!this.dependencies.includes(taskId)) {
      this.dependencies.push(taskId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove dependency
   */
  removeDependency(taskId: string): void {
    this.dependencies = this.dependencies.filter(id => id !== taskId);
    this.updatedAt = new Date();
  }

  /**
   * Add tag
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  /**
   * Set custom field
   */
  setCustomField(key: string, value: any): void {
    this.customFields[key] = value;
    this.updatedAt = new Date();
  }

  /**
   * Get custom field
   */
  getCustomField(key: string): any {
    return this.customFields[key];
  }

  /**
   * Validate task data
   */
  validate(): boolean {
    return !!this.title && this.title.length <= 200;
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.completed) return false;
    return new Date() > this.dueDate;
  }

  /**
   * Check if task is due soon (within 24 hours)
   */
  isDueSoon(): boolean {
    if (!this.dueDate || this.completed) return false;
    const now = new Date();
    const dueSoon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return this.dueDate <= dueSoon && this.dueDate >= now;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Task {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      dueTime: this.dueTime,
      duration: this.duration,
      recurringPattern: this.recurringPattern,
      parentTaskId: this.parentTaskId,
      order: this.order,
      completed: this.completed,
      completedAt: this.completedAt,
      projectId: this.projectId,
      sectionId: this.sectionId,
      assigneeId: this.assigneeId,
      labelIds: this.labelIds,
      attachmentIds: this.attachmentIds,
      commentIds: this.commentIds,
      dependencies: this.dependencies,
      tags: this.tags,
      customFields: this.customFields,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Label Model Implementation
 * Label model with color coding
 */
export class LabelModel implements Label {
  id: string;
  name: string;
  color: string;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Label> = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || 'Untitled Label';
    this.color = data.color || 'blue-500';
    this.isPersonal = data.isPersonal || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'label_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update label data
   */
  update(data: Partial<Label>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Validate label data
   */
  validate(): boolean {
    return !!this.name && this.name.length <= 50;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Label {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isPersonal: this.isPersonal,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Filter Model Implementation
 * Filter model with criteria support
 */
export class FilterModel implements Filter {
  id: string;
  name: string;
  criteria: Record<string, any>;
  color: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Filter> = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || 'Untitled Filter';
    this.criteria = data.criteria || {};
    this.color = data.color || 'gray-500';
    this.favorite = data.favorite || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'filter_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update filter data
   */
  update(data: Partial<Filter>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(): void {
    this.favorite = !this.favorite;
    this.updatedAt = new Date();
  }

  /**
   * Validate filter data
   */
  validate(): boolean {
    return !!this.name && this.name.length <= 100;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Filter {
    return {
      id: this.id,
      name: this.name,
      criteria: this.criteria,
      color: this.color,
      favorite: this.favorite,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Comment Model Implementation
 * Comment model with attachments
 */
export class CommentModel implements Comment {
  id: string;
  taskId: string;
  user: string;
  content: string;
  attachments?: string[];
  timestamp: Date;

  constructor(data: Partial<Comment> = {}) {
    this.id = data.id || this.generateId();
    this.taskId = data.taskId || '';
    this.user = data.user || '';
    this.content = data.content || '';
    this.attachments = data.attachments || [];
    this.timestamp = data.timestamp || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'comment_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update comment data
   */
  update(data: Partial<Comment>): void {
    Object.assign(this, data);
  }

  /**
   * Add attachment
   */
  addAttachment(attachmentId: string): void {
    if (!this.attachments.includes(attachmentId)) {
      this.attachments.push(attachmentId);
    }
  }

  /**
   * Remove attachment
   */
  removeAttachment(attachmentId: string): void {
    this.attachments = this.attachments.filter(id => id !== attachmentId);
  }

  /**
   * Validate comment data
   */
  validate(): boolean {
    return !!this.content && !!this.taskId && !!this.user;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Comment {
    return {
      id: this.id,
      taskId: this.taskId,
      user: this.user,
      content: this.content,
      attachments: this.attachments,
      timestamp: this.timestamp
    };
  }
}

/**
 * Attachment Model Implementation
 * Attachment model with file types
 */
export class AttachmentModel implements Attachment {
  id: string;
  fileName: string;
  url: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    size: number;
    mimeType: string;
    previewUrl?: string;
    taskId?: string;
    userId?: string;
  };

  constructor(data: Partial<Attachment> = {}) {
    this.id = data.id || this.generateId();
    this.fileName = data.fileName || 'Untitled';
    this.url = data.url || '';
    this.type = data.type || 'file';
    this.metadata = data.metadata || {
      size: 0,
      mimeType: 'application/octet-stream'
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'attachment_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update attachment data
   */
  update(data: Partial<Attachment>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }

  /**
   * Set metadata
   */
  setMetadata(metadata: Partial<Attachment['metadata']>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Validate attachment data
   */
  validate(): boolean {
    return !!this.fileName && !!this.url;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Attachment {
    return {
      id: this.id,
      fileName: this.fileName,
      url: this.url,
      type: this.type,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Model Factory for creating model instances
 */
export class ModelFactory {
  /**
   * Create user model
   */
  static createUser(data: Partial<User> = {}): UserModel {
    return new UserModel(data);
  }

  /**
   * Create project model
   */
  static createProject(data: Partial<Project> = {}): ProjectModel {
    return new ProjectModel(data);
  }

  /**
   * Create section model
   */
  static createSection(data: Partial<Section> = {}): SectionModel {
    return new SectionModel(data);
  }

  /**
   * Create task model
   */
  static createTask(data: Partial<Task> = {}): TaskModel {
    return new TaskModel(data);
  }

  /**
   * Create label model
   */
  static createLabel(data: Partial<Label> = {}): LabelModel {
    return new LabelModel(data);
  }

  /**
   * Create filter model
   */
  static createFilter(data: Partial<Filter> = {}): FilterModel {
    return new FilterModel(data);
  }

  /**
   * Create comment model
   */
  static createComment(data: Partial<Comment> = {}): CommentModel {
    return new CommentModel(data);
  }

  /**
   * Create attachment model
   */
  static createAttachment(data: Partial<Attachment> = {}): AttachmentModel {
    return new AttachmentModel(data);
  }

  /**
   * Create models from array data
   */
  static createFromArray<T extends User | Project | Section | Task | Label | Filter | Comment | Attachment>(
    ModelClass: new (data: Partial<T>) => any,
    dataArray: Partial<T>[]
  ): any[] {
    return dataArray.map(data => new ModelClass(data));
  }
}

/**
 * Model validation utilities
 */
export class ModelValidator {
  /**
   * Validate user model
   */
  static validateUser(user: User): boolean {
    return !!user.email && !!user.name && user.email.includes('@');
  }

  /**
   * Validate project model
   */
  static validateProject(project: Project): boolean {
    return !!project.name && project.name.length <= 100;
  }

  /**
   * Validate section model
   */
  static validateSection(section: Section): boolean {
    return !!section.name && !!section.projectId;
  }

  /**
   * Validate task model
   */
  static validateTask(task: Task): boolean {
    return !!task.title && task.title.length <= 200;
  }

  /**
   * Validate label model
   */
  static validateLabel(label: Label): boolean {
    return !!label.name && label.name.length <= 50;
  }

  /**
   * Validate filter model
   */
  static validateFilter(filter: Filter): boolean {
    return !!filter.name && filter.name.length <= 100;
  }

  /**
   * Validate comment model
   */
  static validateComment(comment: Comment): boolean {
    return !!comment.content && !!comment.taskId && !!comment.user;
  }

  /**
   * Validate attachment model
   */
  static validateAttachment(attachment: Attachment): boolean {
    return !!attachment.fileName && !!attachment.url;
  }
}

/**
 * Model transformation utilities
 */
export class ModelTransformer {
  /**
   * Transform API user data to model
   */
  static apiUserToModel(apiUser: any): UserModel {
    return new UserModel({
      id: apiUser.id || apiUser.userId,
      email: apiUser.email,
      name: apiUser.name || apiUser.fullName,
      avatar: apiUser.avatarUrl || apiUser.avatar,
      settings: apiUser.settings,
      preferences: apiUser.preferences,
      stats: apiUser.statistics,
      createdAt: new Date(apiUser.createdAt || apiUser.createdDate),
      updatedAt: new Date(apiUser.updatedAt || apiUser.updatedDate)
    });
  }

  /**
   * Transform API project data to model
   */
  static apiProjectToModel(apiProject: any): ProjectModel {
    return new ProjectModel({
      id: apiProject.id || apiProject.projectId,
      name: apiProject.name,
      description: apiProject.description,
      color: apiProject.color || 'blue',
      viewType: apiProject.viewType || ViewType.LIST,
      favorite: apiProject.favorite || false,
      shared: apiProject.shared || false,
      parentProjectId: apiProject.parentProjectId,
      childProjectIds: apiProject.childProjectIds || [],
      sectionIds: apiProject.sectionIds || [],
      taskIds: apiProject.taskIds || [],
      labelIds: apiProject.labelIds || [],
      memberIds: apiProject.memberIds || [],
      ownerId: apiProject.ownerId,
      status: apiProject.status || 'active',
      visibility: apiProject.visibility || ProjectVisibility.PRIVATE,
      settings: apiProject.settings,
      customFields: apiProject.customFields,
      metadata: apiProject.metadata,
      createdAt: new Date(apiProject.createdAt || apiProject.createdDate),
      updatedAt: new Date(apiProject.updatedAt || apiProject.updatedDate)
    });
  }

  /**
   * Transform API task data to model
   */
  static apiTaskToModel(apiTask: any): TaskModel {
    return new TaskModel({
      id: apiTask.id || apiTask.taskId,
      title: apiTask.title,
      description: apiTask.description,
      status: apiTask.status || TaskStatus.ACTIVE,
      priority: apiTask.priority || PriorityLevel.P3,
      dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : null,
      dueTime: apiTask.dueTime,
      duration: apiTask.duration,
      recurringPattern: apiTask.recurringPattern,
      parentTaskId: apiTask.parentTaskId,
      order: apiTask.order || 0,
      completed: apiTask.completed || false,
      completedAt: apiTask.completedAt ? new Date(apiTask.completedAt) : null,
      projectId: apiTask.projectId,
      sectionId: apiTask.sectionId,
      assigneeId: apiTask.assigneeId,
      labelIds: apiTask.labelIds || [],
      attachmentIds: apiTask.attachmentIds || [],
      commentIds: apiTask.commentIds || [],
      dependencies: apiTask.dependencies || [],
      tags: apiTask.tags || [],
      customFields: apiTask.customFields,
      createdAt: new Date(apiTask.createdAt || apiTask.createdDate),
      updatedAt: new Date(apiTask.updatedAt || apiTask.updatedDate)
    });
  }
}