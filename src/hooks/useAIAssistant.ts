import { useState, useCallback } from "react";
import { aiService } from "../services/aiService";

interface AIAssistantState {
  aiResponse: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAIAssistant = (): AIAssistantState & {
  generateAIResponse: (prompt: string) => Promise<void>;
  clearResponse: () => void;
} => {
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIResponse = useCallback(async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setAIResponse(null);

      if (!prompt || prompt.trim() === "") {
        throw new Error("Prompt cannot be empty");
      }

      const response = await aiService.generateAIResponse(prompt);

      setAIResponse(response.response);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate AI response",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setAIResponse(null);
    setError(null);
  }, []);

  return {
    aiResponse,
    isLoading,
    error,
    generateAIResponse,
    clearResponse,
  };
};
