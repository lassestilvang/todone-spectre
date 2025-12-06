// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Label } from "../../types/models";

interface LabelFormProps {
  label?: Label;
  onSubmit: (label: Label) => void;
  onCancel: () => void;
}

const LabelForm: React.FC<LabelFormProps> = ({ label, onSubmit, onCancel }) => {
  const [name, setName] = useState(label?.name || "");
  const [color, setColor] = useState(label?.color || "#10B981");

  useEffect(() => {
    if (label) {
      setName(label.name);
      setColor(label.color || "#10B981");
    }
  }, [label]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLabel: Label = {
      id: label?.id || crypto.randomUUID(),
      name,
      color,
      createdAt: label?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(newLabel);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 p-1 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {label ? "Update Label" : "Create Label"}
        </button>
      </div>
    </form>
  );
};

export { LabelForm };
export default LabelForm;
