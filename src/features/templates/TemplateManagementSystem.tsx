import React, { useState, useEffect } from 'react';
import { Template, TemplateCategory } from '../../types/template';
import { useTemplates } from '../../hooks/useTemplates';
import { useTemplateCategories } from '../../hooks/useTemplateCategories';
import { TemplateList, TemplateForm, TemplatePreview } from './';
import { Plus, Search, Template as TemplateIcon, Folder, Star, Tag, Settings, Trash2 } from 'lucide-react';

interface TemplateManagementSystemProps {
  initialView?: 'templates' | 'categories' | 'settings';
}

const TemplateManagementSystem: React.FC<TemplateManagementSystemProps> = ({
  initialView = 'templates'
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
    previewTemplate
  } = useTemplates();

  const {
    categories: templateCategories,
    isLoading: categoriesLoading,
    error: categoriesError,
    createTemplateCategory,
    updateTemplateCategory,
    deleteTemplateCategory
  } = useTemplateCategories();

  const [activeView, setActiveView] = useState<'templates' | 'categories' | 'settings'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);
  const [previewTemplateData, setPreviewTemplateData] = useState<Template | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
                           template.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTemplateClick = (template: Template) => {
    setPreviewTemplateData(template);
    setPreviewVariables(template.variables || {});
    setShowPreview(true);
  };

  const handleApplyTemplate = async (content: string) => {
    console.log('Template applied:', content);
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

  const handleSaveTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowCreateForm(false);
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        await fetchTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCreateForm(true);
  };

  const handleEditCategory = (category: TemplateCategory) => {
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const handleSaveCategory = async (categoryData: Omit<TemplateCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        await updateTemplateCategory(editingCategory.id, categoryData);
      } else {
        await createTemplateCategory(categoryData);
      }
      setShowCreateForm(false);
      // Refresh categories - would need to call fetch in real implementation
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? All templates in this category will be unaffected.')) {
      try {
        await deleteTemplateCategory(categoryId);
        // Refresh categories - would need to call fetch in real implementation
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Management System Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TemplateIcon className="w-6 h-6 mr-2 text-blue-600" />
          Template Management System
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Template
          </button>

          {activeView === 'categories' && (
            <button
              onClick={handleCreateCategory}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Category
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveView('templates')}
          className={`py-2 px-4 text-sm font-medium ${
            activeView === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TemplateIcon className="w-4 h-4 inline-block mr-1" />
          Templates
        </button>
        <button
          onClick={() => setActiveView('categories')}
          className={`py-2 px-4 text-sm font-medium ${
            activeView === 'categories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Folder className="w-4 h-4 inline-block mr-1" />
          Categories
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`py-2 px-4 text-sm font-medium ${
            activeView === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4 inline-block mr-1" />
          Settings
        </button>
      </div>

      {/* Content based on active view */}
      {activeView === 'templates' && (
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
          </div>

          {/* Template List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error loading templates: {error}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <TemplateIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-sm mb-4">Try adjusting your search or create a new template</p>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          ) : (
            <TemplateList
              showCategories={true}
              onTemplateClick={handleTemplateClick}
            />
          )}
        </div>
      )}

      {activeView === 'categories' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Template Categories</h3>

          {categoriesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : categoriesError ? (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error loading categories: {categoriesError}
            </div>
          ) : templateCategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-sm mb-4">Create your first template category</p>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templateCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit category"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Template Settings</h3>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">General Settings</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-700">Default Template Visibility</h5>
                  <p className="text-sm text-gray-500">Set the default visibility for new templates</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-700">Template Auto-Save</h5>
                  <p className="text-sm text-gray-500">Enable automatic saving of template changes</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            {editingCategory ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
                {/* Category form would go here */}
                <p>Category form implementation</p>
              </div>
            ) : (
              <TemplateForm
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => setShowCreateForm(false)}
              />
            )}
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

export default TemplateManagementSystem;