import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import type { OrderFilesFilter } from '@/hooks/useOrderFiles';

interface StackFiltersProps {
  filter: OrderFilesFilter;
  onFilterChange: (filter: OrderFilesFilter) => void;
  showClearButton?: boolean;
}

const ROOM_TYPES = [
  'all',
  'kitchen',
  'living_room',
  'bedroom',
  'bathroom',
  'hallway',
  'exterior',
  'facade',
  'balcony',
  'terrace',
  'garden',
  'other',
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'approved', label: 'Approved' },
];

export function StackFilters({ filter, onFilterChange, showClearButton = true }: StackFiltersProps) {
  const hasActiveFilters =
    filter.room_type ||
    filter.marked !== undefined ||
    filter.status ||
    filter.has_warnings !== undefined ||
    filter.search;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files by name..."
            value={filter.search || ''}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                search: e.target.value || undefined,
              })
            }
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Room Type */}
          <div className="space-y-2">
            <Label htmlFor="room-type-filter">Room Type</Label>
            <Select
              value={filter.room_type || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filter,
                  room_type: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="room-type-filter" data-testid="select-room-type">
                <SelectValue placeholder="All rooms" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all'
                      ? 'All Rooms'
                      : type.replace('_', ' ').charAt(0).toUpperCase() +
                        type.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filter.status || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...filter,
                  status: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="status-filter" data-testid="select-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marked Filter */}
          <div className="flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marked-filter"
                checked={filter.marked === true}
                onCheckedChange={(checked) =>
                  onFilterChange({
                    ...filter,
                    marked: checked ? true : undefined,
                  })
                }
                data-testid="checkbox-marked"
              />
              <Label
                htmlFor="marked-filter"
                className="text-sm font-medium cursor-pointer"
              >
                Marked only
              </Label>
            </div>
          </div>

          {/* Warnings Filter */}
          <div className="flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="warnings-filter"
                checked={filter.has_warnings === true}
                onCheckedChange={(checked) =>
                  onFilterChange({
                    ...filter,
                    has_warnings: checked ? true : undefined,
                  })
                }
                data-testid="checkbox-warnings"
              />
              <Label
                htmlFor="warnings-filter"
                className="text-sm font-medium cursor-pointer"
              >
                Has warnings
              </Label>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
