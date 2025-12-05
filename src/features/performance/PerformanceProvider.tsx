import React, { createContext, useContext, useState, useEffect } from "react";
import { performanceService } from "../../services/performanceService";
import { performanceConfigService } from "../../services/performanceConfigService";
import {
  PerformanceMetrics,
  PerformanceStatus,
  PerformanceConfig,
} from "../../types/performance";

interface PerformanceContextType {
  metrics: PerformanceMetrics | null;
  status: PerformanceStatus;
  config: PerformanceConfig;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  updateConfig: (config: Partial<PerformanceConfig>) => void;
  resetConfig: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined,
);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [status, setStatus] = useState<PerformanceStatus>("inactive");
  const [config, setConfig] = useState<PerformanceConfig>(
    performanceConfigService.getConfig(),
  );
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceService.getPerformanceMetrics());
      setStatus(performanceService.getPerformanceStatus());
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = performanceConfigService.subscribe((newConfig) => {
      setConfig(newConfig);
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

  const updateConfig = (newConfig: Partial<PerformanceConfig>) => {
    performanceConfigService.updateConfig(newConfig);
  };

  const resetConfig = () => {
    performanceConfigService.resetConfig();
  };

  return (
    <PerformanceContext.Provider
      value={{
        metrics,
        status,
        config,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        updateConfig,
        resetConfig,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error(
      "usePerformanceContext must be used within a PerformanceProvider",
    );
  }
  return context;
};
