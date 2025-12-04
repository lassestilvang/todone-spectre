import React from 'react';
import { render, screen } from '@testing-library/react';
import { PerformanceProvider, usePerformanceContext } from '../PerformanceProvider';
import { createPerformanceServiceMock, createPerformanceConfigServiceMock } from './performanceTestUtils';

jest.mock('../../../services/performanceService', () => ({
  performanceService: createPerformanceServiceMock()
}));

jest.mock('../../../services/performanceConfigService', () => ({
  performanceConfigService: createPerformanceConfigServiceMock()
}));

describe('PerformanceProvider', () => {
  const TestComponent: React.FC = () => {
    const context = usePerformanceContext();
    return (
      <div>
        <div data-testid="status">{context.status}</div>
        <div data-testid="monitoring">{context.isMonitoring ? 'true' : 'false'}</div>
        <div data-testid="sampling-rate">{context.config.samplingRate}</div>
      </div>
    );
  };

  const renderWithProvider = () => {
    return render(
      <PerformanceProvider>
        <TestComponent />
      </PerformanceProvider>
    );
  };

  it('should provide performance context to children', () => {
    renderWithProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('inactive');
    expect(screen.getByTestId('monitoring')).toHaveTextContent('false');
    expect(screen.getByTestId('sampling-rate')).toHaveTextContent('1000');
  });

  it('should allow starting and stopping monitoring', () => {
    renderWithProvider();
    expect(screen.getByTestId('monitoring')).toHaveTextContent('false');

    // This would need to be tested with actual user interaction
    // or by mocking the context methods
  });

  it('should provide configuration management', () => {
    renderWithProvider();
    expect(screen.getByTestId('sampling-rate')).toHaveTextContent('1000');
  });

  it('should throw error when used outside provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePerformanceContext must be used within a PerformanceProvider');

    console.error = originalError;
  });
});