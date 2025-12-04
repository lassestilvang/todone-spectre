import { useContext } from "react";
import { useKeyboardContext } from "../features/keyboard/KeyboardProvider";

export const useKeyboardShortcuts = () => {
  const context = useKeyboardContext();

  return {
    ...context,
    // Add any additional hook-specific logic here
  };
};
