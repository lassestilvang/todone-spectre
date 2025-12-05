import { useState, useCallback } from "react";
import { nlpService } from "../services/nlpService";

interface ParseResult {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence?: number;
}

interface UseNaturalLanguageOptions {
  debug?: boolean;
  onParseComplete?: (result: ParseResult) => void;
  onError?: (error: Error) => void;
}

export const useNaturalLanguage = (options: UseNaturalLanguageOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);

  const parseNaturalLanguage = useCallback(
    async (text: string) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!text?.trim()) {
          throw new Error("Empty text provided for natural language parsing");
        }

        const result = await nlpService.parseNaturalLanguage(text);
        setLastResult(result);

        if (options.debug) {
          console.log("Natural Language Parsing Result:", result);
        }

        options.onParseComplete?.(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown parsing error");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResult(null);
  }, []);

  return {
    parseNaturalLanguage,
    isLoading,
    error,
    lastResult,
    clearError,
    reset,
  };
};
