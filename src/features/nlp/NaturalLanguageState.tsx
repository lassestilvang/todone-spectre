// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useNlpParser } from "../../hooks/useNlpParser";

interface NlpState {
  inputText: string;
  parsedResult: any;
  isLoading: boolean;
  error: Error | null;
  parseHistory: any[];
}

interface NlpStateContextType extends NlpState {
  setInputText: (text: string) => void;
  parseText: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  clearHistory: () => void;
}

const NlpStateContext = createContext<NlpStateContextType | undefined>(
  undefined,
);

interface NlpStateProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export const NlpStateProvider: React.FC<NlpStateProviderProps> = ({
  children,
  debug = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [parseHistory, setParseHistory] = useState<any[]>([]);

  const { parse: parseNlp } = useNlpParser({ debug });

  const parseText = useCallback(async () => {
    try {
      if (!inputText.trim()) {
        throw new Error("Empty input text");
      }

      setIsLoading(true);
      setError(null);

      const result = await parseNlp(inputText);
      setParsedResult(result);
      setParseHistory((prev) => [...prev, result]);

      if (debug) {
        console.log("NLP State - Parse result:", result);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown parsing error");
      setError(error);
      console.error("NLP State - Parse error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, parseNlp, debug]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setInputText("");
    setParsedResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setParseHistory([]);
  }, []);

  const value = {
    inputText,
    parsedResult,
    isLoading,
    error,
    parseHistory,
    setInputText,
    parseText,
    clearError,
    resetState,
    clearHistory,
  };

  return (
    <NlpStateContext.Provider value={value}>
      {children}
    </NlpStateContext.Provider>
  );
};

export const useNlpState = () => {
  const context = useContext(NlpStateContext);
  if (context === undefined) {
    throw new Error("useNlpState must be used within a NlpStateProvider");
  }
  return context;
};
