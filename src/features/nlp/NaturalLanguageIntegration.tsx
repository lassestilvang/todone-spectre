// @ts-nocheck
import React from "react";
import { useNlpParser } from "../../hooks/useNlpParser";
import { useTaskService } from "../../services/taskService";
import { Button, Box, Text, useToast } from "@chakra-ui/react";

interface NaturalLanguageIntegrationProps {
  onTaskCreated?: (task: any) => void;
  defaultProject?: string;
  debug?: boolean;
}

export const NaturalLanguageIntegration: React.FC<
  NaturalLanguageIntegrationProps
> = ({ onTaskCreated, defaultProject, debug = false }) => {
  const { parseWithContext } = useNlpParser({ debug });
  const { createTask } = useTaskService();
  const toast = useToast();

  const handleCreateTaskFromText = async (text: string) => {
    try {
      const parsedResult = await parseWithContext(text, {
        defaultProject,
      });

      if (!parsedResult.title) {
        throw new Error("No task title could be extracted");
      }

      const taskData = {
        title: parsedResult.title,
        description: parsedResult.description || "",
        dueDate: parsedResult.dueDate,
        priority: parsedResult.priority || "medium",
        labels: parsedResult.labels || [],
        project: parsedResult.project || defaultProject,
        status: "pending",
      };

      const createdTask = await createTask(taskData);

      if (debug) {
        console.log("Created task from NLP:", createdTask);
      }

      onTaskCreated?.(createdTask);

      toast({
        title: "Task created",
        description: `Successfully created task: ${createdTask.title}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return createdTask;
    } catch (error) {
      console.error("Failed to create task from NLP:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create task",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  return (
    <Box>
      <Text fontSize="sm" color="gray.600" mb={2}>
        Natural Language Integration
      </Text>
      <Button
        size="sm"
        colorScheme="blue"
        onClick={() =>
          handleCreateTaskFromText("Sample task created via NLP integration")
        }
      >
        Test Integration
      </Button>
    </Box>
  );
};
