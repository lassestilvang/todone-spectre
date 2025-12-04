import { useState, useEffect } from 'react';
import { performanceConfigService } from '../services/performanceConfigService';
import { PerformanceConfig } from '../types/performance';

export const usePerformanceConfig = () => {
  const [config, setConfig] = useState<PerformanceConfig>(performanceConfigService.getConfig());

  useEffect(() => {
    const unsubscribe = performanceConfigService.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = (newConfig: Partial<PerformanceConfig>) => {
    performanceConfigService.updateConfig(newConfig);
  };

  const resetConfig = () => {
    performanceConfigService.resetConfig();
  };

  return {
    config,
    updateConfig,
    resetConfig
  };
};