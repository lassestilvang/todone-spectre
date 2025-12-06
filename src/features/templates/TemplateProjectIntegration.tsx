import React, { useState } from "react";
import { Template } from "../../types/template";
import { useTemplates } from "../../hooks/useTemplates";
import { TemplateList, TemplatePreview } from "./";
import { Plus, Search, Template as TemplateIcon, Folder } from "lucide-react";

interface TemplateProjectIntegrationProps {
  onTemplateSelected: (template: Template) => void;
  onTemplateApplied: (content: string) => void;
}

const TemplateProjectIntegration: React.FC<TemplateProjectIntegrationProps> = ({
  onTemplateSelected,
  onTemplateApplied,
}) => {
  const { templates, categories, isLoading, error } = useTemplates();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(
    "all",
  );
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<
    Record<string, string>
  >({});

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || template.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVariables(template.variables || {});
    setShowPreview(true);
    onTemplateSelected(template);
  };

  const handleApplyTemplate = (content: string) => {
    onTemplateApplied(content);
    setShowPreview(false);
  };

  return (
    <div className="space-y-4">
      {/* Project Template Integration Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Folder className="w-5 h-5 mr-2 text-green-600" />
          Project Templates
        </h3>

        <button
          onClick={() => setShowTemplateList(!showTemplateList)}
          className="flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showTemplateList ? "Hide Templates" : "Browse Templates"}
        </button>
      </div>

      {/* Template Search and Controls */}
      {showTemplateList && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project templates..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Error loading templates: {error}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No project templates found. Try adjusting your search or create a
              new template.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {template.name}
                      </h4>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {template.description}
                        </p>
                      )}
                    </div>
                    {template.isPublic && (
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full ml-2">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onApply={handleApplyTemplate}
        />
      )}
    </div>
  );
};

export { TemplateProjectIntegration };
export default TemplateProjectIntegration;
