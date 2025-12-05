import React, { useState, useEffect } from "react";
import { Filter } from "../../types/models";

interface FilterFormProps {
  filter?: Filter;
  onSubmit: (filter: Filter) => void;
  onCancel: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  filter,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(filter?.name || "");
  const [color, setColor] = useState(filter?.color || "#4F46E5");
  const [criteria, setCriteria] = useState(filter?.criteria || {});

  useEffect(() => {
    if (filter) {
      setName(filter.name);
      setColor(filter.color || "#4F46E5");
      setCriteria(filter.criteria || {});
    }
  }, [filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilter: Filter = {
      id: filter?.id || crypto.randomUUID(),
      name,
      color,
      criteria,
      createdAt: filter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(newFilter);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {filter ? "Update Filter" : "Create Filter"}
        </button>
      </div>
    </form>
  );
};

export default FilterForm;
