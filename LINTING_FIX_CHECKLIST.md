# Todone Linting Fix Checklist

## 📋 Comprehensive Linting Fix Checklist

### 🎯 Current Status
- **Initial**: 1563 problems (958 errors, 605 warnings)
- **Current**: 1530 problems (925 errors, 605 warnings)
- **Fixed**: 33 errors reduced
- **Phase 1 Completed**: 2/4 critical parsing errors fixed

---

## 🔧 Critical Parsing Errors (4 errors)

### High Priority - Blocking other fixes

- [ ] **src/utils/commentUtils.ts** (line 223)
  - Issue: Unterminated string literal
  - Fix: Replace `.replace(/'/g, ''');` with `.replace(/'/g, ''');`
  - Status: ❌ Persistent file operation issues

- [ ] **src/utils/emptyStateUtils.ts** (line 107)
  - Issue: '>' expected (JSX syntax)
  - Status: ❌ Needs investigation

- [ ] **src/utils/onboardingUtils.ts** (line 15)
  - Issue: '>' expected (JSX syntax)
  - Status: ❌ Needs investigation

- [ ] **src/utils/test-helpers.ts** (line 10)
  - Issue: Unterminated regular expression literal
  - Status: ❌ Needs investigation

---

## 🗑️ Unused Variables Errors (~500+ errors)

### Test Files

- [ ] **src/__tests__/accessibility/colorSchemes.test.tsx**
  - [ ] Line 228: 'isAccessible' is assigned but never used

- [ ] **src/__tests__/accessibility/coreComponents.test.tsx**
  - [ ] Line 110: 'container' is assigned but never used
  - [ ] Line 186: 'dialog' is assigned but never used
  - [ ] Line 187: 'closeButton' is assigned but never used
  - [ ] Line 272: 'container' is assigned but never used
  - [ ] Line 289: 'container' is assigned but never used

- [ ] **src/__tests__/accessibility/featureComponents.test.tsx**
  - [ ] Line 128: 'buttons' is assigned but never used

- [ ] **src/__tests__/accessibility/keyboardNavigation.test.tsx**
  - [ ] Line 215: 'dialog' is assigned but never used

- [ ] **src/__tests__/integration/calendarIntegration.integration.test.ts**
  - [ ] Line 268: 'rangeEvents' is assigned but never used

- [ ] **src/__tests__/integration/taskManagement.integration.test.ts**
  - [ ] Line 159: 'updatedTask' is assigned but never used
  - [ ] Line 219: 'createResponse' is assigned but never used

### Utility Files

- [ ] **src/utils/collaborationUtils.ts**
  - [ ] Line 9: 'User' is defined but never used

- [ ] **src/utils/offlineUtils.ts**
  - [ ] Line 193: 'error' is defined but never used

- [ ] **src/utils/taskUtils.ts**
  - [ ] Line 131: Multiple unused variables ('id', 'createdAt', 'updatedAt', 'completedAt')

### Recurring Task Files (Many unused variables)

- [ ] **src/utils/__tests__/recurringUtils.test.ts** (50+ unused variables)
- [ ] **src/utils/__tests__/recurringTestUtils.ts** (20+ unused variables)
- [ ] **src/utils/__tests__/recurringTaskTestingUtilities.ts** (10+ unused variables)
- [ ] **src/utils/__tests__/recurringTaskCompleteTestSuite.ts** (30+ unused variables)

---

## 📝 Type 'any' Warnings (~600+ warnings)

### High Priority Type Fixes

- [ ] **src/api/authMiddleware.ts** (line 103)
- [ ] **src/api/collaborationApi.ts** (lines 23, 24)
- [ ] **src/utils/accessibilityConfigUtils.ts** (lines 7, 28, 82, 208-209)
- [ ] **src/utils/auth.test-utils.ts** (line 59)
- [ ] **src/utils/commentTestUtils.ts** (line 47)

### Test File Type Fixes

- [ ] **src/__tests__/accessibility/accessibilityTestRunner.ts** (line 26)
- [ ] **src/__tests__/accessibility/colorSchemes.test.tsx** (lines 260, 273, 306)
- [ ] **src/__tests__/accessibility/featureComponents.test.tsx** (lines 54, 72, 90)
- [ ] **src/__tests__/integration/animationSystem.integration.test.ts** (line 175)
- [ ] **src/__tests__/integration/comprehensiveIntegration.integration.test.ts** (lines 189-190)
- [ ] **src/__tests__/integration/offlineSupport.integration.test.ts** (lines 93-94)
- [ ] **src/__tests__/integration/projectCollaboration.integration.test.ts** (lines 114-116)
- [ ] **src/__tests__/integration/taskManagement.integration.test.ts** (lines 64-70)
- [ ] **src/__tests__/performance/utils/testDataGenerators.ts** (lines 94-95, 237)
- [ ] **src/__tests__/unit/authApi.test.ts** (line 42)
- [ ] **src/__tests__/unit/databaseTestUtils.test.ts** (lines 61, 224)
- [ ] **src/__tests__/unit/databaseUtils.test.ts** (line 106)
- [ ] **src/__tests__/unit/projectApi.test.ts** (lines 48, 143)
- [ ] **src/__tests__/unit/taskApi.test.ts** (lines 153, 167, 273)

### Recurring Task Type Fixes

- [ ] **src/utils/__tests__/recurringTaskCompleteTestSuite.ts** (multiple lines)
- [ ] **src/utils/__tests__/recurringTaskServiceMocks.ts** (multiple lines)
- [ ] **src/utils/__tests__/recurringTaskSystemValidation.ts** (multiple lines)

---

## 🎨 Prettier Formatting Errors

- [ ] **src/utils/calendarSyncUtils.ts** (line 215) - ✅ Fixed
- [ ] Various formatting issues across files

---

## ⚛️ React Hooks Violations

- [ ] **src/utils/__tests__/recurringCompleteValidation.ts** (line 158)
- [ ] **src/utils/__tests__/recurringIntegrationTest.ts** (line 367)

---

## 📝 @ts-ignore Comments

### Need to replace with @ts-expect-error

- [ ] **src/__tests__/unit/PriorityBadge.test.tsx** (line 92)
- [ ] **src/__tests__/unit/StatusBadge.test.tsx** (line 98)
- [ ] **src/__tests__/unit/TemplateContext.test.tsx** (lines 167, 195)
- [ ] **src/__tests__/unit/databaseUtils.test.ts** (lines 157, 163, 173, 216, 223)
- [ ] **src/__tests__/unit/taskApi.test.ts** (lines 28, 41, 58, 78, 88, 101, 116)

---

## 📁 Files Successfully Fixed ✅

- [x] **src/utils/auth.ts** - All unused variable errors fixed
- [x] **src/utils/calendarSyncUtils.ts** - Unused variables and prettier formatting fixed

---

## 🎯 Next Steps

### Phase 1: Critical Parsing Errors
1. [ ] Resolve file operation issues with commentUtils.ts
2. [ ] Fix remaining parsing errors in emptyStateUtils.ts, onboardingUtils.ts, test-helpers.ts

### Phase 2: Unused Variables Cleanup
1. [ ] Fix unused variables in test files systematically
2. [ ] Clean up utility files and remove unused imports
3. [ ] Address recurring task file unused variables

### Phase 3: Type Refactoring
1. [ ] Replace `any` types with proper type definitions
2. [ ] Focus on API files first, then test files

### Phase 4: Final Cleanup
1. [ ] Fix React hooks violations
2. [ ] Replace @ts-ignore with @ts-expect-error
3. [ ] Run final lint check

---

## 📊 Progress Tracking

- **Total Issues**: 1530 (925 errors, 605 warnings)
- **Fixed So Far**: 33 errors
- **Remaining**: 925 errors, 605 warnings

---

## ⏱️ Time Estimate

- **Parsing Errors**: 30-60 minutes
- **Unused Variables**: 2-3 hours
- **Type Refactoring**: 3-4 hours
- **Final Cleanup**: 1-2 hours
- **Total**: 6-9 hours

---

## 🎯 Completion Goal

**Target**: Reduce errors to 0, maintain or reduce warnings

**Strategy**: Systematic file-by-file approach, focusing on critical issues first