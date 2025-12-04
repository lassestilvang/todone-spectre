import { EmptyStateConfig } from '../../../types/emptyStateTypes';
import { OnboardingStepConfig } from '../../../types/onboardingTypes';

/**
 * Generate mock empty state configuration for testing
 * @param overrides Partial configuration to override defaults
 * @returns Complete empty state configuration
 */
export const generateMockEmptyStateConfig = (
  overrides: Partial<EmptyStateConfig> = {}
): EmptyStateConfig => {
  return {
    title: 'Test Empty State',
    description: 'This is a test empty state description',
    icon: null,
    actions: null,
    show: true,
    ...overrides
  };
};

/**
 * Generate mock onboarding step for testing
 * @param overrides Partial step configuration to override defaults
 * @returns Complete onboarding step configuration
 */
export const generateMockOnboardingStep = (
  overrides: Partial<OnboardingStepConfig> = {}
): OnboardingStepConfig => {
  return {
    id: 'test-step',
    title: 'Test Step',
    description: 'This is a test onboarding step',
    content: <div>Test content</div>,
    skipable: true,
    ...overrides
  };
};

/**
 * Generate array of mock onboarding steps
 * @param count Number of steps to generate
 * @returns Array of onboarding step configurations
 */
export const generateMockOnboardingSteps = (count: number = 3): OnboardingStepConfig[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `test-step-${index + 1}`,
    title: `Test Step ${index + 1}`,
    description: `Description for step ${index + 1}`,
    content: <div>Content for step {index + 1}</div>,
    skipable: index !== count - 1 // Last step not skipable
  }));
};

/**
 * Create empty state test data generator
 * @param templateType Type of empty state template
 * @returns Test data generator function
 */
export const createEmptyStateTestDataGenerator = (templateType: string) => {
  return (overrides: Partial<EmptyStateConfig> = {}): EmptyStateConfig => ({
    title: `${templateType} Empty State`,
    description: `This is a ${templateType} empty state`,
    icon: <span>📝</span>,
    actions: <button>Create {templateType}</button>,
    show: true,
    ...overrides
  });
};

/**
 * Mock empty state service methods for testing
 */
export const mockEmptyStateServiceMethods = {
  getEmptyStateConfig: jest.fn(),
  registerEmptyState: jest.fn(),
  updateEmptyStateConfig: jest.fn(),
  shouldShowEmptyState: jest.fn(),
  setEmptyStateVisibility: jest.fn()
};

/**
 * Mock onboarding service methods for testing
 */
export const mockOnboardingServiceMethods = {
  getOnboardingState: jest.fn(),
  initializeOnboarding: jest.fn(),
  goToNextStep: jest.fn(),
  goToPreviousStep: jest.fn(),
  completeOnboarding: jest.fn(),
  isOnboardingCompleted: jest.fn()
};

/**
 * Generate empty state test scenarios
 * @returns Array of test scenarios with different configurations
 */
export const generateEmptyStateTestScenarios = (): Array<{
  name: string;
  config: EmptyStateConfig;
  expectedVisible: boolean;
}> => {
  return [
    {
      name: 'Default empty state',
      config: generateMockEmptyStateConfig(),
      expectedVisible: true
    },
    {
      name: 'Hidden empty state',
      config: generateMockEmptyStateConfig({ show: false }),
      expectedVisible: false
    },
    {
      name: 'Empty state with custom icon',
      config: generateMockEmptyStateConfig({
        icon: <span>✨</span>,
        show: true
      }),
      expectedVisible: true
    },
    {
      name: 'Empty state with actions',
      config: generateMockEmptyStateConfig({
        actions: <button>Create Item</button>,
        show: true
      }),
      expectedVisible: true
    }
  ];
};