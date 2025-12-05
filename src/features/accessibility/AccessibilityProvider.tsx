import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccessibility } from "../../hooks/useAccessibility";
import { useAccessibilityConfig } from "../../hooks/useAccessibilityConfig";

interface AccessibilityContextType {
  isHighContrast: boolean;
  fontSize: string;
  reduceMotion: boolean;
  screenReaderEnabled: boolean;
  keyboardNavigation: boolean;
  toggleHighContrast: () => void;
  setFontSize: (size: string) => void;
  toggleReduceMotion: () => void;
  toggleScreenReader: () => void;
  toggleKeyboardNavigation: () => void;
  accessibilityFeatures: string[];
  addAccessibilityFeature: (feature: string) => void;
  removeAccessibilityFeature: (feature: string) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { accessibilityState, updateAccessibilityState } = useAccessibility();
  const { accessibilityConfig, updateAccessibilityConfig } =
    useAccessibilityConfig();

  const [isHighContrast, setIsHighContrast] = useState(
    accessibilityState?.isHighContrast ||
      accessibilityConfig?.defaultHighContrast ||
      false,
  );
  const [fontSize, setFontSize] = useState(
    accessibilityState?.fontSize ||
      accessibilityConfig?.defaultFontSize ||
      "medium",
  );
  const [reduceMotion, setReduceMotion] = useState(
    accessibilityState?.reduceMotion ||
      accessibilityConfig?.defaultReduceMotion ||
      false,
  );
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(
    accessibilityState?.screenReaderEnabled ||
      accessibilityConfig?.defaultScreenReader ||
      false,
  );
  const [keyboardNavigation, setKeyboardNavigation] = useState(
    accessibilityState?.keyboardNavigation ||
      accessibilityConfig?.defaultKeyboardNavigation ||
      false,
  );
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>(
    accessibilityState?.features || [],
  );

  useEffect(() => {
    // Update state when config changes
    if (accessibilityConfig) {
      setIsHighContrast(accessibilityConfig.defaultHighContrast || false);
      setFontSize(accessibilityConfig.defaultFontSize || "medium");
      setReduceMotion(accessibilityConfig.defaultReduceMotion || false);
      setScreenReaderEnabled(accessibilityConfig.defaultScreenReader || false);
      setKeyboardNavigation(
        accessibilityConfig.defaultKeyboardNavigation || false,
      );
    }
  }, [accessibilityConfig]);

  useEffect(() => {
    // Persist state changes
    if (updateAccessibilityState) {
      updateAccessibilityState({
        isHighContrast,
        fontSize,
        reduceMotion,
        screenReaderEnabled,
        keyboardNavigation,
        features: accessibilityFeatures,
      });
    }
  }, [
    isHighContrast,
    fontSize,
    reduceMotion,
    screenReaderEnabled,
    keyboardNavigation,
    accessibilityFeatures,
  ]);

  const toggleHighContrast = () => setIsHighContrast(!isHighContrast);
  const toggleReduceMotion = () => setReduceMotion(!reduceMotion);
  const toggleScreenReader = () => setScreenReaderEnabled(!screenReaderEnabled);
  const toggleKeyboardNavigation = () =>
    setKeyboardNavigation(!keyboardNavigation);

  const addAccessibilityFeature = (feature: string) => {
    if (!accessibilityFeatures.includes(feature)) {
      setAccessibilityFeatures([...accessibilityFeatures, feature]);
    }
  };

  const removeAccessibilityFeature = (feature: string) => {
    setAccessibilityFeatures(
      accessibilityFeatures.filter((f) => f !== feature),
    );
  };

  const handleSetFontSize = (size: string) => {
    const validSizes = ["small", "medium", "large", "xlarge"];
    if (validSizes.includes(size)) {
      setFontSize(size);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isHighContrast,
        fontSize,
        reduceMotion,
        screenReaderEnabled,
        keyboardNavigation,
        toggleHighContrast,
        setFontSize: handleSetFontSize,
        toggleReduceMotion,
        toggleScreenReader,
        toggleKeyboardNavigation,
        accessibilityFeatures,
        addAccessibilityFeature,
        removeAccessibilityFeature,
      }}
    >
      <div
        className={`accessibility-provider ${isHighContrast ? "high-contrast" : ""} ${reduceMotion ? "reduce-motion" : ""}`}
        style={{ fontSize: getFontSizeValue(fontSize) }}
        aria-live="polite"
        aria-atomic="true"
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

const getFontSizeValue = (size: string): string => {
  const fontSizes: Record<string, string> = {
    small: "0.8rem",
    medium: "1rem",
    large: "1.2rem",
    xlarge: "1.5rem",
  };
  return fontSizes[size] || "1rem";
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibilityContext must be used within an AccessibilityProvider",
    );
  }
  return context;
};
