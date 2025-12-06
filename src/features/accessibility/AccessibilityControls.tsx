import React, { useState } from "react";
import { useAccessibilityContext } from "./AccessibilityProvider";
import { Switch } from "../../components/ui";
import {
  Contrast,
  TextSize,
  Motion,
  Keyboard,
  ScreenReader,
  Accessibility as AccessibilityIcon,
} from "../../components/icons";

interface AccessibilityControlsProps {
  className?: string;
  showLabels?: boolean;
  onAccessibilityChange?: (settings: any) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  className = "",
  showLabels = true,
  onAccessibilityChange,
}) => {
  const {
    isHighContrast,
    fontSize,
    reduceMotion,
    screenReaderEnabled,
    keyboardNavigation,
    toggleHighContrast,
    setFontSize,
    toggleReduceMotion,
    toggleScreenReader,
    toggleKeyboardNavigation,
  } = useAccessibilityContext();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleAccessibilityChange = () => {
    if (onAccessibilityChange) {
      onAccessibilityChange({
        isHighContrast,
        fontSize,
        reduceMotion,
        screenReaderEnabled,
        keyboardNavigation,
      });
    }
  };

  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xlarge", label: "Extra Large" },
  ];

  return (
    <div
      className={`accessibility-controls ${className} ${isExpanded ? "expanded" : "collapsed"}`}
    >
      <div className="accessibility-controls-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="accessibility-toggle-button"
          aria-expanded={isExpanded}
          aria-controls="accessibility-controls-panel"
          aria-label={
            isExpanded
              ? "Collapse accessibility controls"
              : "Expand accessibility controls"
          }
        >
          <AccessibilityIcon className="accessibility-icon" />
          {showLabels && <span>Accessibility</span>}
        </button>
      </div>

      {isExpanded && (
        <div
          id="accessibility-controls-panel"
          className="accessibility-controls-panel"
        >
          <div className="accessibility-control-group">
            {showLabels && (
              <label htmlFor="high-contrast-toggle">High Contrast</label>
            )}
            <Tooltip content="Toggle high contrast mode for better visibility">
              <Switch
                id="high-contrast-toggle"
                checked={isHighContrast}
                onCheckedChange={() => {
                  toggleHighContrast();
                  handleAccessibilityChange();
                }}
                aria-label="Toggle high contrast mode"
              >
                <Contrast className="control-icon" />
              </Switch>
            </Tooltip>
          </div>

          <div className="accessibility-control-group">
            {showLabels && <label htmlFor="font-size-select">Text Size</label>}
            <Tooltip content="Adjust text size for better readability">
              <Select
                value={fontSize}
                onValueChange={(value) => {
                  setFontSize(value);
                  handleAccessibilityChange();
                }}
                aria-label="Select text size"
              >
                <button
                  className="select-trigger"
                  aria-label="Text size options"
                >
                  <TextSize className="control-icon" />
                </button>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </Tooltip>
          </div>

          <div className="accessibility-control-group">
            {showLabels && (
              <label htmlFor="reduce-motion-toggle">Reduce Motion</label>
            )}
            <Tooltip content="Reduce animations and motion for better accessibility">
              <Switch
                id="reduce-motion-toggle"
                checked={reduceMotion}
                onCheckedChange={() => {
                  toggleReduceMotion();
                  handleAccessibilityChange();
                }}
                aria-label="Toggle reduce motion"
              >
                <Motion className="control-icon" />
              </Switch>
            </Tooltip>
          </div>

          <div className="accessibility-control-group">
            {showLabels && (
              <label htmlFor="screen-reader-toggle">Screen Reader</label>
            )}
            <Tooltip content="Enable screen reader support">
              <Switch
                id="screen-reader-toggle"
                checked={screenReaderEnabled}
                onCheckedChange={() => {
                  toggleScreenReader();
                  handleAccessibilityChange();
                }}
                aria-label="Toggle screen reader support"
              >
                <ScreenReader className="control-icon" />
              </Switch>
            </Tooltip>
          </div>

          <div className="accessibility-control-group">
            {showLabels && (
              <label htmlFor="keyboard-nav-toggle">Keyboard Navigation</label>
            )}
            <Tooltip content="Enable enhanced keyboard navigation">
              <Switch
                id="keyboard-nav-toggle"
                checked={keyboardNavigation}
                onCheckedChange={() => {
                  toggleKeyboardNavigation();
                  handleAccessibilityChange();
                }}
                aria-label="Toggle keyboard navigation"
              >
                <Keyboard className="control-icon" />
              </Switch>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};
