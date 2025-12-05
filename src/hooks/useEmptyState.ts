import { useState, useEffect } from "react";
import { emptyStateService } from "../services/emptyStateService";
import { EmptyStateConfig } from "../types/emptyStateTypes";

export const useEmptyState = (emptyStateKey: string) => {
  const [emptyStateConfig, setEmptyStateConfig] = useState<EmptyStateConfig>(
    emptyStateService.getEmptyStateConfig(emptyStateKey),
  );
  const [isVisible, setIsVisible] = useState<boolean>(
    emptyStateService.shouldShowEmptyState(emptyStateKey),
  );

  // Update config when key changes
  useEffect(() => {
    setEmptyStateConfig(emptyStateService.getEmptyStateConfig(emptyStateKey));
    setIsVisible(emptyStateService.shouldShowEmptyState(emptyStateKey));
  }, [emptyStateKey]);

  const updateEmptyState = (config: Partial<EmptyStateConfig>) => {
    emptyStateService.updateEmptyStateConfig(emptyStateKey, config);
    setEmptyStateConfig(emptyStateService.getEmptyStateConfig(emptyStateKey));
  };

  const setVisibility = (show: boolean) => {
    emptyStateService.setEmptyStateVisibility(emptyStateKey, show);
    setIsVisible(show);
  };

  const registerEmptyState = (config: EmptyStateConfig) => {
    emptyStateService.registerEmptyState(emptyStateKey, config);
    setEmptyStateConfig(config);
    setIsVisible(config.show);
  };

  return {
    emptyStateConfig,
    isVisible,
    updateEmptyState,
    setVisibility,
    registerEmptyState,
    emptyStateService,
  };
};
