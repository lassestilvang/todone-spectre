import React, { useMemo } from "react";
import { Template } from "../../types/template";
import TemplateItem from "./TemplateItem";
import { useTemplates } from "../../hooks/useTemplates";
import { useTemplateCategories } from "../../hooks/useTemplateCategories";

interface TemplateListProps {
  categoryId?: string;
  showPublicOnly?: boolean;
  onTemplateClick?: (template: Template) => void;
  showCategories?: boolean;
}

const TemplateList: React.FC<TemplateListProps> = ({
  categoryId,
  showPublicOnly = false,
  onTemplateClick,
  showCategories = true,
}) => {
  const { getProcessedTemplates, isLoading, error, fetchTemplates } =
    useTemplates();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useTemplateCategories();

  const processedTemplates = useMemo(() => {
    const templates = getProcessedTemplates();

    // Apply category filter if provided
    if (categoryId) {
      return templates.filter((template) => template.categoryId === categoryId);
    }

    // Apply public filter if requested
    if (showPublicOnly) {
      return templates.filter((template) => template.isPublic);
    }

    return templates;
  }, [getProcessedTemplates, categoryId, showPublicOnly]);

  const filteredCategories = useMemo(() => {
    if (!showCategories) return [];

    // Get categories that have templates
    const categoryIdsWithTemplates = new Set(
      processedTemplates.map((t) => t.categoryId).filter(Boolean) as string[],
    );
    return categories.filter((c) => categoryIdsWithTemplates.has(c.id));
  }, [categories, processedTemplates, showCategories]);

  if (isLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading templates: {error}
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading categories: {categoriesError}
      </div>
    );
  }

  if (processedTemplates.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No templates found. Create a new template to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Navigation */}
      {showCategories && filteredCategories.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{
                backgroundColor: category.color + "20",
                color: category.color,
                border: `1px solid ${category.color}`,
              }}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedTemplates.map((template) => (
          <TemplateItem
            key={template.id}
            template={template}
            onClick={onTemplateClick}
          />
        ))}
      </div>
    </div>
  );
};

export { TemplateList };
export default TemplateList;
