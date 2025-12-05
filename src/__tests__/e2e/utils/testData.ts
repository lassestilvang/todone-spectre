export const TEST_TASK = {
  title: "Complete project documentation",
  description: "Write comprehensive documentation for the Todone project",
  priority: "high",
  status: "todo",
};

export const TEST_PROJECT = {
  name: "Todone Redesign",
  description: "Complete redesign of the Todone application",
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
};

export const TEST_COMMENT = {
  text: "This is a test comment for the task",
};

export const TEST_TEAM = {
  name: "Development Team",
  description: "Main development team for Todone project",
};

export function generateRandomTask() {
  const priorities = ["low", "medium", "high", "critical"];
  const statuses = ["todo", "in-progress", "done", "blocked"];

  return {
    title: `Test Task ${Math.floor(Math.random() * 1000)}`,
    description: `This is a test task description ${Math.floor(Math.random() * 1000)}`,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
}

export function generateRandomProject() {
  return {
    name: `Test Project ${Math.floor(Math.random() * 1000)}`,
    description: `Test project description ${Math.floor(Math.random() * 1000)}`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  };
}
