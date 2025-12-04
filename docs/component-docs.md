# Todone Component Documentation

## 📚 Overview
Comprehensive documentation for all UI components with props, usage examples, and implementation details.

## 🧩 Core Components

### PriorityBadge
**Props**
```typescript
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}
```

**Usage**
```jsx
<PriorityBadge priority="high" />
<PriorityBadge priority="medium" className="custom-class" />
```

**Features**
- Visual priority indication
- Customizable styling
- Accessibility support

### StatusBadge
**Props**
```typescript
interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'done';
  className?: string;
}
```

**Usage**
```jsx
<StatusBadge status="todo" />
<StatusBadge status="in-progress" className="custom-status" />
```

### TaskList
**Props**
```typescript
interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  className?: string;
}
```

**Usage**
```jsx
<TaskList
  tasks={tasks}
  onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
  onTaskComplete={(taskId) => completeTask(taskId)}
/>
```

## 🎨 UI Components

### Button
**Props**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}
```

**Usage**
```jsx
<Button onClick={handleClick} variant="primary" size="lg">
  Click Me
</Button>
```

### Modal
**Props**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage**
```jsx
<Modal isOpen={isModalOpen} onClose={closeModal} title="Task Details">
  <TaskForm onSubmit={handleSubmit} />
</Modal>
```

## 📦 Container Components

### TaskManagementSystem
**Props**
```typescript
interface TaskManagementSystemProps {
  userId: string;
  initialView?: 'list' | 'board' | 'calendar';
  onTaskCreated?: (task: Task) => void;
}
```

**Usage**
```jsx
<TaskManagementSystem
  userId="current-user-id"
  initialView="list"
  onTaskCreated={(task) => showNotification(`Task created: ${task.title}`)}
/>
```

## 🧪 Testing Components

All components include comprehensive test coverage with:
- Unit tests for individual functionality
- Integration tests for component interactions
- Accessibility tests
- Performance tests

## 📖 Component Patterns

### Composition Pattern
```jsx
function TaskCard({ task }) {
  return (
    <div className="task-card">
      <PriorityBadge priority={task.priority} />
      <StatusBadge status={task.status} />
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
}
```

### Compound Components
```jsx
function TaskForm({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      {children}
    </form>
  );
}

TaskForm.Title = function Title({ children }) {
  return <h2 className="form-title">{children}</h2>;
};

TaskForm.Field = function Field({ label, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
};
```

## 🔧 Best Practices

### Type Safety
All components use TypeScript interfaces for props validation.

### Accessibility
Components follow WCAG guidelines with proper ARIA attributes.

### Performance
Optimized rendering with React.memo and useMemo where appropriate.

### Documentation
Each component includes JSDoc comments and usage examples.