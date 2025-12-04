/**
 * Recurring Task Utilities Demo
 * Demonstration of recurring task utility functions
 */
import { Task, RecurringTaskConfig } from '../types/task';
import { RecurringPattern } from '../types/enums';
import { generateRecurringTaskInstances, validateRecurringTaskConfig } from './recurringUtils';
import { normalizeRecurringPatternConfig, getPatternFrequencyDescription } from './recurringPatternUtils';

/**
 * Demo: Generate recurring task instances
 */
export const demoGenerateRecurringInstances = (): void => {
  console.log('🎯 Demo: Generate Recurring Task Instances');

  const mockTask: Task = {
    id: 'demo-task-1',
    title: 'Weekly Team Meeting',
    description: 'Weekly team sync meeting',
    status: 'active',
    priority: 'P2',
    dueDate: new Date('2023-01-15'),
    dueTime: '10:00',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    customFields: {}
  };

  const config: RecurringTaskConfig = {
    pattern: 'weekly',
    startDate: new Date('2023-01-15'),
    endDate: null,
    maxOccurrences: 5,
    customInterval: 1,
    customUnit: null
  };

  const instances = generateRecurringTaskInstances(mockTask, config, 5);

  console.log(`✅ Generated ${instances.length} instances for weekly task`);
  instances.forEach((instance, index) => {
    console.log(`  ${index + 1}. ${instance.date.toDateString()} (${instance.isGenerated ? 'Generated' : 'Original'})`);
  });
};

/**
 * Demo: Validate recurring task configuration
 */
export const demoValidateRecurringConfig = (): void => {
  console.log('🎯 Demo: Validate Recurring Task Configuration');

  const validConfig: RecurringTaskConfig = {
    pattern: 'daily',
    startDate: new Date(),
    endDate: null,
    maxOccurrences: 10,
    customInterval: 1,
    customUnit: null
  };

  const invalidConfig: RecurringTaskConfig = {
    pattern: 'weekly',
    startDate: new Date(),
    endDate: new Date('2020-01-01'), // Past date
    maxOccurrences: 0, // Invalid
    customInterval: 1,
    customUnit: null
  };

  const validResult = validateRecurringTaskConfig(validConfig);
  console.log(`✅ Valid config: ${validResult.valid} (${validResult.errors.length} errors)`);

  const invalidResult = validateRecurringTaskConfig(invalidConfig);
  console.log(`❌ Invalid config: ${invalidResult.valid} (${invalidResult.errors.length} errors)`);
  invalidResult.errors.forEach(error => console.log(`   - ${error}`));
};

/**
 * Demo: Normalize pattern configuration
 */
export const demoNormalizePatternConfig = (): void => {
  console.log('🎯 Demo: Normalize Pattern Configuration');

  const partialConfig = {
    pattern: 'monthly',
    interval: 2
  };

  const normalized = normalizeRecurringPatternConfig(partialConfig);
  console.log('✅ Normalized config:', JSON.stringify(normalized, null, 2));
};

/**
 * Demo: Get pattern frequency description
 */
export const demoPatternFrequencyDescription = (): void => {
  console.log('🎯 Demo: Get Pattern Frequency Description');

  const patterns: RecurringPatternConfig[] = [
    { pattern: 'daily', interval: 1 },
    { pattern: 'weekly', interval: 2 },
    { pattern: 'monthly', interval: 1 },
    { pattern: 'yearly', interval: 1 },
    { pattern: 'custom', frequency: 'weekdays', interval: 1 }
  ];

  patterns.forEach(config => {
    const description = getPatternFrequencyDescription(config);
    console.log(`✅ ${config.pattern}: ${description}`);
  });
};

/**
 * Demo: Run all demonstrations
 */
export const runAllDemos = (): void => {
  console.log('🚀 Running Recurring Task Utilities Demo...\\n');

  demoGenerateRecurringInstances();
  console.log();

  demoValidateRecurringConfig();
  console.log();

  demoNormalizePatternConfig();
  console.log();

  demoPatternFrequencyDescription();
  console.log();

  console.log('🎉 All demos completed successfully!');
};