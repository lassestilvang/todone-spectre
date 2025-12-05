import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNlpParser } from "../../hooks/useNlpParser";

interface ParsedResult {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence?: number;
}

interface NaturalLanguageParserProps {
  text: string;
  onParseComplete?: (result: ParsedResult) => void;
}

export const NaturalLanguageParser: React.FC<NaturalLanguageParserProps> = ({
  text,
  onParseComplete,
}) => {
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { parseNaturalLanguage } = useNlpParser();
  const bgColor = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    const parseText = async () => {
      if (!text.trim()) {
        setParsedResult(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await parseNaturalLanguage(text);
        setParsedResult(result);
        onParseComplete?.(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse text");
        console.error("Parsing error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    parseText();
  }, [text, parseNaturalLanguage, onParseComplete]);

  if (isLoading) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md">
        <Text fontSize="sm" color="gray.500">
          Parsing natural language...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md">
        <Text fontSize="sm" color="red.500">
          Error: {error}
        </Text>
      </Box>
    );
  }

  if (!parsedResult) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md">
        <Text fontSize="sm" color="gray.500">
          Enter text to see parsed results
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justifyContent="space-between">
          <Text fontSize="sm" fontWeight="bold">
            Parsed Results
          </Text>
          <Badge colorScheme="green" fontSize="xs">
            Confidence: {(parsedResult.confidence || 0).toFixed(1)}%
          </Badge>
        </HStack>

        <Divider />

        {parsedResult.title && (
          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Title:
            </Text>
            <Text fontSize="sm">{parsedResult.title}</Text>
          </HStack>
        )}

        {parsedResult.description && (
          <HStack align="start">
            <Text fontSize="sm" fontWeight="medium">
              Description:
            </Text>
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {parsedResult.description}
            </Text>
          </HStack>
        )}

        {parsedResult.dueDate && (
          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Due Date:
            </Text>
            <Text fontSize="sm">{parsedResult.dueDate}</Text>
          </HStack>
        )}

        {parsedResult.priority && (
          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Priority:
            </Text>
            <Badge
              colorScheme={
                parsedResult.priority.toLowerCase() === "high"
                  ? "red"
                parsedResult.priority.toLowerCase() === 'medium' ? 'yellow' : 'green'
              }
            >
              {parsedResult.priority}
            </Badge>
          </HStack>
        )}

        {parsedResult.labels && parsedResult.labels.length > 0 && (
          <HStack align="start">
            <Text fontSize="sm" fontWeight="medium">
              Labels:
            </Text>
            <HStack wrap="wrap">
              {parsedResult.labels.map((label, index) => (
                <Badge key={index} colorScheme="blue" mr={1} mb={1}>
                  {label}
                </Badge>
              ))}
            </HStack>
          </HStack>
        )}

        {parsedResult.project && (
          <HStack>
            <Text fontSize="sm" fontWeight="medium">
              Project:
            </Text>
            <Text fontSize="sm">{parsedResult.project}</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};
