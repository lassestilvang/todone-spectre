import React, { useState, useEffect } from "react";
import { useAccessibilityContext } from "./AccessibilityProvider";
import { useAccessibilityConfig } from "../../hooks/useAccessibilityConfig";
import {
  Button,
  Switch,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui";
import {
  Save,
  Reset,
  Accessibility as AccessibilityIcon,
} from "../../components/icons";

interface AccessibilitySettingsProps {
  onSave?: (config: any) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  onSave,
  onCancel,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const {
    isHighContrast,
    fontSize,
    reduceMotion,
    screenReaderEnabled,
    keyboardNavigation,
    setFontSize,
    toggleHighContrast,
    toggleReduceMotion,
    toggleScreenReader,
    toggleKeyboardNavigation,
  } = useAccessibilityContext();

  const { accessibilityConfig, updateAccessibilityConfig } =
    useAccessibilityConfig();
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const [tempSettings, setTempSettings] = useState({
    highContrast: isHighContrast,
    fontSize: fontSize,
    reduceMotion: reduceMotion,
    screenReader: screenReaderEnabled,
    keyboardNavigation: keyboardNavigation,
    autoApply: accessibilityConfig?.autoApply || false,
    persistSettings: accessibilityConfig?.persistSettings || true,
  });

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    setTempSettings({
      highContrast: isHighContrast,
      fontSize: fontSize,
      reduceMotion: reduceMotion,
      screenReader: screenReaderEnabled,
      keyboardNavigation: keyboardNavigation,
      autoApply: accessibilityConfig?.autoApply || false,
      persistSettings: accessibilityConfig?.persistSettings || true,
    });
  }, [
    isHighContrast,
    fontSize,
    reduceMotion,
    screenReaderEnabled,
    keyboardNavigation,
    accessibilityConfig,
  ]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const handleSave = () => {
    // Apply settings
    if (
      tempSettings.highContrast !== isHighContrast &&
      tempSettings.highContrast
    ) {
      toggleHighContrast();
    }
    if (tempSettings.fontSize !== fontSize) {
      setFontSize(tempSettings.fontSize);
    }
    if (
      tempSettings.reduceMotion !== reduceMotion &&
      tempSettings.reduceMotion
    ) {
      toggleReduceMotion();
    }
    if (
      tempSettings.screenReader !== screenReaderEnabled &&
      tempSettings.screenReader
    ) {
      toggleScreenReader();
    }
    if (
      tempSettings.keyboardNavigation !== keyboardNavigation &&
      tempSettings.keyboardNavigation
    ) {
      toggleKeyboardNavigation();
    }

    // Update config
    if (updateAccessibilityConfig) {
      updateAccessibilityConfig({
        ...accessibilityConfig,
        autoApply: tempSettings.autoApply,
        persistSettings: tempSettings.persistSettings,
        defaultHighContrast: tempSettings.highContrast,
        defaultFontSize: tempSettings.fontSize,
        defaultReduceMotion: tempSettings.reduceMotion,
        defaultScreenReader: tempSettings.screenReader,
        defaultKeyboardNavigation: tempSettings.keyboardNavigation,
      });
    }

    if (onSave) {
      onSave(tempSettings);
    }

    handleOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to current values
    setTempSettings({
      highContrast: isHighContrast,
      fontSize: fontSize,
      reduceMotion: reduceMotion,
      screenReader: screenReaderEnabled,
      keyboardNavigation: keyboardNavigation,
      autoApply: accessibilityConfig?.autoApply || false,
      persistSettings: accessibilityConfig?.persistSettings || true,
    });

    if (onCancel) {
      onCancel();
    }

    handleOpenChange(false);
  };

  const fontSizeOptions = [
    { value: "small", label: "Small (0.8rem)" },
    { value: "medium", label: "Medium (1rem)" },
    { value: "large", label: "Large (1.2rem)" },
    { value: "xlarge", label: "Extra Large (1.5rem)" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="accessibility-settings-dialog"
        aria-labelledby="accessibility-settings-title"
      >
        <DialogHeader>
          <DialogTitle id="accessibility-settings-title">
            <AccessibilityIcon className="settings-icon" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>

        <div className="accessibility-settings-content">
          <div className="settings-section">
            <h3>Visual Settings</h3>

            <div className="setting-item">
              <label htmlFor="high-contrast-setting">High Contrast Mode</label>
              <Switch
                id="high-contrast-setting"
                checked={tempSettings.highContrast}
                onCheckedChange={(checked) =>
                  setTempSettings({ ...tempSettings, highContrast: checked })
                }
                aria-label="Enable high contrast mode"
              />
              <p className="setting-description">
                Increases color contrast for better visibility
              </p>
            </div>

            <div className="setting-item">
              <label htmlFor="font-size-setting">Text Size</label>
              <Select
                value={tempSettings.fontSize}
                onValueChange={(value) =>
                  setTempSettings({ ...tempSettings, fontSize: value })
                }
                aria-label="Select text size"
              >
                <button
                  className="select-trigger"
                  aria-label="Text size options"
                >
                  {fontSizeOptions.find(
                    (opt) => opt.value === tempSettings.fontSize,
                  )?.label || "Medium"}
                </button>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <p className="setting-description">
                Adjust text size for better readability
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h3>Motion Settings</h3>

            <div className="setting-item">
              <label htmlFor="reduce-motion-setting">Reduce Motion</label>
              <Switch
                id="reduce-motion-setting"
                checked={tempSettings.reduceMotion}
                onCheckedChange={(checked) =>
                  setTempSettings({ ...tempSettings, reduceMotion: checked })
                }
                aria-label="Reduce animations and motion"
              />
              <p className="setting-description">
                Reduces animations and motion effects
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h3>Assistive Technology</h3>

            <div className="setting-item">
              <label htmlFor="screen-reader-setting">
                Screen Reader Support
              </label>
              <Switch
                id="screen-reader-setting"
                checked={tempSettings.screenReader}
                onCheckedChange={(checked) =>
                  setTempSettings({ ...tempSettings, screenReader: checked })
                }
                aria-label="Enable screen reader support"
              />
              <p className="setting-description">
                Enhances compatibility with screen readers
              </p>
            </div>

            <div className="setting-item">
              <label htmlFor="keyboard-nav-setting">Keyboard Navigation</label>
              <Switch
                id="keyboard-nav-setting"
                checked={tempSettings.keyboardNavigation}
                onCheckedChange={(checked) =>
                  setTempSettings({
                    ...tempSettings,
                    keyboardNavigation: checked,
                  })
                }
                aria-label="Enable enhanced keyboard navigation"
              />
              <p className="setting-description">
                Improves keyboard-only navigation experience
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h3>Advanced Settings</h3>

            <div className="setting-item">
              <label htmlFor="auto-apply-setting">Auto Apply Settings</label>
              <Switch
                id="auto-apply-setting"
                checked={tempSettings.autoApply}
                onCheckedChange={(checked) =>
                  setTempSettings({ ...tempSettings, autoApply: checked })
                }
                aria-label="Automatically apply accessibility settings"
              />
              <p className="setting-description">
                Automatically apply settings when changed
              </p>
            </div>

            <div className="setting-item">
              <label htmlFor="persist-settings-setting">Persist Settings</label>
              <Switch
                id="persist-settings-setting"
                checked={tempSettings.persistSettings}
                onCheckedChange={(checked) =>
                  setTempSettings({ ...tempSettings, persistSettings: checked })
                }
                aria-label="Persist accessibility settings"
              />
              <p className="setting-description">
                Save settings between sessions
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            <Reset className="button-icon" />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="button-icon" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
