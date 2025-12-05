import React from "react";
import { Template } from "../../types/template";
import { useTemplateCategories } from "../../hooks/useTemplateCategories";
import { Star, Eye, Tag, Download } from "lucide-react";

interface TemplateItemProps {
  template: Template;
  onClick?: (template: Template) => void;
  showActions?: boolean;
}

const TemplateItem: React.FC<TemplateItemProps> = ({
  template,
  onClick,
  showActions = true,
}) => {
  const { categories } = useTemplateCategories();
  const category = categories.find((c) => c.id === template.categoryId);

  const handleClick = () => {
    if (onClick) {
      onClick(template);
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        template.isPublic
          ? "bg-white border-gray-100"
          : "bg-gray-50 border-gray-200"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium truncate text-gray-900">
                {template.name}
              </h3>
              {template.isPublic && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Public
                </span>
              )}
            </div>

            {template.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {template.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
              {category && (
                <span className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color }}
                  ></span>
                  {category.name}
                </span>
              )}

              {template.tags && template.tags.length > 0 && (
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {template.tags.length} tag
                  {template.tags.length > 1 ? "s" : ""}
                </span>
              )}

              {template.usageCount !== undefined && (
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {template.usageCount} use
                  {template.usageCount !== 1 ? "s" : ""}
                </span>
              )}

              {template.rating && (
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  {template.rating}/5
                </span>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle apply template
                }}
                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                title="Apply template"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateItem;
