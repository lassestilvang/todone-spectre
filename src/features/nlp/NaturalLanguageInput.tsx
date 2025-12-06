// @ts-nocheck
import React, { useState, useCallback } from "react";
import { useNlpParser } from "../../hooks/useNlpParser";
import { Button, Input, Box, Text } from "@chakra-ui/react";

interface NaturalLanguageInputProps {
  onParseComplete: (parsedData: any) => void;
  placeholder?: string;
  inputValue?: string;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onParseComplete,
  placeholder = "Type your task in natural language...",
  inputValue = "",
}) => {
  const [inputText, setInputText] = useState(inputValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { parseNaturalLanguage } = useNlpParser();

  const handleParse = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to parse");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await parseNaturalLanguage(inputText);
      onParseComplete(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse natural language",
      );
      console.error("Natural language parsing error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, parseNaturalLanguage, onParseComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <Box mb={4}>
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        isDisabled={isLoading}
        size="md"
        mb={2}
      />
      <Button
        onClick={handleParse}
        isLoading={isLoading}
        loadingText="Parsing..."
        colorScheme="blue"
        size="sm"
        mr={2}
      >
        Parse
      </Button>
      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
};
