import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  TemplateProvider,
  useTemplateContext,
} from "../../context/TemplateContext";
import { Template, TemplateCategory } from "../../types/template";

describe("TemplateContext", () => {
  const mockTemplate: Template = {
    id: "template-1",
    name: "Test Template",
    description: "Test Description",
    content: "Test Content",
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    rating: 0,
    isPublic: false,
  };

  const mockCategory: TemplateCategory = {
    id: "category-1",
    name: "Test Category",
    description: "Test Category Description",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("TemplateProvider", () => {
    it("should provide template context to children", () => {
      render(
        <TemplateProvider>
          <div>Test Content</div>
        </TemplateProvider>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should initialize with default values", () => {
      const TestComponent = () => {
        const context = useTemplateContext();
        return (
          <div>
            {context.selectedTemplate ? "Has template" : "No template"}
            {context.isTemplateModalOpen ? "Modal open" : "Modal closed"}
          </div>
        );
      };

      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      expect(screen.getByText("No template")).toBeInTheDocument();
      expect(screen.getByText("Modal closed")).toBeInTheDocument();
    });
  });

  describe("useTemplateContext", () => {
    it("should throw error when used outside TemplateProvider", () => {
      const TestComponent = () => {
        useTemplateContext();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useTemplateContext must be used within a TemplateProvider");
    });
  });

  describe("Context Functions", () => {
    const TestComponent = () => {
      const context = useTemplateContext();
      return (
        <div>
          <button onClick={() => context.setSelectedTemplate(mockTemplate)}>
            Set Template
          </button>
          <button onClick={() => context.setSelectedCategory(mockCategory)}>
            Set Category
          </button>
          <button onClick={() => context.setIsTemplateModalOpen(true)}>
            Open Modal
          </button>
        </div>
      );
    };

    it("should allow setting selected template", () => {
      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const setTemplateButton = screen.getByText("Set Template");
      act(() => {
        setTemplateButton.click();
      });

      // Verify template was set by checking if we can access it
      const context = useTemplateContext();
      expect(context.selectedTemplate).toBe(mockTemplate);
    });

    it("should allow setting selected category", () => {
      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const setCategoryButton = screen.getByText("Set Category");
      act(() => {
        setCategoryButton.click();
      });

      // Verify category was set
      const context = useTemplateContext();
      expect(context.selectedCategory).toBe(mockCategory);
    });

    it("should allow opening template modal", () => {
      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const openModalButton = screen.getByText("Open Modal");
      act(() => {
        openModalButton.click();
      });

      // Verify modal state was updated
      const context = useTemplateContext();
      expect(context.isTemplateModalOpen).toBe(true);
    });
  });

  describe("Template Functions", () => {
    it("should apply template with variables", async () => {
      const TestComponent = () => {
        const context = useTemplateContext();
        return (
          <button
            onClick={() =>
              context.applyTemplate("template-1", { var1: "value1" })
            }
          >
            Apply Template
          </button>
        );
      };

      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const applyButton = screen.getByText("Apply Template");
      let result: string | undefined;

      act(async () => {
        result = await context.applyTemplate("template-1", { var1: "value1" });
      });

      expect(result).toBe("Applied template template-1 content");
    });

    it("should create template from task content", async () => {
      const TestComponent = () => {
        const context = useTemplateContext();
        return (
          <button
            onClick={() => context.createTemplateFromTask("Test task content")}
          >
            Create Template
          </button>
        );
      };

      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const createButton = screen.getByText("Create Template");
      let result: Template | undefined;

      act(async () => {
        result = await context.createTemplateFromTask("Test task content");
      });

      expect(result).toBeDefined();
      expect(result?.content).toBe("Test task content");
      expect(result?.name).toContain("Template from Task");
    });
  });

  describe("State Management", () => {
    it("should manage preview state correctly", () => {
      const TestComponent = () => {
        const context = useTemplateContext();
        return (
          <div>
            <button onClick={() => context.setPreviewTemplate(mockTemplate)}>
              Set Preview
            </button>
            <button
              onClick={() => context.setPreviewVariables({ var1: "value1" })}
            >
              Set Variables
            </button>
            <button onClick={() => context.setIsPreviewModalOpen(true)}>
              Open Preview
            </button>
          </div>
        );
      };

      render(
        <TemplateProvider>
          <TestComponent />
        </TemplateProvider>,
      );

      const context = useTemplateContext();

      // Test preview template
      act(() => {
        context.setPreviewTemplate(mockTemplate);
      });
      expect(context.previewTemplate).toBe(mockTemplate);

      // Test preview variables
      act(() => {
        context.setPreviewVariables({ var1: "value1" });
      });
      expect(context.previewVariables).toEqual({ var1: "value1" });

      // Test preview modal
      act(() => {
        context.setIsPreviewModalOpen(true);
      });
      expect(context.isPreviewModalOpen).toBe(true);
    });
  });
});
