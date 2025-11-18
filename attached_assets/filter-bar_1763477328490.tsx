import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';

export type FilterType = 'all' | 'normal' | 'selected' | 'locked' | 'editing';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    normal: number;
    selected: number;
    locked: number;
    editing: number;
  };
}

export function FilterBar({ activeFilter, onFilterChange, counts }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Alle Bilder', count: counts.all },
    { value: 'normal', label: 'Verfügbar', count: counts.normal },
    { value: 'selected', label: 'Ausgewählt', count: counts.selected },
    { value: 'locked', label: 'Gesperrt', count: counts.locked },
    { value: 'editing', label: 'In Bearbeitung', count: counts.editing },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full text-gray-700 hover:text-gray-900"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">
            Filter: {filters.find(f => f.value === activeFilter)?.label}
          </span>
        </div>
        <X className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-0' : 'rotate-45'}`} />
      </button>

      {/* Filter Buttons */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:flex flex-wrap gap-2 mt-3 lg:mt-0`}>
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              onFilterChange(filter.value);
              setIsOpen(false);
            }}
            className={`${
              activeFilter === filter.value
                ? 'bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } text-xs sm:text-sm`}
          >
            {filter.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {filter.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
