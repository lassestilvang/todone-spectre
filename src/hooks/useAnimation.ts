// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { animationService } from "../services/animationService";
import { animationUtils } from "../utils/animationUtils";

export const useAnimation = () => {
  const [animationState, setAnimationState] = useState(
    animationService.getState(),
  );

  const triggerAnimation = useCallback((animationName: string) => {
    animationService.startAnimation(animationName);
  }, []);

  const stopAnimation = useCallback(() => {
    animationService.stopAnimation();
  }, []);

  const resumeAnimation = useCallback(() => {
    animationService.resumeAnimation();
  }, []);

  const setAnimationConfig = useCallback((config: any) => {
    animationService.setConfig(config);
  }, []);

  const getAnimationConfig = useCallback((animationName: string) => {
    return animationUtils.getAnimationConfig(animationName);
  }, []);

  useEffect(() => {
    const unsubscribe = animationService.subscribe(setAnimationState);
    return () => unsubscribe();
  }, []);

  return {
    animationState,
    triggerAnimation,
    stopAnimation,
    resumeAnimation,
    setAnimationConfig,
    getAnimationConfig,
  };
};
