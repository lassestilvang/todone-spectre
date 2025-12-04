#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testScenarios = [
  {
    name: 'User Onboarding',
    file: 'userOnboarding.spec.ts',
    description: 'Registration → Login → Task creation → Project setup'
  },
  {
    name: 'Task Management',
    file: 'taskManagement.spec.ts',
    description: 'Create task → Set priority → Add comments → Complete task'
  },
  {
    name: 'Collaboration',
    file: 'collaboration.spec.ts',
    description: 'Create team → Invite members → Assign tasks → Real-time updates'
  },
  {
    name: 'Offline Workflow',
    file: 'offlineWorkflow.spec.ts',
    description: 'Go offline → Create tasks → Reconnect → Verify sync'
  },
  {
    name: 'AI Assistance',
    file: 'aiAssistance.spec.ts',
    description: 'Create task with natural language → Get suggestions → Apply suggestions'
  },
  {
    name: 'Performance Monitoring',
    file: 'performanceMonitoring.spec.ts',
    description: 'Complete complex workflows → Check performance metrics'
  }
];

function runTests() {
  console.log('🚀 Todone E2E Test Runner');
  console.log('========================');
  console.log();

  try {
    // Check if Playwright is installed
    console.log('🔍 Checking Playwright installation...');
    execSync('npx playwright --version', { stdio: 'pipe' });
    console.log('✅ Playwright is installed');
    console.log();

    // Run all test scenarios
    console.log('🧪 Running E2E Test Scenarios:');
    console.log();

    testScenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);
      console.log(`   File: src/__tests__/e2e/${scenario.file}`);
      console.log();
    });

    console.log('📊 Test Coverage Summary:');
    console.log(`   • Total Scenarios: ${testScenarios.length}`);
    console.log('   • User Flows: Complete registration to task completion');
    console.log('   • Multi-step Workflows: Task management, collaboration');
    console.log('   • Real-world Scenarios: Offline work, AI assistance');
    console.log('   • Cross-feature Interactions: All major features integrated');
    console.log('   • Authentication Flows: Login, registration, session management');
    console.log('   • Error Recovery: Form validation, network issues, data conflicts');
    console.log();

    console.log('🎯 Running all E2E tests...');
    console.log('This may take a few minutes as tests run across multiple browsers.');

    // Run the actual tests
    try {
      execSync('npm run test:e2e', { stdio: 'inherit' });
      console.log();
      console.log('🎉 All E2E tests completed successfully!');
    } catch (error) {
      console.log();
      console.log('❌ Some tests failed. Check the report for details.');
      console.log('Run `npm run test:e2e:report` to view the HTML report.');
    }

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.log();
    console.log('🔧 Troubleshooting steps:');
    console.log('1. Run `npm install` to ensure all dependencies are installed');
    console.log('2. Run `npx playwright install` to install browsers');
    console.log('3. Check that the development server is running');
    console.log('4. Run tests individually with `npx playwright test src/__tests__/e2e/<test-file>`');
  }
}

function showHelp() {
  console.log('📖 Todone E2E Test Runner - Help');
  console.log('================================');
  console.log();
  console.log('Available commands:');
  console.log();
  console.log('  npm run test:e2e          # Run all E2E tests headless');
  console.log('  npm run test:e2e:ui      # Run tests with UI interface');
  console.log('  npm run test:e2e:headed  # Run tests with browser visible');
  console.log('  npm run test:e2e:report  # Show HTML test report');
  console.log();
  console.log('Test Scenarios:');
  testScenarios.forEach((scenario, index) => {
    console.log(`  ${index + 1}. ${scenario.name}: ${scenario.description}`);
  });
  console.log();
  console.log('Browsers tested: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari, Tablet');
  console.log('Viewports: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)');
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  runTests();
}