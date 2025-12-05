import React from "react";
import FilterItem from "./FilterItem";
import { Filter } from "../../types/models";

interface FilterListProps {
  filters: Filter[];
  onEdit: (filter: Filter) => void;
  onDelete: (filterId: string) => void;
  onSelect: (filterId: string) => void;
  selectedFilterId?: string;
}

const FilterList: React.FC<FilterListProps> = ({
  filters,
  onEdit,
  onDelete,
  onSelect,
  selectedFilterId,
}) => {
  return (
    <div className="space-y-2">
      {filters.map((filter) => (
        <FilterItem
          key={filter.id}
          filter={filter}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={filter.id === selectedFilterId}
        />
      ))}
    </div>
  );
};

export default FilterList;
