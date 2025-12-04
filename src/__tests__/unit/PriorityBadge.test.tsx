import React from 'react';
import { render, screen } from '@testing-library/react';
import PriorityBadge from '../../components/PriorityBadge';
import { PriorityLevel } from '../../types/task';

describe('PriorityBadge Component', () => {
  const testPriorities: PriorityLevel[] = ['critical', 'high', 'medium', 'low'];

  describe('Rendering', () => {
    it('should render with critical priority', () => {
      render(<PriorityBadge priority="critical" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toHaveClass('bg-red-100 text-red-800');
    });

    it('should render with high priority', () => {
      render(<PriorityBadge priority="high" />);
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('High')).toHaveClass('bg-yellow-100 text-yellow-800');
    });

    it('should render with medium priority', () => {
      render(<PriorityBadge priority="medium" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toHaveClass('bg-blue-100 text-blue-800');
    });

    it('should render with low priority', () => {
      render(<PriorityBadge priority="low" />);
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Low')).toHaveClass('bg-green-100 text-green-800');
    });

    it('should render with default priority for unknown values', () => {
      render(<PriorityBadge priority="unknown" as any />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toHaveClass('bg-gray-100 text-gray-800');
    });
  });

  describe('Label Formatting', () => {
    it('should capitalize the first letter of priority', () => {
      render(<PriorityBadge priority="high" />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should handle multi-word priorities correctly', () => {
      render(<PriorityBadge priority="in-progress" as any />);
      expect(screen.getByText('In-progress')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct styles for each priority level', () => {
      testPriorities.forEach(priority => {
        const { container } = render(<PriorityBadge priority={priority} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium');
      });
    });

    it('should apply custom className when provided', () => {
      const customClass = 'custom-class';
      const { container } = render(<PriorityBadge priority="medium" className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className prop', () => {
      const { container } = render(<PriorityBadge priority="high" className="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle undefined priority gracefully', () => {
      // @ts-ignore - testing edge case
      const { container } = render(<PriorityBadge priority={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});