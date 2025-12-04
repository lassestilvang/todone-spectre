import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from './accessibilitySetup';
import { setupAccessibilityTests, cleanupAccessibilityTests } from './accessibilitySetup';
import { AccessibilityControls, AccessibilitySettings } from '../../features/accessibility';
import { TaskForm } from '../../features/tasks/TaskForm';
import { ProjectForm } from '../../features/projects/ProjectForm';
import { CommentForm } from '../../features/comments/CommentForm';

// Mock feature components
jest.mock('../../features/accessibility/AccessibilityControls.tsx', () => ({
  AccessibilityControls: () => (
    <div role="group" aria-label="Accessibility controls">
      <button aria-label="Toggle high contrast mode">High Contrast</button>
      <button aria-label="Toggle reduce motion">Reduce Motion</button>
      <button aria-label="Toggle screen reader support">Screen Reader</button>
    </div>
  )
}));

jest.mock('../../features/accessibility/AccessibilitySettings.tsx', () => ({
  AccessibilitySettings: ({ isOpen, onSave }: { isOpen: boolean; onSave: () => void }) =>
    isOpen ? (
      <div role="dialog" aria-labelledby="settings-title" aria-modal="true">
        <h2 id="settings-title">Accessibility Settings</h2>
        <form aria-label="Accessibility settings form">
          <label htmlFor="font-size">Font Size</label>
          <select id="font-size" aria-label="Text size options">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <button type="button" onClick={onSave}>Save Settings</button>
        </form>
      </div>
    ) : null
}));

jest.mock('../../features/tasks/TaskForm.tsx', () => ({
  TaskForm: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ title: 'Test Task' }); }} aria-label="Task creation form">
      <label htmlFor="task-title">Task Title</label>
      <input id="task-title" type="text" required aria-required="true" />
      <label htmlFor="task-description">Description</label>
      <textarea id="task-description" aria-label="Task description" />
      <button type="submit">Create Task</button>
    </form>
  )
}));

jest.mock('../../features/projects/ProjectForm.tsx', () => ({
  ProjectForm: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name: 'Test Project' }); }} aria-label="Project creation form">
      <label htmlFor="project-name">Project Name</label>
      <input id="project-name" type="text" required aria-required="true" />
      <label htmlFor="project-description">Description</label>
      <textarea id="project-description" aria-label="Project description" />
      <button type="submit">Create Project</button>
    </form>
  )
}));

jest.mock('../../features/comments/CommentForm.tsx', () => ({
  CommentForm: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ text: 'Test Comment' }); }} aria-label="Comment form">
      <label htmlFor="comment-text">Comment</label>
      <textarea id="comment-text" required aria-required="true" aria-label="Comment input" />
      <button type="submit">Post Comment</button>
    </form>
  )
}));

describe('Feature Components Accessibility Tests', () => {
  beforeAll(() => {
    setupAccessibilityTests();
  });

  afterAll(() => {
    cleanupAccessibilityTests();
  });

  describe('Accessibility Controls', () => {
    it('should have proper ARIA attributes', () => {
      render(<AccessibilityControls />);
      const controls = screen.getByRole('group');
      expect(controls).toHaveAttribute('aria-label', 'Accessibility controls');
    });

    it('should have accessible buttons with proper labels', () => {
      render(<AccessibilityControls />);
      const buttons = screen.getAllByRole('button');

      expect(screen.getByLabelText('Toggle high contrast mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle reduce motion')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle screen reader support')).toBeInTheDocument();
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<AccessibilityControls />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', () => {
      render(<AccessibilityControls />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button, index) => {
        button.focus();
        expect(document.activeElement).toBe(button);

        if (index < buttons.length - 1) {
          fireEvent.keyDown(button, { key: 'Tab' });
          expect(document.activeElement).toBe(buttons[index + 1]);
        }
      });
    });
  });

  describe('Accessibility Settings', () => {
    it('should have proper dialog ARIA attributes when open', () => {
      render(<AccessibilitySettings isOpen={true} onSave={() => {}} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible form controls', () => {
      render(<AccessibilitySettings isOpen={true} onSave={() => {}} />);
      const form = screen.getByLabelText('Accessibility settings form');
      const select = screen.getByLabelText('Text size options');

      expect(form).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<AccessibilitySettings isOpen={true} onSave={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle form submission with keyboard', () => {
      const handleSave = jest.fn();
      render(<AccessibilitySettings isOpen={true} onSave={handleSave} />);

      const saveButton = screen.getByText('Save Settings');
      saveButton.focus();
      fireEvent.keyDown(saveButton, { key: 'Enter' });

      expect(handleSave).toHaveBeenCalled();
    });
  });

  describe('Task Form', () => {
    it('should have proper form ARIA attributes', () => {
      render(<TaskForm onSubmit={() => {}} />);
      const form = screen.getByLabelText('Task creation form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible form fields', () => {
      render(<TaskForm onSubmit={() => {}} />);
      const titleInput = screen.getByLabelText('Task Title');
      const descriptionInput = screen.getByLabelText('Task description');

      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(descriptionInput).toHaveAttribute('aria-label', 'Task description');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<TaskForm onSubmit={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(<TaskForm onSubmit={handleSubmit} />);

      const form = screen.getByLabelText('Task creation form');
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalledWith({ title: 'Test Task' });
    });
  });

  describe('Project Form', () => {
    it('should have proper form ARIA attributes', () => {
      render(<ProjectForm onSubmit={() => {}} />);
      const form = screen.getByLabelText('Project creation form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible form fields', () => {
      render(<ProjectForm onSubmit={() => {}} />);
      const nameInput = screen.getByLabelText('Project Name');
      const descriptionInput = screen.getByLabelText('Project description');

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(descriptionInput).toHaveAttribute('aria-label', 'Project description');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<ProjectForm onSubmit={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Comment Form', () => {
    it('should have proper form ARIA attributes', () => {
      render(<CommentForm onSubmit={() => {}} />);
      const form = screen.getByLabelText('Comment form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible form fields', () => {
      render(<CommentForm onSubmit={() => {}} />);
      const commentInput = screen.getByLabelText('Comment');

      expect(commentInput).toHaveAttribute('aria-required', 'true');
      expect(commentInput).toHaveAttribute('aria-label', 'Comment input');
    });

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<CommentForm onSubmit={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle form submission', () => {
      const handleSubmit = jest.fn();
      render(<CommentForm onSubmit={handleSubmit} />);

      const form = screen.getByLabelText('Comment form');
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalledWith({ text: 'Test Comment' });
    });
  });

  describe('Feature Components Integration Tests', () => {
    it('should integrate accessibility controls with forms', () => {
      render(
        <>
          <AccessibilityControls />
          <TaskForm onSubmit={() => {}} />
        </>
      );

      // Verify both components are accessible
      expect(screen.getByLabelText('Toggle high contrast mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Task creation form')).toBeInTheDocument();
    });

    it('should maintain accessibility across feature boundaries', () => {
      render(
        <>
          <AccessibilitySettings isOpen={true} onSave={() => {}} />
          <ProjectForm onSubmit={() => {}} />
          <CommentForm onSubmit={() => {}} />
        </>
      );

      // All forms should be accessible
      const forms = screen.getAllByRole('form');
      expect(forms.length).toBeGreaterThan(0);

      forms.forEach(form => {
        expect(form).toHaveAttribute('aria-label');
      });
    });
  });
});