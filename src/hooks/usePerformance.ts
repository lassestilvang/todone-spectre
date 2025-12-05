import { useState, useEffect } from "react";
import { performanceService } from "../services/performanceService";
import { performanceConfigService } from "../services/performanceConfigService";
import {
  PerformanceMetrics,
  PerformanceStatus,
  PerformanceConfig,
} from "../types/performance";

export const usePerformance = () => {
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [performanceStatus, setPerformanceStatus] =
    useState<PerformanceStatus>("inactive");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceConfig, setPerformanceConfig] = useState(
    performanceConfigService.getConfig(),
  );

  useEffect(() => {
    const updateMetrics = () => {
      setPerformanceMetrics(performanceService.getPerformanceMetrics());
      setPerformanceStatus(performanceService.getPerformanceStatus());
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = performanceConfigService.subscribe((config) => {
      setPerformanceConfig(config);
    });

    return () => unsubscribe();
  }, []);

  const startMonitoring = () => {
    performanceService.startMonitoring();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    performanceService.stopMonitoring();
    setIsMonitoring(false);
  };

  const updatePerformanceConfig = (config: Partial<PerformanceConfig>) => {
    performanceConfigService.updateConfig(config);
  };

  const resetToDefaults = () => {
    performanceConfigService.resetConfig();
  };

  return {
    performanceMetrics,
    performanceStatus,
    isMonitoring,
    performanceConfig,
    startMonitoring,
    stopMonitoring,
    updatePerformanceConfig,
    resetToDefaults,
  };
};
