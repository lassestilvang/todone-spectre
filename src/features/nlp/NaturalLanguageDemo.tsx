import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Heading,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { NaturalLanguageInput } from "./NaturalLanguageInput";
import { NaturalLanguageParser } from "./NaturalLanguageParser";
import { NaturalLanguagePreview } from "./NaturalLanguagePreview";

const demoExamples = [
  "Create a high priority task to finish the project proposal by Friday with labels important and work",
  "Schedule a meeting with the team tomorrow at 2pm to discuss Q3 goals",
  "Add a low priority task to research new design trends for the marketing project",
  "Remind me to call mom on her birthday next week and buy a gift",
  "Set up a weekly review every Monday at 9am for project status updates",
];

export const NaturalLanguageDemo: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const bgColor = useColorModeValue("white", "gray.800");

  const handleParseComplete = (result: any) => {
    setParsedResult(result);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    console.log("Task confirmed:", parsedResult);
    // In a real app, this would create the task
    setShowPreview(false);
  };

  const handleCancel = () => {
    setShowPreview(false);
  };

  const handleExampleClick = (example: string) => {
    setInputText(example);
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="md">
      <VStack align="stretch" spacing={6}>
        <Heading size="md">Natural Language Parsing Demo</Heading>

        <Text fontSize="sm" color="gray.600">
          Try entering natural language text to see how the system parses task
          information. The parser extracts titles, descriptions, due dates,
          priorities, labels, and projects.
        </Text>

        <NaturalLanguageInput
          onParseComplete={handleParseComplete}
          placeholder="Type or paste natural language text..."
          inputValue={inputText}
        />

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Try these examples:
          </Text>
          <VStack align="stretch" spacing={2}>
            {demoExamples.map((example, index) => (
              <Box
                key={index}
                p={2}
                bg="gray.50"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleExampleClick(example)}
                fontSize="sm"
              >
                {example}
              </Box>
            ))}
          </VStack>
        </Box>

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
          />
        )}
      </VStack>
    </Box>
  );
};
