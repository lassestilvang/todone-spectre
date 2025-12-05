import React, { createContext, useContext, useState, ReactNode } from "react";
import { Template, TemplateCategory } from "../types/template";

interface TemplateContextType {
  selectedTemplate: Template | null;
  selectedCategory: TemplateCategory | null;
  isTemplateModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isPreviewModalOpen: boolean;
  previewTemplate: Template | null;
  previewVariables: Record<string, string>;
  setSelectedTemplate: (template: Template | null) => void;
  setSelectedCategory: (category: TemplateCategory | null) => void;
  setIsTemplateModalOpen: (isOpen: boolean) => void;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  setPreviewTemplate: (template: Template | null) => void;
  setPreviewVariables: (variables: Record<string, string>) => void;
  applyTemplate: (
    templateId: string,
    variables?: Record<string, string>,
  ) => Promise<string>;
  createTemplateFromTask: (taskContent: string) => Promise<Template>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined,
);

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewVariables, setPreviewVariables] = useState<
    Record<string, string>
  >({});

  const applyTemplate = async (
    templateId: string,
    variables?: Record<string, string>,
  ): Promise<string> => {
    // This would call the template service in a real implementation
    console.log(`Applying template ${templateId} with variables`, variables);
    return `Applied template ${templateId} content`;
  };

  const createTemplateFromTask = async (
    taskContent: string,
  ): Promise<Template> => {
    // This would create a template from task content in a real implementation
    console.log(`Creating template from task content: ${taskContent}`);
    return {
      id: `template-${Date.now()}`,
      name: `Template from Task ${Date.now()}`,
      description: "Template created from task content",
      content: taskContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 0,
      isPublic: false,
    };
  };

  return (
    <TemplateContext.Provider
      value={{
        selectedTemplate,
        selectedCategory,
        isTemplateModalOpen,
        isCategoryModalOpen,
        isPreviewModalOpen,
        previewTemplate,
        previewVariables,
        setSelectedTemplate,
        setSelectedCategory,
        setIsTemplateModalOpen,
        setIsCategoryModalOpen,
        setIsPreviewModalOpen,
        setPreviewTemplate,
        setPreviewVariables,
        applyTemplate,
        createTemplateFromTask,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error(
      "useTemplateContext must be used within a TemplateProvider",
    );
  }
  return context;
};
