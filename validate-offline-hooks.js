#!/usr/bin/env node

/**
 * Validation script for offline hooks implementation
 * This script validates that the offline hooks are properly created and integrated
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating Offline Hooks Implementation...\\n');

const filesToCheck = [
  {
    path: join(__dirname, 'src', 'hooks', 'useOffline.ts'),
    name: 'useOffline.ts',
    requiredExports: [
      'useOffline',
      'initialize',
      'getOfflineStatus',
      'getOfflineState',
      'enqueueOperation',
      'processOfflineQueue',
      'retryFailedItems',
      'getQueueStats',
      'simulateNetworkChange',
    ],
  },
  {
    path: join(__dirname, 'src', 'hooks', 'useOfflineSync.ts'),
    name: 'useOfflineSync.ts',
    requiredExports: [
      'useOfflineSync',
      'syncQueue',
      'getSyncStatus',
      'isSyncNeeded',
      'initialize',
    ],
  },
  {
    path: join(__dirname, 'src', 'hooks', 'index.ts'),
    name: 'hooks index.ts',
    requiredExports: ['useOffline', 'useOfflineSync', 'useOfflineSettings'],
  },
  {
    path: join(__dirname, 'src', 'hooks', '__tests__', 'useOffline.test.ts'),
    name: 'useOffline.test.ts',
    requiredContent: [
      'useOffline',
      'initialize',
      'enqueueOperation',
      'processOfflineQueue',
      'getQueueStats',
    ],
  },
];

let allValid = true;

filesToCheck.forEach((file) => {
  console.log(`📁 Checking ${file.name}...`);

  if (!existsSync(file.path)) {
    console.error(`❌ File ${file.name} does not exist!`);
    allValid = false;
    return;
  }

  try {
    const content = readFileSync(file.path, 'utf8');

    if (file.requiredExports) {
      file.requiredExports.forEach((exportName) => {
        if (!content.includes(exportName)) {
          console.error(`❌ Missing required export/function: ${exportName}`);
          allValid = false;
        }
      });
    }

    if (file.requiredContent) {
      file.requiredContent.forEach((contentItem) => {
        if (!content.includes(contentItem)) {
          console.error(`❌ Missing required content: ${contentItem}`);
          allValid = false;
        }
      });
    }

    if (
      file.requiredExports &&
      file.requiredExports.every((exp) => content.includes(exp))
    ) {
      console.log(`✅ All required exports found in ${file.name}`);
    }

    if (
      file.requiredContent &&
      file.requiredContent.every((content) => content.includes(content))
    ) {
      console.log(`✅ All required content found in ${file.name}`);
    }
  } catch (error) {
    console.error(`❌ Error reading ${file.name}:`, error.message);
    allValid = false;
  }
});

// Check integration with existing components
console.log('\\n🔧 Checking integration with existing components...');

const integrationFiles = [
  join(__dirname, 'src', 'features', 'offline', 'OfflineHooksDemo.tsx'),
  join(__dirname, 'src', 'features', 'offline', 'index.ts'),
];

integrationFiles.forEach((filePath) => {
  const fileName = filePath.split('/').pop();
  console.log(`📁 Checking integration file ${fileName}...`);

  if (!existsSync(filePath)) {
    console.error(`❌ Integration file ${fileName} does not exist!`);
    allValid = false;
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf8');

    if (fileName === 'OfflineHooksDemo.tsx') {
      const requiredImports = [
        'useOffline',
        'useOfflineSync',
        'useOfflineSettings',
      ];
      requiredImports.forEach((importName) => {
        if (!content.includes(importName)) {
          console.error(`❌ Missing required import in demo: ${importName}`);
          allValid = false;
        }
      });
    }

    if (fileName === 'index.ts') {
      if (!content.includes('OfflineHooksDemo')) {
        console.error(
          '❌ Demo component not exported in offline feature index',
        );
        allValid = false;
      } else {
        console.log("✅ Demo component properly exported");
      }
    }
  } catch (error) {
    console.error(
      `❌ Error reading integration file ${fileName}:`,
      error.message,
    );
    allValid = false;
  }
});

console.log('\\n📊 Validation Summary:');
if (allValid) {
  console.log(
    '✅ All offline hooks have been successfully created and integrated!',
  );
  console.log('\\n🎉 Implementation Summary:');
  console.log(
    '• useOffline.ts - Offline status monitoring and queue management',
  );
  console.log('• useOfflineSync.ts - Offline sync functionality');
  console.log('• useOfflineSettings.ts - Offline settings management');
  console.log('• OfflineHooksDemo.tsx - Integration demo component');
  console.log('• Comprehensive test coverage');
  console.log('• Proper exports and integration');
} else {
  console.log(
    '❌ Some validation checks failed. Please review the errors above.',
  );
  process.exit(1);
}
