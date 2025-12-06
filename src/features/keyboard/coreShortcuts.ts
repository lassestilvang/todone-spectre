// @ts-nocheck
import { KeyboardShortcut } from "../../types/keyboard";
import { useTasks } from "../../hooks/useTasks";
import { useSearchStore } from "../../store/useSearchStore";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { useNavigate } from "react-router-dom";

/**
 * Core keyboard shortcuts for Todone application
 */
export const setupCoreKeyboardShortcuts = () => {
  const { createTask, toggleTaskCompletion } = useTasks();
  const { openSearchModal, closeSearchModal } = useSearchStore.getState();
  const { openCommandPalette } = useCommandPalette();
  const navigate = useNavigate();

  const coreShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: "k",
      modifiers: ["ctrl"],
      description: "Open command palette",
      category: "Navigation",
      action: (event) => {
        event.preventDefault();
        openCommandPalette();
      },
    },
    {
      key: "f",
      modifiers: ["ctrl"],
      description: "Open search",
      category: "Navigation",
      action: (event) => {
        event.preventDefault();
        openSearchModal();
      },
    },
    {
      key: "Escape",
      modifiers: [],
      description: "Close modal/dialog",
      category: "Navigation",
      action: (event) => {
        event.preventDefault();
        closeSearchModal();
      },
    },
    {
      key: "p",
      modifiers: ["ctrl"],
      description: "Go to projects",
      category: "Navigation",
      action: (event) => {
        event.preventDefault();
        navigate("/projects");
      },
    },

    // Task management shortcuts
    {
      key: "n",
      modifiers: ["ctrl"],
      description: "Create new task",
      category: "Task Management",
      action: (event) => {
        event.preventDefault();
        createTask({
          title: "New Task",
          description: "",
          status: "todo",
          priority: "medium",
        });
      },
    },
    {
      key: "t",
      modifiers: ["ctrl"],
      description: "Toggle task completion",
      category: "Task Management",
      action: (event) => {
        event.preventDefault();
        // This would need to be enhanced to work with the currently selected task
        console.log("Toggle task completion");
      },
    },
    {
      key: "d",
      modifiers: ["ctrl"],
      description: "Delete selected task",
      category: "Task Management",
      action: (event) => {
        event.preventDefault();
        // This would need to be enhanced to work with the currently selected task
        console.log("Delete task");
      },
    },

    // View switching shortcuts
    {
      key: "1",
      modifiers: ["ctrl"],
      description: "Switch to Inbox view",
      category: "View Switching",
      action: (event) => {
        event.preventDefault();
        navigate("/inbox");
      },
    },
    {
      key: "2",
      modifiers: ["ctrl"],
      description: "Switch to Today view",
      category: "View Switching",
      action: (event) => {
        event.preventDefault();
        navigate("/today");
      },
    },
    {
      key: "3",
      modifiers: ["ctrl"],
      description: "Switch to Upcoming view",
      category: "View Switching",
      action: (event) => {
        event.preventDefault();
        navigate("/upcoming");
      },
    },

    // Global shortcuts
    {
      key: "?",
      modifiers: ["ctrl"],
      description: "Show keyboard shortcuts help",
      category: "Global",
      action: (event) => {
        event.preventDefault();
        // This would trigger the help modal
        console.log("Show keyboard shortcuts help");
      },
    },
    {
      key: "s",
      modifiers: ["ctrl"],
      description: "Save changes",
      category: "Global",
      action: (event) => {
        event.preventDefault();
        console.log("Save changes");
      },
    },
  ];

  return coreShortcuts;
};
