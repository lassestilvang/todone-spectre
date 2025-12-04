import React from 'react';
import { Box, Text, VStack, HStack, Badge, Divider, useColorModeValue } from '@chakra-ui/react';

interface PreviewData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence?: number;
}

interface NaturalLanguagePreviewProps {
  previewData: PreviewData;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NaturalLanguagePreview: React.FC<NaturalLanguagePreviewProps> = ({
  previewData,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">Task Preview</Text>

        <Divider />

        <HStack justifyContent="space-between">
          <Text fontSize="sm" fontWeight="medium">Original Text:</Text>
          <Text fontSize="sm" fontStyle="italic">{previewData.rawText}</Text>
        </HStack>

        <Divider />

        <VStack align="stretch" spacing={3}>
          {previewData.title && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">Title:</Text>
              <Text fontSize="sm">{previewData.title}</Text>
            </HStack>
          )}

          {previewData.description && (
            <HStack align="start">
              <Text fontSize="sm" fontWeight="medium">Description:</Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">{previewData.description}</Text>
            </HStack>
          )}

          {previewData.dueDate && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">Due Date:</Text>
              <Text fontSize="sm">{previewData.dueDate}</Text>
            </HStack>
          )}

          {previewData.priority && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">Priority:</Text>
              <Badge colorScheme={
                previewData.priority.toLowerCase() === 'high' ? 'red' :
                previewData.priority.toLowerCase() === 'medium' ? 'yellow' : 'green'
              }>
                {previewData.priority}
              </Badge>
            </HStack>
          )}

          {previewData.labels && previewData.labels.length > 0 && (
            <HStack align="start">
              <Text fontSize="sm" fontWeight="medium">Labels:</Text>
              <HStack wrap="wrap">
                {previewData.labels.map((label, index) => (
                  <Badge key={index} colorScheme="blue" mr={1} mb={1}>
                    {label}
                  </Badge>
                ))}
              </HStack>
            </HStack>
          )}

          {previewData.project && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">Project:</Text>
              <Text fontSize="sm">{previewData.project}</Text>
            </HStack>
          )}
        </VStack>

        <Divider />

        <HStack justifyContent="flex-end" spacing={3}>
          <Badge colorScheme="green" fontSize="xs">
            Confidence: {(previewData.confidence || 0).toFixed(1)}%
          </Badge>
          <Box flexGrow={1} />
          <HStack spacing={2}>
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              size="sm"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Confirm
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

// Add Button import
import { Button } from '@chakra-ui/react';