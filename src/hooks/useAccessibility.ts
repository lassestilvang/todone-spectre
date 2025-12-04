import { useState, useEffect, useCallback } from 'react';
import { accessibilityService } from '../services/accessibilityService';
import { useAccessibilityContext } from '../features/accessibility/AccessibilityProvider';

interface UseAccessibilityReturn {
  accessibilityState: {
    isHighContrast: boolean;
    fontSize: string;
    reduceMotion: boolean;
    screenReaderEnabled: boolean;
    keyboardNavigation: boolean;
    features: string[];
    lastUpdated: Date;
  };
  accessibilityPreferences: {
    preferredContrast: string;
    preferredFontSize: string;
    preferredMotion: string;
    preferredScreenReader: boolean;
    preferredKeyboardNavigation: boolean;
  };
  updateAccessibilityState: (stateUpdate: Partial<{
    isHighContrast?: boolean;
    fontSize?: string;
    reduceMotion?: boolean;
    screenReaderEnabled?: boolean;
    keyboardNavigation?: boolean;
    features?: string[];
  }>) => void;
  updateAccessibilityPreferences: (preferencesUpdate: Partial<{
    preferredContrast?: string;
    preferredFontSize?: string;
    preferredMotion?: string;
    preferredScreenReader?: boolean;
    preferredKeyboardNavigation?: boolean;
  }>) => void;
  toggleHighContrast: () => void;
  setFontSize: (size: string) => void;
  toggleReduceMotion: () => void;
  toggleScreenReader: (enabled?: boolean) => void;
  toggleKeyboardNavigation: (enabled?: boolean) => void;
  addFeature: (featureId: string) => void;
  removeFeature: (featureId: string) => void;
  resetToDefaults: () => void;
  getAccessibilityStatus: () => { level: string; message: string; score: number };
  applySystemPreferences: () => void;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const context = useAccessibilityContext();
  const [accessibilityState, setAccessibilityState] = useState(accessibilityService.getCurrentState());
  const [accessibilityPreferences, setAccessibilityPreferences] = useState(accessibilityService.getCurrentPreferences());

  useEffect(() => {
    // Sync with service state
    const updateState = () => {
      setAccessibilityState(accessibilityService.getCurrentState());
      setAccessibilityPreferences(accessibilityService.getCurrentPreferences());
    };

    updateState();

    // Set up event listeners for system preference changes
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMediaChange = () => updateState();

    mediaQueryList.addEventListener('change', handleMediaChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Sync context with service state
  useEffect(() => {
    if (context) {
      // Update context when service state changes
      const handleContextUpdate = () => {
        if (context.isHighContrast !== accessibilityState.isHighContrast) {
          context.toggleHighContrast();
        }
        if (context.fontSize !== accessibilityState.fontSize) {
          context.setFontSize(accessibilityState.fontSize);
        }
        if (context.reduceMotion !== accessibilityState.reduceMotion) {
          context.toggleReduceMotion();
        }
        if (context.screenReaderEnabled !== accessibilityState.screenReaderEnabled) {
          context.toggleScreenReader();
        }
        if (context.keyboardNavigation !== accessibilityState.keyboardNavigation) {
          context.toggleKeyboardNavigation();
        }
      };

      handleContextUpdate();
    }
  }, [accessibilityState, context]);

  const updateAccessibilityState = useCallback((stateUpdate: Partial<{
    isHighContrast?: boolean;
    fontSize?: string;
    reduceMotion?: boolean;
    screenReaderEnabled?: boolean;
    keyboardNavigation?: boolean;
    features?: string[];
  }>) => {
    accessibilityService.updateState(stateUpdate);
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const updateAccessibilityPreferences = useCallback((preferencesUpdate: Partial<{
    preferredContrast?: string;
    preferredFontSize?: string;
    preferredMotion?: string;
    preferredScreenReader?: boolean;
    preferredKeyboardNavigation?: boolean;
  }>) => {
    accessibilityService.updatePreferences(preferencesUpdate);
    setAccessibilityPreferences(accessibilityService.getCurrentPreferences());
  }, []);

  const toggleHighContrast = useCallback(() => {
    accessibilityService.toggleHighContrast();
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const setFontSize = useCallback((size: string) => {
    accessibilityService.setFontSize(size);
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const toggleReduceMotion = useCallback(() => {
    accessibilityService.toggleReduceMotion();
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const toggleScreenReader = useCallback((enabled?: boolean) => {
    if (enabled !== undefined) {
      accessibilityService.toggleScreenReaderSupport(enabled);
    } else {
      accessibilityService.toggleScreenReaderSupport(!accessibilityState.screenReaderEnabled);
    }
    setAccessibilityState(accessibilityService.getCurrentState());
  }, [accessibilityState.screenReaderEnabled]);

  const toggleKeyboardNavigation = useCallback((enabled?: boolean) => {
    if (enabled !== undefined) {
      accessibilityService.toggleKeyboardNavigation(enabled);
    } else {
      accessibilityService.toggleKeyboardNavigation(!accessibilityState.keyboardNavigation);
    }
    setAccessibilityState(accessibilityService.getCurrentState());
  }, [accessibilityState.keyboardNavigation]);

  const addFeature = useCallback((featureId: string) => {
    accessibilityService.addFeature(featureId);
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const removeFeature = useCallback((featureId: string) => {
    accessibilityService.removeFeature(featureId);
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  const resetToDefaults = useCallback(() => {
    accessibilityService.resetToDefaults();
    setAccessibilityState(accessibilityService.getCurrentState());
    setAccessibilityPreferences(accessibilityService.getCurrentPreferences());
  }, []);

  const getAccessibilityStatus = useCallback(() => {
    return accessibilityService.getAccessibilityStatus();
  }, []);

  const applySystemPreferences = useCallback(() => {
    accessibilityService.applySystemPreferences();
    setAccessibilityState(accessibilityService.getCurrentState());
  }, []);

  return {
    accessibilityState,
    accessibilityPreferences,
    updateAccessibilityState,
    updateAccessibilityPreferences,
    toggleHighContrast,
    setFontSize,
    toggleReduceMotion,
    toggleScreenReader,
    toggleKeyboardNavigation,
    addFeature,
    removeFeature,
    resetToDefaults,
    getAccessibilityStatus,
    applySystemPreferences
  };
};