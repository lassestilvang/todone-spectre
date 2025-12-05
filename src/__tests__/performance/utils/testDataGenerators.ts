import { faker } from "@faker-js/faker";

/**
 * Performance Test Data Generators
 * Generates test data of varying sizes for performance testing
 */

export function generatePerformanceTestData(
  size: "small" | "medium" | "large" | number,
) {
  const sizes = {
    small: 10,
    medium: 50,
    large: 200,
    xlarge: 500,
  };

  const count = typeof size === "number" ? size : sizes[size] || sizes.medium;

  const tasks = [];
  const projects = [];
  const users = [];

  // Generate users
  for (let i = 0; i < Math.min(10, Math.ceil(count / 20)); i++) {
    users.push(generatePerformanceUser(i));
  }

  // Generate projects
  for (let i = 0; i < Math.min(5, Math.ceil(count / 40)); i++) {
    projects.push(generatePerformanceProject(i));
  }

  // Generate tasks
  for (let i = 0; i < count; i++) {
    tasks.push(generatePerformanceTask(i, users, projects));
  }

  return {
    tasks,
    projects,
    users,
    totalItems: count,
    generatedAt: new Date().toISOString(),
  };
}

export function generatePerformanceUser(index: number) {
  return {
    id: `user-${index}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["admin", "manager", "member", "guest"]),
    lastActive: faker.date.recent().toISOString(),
    preferences: {
      theme: faker.helpers.arrayElement(["light", "dark", "system"]),
      notifications: faker.datatype.boolean(),
      emailFrequency: faker.helpers.arrayElement(["daily", "weekly", "never"]),
    },
    createdAt: faker.date.past().toISOString(),
  };
}

export function generatePerformanceProject(index: number) {
  return {
    id: `project-${index}`,
    name: faker.commerce.productName(),
    description: faker.lorem.paragraphs(2),
    status: faker.helpers.arrayElement([
      "active",
      "completed",
      "archived",
      "on-hold",
    ]),
    priority: faker.helpers.arrayElement(["low", "medium", "high", "critical"]),
    createdAt: faker.date.past().toISOString(),
    dueDate: faker.date.future().toISOString(),
    teamSize: faker.datatype.number({ min: 1, max: 20 }),
    complexity: faker.helpers.arrayElement([
      "simple",
      "moderate",
      "complex",
      "enterprise",
    ]),
    tags: Array.from(
      { length: faker.datatype.number({ min: 1, max: 5 }) },
      () => faker.commerce.productAdjective(),
    ),
  };
}

export function generatePerformanceTask(
  index: number,
  users: any[] = [],
  projects: any[] = [],
) {
  const taskTypes = [
    "feature",
    "bug",
    "improvement",
    "documentation",
    "research",
    "maintenance",
  ];
  const priorities = ["low", "medium", "high", "critical"];
  const statuses = ["todo", "in-progress", "review", "completed", "blocked"];

  return {
    id: `task-${index}`,
    title: `${faker.hacker.verb()} ${faker.commerce.product()} ${faker.commerce.productAdjective()}`,
    description: faker.lorem.paragraphs(
      faker.datatype.number({ min: 1, max: 3 }),
    ),
    type: faker.helpers.arrayElement(taskTypes),
    priority: faker.helpers.arrayElement(priorities),
    status: faker.helpers.arrayElement(statuses),
    createdAt: faker.date.past().toISOString(),
    dueDate: faker.datatype.boolean()
      ? faker.date.future().toISOString()
      : null,
    estimatedHours: faker.datatype.number({ min: 1, max: 40 }),
    actualHours: faker.datatype.boolean()
      ? faker.datatype.number({ min: 0, max: 40 })
      : null,
    assignee: users.length > 0 ? faker.helpers.arrayElement(users).id : null,
    project:
      projects.length > 0 ? faker.helpers.arrayElement(projects).id : null,
    dependencies: Array.from(
      { length: faker.datatype.number({ min: 0, max: 3 }) },
      (_, i) => `task-${index - i - 1}`,
    ).filter((dep) => dep !== `task-${index}`),
    tags: Array.from(
      { length: faker.datatype.number({ min: 1, max: 4 }) },
      () => faker.commerce.productAdjective(),
    ),
    attachments: Array.from(
      { length: faker.datatype.number({ min: 0, max: 2 }) },
      () => ({
        id: `attach-${index}-${faker.string.uuid()}`,
        name: faker.system.fileName(),
        size: faker.datatype.number({ min: 10, max: 5000 }),
        type: faker.system.mimeType(),
        url: faker.internet.url(),
      }),
    ),
    comments: Array.from(
      { length: faker.datatype.number({ min: 0, max: 3 }) },
      () => ({
        id: `comment-${index}-${faker.string.uuid()}`,
        author:
          users.length > 0
            ? faker.helpers.arrayElement(users).id
            : `user-${faker.datatype.number({ min: 0, max: 9 })}`,
        content: faker.lorem.sentences(
          faker.datatype.number({ min: 1, max: 2 }),
        ),
        createdAt: faker.date.recent().toISOString(),
        reactions: Array.from(
          { length: faker.datatype.number({ min: 0, max: 5 }) },
          () => faker.helpers.arrayElement(["👍", "❤️", "🚀", "🎉", "💡"]),
        ),
      }),
    ),
    history: Array.from(
      { length: faker.datatype.number({ min: 1, max: 5 }) },
      (_, i) => ({
        id: `history-${index}-${i}`,
        action: faker.helpers.arrayElement([
          "created",
          "updated",
          "priority-changed",
          "status-changed",
          "assigned",
          "commented",
          "attachment-added",
        ]),
        performedBy:
          users.length > 0
            ? faker.helpers.arrayElement(users).id
            : `user-${faker.datatype.number({ min: 0, max: 9 })}`,
        performedAt: faker.date.recent().toISOString(),
        details: {
          from: i === 0 ? null : faker.helpers.arrayElement(statuses),
          to: faker.helpers.arrayElement(statuses),
          field: faker.helpers.arrayElement([
            "status",
            "priority",
            "assignee",
            "description",
          ]),
        },
      }),
    ),
  };
}

export function generatePerformanceDatasetForBenchmarking() {
  // Generate datasets of different sizes for comprehensive benchmarking
  const datasets = {
    small: generatePerformanceTestData("small"),
    medium: generatePerformanceTestData("medium"),
    large: generatePerformanceTestData("large"),
    xlarge: generatePerformanceTestData("xlarge"),
  };

  // Add metadata for benchmarking
  Object.keys(datasets).forEach((size) => {
    const dataset = datasets[size];
    dataset.benchmarkMetadata = {
      sizeCategory: size,
      idealPerformance: calculateIdealPerformance(size, dataset.totalItems),
      complexityScore: calculateComplexityScore(dataset),
    };
  });

  return datasets;
}

function calculateIdealPerformance(sizeCategory: string, itemCount: number) {
  const sizeMultipliers = {
    small: 1,
    medium: 1.5,
    large: 2.5,
    xlarge: 4,
  };

  const multiplier = sizeMultipliers[sizeCategory] || 1;
  const baseTimePerItem = 5; // ms per item

  return {
    maxLoadTimeMs: itemCount * baseTimePerItem * multiplier,
    maxMemoryPerItemKb: 20 * multiplier, // KB per item
    targetFps: Math.max(30, 60 - itemCount / 10), // Target frame rate
  };
}

function calculateComplexityScore(dataset: any) {
  // Calculate a complexity score based on dataset characteristics
  let score = 0;

  // Add points for each item
  score += dataset.totalItems * 0.1;

  // Add points for relationships
  dataset.tasks.forEach((task) => {
    score += task.dependencies?.length * 0.2 || 0;
    score += task.comments?.length * 0.3 || 0;
    score += task.attachments?.length * 0.1 || 0;
    score += task.history?.length * 0.2 || 0;
  });

  // Add points for projects
  score += dataset.projects.length * 2;

  // Add points for users
  score += dataset.users.length * 1.5;

  return Math.min(100, Math.round(score));
}

export function generateNetworkConditionTestData() {
  // Generate test data for different network conditions
  return {
    conditions: [
      {
        name: "No throttling",
        download: "0 Mbps (no limit)",
        upload: "0 Mbps (no limit)",
        latency: "0 ms",
        description: "Normal network conditions",
      },
      {
        name: "Slow 3G",
        download: "1.5 Mbps",
        upload: "0.75 Mbps",
        latency: "400 ms",
        description: "Simulates slow mobile network",
      },
      {
        name: "Fast 3G",
        download: "10 Mbps",
        upload: "5 Mbps",
        latency: "150 ms",
        description: "Simulates good mobile network",
      },
      {
        name: "Slow 4G",
        download: "25 Mbps",
        upload: "10 Mbps",
        latency: "80 ms",
        description: "Simulates average 4G network",
      },
      {
        name: "Fast 4G",
        download: "50 Mbps",
        upload: "25 Mbps",
        latency: "40 ms",
        description: "Simulates good 4G network",
      },
      {
        name: "WiFi",
        download: "100 Mbps",
        upload: "50 Mbps",
        latency: "20 ms",
        description: "Simulates typical WiFi network",
      },
      {
        name: "Offline",
        download: "0 Mbps",
        upload: "0 Mbps",
        latency: "0 ms",
        description: "Simulates offline mode",
      },
    ],
    testScenarios: [
      {
        name: "Task creation under different network conditions",
        operations: ["create_task", "update_task", "delete_task"],
        expectedPerformance: {
          "No throttling": { maxTimeMs: 1000 },
          "Slow 3G": { maxTimeMs: 5000 },
          "Fast 3G": { maxTimeMs: 2000 },
          WiFi: { maxTimeMs: 800 },
        },
      },
      {
        name: "Project loading under different network conditions",
        operations: ["load_project", "load_tasks", "load_collaboration"],
        expectedPerformance: {
          "No throttling": { maxTimeMs: 2000 },
          "Slow 3G": { maxTimeMs: 10000 },
          "Fast 3G": { maxTimeMs: 4000 },
          WiFi: { maxTimeMs: 1500 },
        },
      },
    ],
  };
}
