import React from "react";
import LabelItem from "./LabelItem";
import { Label } from "../../types/models";

interface LabelListProps {
  labels: Label[];
  onEdit: (label: Label) => void;
  onDelete: (labelId: string) => void;
  onSelect: (labelId: string) => void;
  selectedLabelId?: string;
}

const LabelList: React.FC<LabelListProps> = ({
  labels,
  onEdit,
  onDelete,
  onSelect,
  selectedLabelId,
}) => {
  return (
    <div className="space-y-2">
      {labels.map((label) => (
        <LabelItem
          key={label.id}
          label={label}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={label.id === selectedLabelId}
        />
      ))}
    </div>
  );
};

export { LabelList };
export default LabelList;
