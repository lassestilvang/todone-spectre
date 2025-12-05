import { useState, useCallback, useMemo } from "react";
import { nlpParserService } from "../services/nlpParserService";

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

interface UseNlpParserOptions {
  debug?: boolean;
  strictMode?: boolean;
  fallbackToBasic?: boolean;
  defaultContext?: any;
}

export const useNlpParser = (options: UseNlpParserOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);
  const [parseHistory, setParseHistory] = useState<ParseResult[]>([]);

  // Create parser service instance with options
  const parserService = useMemo(() => {
    return new nlpParserService.constructor({
      debug: options.debug,
      strictMode: options.strictMode,
      fallbackToBasic: options.fallbackToBasic,
    });
  }, [options.debug, options.strictMode, options.fallbackToBasic]);

  const parse = useCallback(
    async (text: string) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!text?.trim()) {
          throw new Error("Empty text provided for NLP parsing");
        }

        const result = await parserService.parse(text);
        setLastResult(result);
        setParseHistory((prev) => [...prev, result]);

        if (options.debug) {
          console.log("NLP Parser Result:", result);
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown parsing error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [parserService, options.debug],
  );

  const parseWithContext = useCallback(
    async (text: string, context: any = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!text?.trim()) {
          throw new Error("Empty text provided for NLP parsing with context");
        }

        const mergedContext = {
          ...options.defaultContext,
          ...context,
        };

        const result = await parserService.parseWithContext(
          text,
          mergedContext,
        );
        setLastResult(result);
        setParseHistory((prev) => [...prev, result]);

        if (options.debug) {
          console.log("NLP Parser Result with Context:", result);
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown parsing error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [parserService, options.debug, options.defaultContext],
  );

  const parseBatch = useCallback(
    async (texts: string[]) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!texts || texts.length === 0) {
          throw new Error("Empty batch provided for NLP parsing");
        }

        const results = await parserService.parseBatch(texts);
        setParseHistory((prev) => [...prev, ...results]);

        if (options.debug) {
          console.log("NLP Parser Batch Results:", results);
        }

        return results;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Unknown batch parsing error");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [parserService, options.debug],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResult(null);
    setParseHistory([]);
  }, []);

  const clearHistory = useCallback(() => {
    setParseHistory([]);
  }, []);

  return {
    parse,
    parseWithContext,
    parseBatch,
    isLoading,
    error,
    lastResult,
    parseHistory,
    clearError,
    reset,
    clearHistory,
  };
};
