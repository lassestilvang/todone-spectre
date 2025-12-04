#!/usr/bin/env node

/**
 * Validation script for recurring utilities
 * Tests basic functionality without requiring a full test framework
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import the utilities we want to test
const { generateRecurringTaskInstances, validateRecurringTaskConfig } =
  await import("./src/utils/recurringUtils.js");
const { normalizeRecurringPatternConfig, getPatternFrequencyDescription } =
  await import("./src/utils/recurringPatternUtils.js");

console.log("🔍 Validating Recurring Utilities Implementation...\\n");

let passedTests = 0;
let failedTests = 0;

// Test data
const mockTask = {
  id: "test-task-1",
  title: "Test Task",
  status: "active",
  priority: "P2",
  dueDate: new Date("2023-01-15"),
  createdAt: new Date(),
  updatedAt: new Date(),
  completed: false,
  order: 0,
  customFields: {},
};

const mockConfig = {
  pattern: "weekly",
  startDate: new Date("2023-01-15"),
  endDate: null,
  maxOccurrences: null,
  customInterval: 1,
  customUnit: null,
};

// Test 1: Generate recurring instances
try {
  console.log("🧪 Test 1: Generate recurring task instances");
  const instances = generateRecurringTaskInstances(mockTask, mockConfig, 3);
  if (instances.length > 0 && instances[0].taskId === mockTask.id) {
    console.log("✅ PASSED: Generated instances correctly");
    passedTests++;
  } else {
    console.log("❌ FAILED: Instance generation failed");
    failedTests++;
  }
} catch (error) {
  console.log("❌ FAILED: Instance generation threw error:", error.message);
  failedTests++;
}

// Test 2: Validate recurring config
try {
  console.log("🧪 Test 2: Validate recurring task config");
  const validation = validateRecurringTaskConfig(mockConfig);
  if (validation.valid && validation.errors.length === 0) {
    console.log("✅ PASSED: Config validation works correctly");
    passedTests++;
  } else {
    console.log("❌ FAILED: Config validation failed");
    failedTests++;
  }
} catch (error) {
  console.log("❌ FAILED: Config validation threw error:", error.message);
  failedTests++;
}

// Test 3: Normalize pattern config
try {
  console.log("🧪 Test 3: Normalize pattern config");
  const partialConfig = { pattern: "daily" };
  const normalized = normalizeRecurringPatternConfig(partialConfig);
  if (normalized.pattern === "daily" && normalized.interval === 1) {
    console.log("✅ PASSED: Pattern normalization works correctly");
    passedTests++;
  } else {
    console.log("❌ FAILED: Pattern normalization failed");
    failedTests++;
  }
} catch (error) {
  console.log("❌ FAILED: Pattern normalization threw error:", error.message);
  failedTests++;
}

// Test 4: Get pattern frequency description
try {
  console.log("🧪 Test 4: Get pattern frequency description");
  const config = { pattern: "daily", interval: 1 };
  const description = getPatternFrequencyDescription(config);
  if (description === "Daily") {
    console.log("✅ PASSED: Pattern frequency description works correctly");
    passedTests++;
  } else {
    console.log("❌ FAILED: Pattern frequency description failed");
    failedTests++;
  }
} catch (error) {
  console.log(
    "❌ FAILED: Pattern frequency description threw error:",
    error.message,
  );
  failedTests++;
}

// Summary
console.log("\\n📊 Test Summary:");
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(
  `📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`,
);

if (failedTests === 0) {
  console.log(
    "\\n🎉 All tests passed! Recurring utilities are working correctly.",
  );
  process.exit(0);
} else {
  console.log("\\n⚠️  Some tests failed. Please review the implementation.");
  process.exit(1);
}
