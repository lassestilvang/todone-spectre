/**
 * Template component tests for Todone application
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplateList, TemplateItem, TemplateForm, TemplatePreview } from "../";
import {
  generateMockTemplate,
  generateMockTemplateCategory,
  createMockTemplateService,
} from "./templateTestUtils";
import { TemplateProvider } from "../../../context/TemplateContext";
import { useTemplates } from "../../../hooks/useTemplates";
import { useTemplateCategories } from "../../../hooks/useTemplateCategories";

// Mock the hooks
jest.mock("../../../hooks/useTemplates");
jest.mock("../../../hooks/useTemplateCategories");

describe("TemplateList Component", () => {
  const mockTemplates = [
    generateMockTemplate({ name: "Template 1", categoryId: "category-1" }),
    generateMockTemplate({ name: "Template 2", categoryId: "category-2" }),
  ];

  const mockCategories = [
    generateMockTemplateCategory({ id: "category-1", name: "Category 1" }),
    generateMockTemplateCategory({ id: "category-2", name: "Category 2" }),
  ];

  beforeEach(() => {
    (useTemplates as jest.Mock).mockReturnValue({
      templates: mockTemplates,
      categories: mockCategories,
      getProcessedTemplates: () => mockTemplates,
      isLoading: false,
      error: null,
      fetchTemplates: jest.fn(),
    });

    (useTemplateCategories as jest.Mock).mockReturnValue({
      categories: mockCategories,
      isLoading: false,
      error: null,
    });
  });

  it("renders template list with templates", () => {
    render(
      <TemplateProvider>
        <TemplateList />
      </TemplateProvider>,
    );

    expect(screen.getByText("Template 1")).toBeInTheDocument();
    expect(screen.getByText("Template 2")).toBeInTheDocument();
  });

  it("shows loading state when loading", () => {
    (useTemplates as jest.Mock).mockReturnValue({
      ...useTemplates(),
      isLoading: true,
    });

    render(
      <TemplateProvider>
        <TemplateList />
      </TemplateProvider>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows error message when there is an error", () => {
    (useTemplates as jest.Mock).mockReturnValue({
      ...useTemplates(),
      error: "Failed to load templates",
    });

    render(
      <TemplateProvider>
        <TemplateList />
      </TemplateProvider>,
    );

    expect(
      screen.getByText("Error loading templates: Failed to load templates"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no templates", () => {
    (useTemplates as jest.Mock).mockReturnValue({
      ...useTemplates(),
      templates: [],
      getProcessedTemplates: () => [],
    });

    render(
      <TemplateProvider>
        <TemplateList />
      </TemplateProvider>,
    );

    expect(
      screen.getByText(
        "No templates found. Create a new template to get started!",
      ),
    ).toBeInTheDocument();
  });
});

describe("TemplateItem Component", () => {
  const mockTemplate = generateMockTemplate({
    name: "Test Template",
    description: "Test description",
    tags: ["test", "example"],
    usageCount: 5,
    rating: 4,
    isPublic: true,
  });

  const mockCategory = generateMockTemplateCategory({
    id: "category-1",
    name: "Test Category",
    color: "#3B82F6",
  });

  beforeEach(() => {
    (useTemplateCategories as jest.Mock).mockReturnValue({
      categories: [mockCategory],
      isLoading: false,
      error: null,
    });
  });

  it("renders template item with all details", () => {
    render(
      <TemplateProvider>
        <TemplateItem template={mockTemplate} />
      </TemplateProvider>,
    );

    expect(screen.getByText("Test Template")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getByText("2 tags")).toBeInTheDocument();
    expect(screen.getByText("5 uses")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();

    render(
      <TemplateProvider>
        <TemplateItem template={mockTemplate} onClick={handleClick} />
      </TemplateProvider>,
    );

    fireEvent.click(screen.getByText("Test Template"));
    expect(handleClick).toHaveBeenCalledWith(mockTemplate);
  });
});

describe("TemplateForm Component", () => {
  const mockTemplate = generateMockTemplate({
    name: "Existing Template",
    description: "Existing description",
    content: "Existing content with {{variable}}",
    categoryId: "category-1",
    tags: ["existing"],
    isPublic: true,
    variables: { variable: "value" },
  });

  const mockCategories = [
    generateMockTemplateCategory({ id: "category-1", name: "Category 1" }),
    generateMockTemplateCategory({ id: "category-2", name: "Category 2" }),
  ];

  const mockCreateTemplate = jest.fn();
  const mockUpdateTemplate = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    (useTemplates as jest.Mock).mockReturnValue({
      createTemplate: mockCreateTemplate,
      updateTemplate: mockUpdateTemplate,
      isLoading: false,
      error: null,
    });

    (useTemplateCategories as jest.Mock).mockReturnValue({
      categories: mockCategories,
      isLoading: false,
      error: null,
    });
  });

  it("renders create form with empty fields", () => {
    render(
      <TemplateProvider>
        <TemplateForm onSave={mockOnSave} onCancel={() => {}} />
      </TemplateProvider>,
    );

    expect(screen.getByLabelText("Template Name")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Template Content")).toHaveValue("");
  });

  it("renders edit form with template data", () => {
    render(
      <TemplateProvider>
        <TemplateForm
          template={mockTemplate}
          onSave={mockOnSave}
          onCancel={() => {}}
        />
      </TemplateProvider>,
    );

    expect(screen.getByLabelText("Template Name")).toHaveValue(
      "Existing Template",
    );
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Existing description",
    );
    expect(screen.getByLabelText("Template Content")).toHaveValue(
      "Existing content with {{variable}}",
    );
  });

  it("validates form and shows errors", async () => {
    render(
      <TemplateProvider>
        <TemplateForm onSave={mockOnSave} onCancel={() => {}} />
      </TemplateProvider>,
    );

    fireEvent.click(screen.getByText("Save Template"));

    await waitFor(() => {
      expect(screen.getByText("Template name is required")).toBeInTheDocument();
      expect(
        screen.getByText("Template content is required"),
      ).toBeInTheDocument();
    });
  });

  it("calls onSave when form is submitted with valid data", async () => {
    render(
      <TemplateProvider>
        <TemplateForm onSave={mockOnSave} onCancel={() => {}} />
      </TemplateProvider>,
    );

    fireEvent.change(screen.getByLabelText("Template Name"), {
      target: { value: "New Template" },
    });
    fireEvent.change(screen.getByLabelText("Template Content"), {
      target: { value: "New content" },
    });

    fireEvent.click(screen.getByText("Save Template"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});

describe("TemplatePreview Component", () => {
  const mockTemplate = generateMockTemplate({
    name: "Preview Template",
    content: "## Preview Content\n\nThis is a {{testVariable}} preview.",
    variables: { testVariable: "sample" },
  });

  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  it("renders template preview", () => {
    render(
      <TemplateProvider>
        <TemplatePreview
          template={mockTemplate}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </TemplateProvider>,
    );

    expect(screen.getByText("Preview: Preview Template")).toBeInTheDocument();
    expect(screen.getByText("Preview Content")).toBeInTheDocument();
    expect(screen.getByText("This is a sample preview.")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <TemplateProvider>
        <TemplatePreview
          template={mockTemplate}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </TemplateProvider>,
    );

    fireEvent.click(screen.getByTitle("Close preview"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onApply when apply button is clicked", () => {
    render(
      <TemplateProvider>
        <TemplatePreview
          template={mockTemplate}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </TemplateProvider>,
    );

    fireEvent.click(screen.getByText("Apply Template"));
    expect(mockOnApply).toHaveBeenCalled();
  });

  it("switches between preview and variables tabs", () => {
    render(
      <TemplateProvider>
        <TemplatePreview
          template={mockTemplate}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      </TemplateProvider>,
    );

    // Should start on preview tab
    expect(screen.getByText("Preview Content")).toBeVisible();

    // Switch to variables tab
    fireEvent.click(screen.getByText("Variables (1)"));
    expect(
      screen.getByText("Customize the template variables before applying:"),
    ).toBeVisible();
  });
});
