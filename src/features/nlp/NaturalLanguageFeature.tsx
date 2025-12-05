import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Divider,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { NaturalLanguageInput } from "./NaturalLanguageInput";
import { NaturalLanguageParser } from "./NaturalLanguageParser";
import { NaturalLanguagePreview } from "./NaturalLanguagePreview";
import { NaturalLanguageDemo } from "./NaturalLanguageDemo";
import { useNlpState } from "./NaturalLanguageState";

interface NaturalLanguageFeatureProps {
  onTaskCreated?: (taskData: any) => void;
  defaultProject?: string;
  showDemo?: boolean;
}

export const NaturalLanguageFeature: React.FC<NaturalLanguageFeatureProps> = ({
  onTaskCreated,
  defaultProject,
  showDemo = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const bgColor = useColorModeValue("white", "gray.800");

  const { inputText, parsedResult, isLoading, error, setInputText, parseText } =
    useNlpState();

  const handleParseComplete = (result: any) => {
    setShowPreview(true);
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onTaskCreated?.({
        title: parsedResult.title || "Untitled Task",
        description: parsedResult.description || "",
        dueDate: parsedResult.dueDate,
        priority: parsedResult.priority || "medium",
        labels: parsedResult.labels || [],
        project: parsedResult.project || defaultProject,
        status: "pending",
      });
      setShowPreview(false);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
  };

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" boxShadow="sm">
      <VStack align="stretch" spacing={6}>
        <Heading size="md">Natural Language Task Creation</Heading>

        <Text fontSize="sm" color="gray.600">
          Enter your task in natural language and let the system parse it
          automatically.
        </Text>

        <NaturalLanguageInput
          onParseComplete={handleParseComplete}
          placeholder="Type your task in natural language..."
          inputValue={inputText}
        />

        <Divider />

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Parsing Results:
          </Text>
          <NaturalLanguageParser
            text={inputText}
            onParseComplete={handleParseComplete}
          />
        </Box>

        {showPreview && parsedResult && (
          <NaturalLanguagePreview
            previewData={parsedResult}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {showDemo && (
          <>
            <Divider />
            <NaturalLanguageDemo />
          </>
        )}
      </VStack>
    </Box>
  );
};
