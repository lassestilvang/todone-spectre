import React from 'react';
import { ViewType } from '../../types/enums';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  availableViews?: ViewType[];
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  availableViews = [ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR],
}) => {
  const viewOptions = [
    { value: ViewType.LIST, label: 'List', icon: '📋' },
    { value: ViewType.BOARD, label: 'Board', icon: '📊' },
    { value: ViewType.CALENDAR, label: 'Calendar', icon: '📅' },
  ];

  const filteredOptions = viewOptions.filter(option =>
    availableViews.includes(option.value)
  );

  return (
    <div className="view-switcher">
      {filteredOptions.map((option) => (
        <button
          key={option.value}
          className={`view-option ${currentView === option.value ? 'active' : ''}`}
          onClick={() => onViewChange(option.value)}
          title={option.label}
        >
          <span className="view-icon">{option.icon}</span>
          <span className="view-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};