// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Template, TemplateCategory } from "../../types/template";
import { useTemplates } from "../../hooks/useTemplates";
import { useTemplateCategories } from "../../hooks/useTemplateCategories";
import { validateTemplate } from "../../utils/templateUtils";
import { X, Save, Tag, Eye, EyeOff, Star } from "lucide-react";

interface TemplateFormProps {
  template?: Template | null;
  onSave: (
    templateData: Omit<Template, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const { createTemplate, updateTemplate } = useTemplates();
  const { categories } = useTemplateCategories();

  const [formData, setFormData] = useState<
    Omit<Template, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    content: "",
    categoryId: "",
    tags: [],
    isPublic: false,
    variables: {},
    rating: 0,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");

  // Initialize form with template data if editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        content: template.content,
        categoryId: template.categoryId || "",
        tags: template.tags || [],
        isPublic: template.isPublic || false,
        variables: template.variables || {},
        rating: template.rating || 0,
      });
    }
  }, [template]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: e.target.value,
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const handleVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "variableKey") {
      setNewVariableKey(value);
    } else {
      setNewVariableValue(value);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addVariable = () => {
    if (newVariableKey.trim() && newVariableValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        variables: {
          ...prev.variables,
          [newVariableKey.trim()]: newVariableValue.trim(),
        },
      }));
      setNewVariableKey("");
      setNewVariableValue("");
    }
  };

  const removeVariable = (key: string) => {
    setFormData((prev) => {
      const newVariables = { ...prev.variables };
      delete newVariables[key];
      return {
        ...prev,
        variables: newVariables,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateTemplate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      if (template) {
        // Update existing template
        await updateTemplate(template.id, formData);
      } else {
        // Create new template
        await createTemplate(formData);
      }

      // Call parent onSave with the form data
      await onSave(formData);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Failed to save template",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {template ? "Edit Template" : "Create New Template"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Template Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Template Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter template name"
          required
        />
      </div>

      {/* Template Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          placeholder="Enter template description"
        />
      </div>

      {/* Template Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Template Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[200px] font-mono text-sm"
          placeholder="Enter template content with variables like {{variableName}}"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Use{" "}
          <code className="bg-gray-100 px-1 rounded">{{ variableName }}</code>{" "}
          syntax for variables
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={handleTagChange}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add tag and press Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variables */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variables
        </label>
        <div className="space-y-2">
          {Object.entries(formData.variables).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                <code>{`{${key}}`}</code> = {value}
              </span>
              <button
                type="button"
                onClick={() => removeVariable(key)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              name="variableKey"
              value={newVariableKey}
              onChange={handleVariableChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Variable name"
            />
            <input
              type="text"
              name="variableValue"
              value={newVariableValue}
              onChange={handleVariableChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Default value"
            />
            <button
              type="button"
              onClick={addVariable}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 block text-sm text-gray-700"
          >
            Public Template
          </label>
        </div>

        <div className="flex items-center">
          <label htmlFor="rating" className="block text-sm text-gray-700 mr-2">
            Rating:
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, rating: star }))
                }
                className={`text-xl ${star <= formData.rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                <Star className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
};

export { TemplateForm };
export default TemplateForm;
