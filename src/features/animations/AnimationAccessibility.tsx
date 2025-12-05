import React, { useEffect, useState } from "react";
import { useAnimationContext } from "./AnimationProvider";

interface AnimationAccessibilityProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

export const AnimationAccessibility: React.FC<AnimationAccessibilityProps> = ({
  children,
  reducedMotion = false,
  highContrast = false,
}) => {
  const { isAnimating, toggleAnimation, animationSpeed, setAnimationSpeed } =
    useAnimationContext();
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    screenReaderActive: false,
  });

  useEffect(() => {
    // Check for system accessibility preferences
    checkSystemPreferences();

    // Set up event listeners for preference changes
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", checkSystemPreferences);
    window
      .matchMedia("(prefers-contrast: more)")
      .addEventListener("change", checkSystemPreferences);

    return () => {
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .removeEventListener("change", checkSystemPreferences);
      window
        .matchMedia("(prefers-contrast: more)")
        .removeEventListener("change", checkSystemPreferences);
    };
  }, []);

  useEffect(() => {
    // Apply accessibility settings
    applyAccessibilitySettings();
  }, [accessibilitySettings, reducedMotion, highContrast]);

  const checkSystemPreferences = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prefersHighContrast = window.matchMedia(
      "(prefers-contrast: more)",
    ).matches;

    setAccessibilitySettings((prev) => ({
      ...prev,
      prefersReducedMotion,
      prefersHighContrast,
    }));
  };

  const applyAccessibilitySettings = () => {
    const shouldReduceMotion =
      reducedMotion || accessibilitySettings.prefersReducedMotion;
    const shouldUseHighContrast =
      highContrast || accessibilitySettings.prefersHighContrast;

    if (shouldReduceMotion && isAnimating) {
      // Disable or reduce animations for users who prefer reduced motion
      toggleAnimation();
      setAnimationSpeed(2.0); // Make animations very fast if not completely disabled
    }

    if (shouldUseHighContrast) {
      // Apply high contrast styles
      document.body.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
    }
  };

  const getAccessibilityStatus = () => {
    const issues = [];

    if (accessibilitySettings.prefersReducedMotion && isAnimating) {
      issues.push("Animations enabled despite reduced motion preference");
    }

    if (accessibilitySettings.prefersHighContrast && !highContrast) {
      issues.push("High contrast preference not fully applied");
    }

    return issues.length === 0
      ? "✅ Accessible"
      : `⚠️ ${issues.length} issue(s)`;
  };

  return (
    <div
      aria-live="off"
      aria-atomic="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {children}

      {(isAnimating || highContrast) && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(5px)",
          }}
        >
          <span role="status" aria-label="Accessibility status">
            {getAccessibilityStatus()}
          </span>
          {accessibilitySettings.prefersReducedMotion && (
            <span>🚫 Reduced Motion</span>
          )}
          {accessibilitySettings.prefersHighContrast && (
            <span>🎨 High Contrast</span>
          )}
        </div>
      )}
    </div>
  );
};
