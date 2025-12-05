import React, { useState, useEffect } from "react";
import { Template, TemplateCategory } from "../../types/template";
import { useTemplates } from "../../hooks/useTemplates";
import { useTemplateCategories } from "../../hooks/useTemplateCategories";
import { TemplateList, TemplateForm, TemplatePreview } from "./";
import {
  Plus,
  Search,
  Template as TemplateIcon,
  Folder,
  Star,
  Tag,
} from "lucide-react";

interface TemplateFeatureImplementationProps {
  showCategories?: boolean;
  showPublicOnly?: boolean;
  onTemplateSelected?: (template: Template) => void;
  onTemplateApplied?: (content: string) => void;
}

const TemplateFeatureImplementation: React.FC<
  TemplateFeatureImplementationProps
> = ({
  showCategories = true,
  showPublicOnly = false,
  onTemplateSelected,
  onTemplateApplied,
}) => {
  const {
    templates,
    categories,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    previewTemplate,
  } = useTemplates();

  const {
    categories: templateCategories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useTemplateCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(
    "all",
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplateData, setPreviewTemplateData] =
    useState<Template | null>(null);
  const [previewVariables, setPreviewVariables] = useState<
    Record<string, string>
  >({});
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || template.categoryId === selectedCategory;

    const matchesPublic = !showPublicOnly || template.isPublic;

    return matchesSearch && matchesCategory && matchesPublic;
  });

  const handleTemplateClick = (template: Template) => {
    if (onTemplateSelected) {
      onTemplateSelected(template);
    }
    setPreviewTemplateData(template);
    setPreviewVariables(template.variables || {});
    setShowPreview(true);
  };

  const handleApplyTemplate = async (content: string) => {
    if (onTemplateApplied) {
      onTemplateApplied(content);
    }
    setShowPreview(false);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleSaveTemplate = async (
    templateData: Omit<Template, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowCreateForm(false);
      await fetchTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(templateId);
        await fetchTemplates();
      } catch (error) {
        console.error("Failed to delete template:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TemplateIcon className="w-6 h-6 mr-2 text-blue-600" />
          Template Management
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Template
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, description, or tags..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {showCategories && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
          >
            <option value="all">All Categories</option>
            {templateCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Template Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <TemplateIcon className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-800">
                {templates.length}
              </div>
              <div className="text-sm text-blue-600">Total Templates</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Folder className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-800">
                {templateCategories.length}
              </div>
              <div className="text-sm text-green-600">Categories</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-yellow-800">
                {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
              </div>
              <div className="text-sm text-yellow-600">Total Uses</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Tag className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-purple-800">
                {templates.reduce((sum, t) => sum + (t.tags?.length || 0), 0)}
              </div>
              <div className="text-sm text-purple-600">Total Tags</div>
            </div>
          </div>
        </div>
      </div>

      {/* Template List */}
      {isLoading || categoriesLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading templates: {error}
        </div>
      ) : categoriesError ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading categories: {categoriesError}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <TemplateIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-sm mb-4">
            Try adjusting your search or create a new template
          </p>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Template
          </button>
        </div>
      ) : (
        <TemplateList
          showCategories={showCategories}
          onTemplateClick={handleTemplateClick}
        />
      )}

      {/* Create/Edit Template Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <TemplateForm
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplateData && (
        <TemplatePreview
          template={previewTemplateData}
          onClose={() => setShowPreview(false)}
          onApply={handleApplyTemplate}
        />
      )}
    </div>
  );
};

export default TemplateFeatureImplementation;
