import { ParseResult } from "../../../hooks/useNlpParser";

/**
 * Generates test data for NLP parsing
 */
export function generateTestParseData(
  overrides: Partial<ParseResult> = {},
): ParseResult {
  return {
    title: "Test task title",
    description: "This is a test task description",
    dueDate: "December 31, 2023",
    priority: "medium",
    labels: ["test", "demo"],
    project: "Test Project",
    rawText: "Create a test task for the demo project due by December 31, 2023",
    confidence: 85,
    ...overrides,
  };
}

/**
 * Generates mock NLP service responses
 */
export function generateMockNlpResponse(
  overrides: Partial<ParseResult> = {},
): ParseResult {
  return generateTestParseData(overrides);
}

/**
 * Creates test input texts for various scenarios
 */
export function generateTestInputTexts(): string[] {
  return [
    "Create a high priority task to finish the project proposal by Friday with labels important and work",
    "Schedule a meeting with the team tomorrow at 2pm to discuss Q3 goals",
    "Add a low priority task to research new design trends for the marketing project",
    "Remind me to call mom on her birthday next week and buy a gift",
    "Set up a weekly review every Monday at 9am for project status updates",
    "Buy groceries for the week including milk, eggs, and bread",
    "Prepare presentation slides for the client meeting on Thursday",
    "Review and respond to important emails from the manager",
    "Update the project documentation with new API changes",
    "Test the new feature implementation before the demo",
  ];
}

/**
 * Creates expected parse results for test inputs
 */
export function generateExpectedParseResults(): ParseResult[] {
  return [
    {
      title: "finish the project proposal",
      description: undefined,
      dueDate: "Friday",
      priority: "high",
      labels: ["important", "work"],
      project: undefined,
      rawText:
        "Create a high priority task to finish the project proposal by Friday with labels important and work",
      confidence: 75,
    },
    {
      title: "meeting with the team",
      description: "to discuss Q3 goals",
      dueDate: "tomorrow at 2pm",
      priority: "medium",
      labels: undefined,
      project: undefined,
      rawText:
        "Schedule a meeting with the team tomorrow at 2pm to discuss Q3 goals",
      confidence: 65,
    },
    {
      title: "research new design trends",
      description: undefined,
      dueDate: undefined,
      priority: "low",
      labels: undefined,
      project: "marketing project",
      rawText:
        "Add a low priority task to research new design trends for the marketing project",
      confidence: 60,
    },
  ];
}

/**
 * Mock NLP parser service
 */
export class MockNlpParserService {
  private mockResponses: ParseResult[];
  private responseIndex = 0;

  constructor(mockResponses: ParseResult[] = []) {
    this.mockResponses =
      mockResponses.length > 0 ? mockResponses : [generateMockNlpResponse()];
  }

  async parse(text: string): Promise<ParseResult> {
    if (this.responseIndex >= this.mockResponses.length) {
      this.responseIndex = 0;
    }

    const response = this.mockResponses[this.responseIndex];
    this.responseIndex++;

    return {
      ...response,
      rawText: text,
    };
  }

  setMockResponses(responses: ParseResult[]) {
    this.mockResponses = responses;
    this.responseIndex = 0;
  }

  reset() {
    this.responseIndex = 0;
  }
}

/**
 * Test validation utilities
 */
export function validateParseResult(
  result: ParseResult,
  expected: Partial<ParseResult>,
) {
  const errors: string[] = [];

  if (expected.title && result.title !== expected.title) {
    errors.push(
      `Title mismatch: expected "${expected.title}", got "${result.title}"`,
    );
  }

  if (expected.priority && result.priority !== expected.priority) {
    errors.push(
      `Priority mismatch: expected "${expected.priority}", got "${result.priority}"`,
    );
  }

  if (expected.dueDate && result.dueDate !== expected.dueDate) {
    errors.push(
      `Due date mismatch: expected "${expected.dueDate}", got "${result.dueDate}"`,
    );
  }

  if (expected.project && result.project !== expected.project) {
    errors.push(
      `Project mismatch: expected "${expected.project}", got "${result.project}"`,
    );
  }

  if (expected.labels && result.labels) {
    const expectedLabels = new Set(expected.labels);
    const resultLabels = new Set(result.labels);

    if (!setsAreEqual(expectedLabels, resultLabels)) {
      errors.push(
        `Labels mismatch: expected ${Array.from(expectedLabels)}, got ${Array.from(resultLabels)}`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function setsAreEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
