import { accessibilityService } from '../services/accessibilityService';

interface AccessibilityUtils {
  getFontSizeValue: (size: string) => string;
  getContrastRatio: (color1: string, color2: string) => number;
  isColorAccessible: (fgColor: string, bgColor: string, minRatio?: number) => boolean;
  generateAccessibleColor: (baseColor: string, isBackground?: boolean) => string;
  getAriaAttributes: (elementType: string, role?: string) => Record<string, string>;
  createAccessibleElement: (
    tag: string,
    content: string,
    options?: {
      role?: string;
      ariaLabel?: string;
      ariaLive?: 'off' | 'polite' | 'assertive';
      className?: string;
      onClick?: () => void;
    }
  ) => HTMLElement;
  validateAccessibility: (element: HTMLElement) => {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
  getKeyboardNavigationAttributes: () => Record<string, string>;
  getScreenReaderAttributes: () => Record<string, string>;
  applyAccessibilityFeatures: (features: string[]) => void;
  removeAccessibilityFeatures: (features: string[]) => void;
  getAccessibilityFeatureStatus: (featureId: string) => boolean;
  toggleAccessibilityFeature: (featureId: string) => void;
  getAllAccessibilityFeatures: () => string[];
  formatAccessibilityStatus: (status: {
    level: string;
    message: string;
    score: number;
  }) => string;
}

const getLuminance = (color: string): number => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rgb = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );

  // Calculate relative luminance
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};

const accessibilityUtils: AccessibilityUtils = {
  getFontSizeValue: (size: string): string => {
    const fontSizes: Record<string, string> = {
      small: '0.8rem',
      medium: '1rem',
      large: '1.2rem',
      xlarge: '1.5rem'
    };
    return fontSizes[size] || '1rem';
  },

  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1) + 0.05;
    const lum2 = getLuminance(color2) + 0.05;
    return lum1 > lum2 ? lum1 / lum2 : lum2 / lum1;
  },

  isColorAccessible: (fgColor: string, bgColor: string, minRatio: number = 4.5): boolean => {
    const ratio = this.getContrastRatio(fgColor, bgColor);
    return ratio >= minRatio;
  },

  generateAccessibleColor: (baseColor: string, isBackground: boolean = false): string => {
    // Simple algorithm to generate accessible colors
    const hex = baseColor.replace('#', '');
    if (hex.length !== 6) return baseColor;

    // Convert to HSL for better manipulation
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    // Adjust for accessibility
    if (isBackground) {
      // Make background colors more distinct
      s = Math.min(1, s * 1.2);
      l = l < 0.5 ? Math.max(0.2, l * 0.8) : Math.min(0.8, l * 1.2);
    } else {
      // Make foreground colors more distinct
      s = Math.min(1, s * 1.3);
      l = l < 0.5 ? Math.max(0.3, l * 0.7) : Math.min(0.7, l * 1.3);
    }

    // Convert back to RGB
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r2 = hue2rgb(p, q, h + 1/3);
    const g2 = hue2rgb(p, q, h);
    const b2 = hue2rgb(p, q, h - 1/3);

    const toHex = (value: number): string => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
  },

  getAriaAttributes: (elementType: string, role?: string): Record<string, string> => {
    const attributes: Record<string, string> = {};

    switch (elementType.toLowerCase()) {
      case 'button':
        attributes['role'] = role || 'button';
        attributes['tabindex'] = '0';
        attributes['aria-pressed'] = 'false';
        break;
      case 'link':
        attributes['role'] = role || 'link';
        attributes['tabindex'] = '0';
        break;
      case 'modal':
        attributes['role'] = role || 'dialog';
        attributes['aria-modal'] = 'true';
        attributes['aria-labelledby'] = 'modal-title';
        break;
      case 'alert':
        attributes['role'] = role || 'alert';
        attributes['aria-live'] = 'assertive';
        break;
      case 'status':
        attributes['role'] = role || 'status';
        attributes['aria-live'] = 'polite';
        break;
      case 'navigation':
        attributes['role'] = role || 'navigation';
        attributes['aria-label'] = 'Main navigation';
        break;
      default:
        attributes['role'] = role || 'region';
    }

    return attributes;
  },

  createAccessibleElement: (
    tag: string,
    content: string,
    options: {
      role?: string;
      ariaLabel?: string;
      ariaLive?: 'off' | 'polite' | 'assertive';
      className?: string;
      onClick?: () => void;
    } = {}
  ): HTMLElement => {
    const element = document.createElement(tag);
    element.textContent = content;

    if (options.role) {
      element.setAttribute('role', options.role);
    }

    if (options.ariaLabel) {
      element.setAttribute('aria-label', options.ariaLabel);
    }

    if (options.ariaLive) {
      element.setAttribute('aria-live', options.ariaLive);
    }

    if (options.className) {
      element.className = options.className;
    }

    if (options.onClick) {
      element.addEventListener('click', options.onClick);
      element.setAttribute('tabindex', '0');
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          options.onClick?.();
        }
      });
    }

    return element;
  },

  validateAccessibility: (element: HTMLElement): { isValid: boolean; issues: string[]; suggestions: string[] } => {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for common accessibility issues
    if (!element.getAttribute('role') && !['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
      issues.push('Element missing ARIA role');
      suggestions.push('Add appropriate ARIA role attribute');
    }

    if (element.tagName.toLowerCase() === 'button' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
      issues.push('Button missing accessible name');
      suggestions.push('Add aria-label or visible text content');
    }

    if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('disabled')) {
      issues.push('Element removed from tab order but not disabled');
      suggestions.push('Consider using disabled attribute or proper tabindex management');
    }

    // Check color contrast if element has color styles
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrastRatio = this.getContrastRatio(color, backgroundColor);
      if (contrastRatio < 4.5) {
        issues.push(`Low color contrast (${contrastRatio.toFixed(2)}:1)`);
        suggestions.push('Increase color contrast to at least 4.5:1 for normal text');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  },

  getKeyboardNavigationAttributes: (): Record<string, string> => {
    return {
      'tabindex': '0',
      'role': 'button',
      'aria-label': 'Keyboard navigable element',
      'data-keyboard-nav': 'true'
    };
  },

  getScreenReaderAttributes: (): Record<string, string> => {
    return {
      'aria-hidden': 'false',
      'aria-live': 'polite',
      'role': 'region',
      'data-screen-reader': 'enhanced'
    };
  },

  applyAccessibilityFeatures: (features: string[]): void => {
    features.forEach(feature => {
      accessibilityService.addFeature(feature);
    });
  },

  removeAccessibilityFeatures: (features: string[]): void => {
    features.forEach(feature => {
      accessibilityService.removeFeature(feature);
    });
  },

  getAccessibilityFeatureStatus: (featureId: string): boolean => {
    return accessibilityService.getCurrentState().features.includes(featureId);
  },

  toggleAccessibilityFeature: (featureId: string): void => {
    const currentState = accessibilityService.getCurrentState();
    if (currentState.features.includes(featureId)) {
      accessibilityService.removeFeature(featureId);
    } else {
      accessibilityService.addFeature(featureId);
    }
  },

  getAllAccessibilityFeatures: (): string[] => {
    return accessibilityService.getCurrentState().features;
  },

  formatAccessibilityStatus: (status: { level: string; message: string; score: number }): string => {
    return `${status.level.toUpperCase()}: ${status.message} (Score: ${status.score}/100)`;
  }
};

export { accessibilityUtils };