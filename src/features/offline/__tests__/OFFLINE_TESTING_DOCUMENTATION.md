# Offline Testing Utilities - Comprehensive Documentation

## Overview

This documentation provides a complete guide to the offline testing utilities that have been added to provide comprehensive testing coverage for all offline functionality in the Todone Spectre application.

## Table of Contents

1. [Test Data Generators](#test-data-generators)
2. [Service Mocks](#service-mocks)
3. [Component Tests](#component-tests)
4. [Integration Tests](#integration-tests)
5. [Usage Examples](#usage-examples)
6. [Test Coverage Matrix](#test-coverage-matrix)

## Test Data Generators

The offline test data generators provide comprehensive utilities for creating realistic test data for offline scenarios.

### Location: `src/features/offline/__tests__/utils/offlineTestDataGenerators.ts`

### Key Functions:

#### `generateMockTask(overrides?)`
Generates a single mock task with realistic default values.

```typescript
const task = generateMockTask({
  title: 'Custom Task Title',
  priority: 'high'
});
```

#### `generateMockTasks(count, overrides?)`
Generates multiple mock tasks.

```typescript
const tasks = generateMockTasks(10, { projectId: 'custom-project' });
```

#### `generateOfflineQueueItem(type, priority, overrides?)`
Generates offline queue items for different operation types.

```typescript
const queueItem = generateOfflineQueueItem('create', 'high', {
  operation: 'Custom create operation'
});
```

#### `generateOfflineQueueItems(count, types, priorities)`
Generates multiple queue items with varied types and priorities.

```typescript
const queueItems = generateOfflineQueueItems(5);
```

#### `generateOfflineState(overrides?)`
Generates complete offline state for store testing.

```typescript
const offlineState = generateOfflineState({
  status: { isOffline: true }
});
```

#### `generateStorageStats(overrides?)`
Generates realistic storage statistics.

```typescript
const stats = generateStorageStats({
  taskCount: 25,
  storageUsage: 4096
});
```

## Service Mocks

The service mocks provide complete mock implementations of all offline services for isolated testing.

### Location: `src/features/offline/__tests__/utils/offlineServiceMocks.ts`

### Mock Classes:

#### `MockOfflineTaskService`
Complete mock of the offline task service with methods for:
- `createTaskOffline()`
- `updateTaskOffline()`
- `deleteTaskOffline()`
- `toggleTaskCompletionOffline()`
- `processOfflineTaskQueue()`
- Queue management methods

#### `MockOfflineDataPersistence`
Complete mock of data persistence service with methods for:
- `initialize()`
- `storeOfflineTasks()`
- `getOfflineTasks()`
- `storeOfflineOperation()`
- `processOfflineOperations()`
- `syncOfflineData()`
- Storage statistics methods

#### `MockOfflineSyncService`
Complete mock of sync service with methods for:
- `needsSync()`
- `autoSync()`
- `syncAll()`
- `processSyncQueue()`
- `retryFailedOperations()`
- Sync status methods

#### `MockOfflineStore`
Complete mock of the offline Zustand store with:
- State management
- Subscription support
- Comprehensive state manipulation

### Utility Function:

#### `createMockServices(isOffline?)`
Creates a complete set of mock services for testing.

```typescript
const {
  offlineTaskService,
  offlineDataPersistence,
  offlineSyncService,
  useOfflineStore
} = createMockServices(true); // Start in offline mode
```

## Component Tests

Comprehensive component tests covering all offline UI components.

### Location: `src/features/offline/__tests__/offlineComponentTests.ts`

### Test Coverage:

#### OfflineIndicator Component
- Online/offline status rendering
- Network quality display
- Error state handling
- Pending changes display

#### OfflineQueue Component
- Empty queue state
- Queue items with different statuses
- Queue statistics display
- Queue full state handling

#### OfflineSync Component
- Default sync status
- Syncing progress display
- Completed sync state
- Error state handling
- Paused sync state

#### OfflineSettings Component
- All setting fields rendering
- Current network status display
- Storage statistics display
- Settings update handling

#### Integration Tests
- Component interaction scenarios
- Consistent state across components
- Error handling and edge cases

## Integration Tests

Comprehensive integration tests covering end-to-end offline workflows.

### Location: `src/features/offline/__tests__/offlineComprehensiveTests.ts`

### Test Categories:

#### Complete Offline Workflow
- Task creation → update → deletion → completion toggle
- Queue management and processing
- Online/offline state transitions

#### Data Persistence Workflow
- Task storage and retrieval
- Operation queuing and processing
- Storage statistics management

#### Sync Workflow
- Auto-sync behavior
- Manual sync operations
- Sync status tracking

#### Hook Integration
- `useOffline` hook testing
- `useOfflineTasks` hook testing
- `useOfflineDataPersistence` hook testing
- `useOfflineSync` hook testing

#### Error Handling
- Queue processing errors
- Sync operation errors
- Data persistence errors
- Recovery scenarios

#### Performance Testing
- Large queue processing (100+ items)
- Concurrent operations
- Stress testing scenarios

#### State Management
- Comprehensive state changes
- Settings management
- Cross-service state consistency

#### Cross-Service Integration
- Task service → data persistence → sync service workflows
- End-to-end offline-to-online transitions
- Complete data lifecycle testing

## Usage Examples

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';
import { useOfflineStore } from '../../../store/useOfflineStore';
import { MockOfflineStore } from './utils/offlineServiceMocks';

jest.mock('../../../store/useOfflineStore');

it('should show offline status', () => {
  const mockStore = new MockOfflineStore({
    status: { isOffline: true }
  });

  (useOfflineStore as jest.Mock).mockReturnValue(mockStore.getState());

  render(<OfflineIndicator />);
  expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
});
```

### Service Integration Test

```typescript
import { MockOfflineTaskService } from './utils/offlineServiceMocks';
import { generateMockTask } from './utils/offlineTestDataGenerators';

it('should handle offline task creation and queuing', async () => {
  const mockService = new MockOfflineTaskService(true);
  const task = generateMockTask();

  const createdTask = await mockService.createTaskOffline(task);
  expect(createdTask.id).toContain('temp-');
  expect(mockService.getQueueItems().length).toBe(1);
});
```

### Complete Workflow Test

```typescript
import { renderHook, act } from '@testing-library/react';
import { useOfflineTasks } from '../../../hooks/useOfflineTasks';
import { MockOfflineStore } from './utils/offlineServiceMocks';

it('should handle complete offline workflow', async () => {
  const mockStore = new MockOfflineStore({ status: { isOffline: true } });
  (useOfflineStore as jest.Mock).mockReturnValue(mockStore.getState());

  const { result } = renderHook(() => useOfflineTasks());

  // Create task offline
  const task = await result.current.createTaskOffline(generateMockTask());
  expect(task.id).toContain('temp-');

  // Update task offline
  const updated = await result.current.updateTaskOffline(task.id, {
    title: 'Updated'
  });

  // Process queue when back online
  mockStore.setState({ status: { isOffline: false } });
  await result.current.processOfflineQueue();
});
```

## Test Coverage Matrix

| Feature Area | Test Coverage | Test Files |
|-------------|---------------|------------|
| **Data Generation** | ✅ Comprehensive | `offlineTestDataGenerators.ts` |
| **Service Mocking** | ✅ Complete | `offlineServiceMocks.ts` |
| **Component Testing** | ✅ Extensive | `offlineComponentTests.ts` |
| **Integration Testing** | ✅ End-to-end | `offlineComprehensiveTests.ts` |
| **Error Handling** | ✅ Comprehensive | All test files |
| **Performance Testing** | ✅ Included | Integration tests |
| **State Management** | ✅ Complete | All test files |
| **Cross-Service Workflows** | ✅ Comprehensive | Integration tests |

## Testing Best Practices

### 1. Isolation
Each test should be isolated and not depend on external state. Use the mock services to control test conditions.

### 2. Realistic Data
Use the test data generators to create realistic test data that matches production scenarios.

### 3. Edge Cases
Test edge cases including:
- Empty states
- Error conditions
- Large data sets
- Concurrent operations

### 4. State Transitions
Test complete workflows that involve state transitions (offline → online, pending → completed, etc.).

### 5. Integration Testing
Test the interaction between different services and components to ensure they work together correctly.

### 6. Performance Considerations
Include tests that verify the system can handle expected load and stress conditions.

## Running the Tests

All tests can be run using the standard Jest test runner:

```bash
npm test
# or for specific test files
npm test -- src/features/offline/__tests__/offlineComponentTests.ts
```

## Test Maintenance

### Adding New Features
When adding new offline features:
1. Add corresponding test data generators
2. Create service mocks for new services
3. Add component tests for new UI elements
4. Extend integration tests to cover new workflows

### Updating Existing Features
When modifying existing features:
1. Update relevant test data generators
2. Modify service mocks to match new behavior
3. Extend component tests for new UI behavior
4. Update integration tests for new workflows

## Conclusion

This comprehensive testing suite provides complete coverage of all offline functionality, ensuring robust and reliable offline capabilities in the Todone Spectre application. The utilities can be easily extended as new offline features are added.