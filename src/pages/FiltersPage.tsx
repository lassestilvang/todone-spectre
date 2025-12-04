import React, { useState } from 'react';
import { useFilters } from '../hooks/useFilters';
import FilterList from '../features/filters/FilterList';
import FilterForm from '../features/filters/FilterForm';
import { Filter } from '../types/models';

const FiltersPage: React.FC = () => {
  const {
    filters,
    loading,
    error,
    selectedFilterId,
    createFilter,
    updateFilter,
    deleteFilter,
    selectFilter
  } = useFilters();

  const [showForm, setShowForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);

  const handleCreate = async (filter: Filter) => {
    await createFilter(filter);
    setShowForm(false);
    setEditingFilter(null);
  };

  const handleUpdate = async (filter: Filter) => {
    await updateFilter(filter.id, filter);
    setShowForm(false);
    setEditingFilter(null);
  };

  const handleEdit = (filter: Filter) => {
    setEditingFilter(filter);
    setShowForm(true);
  };

  const handleDelete = async (filterId: string) => {
    if (window.confirm('Are you sure you want to delete this filter?')) {
      await deleteFilter(filterId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFilter(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Filters</h1>
        <button
          onClick={() => {
            setEditingFilter(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Filter
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading filters...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {showForm ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingFilter ? 'Edit Filter' : 'Create New Filter'}
              </h2>
              <FilterForm
                filter={editingFilter || undefined}
                onSubmit={editingFilter ? handleUpdate : handleCreate}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              {filters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No filters found</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Your First Filter
                  </button>
                </div>
              ) : (
                <FilterList
                  filters={filters}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={selectFilter}
                  selectedFilterId={selectedFilterId || undefined}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FiltersPage;