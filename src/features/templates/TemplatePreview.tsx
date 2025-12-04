import React, { useState, useEffect } from 'react';
import { Template } from '../../types/template';
import { useTemplates } from '../../hooks/useTemplates';
import { generateTemplatePreview, applyTemplateVariables } from '../../utils/templateUtils';
import { X, Copy, Download, Eye } from 'lucide-react';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onApply: (result: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
  onApply
}) => {
  const { previewTemplate } = useTemplates();
  const [previewContent, setPreviewContent] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>(template.variables || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'variables'>('preview');

  // Generate preview when component mounts or template changes
  useEffect(() => {
    const generatePreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate preview with current variables
        const preview = generateTemplatePreview(template, variables);
        setPreviewContent(preview);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate preview');
      } finally {
        setIsLoading(false);
      }
    };

    generatePreview();
  }, [template, variables]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    try {
      // Apply template with current variables
      const result = applyTemplateVariables(template.content, variables);
      onApply(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent)
      .then(() => {
        // Show success feedback
        console.log('Preview copied to clipboard');
      })
      .catch(err => {
        setError('Failed to copy preview to clipboard');
      });
  };

  const handleDownload = () => {
    const blob = new Blob([previewContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_preview.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Preview: {template.name}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Copy preview"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Download preview"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'variables'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Variables ({Object.keys(variables).length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          ) : activeTab === 'preview' ? (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                {previewContent}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Customize the template variables before applying:
              </p>

              <div className="space-y-3">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      <code>{{{key}}}</code>
                    </span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Value for ${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;