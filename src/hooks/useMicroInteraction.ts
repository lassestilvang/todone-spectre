// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { microInteractionService } from "../services/microInteractionService";
import { microInteractionUtils } from "../utils/microInteractionUtils";

export const useMicroInteraction = () => {
  const [microInteractionState, setMicroInteractionState] = useState(
    microInteractionService.getState(),
  );

  const triggerMicroInteraction = useCallback((type: string) => {
    microInteractionService.triggerInteraction(type);
  }, []);

  const enableMicroInteractions = useCallback((enabled: boolean) => {
    microInteractionService.enableInteractions(enabled);
  }, []);

  const setMicroInteractionConfig = useCallback((config: any) => {
    microInteractionService.setConfig(config);
  }, []);

  const getMicroInteractionConfig = useCallback((type: string) => {
    return microInteractionUtils.getInteractionConfig(type);
  }, []);

  useEffect(() => {
    const unsubscribe = microInteractionService.subscribe(
      setMicroInteractionState,
    );
    return () => unsubscribe();
  }, []);

  return {
    microInteractionState,
    triggerMicroInteraction,
    enableMicroInteractions,
    setMicroInteractionConfig,
    getMicroInteractionConfig,
  };
};
