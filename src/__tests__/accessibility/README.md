# 🧪 Todone Accessibility Testing Suite

This directory contains comprehensive accessibility tests for the Todone project to ensure WCAG 2.1 AA compliance.

## 📁 Structure

```
src/__tests__/accessibility/
├── accessibilitySetup.ts          # Test setup and utilities
├── accessibilityTestRunner.ts     # Comprehensive test runner
├── accessibilitySuite.test.tsx    # Main test suite
├── comprehensiveAccessibility.test.tsx # Comprehensive WCAG tests
├── coreComponents.test.tsx        # Core component accessibility tests
├── featureComponents.test.tsx      # Feature component accessibility tests
├── animationSystem.test.tsx       # Animation system accessibility tests
├── colorSchemes.test.tsx           # Color scheme and contrast tests
├── keyboardNavigation.test.tsx    # Keyboard navigation tests
└── README.md                       # This file
```

## 🎯 Testing Objectives

- **WCAG 2.1 AA Compliance**: Achieve full compliance with Web Content Accessibility Guidelines
- **Keyboard Navigation**: Ensure all functionality is accessible via keyboard
- **Screen Reader Compatibility**: Validate compatibility with NVDA, VoiceOver, and other screen readers
- **Color Contrast**: Verify sufficient contrast ratios for all UI elements
- **ARIA Attributes**: Validate proper ARIA attributes and semantic HTML
- **Focus Management**: Test focus order, traps, and keyboard navigation

## 🚀 Running Accessibility Tests

### Run all accessibility tests:
```bash
npm test -- --testPathPattern=accessibility
```

### Run specific test files:
```bash
npm test -- --testPathPattern=accessibility/coreComponents
npm test -- --testPathPattern=accessibility/featureComponents
```

### Run comprehensive audit:
```bash
npm test -- --testPathPattern=accessibilitySuite
```

## 🧪 Test Coverage

### Core Components
- **PriorityBadge**: ARIA attributes, color contrast, screen reader compatibility
- **StatusBadge**: Proper status roles, announcements
- **Button**: Keyboard navigation, focus states, disabled states
- **Modal**: Focus trapping, ARIA dialog attributes, keyboard navigation
- **Navigation**: Landmark roles, keyboard navigation, current page indication

### Feature Components
- **AccessibilityControls**: Keyboard accessibility, ARIA attributes
- **AccessibilitySettings**: Form accessibility, dialog patterns
- **TaskForm**: Form field accessibility, validation messages
- **ProjectForm**: Complex form accessibility
- **CommentForm**: Text area accessibility, submission handling

### Animation System
- **AnimationAccessibility**: Reduced motion support, ARIA live regions
- **AnimationControls**: Keyboard accessible controls
- **TaskAnimation**: Animation state announcements
- **ViewAnimation**: Transition accessibility

### Color Schemes
- **Contrast Ratios**: WCAG 2.1 AA minimum ratios (4.5:1 for normal text, 3:1 for large text)
- **Theme Compatibility**: Light, dark, and high-contrast theme testing
- **Color Blindness**: Protanopia, deuteranopia, tritanopia compatibility

### Keyboard Navigation
- **Tab Order**: Logical navigation sequence
- **Focus Traps**: Modal focus management
- **Keyboard Shortcuts**: Accessible shortcut implementations
- **Focus Indicators**: Visible focus states

## 📊 Test Results

The test suite generates comprehensive reports including:
- **WCAG Compliance Level**: AAA, AA, A, or Partial
- **Compliance Score**: 0-100 percentage
- **Violation Details**: Specific accessibility issues found
- **Performance Metrics**: Test execution times

## 🔧 Configuration

Accessibility tests use:
- **axe-core**: Automated accessibility testing engine
- **jest-axe**: Jest integration for axe-core
- **@testing-library/react**: DOM testing utilities
- **Custom Mocks**: Screen reader, keyboard navigation, and color contrast utilities

## 🎯 WCAG 2.1 AA Success Criteria Covered

### Perceivable
- **1.1.1 Non-text Content**: Alternative text for images and icons
- **1.3.1 Info and Relationships**: Semantic HTML and ARIA attributes
- **1.3.2 Meaningful Sequence**: Logical content ordering
- **1.4.3 Contrast (Minimum)**: Sufficient color contrast
- **1.4.4 Resize Text**: Text resizing support
- **1.4.5 Images of Text**: Avoid images of text

### Operable
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: No keyboard traps
- **2.4.1 Bypass Blocks**: Skip navigation links
- **2.4.2 Page Titled**: Descriptive page titles
- **2.4.3 Focus Order**: Logical focus order
- **2.4.4 Link Purpose**: Descriptive link text
- **2.4.6 Headings and Labels**: Clear headings and labels

### Understandable
- **3.1.1 Language of Page**: Language specification
- **3.2.1 On Focus**: No unexpected focus changes
- **3.2.2 On Input**: No unexpected form submissions
- **3.3.1 Error Identification**: Clear error messages
- **3.3.2 Labels or Instructions**: Form field labels

### Robust
- **4.1.1 Parsing**: Valid HTML parsing
- **4.1.2 Name, Role, Value**: Proper ARIA attributes

## 🛠️ Continuous Integration

Accessibility tests are integrated into the CI/CD pipeline:
- Run on every pull request
- Block merges with accessibility violations
- Generate accessibility reports
- Track compliance over time

## 📝 Best Practices

1. **Run tests frequently**: Catch accessibility issues early
2. **Test with real screen readers**: Manual testing with NVDA/VoiceOver
3. **Keyboard-only testing**: Regular keyboard navigation testing
4. **Color contrast checking**: Use browser dev tools for contrast analysis
5. **ARIA validation**: Validate ARIA attributes with browser tools

## 🎓 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Accessibility Resources](https://webaim.org/)
- [MDN Accessibility Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility)