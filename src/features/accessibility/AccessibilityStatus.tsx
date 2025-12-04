import React, { useEffect, useState } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';
import { useAccessibilityConfig } from '../../hooks/useAccessibilityConfig';
import { CheckCircle, AlertCircle, Info, Accessibility as AccessibilityIcon, Settings } from '../../components/icons';
import { Button, Tooltip, Badge } from '../../components/ui';

interface AccessibilityStatusProps {
  showDetailedStatus?: boolean;
  onSettingsClick?: () => void;
  className?: string;
}

interface AccessibilityFeatureStatus {
  name: string;
  enabled: boolean;
  description: string;
  icon?: React.ReactNode;
}

export const AccessibilityStatus: React.FC<AccessibilityStatusProps> = ({
  showDetailedStatus = false,
  onSettingsClick,
  className = ''
}) => {
  const {
    isHighContrast,
    fontSize,
    reduceMotion,
    screenReaderEnabled,
    keyboardNavigation,
    accessibilityFeatures
  } = useAccessibilityContext();

  const { accessibilityConfig } = useAccessibilityConfig();
  const [statusLevel, setStatusLevel] = useState<'good' | 'warning' | 'error' | 'info'>('info');
  const [statusMessage, setStatusMessage] = useState('Accessibility features available');
  const [featureStatuses, setFeatureStatuses] = useState<AccessibilityFeatureStatus[]>([]);

  useEffect(() => {
    // Calculate overall accessibility status
    const activeFeatures = [
      isHighContrast ? 1 : 0,
      fontSize !== 'medium' ? 1 : 0,
      reduceMotion ? 1 : 0,
      screenReaderEnabled ? 1 : 0,
      keyboardNavigation ? 1 : 0,
      accessibilityFeatures.length
    ].reduce((sum, val) => sum + val, 0);

    // Determine status level
    if (activeFeatures >= 3) {
      setStatusLevel('good');
      setStatusMessage('Enhanced accessibility active');
    } else if (activeFeatures >= 1) {
      setStatusLevel('info');
      setStatusMessage('Basic accessibility active');
    } else {
      setStatusLevel('warning');
      setStatusMessage('Accessibility features available');
    }

    // Update feature statuses
    const features: AccessibilityFeatureStatus[] = [
      {
        name: 'High Contrast',
        enabled: isHighContrast,
        description: 'Improves visibility with higher color contrast',
        icon: <CheckCircle className={`status-icon ${isHighContrast ? 'active' : 'inactive'}`} />
      },
      {
        name: 'Custom Text Size',
        enabled: fontSize !== 'medium',
        description: `Text size set to ${fontSize}`,
        icon: <Info className="status-icon" />
      },
      {
        name: 'Reduce Motion',
        enabled: reduceMotion,
        description: 'Reduces animations and motion effects',
        icon: <CheckCircle className={`status-icon ${reduceMotion ? 'active' : 'inactive'}`} />
      },
      {
        name: 'Screen Reader',
        enabled: screenReaderEnabled,
        description: 'Enhanced screen reader compatibility',
        icon: <CheckCircle className={`status-icon ${screenReaderEnabled ? 'active' : 'inactive'}`} />
      },
      {
        name: 'Keyboard Navigation',
        enabled: keyboardNavigation,
        description: 'Improved keyboard-only navigation',
        icon: <CheckCircle className={`status-icon ${keyboardNavigation ? 'active' : 'inactive'}`} />
      },
      ...accessibilityFeatures.map(feature => ({
        name: feature,
        enabled: true,
        description: `Custom accessibility feature: ${feature}`,
        icon: <CheckCircle className="status-icon active" />
      }))
    ];

    setFeatureStatuses(features);

  }, [isHighContrast, fontSize, reduceMotion, screenReaderEnabled, keyboardNavigation, accessibilityFeatures]);

  const getStatusIcon = () => {
    switch (statusLevel) {
      case 'good': return <CheckCircle className="status-icon good" />;
      case 'warning': return <AlertCircle className="status-icon warning" />;
      case 'error': return <AlertCircle className="status-icon error" />;
      default: return <Info className="status-icon info" />;
    }
  };

  const getStatusColor = () => {
    switch (statusLevel) {
      case 'good': return 'var(--success-color)';
      case 'warning': return 'var(--warning-color)';
      case 'error': return 'var(--error-color)';
      default: return 'var(--info-color)';
    }
  };

  if (!showDetailedStatus) {
    return (
      <div className={`accessibility-status ${className}`} style={{ color: getStatusColor() }}>
        {getStatusIcon()}
        <span className="status-text">{statusMessage}</span>
        {onSettingsClick && (
          <Tooltip content="Accessibility settings">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="settings-button"
              aria-label="Open accessibility settings"
            >
              <Settings className="settings-icon" />
            </Button>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className={`accessibility-status-detailed ${className}`}>
      <div className="status-header">
        <AccessibilityIcon className="accessibility-icon" />
        <h3>Accessibility Status</h3>
        <Badge variant={statusLevel === 'good' ? 'success' : statusLevel === 'warning' ? 'warning' : 'info'}>
          {statusMessage}
        </Badge>
      </div>

      <div className="status-grid">
        {featureStatuses.map((feature, index) => (
          <div key={index} className="feature-status">
            <div className="feature-icon">
              {feature.icon || <CheckCircle className={`status-icon ${feature.enabled ? 'active' : 'inactive'}`} />}
            </div>
            <div className="feature-info">
              <h4>{feature.name}</h4>
              <p>{feature.description}</p>
              <Badge variant={feature.enabled ? 'success' : 'secondary'}>
                {feature.enabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {onSettingsClick && (
        <div className="status-footer">
          <Button variant="outline" onClick={onSettingsClick}>
            <Settings className="button-icon" />
            Configure Accessibility
          </Button>
        </div>
      )}
    </div>
  );
};