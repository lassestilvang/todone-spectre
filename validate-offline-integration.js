#!/usr/bin/env node

/**
 * Offline Integration Validation Script
 * Validates that all offline integrations are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Offline Integration Validation...\\n');

let allPassed = true;

// Check if required files exist
const requiredFiles = [
  'src/services/offlineTaskService.ts',
  'src/services/offlineDataPersistence.ts',
  'src/services/offlineSyncService.ts',
  'src/hooks/useOfflineTasks.ts',
  'src/hooks/useOfflineDataPersistence.ts',
  'src/hooks/useOfflineSync.ts',
  'src/features/offline/OfflineIntegration.tsx',
  'src/features/offline/__tests__/OfflineIntegration.test.tsx',
  'src/features/offline/__tests__/offlineIntegrationTests.ts',
];

console.log('📁 Checking required files...');
requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allPassed = false;
  }
});

// Check if services are properly exported
console.log('\\n🔧 Checking service exports...');
try {
  const servicesIndex = fs.readFileSync(
    path.join(__dirname, 'src/services/index.ts'),
    'utf8',
  );

  const requiredExports = [
    'offlineTaskService',
    'offlineDataPersistence',
    'offlineSyncService',
  ];

  requiredExports.forEach((exportName) => {
    if (servicesIndex.includes(exportName)) {
      console.log(`✅ ${exportName} exported`);
    } else {
      console.log(`❌ ${exportName} - NOT EXPORTED`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('❌ Services index file not found or readable');
  allPassed = false;
}

// Check if hooks are properly exported
console.log('\\n🎣 Checking hook exports...');
try {
  const hooksIndex = fs.readFileSync(
    path.join(__dirname, 'src/hooks/index.ts'),
    'utf8',
  );

  const requiredHooks = [
    'useOfflineTasks',
    'useOfflineDataPersistence',
    'useOfflineSync',
  ];

  requiredHooks.forEach((hookName) => {
    if (hooksIndex.includes(hookName)) {
      console.log(`✅ ${hookName} exported`);
    } else {
      console.log(`❌ ${hookName} - NOT EXPORTED`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('❌ Hooks index file not found or readable');
  allPassed = false;
}

// Check if offline features are properly exported
console.log('\\n🎭 Checking offline feature exports...');
try {
  const offlineIndex = fs.readFileSync(
    path.join(__dirname, 'src/features/offline/index.ts'),
    'utf8',
  );

  if (offlineIndex.includes('OfflineIntegration')) {
    console.log("✅ OfflineIntegration exported");
  } else {
    console.log("❌ OfflineIntegration - NOT EXPORTED");
    allPassed = false;
  }
} catch (error) {
  console.log('❌ Offline features index file not found or readable');
  allPassed = false;
}

// Check if the integration component has proper imports
console.log('\\n🔗 Checking integration component imports...');
try {
  const integrationComponent = fs.readFileSync(
    path.join(__dirname, 'src/features/offline/OfflineIntegration.tsx'),
    'utf8',
  );

  const requiredImports = [
    'useOfflineTasks',
    'useOfflineDataPersistence',
    'useOfflineSync',
    'OfflineIndicator',
    'OfflineQueue',
    'OfflineSync',
    'OfflineSettings',
  ];

  requiredImports.forEach((importName) => {
    if (integrationComponent.includes(importName)) {
      console.log(`✅ ${importName} imported`);
    } else {
      console.log(`❌ ${importName} - NOT IMPORTED`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log('❌ Integration component file not found or readable');
  allPassed = false;
}

// Check if test files have proper structure
console.log('\\n🧪 Checking test file structure...');
try {
  const integrationTest = fs.readFileSync(
    path.join(
      __dirname,
      'src/features/offline/__tests__/OfflineIntegration.test.tsx',
    ),
    'utf8',
  );

  if (integrationTest.includes('describe') && integrationTest.includes('it(')) {
    console.log("✅ OfflineIntegration.test.tsx has proper test structure");
  } else {
    console.log(
      '❌ OfflineIntegration.test.tsx - MISSING PROPER TEST STRUCTURE',
    );
    allPassed = false;
  }

  const integrationTests = fs.readFileSync(
    path.join(
      __dirname,
      'src/features/offline/__tests__/offlineIntegrationTests.ts',
    ),
    'utf8',
  );

  if (
    integrationTests.includes('describe') &&
    integrationTests.includes('it(')
  ) {
    console.log("✅ offlineIntegrationTests.ts has proper test structure");
  } else {
    console.log(
      '❌ offlineIntegrationTests.ts - MISSING PROPER TEST STRUCTURE',
    );
    allPassed = false;
  }
} catch (error) {
  console.log('❌ Test files not found or readable');
  allPassed = false;
}

// Summary
console.log('\\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 ALL OFFLINE INTEGRATION VALIDATIONS PASSED!');
  console.log('✅ Offline task management integration - SET UP');
  console.log('✅ Offline data persistence integration - SET UP');
  console.log('✅ Offline sync functionality integration - SET UP');
  console.log('✅ All components properly integrated');
  console.log('✅ All tests properly structured');
  process.exit(0);
} else {
  console.log('❌ SOME OFFLINE INTEGRATION VALIDATIONS FAILED!');
  console.log('Please check the failed validations above.');
  process.exit(1);
}
