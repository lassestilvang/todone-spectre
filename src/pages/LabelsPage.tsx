import React, { useState } from "react";
import { useLabels } from "../hooks/useLabels";
import LabelList from "../features/filters/LabelList";
import LabelForm from "../features/filters/LabelForm";
import { Label } from "../types/models";

const LabelsPage: React.FC = () => {
  const {
    labels,
    loading,
    error,
    selectedLabelId,
    createLabel,
    updateLabel,
    deleteLabel,
    selectLabel,
  } = useLabels();

  const [showForm, setShowForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleCreate = async (label: Label) => {
    await createLabel(label);
    setShowForm(false);
    setEditingLabel(null);
  };

  const handleUpdate = async (label: Label) => {
    await updateLabel(label.id, label);
    setShowForm(false);
    setEditingLabel(null);
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setShowForm(true);
  };

  const handleDelete = async (labelId: string) => {
    if (window.confirm("Are you sure you want to delete this label?")) {
      await deleteLabel(labelId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLabel(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Labels</h1>
        <button
          onClick={() => {
            setEditingLabel(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create Label
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading labels...</p>
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
                {editingLabel ? "Edit Label" : "Create New Label"}
              </h2>
              <LabelForm
                label={editingLabel || undefined}
                onSubmit={editingLabel ? handleUpdate : handleCreate}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              {labels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No labels found</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Create Your First Label
                  </button>
                </div>
              ) : (
                <LabelList
                  labels={labels}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={selectLabel}
                  selectedLabelId={selectedLabelId || undefined}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabelsPage;
