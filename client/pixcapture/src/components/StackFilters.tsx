import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { OrderFilesFilter } from "../hooks/useOrderFiles";

interface StackFiltersProps {
  filter: OrderFilesFilter;
  onFilterChange: (filter: OrderFilesFilter) => void;
  roomTypes?: string[];
  activeFilterCount?: number;
}

const statusOptions = [
  "waiting",
  "uploading",
  "uploaded",
  "registered",
  "submitted",
  "in_progress",
  "processing",
  "done",
  "awaiting_approval",
  "approved",
  "revision",
  "locked",
  "deleted",
  "completed",
] as const;

export function StackFilters({
  filter,
  onFilterChange,
  roomTypes = [],
  activeFilterCount = 0,
}: StackFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filter.search || "");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFilterChange({ ...filter, search: value || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({});
    setSearchValue("");
  };

  const hasActiveFilters =
    filter.roomType ||
    filter.marked !== undefined ||
    filter.status ||
    filter.warnings !== undefined ||
    filter.search ||
    filter.trashed !== undefined;

  return (
    <div className="border-b bg-background">
      {/* Search bar always visible */}
      <div className="flex items-center gap-2 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("filter.search")}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("filter.title")}
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="p-4 pt-2 space-y-4 border-t">
              {/* Room Type Filter */}
              {roomTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("filter.roomtype")}</Label>
                  <Select
                    value={filter.roomType || ""}
                    onValueChange={(value) =>
                      onFilterChange({
                        ...filter,
                        roomType: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger data-testid="select-roomtype">
                      <SelectValue
                        placeholder={t("filter.roomtype")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t("common.all")}
                      </SelectItem>
                      {roomTypes.map((roomType) => (
                        <SelectItem
                          key={roomType}
                          value={roomType}
                        >
                          {t(`rooms.${roomType}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>{t("filter.status")}</Label>
                <Select
                  value={filter.status || ""}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filter,
                      status: value || undefined,
                    })
                  }
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder={t("filter.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("common.all")}
                    </SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Boolean Filters Row */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter.marked ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onFilterChange({
                      ...filter,
                      marked:
                        filter.marked === true ? undefined : true,
                    })
                  }
                  data-testid="button-filter-marked"
                >
                  {t("filter.marked")}
                </Button>

                <Button
                  variant={filter.warnings ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onFilterChange({
                      ...filter,
                      warnings:
                        filter.warnings === true ? undefined : true,
                    })
                  }
                  data-testid="button-filter-warnings"
                >
                  {t("filter.warnings")}
                </Button>

                <Button
                  variant={filter.trashed ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onFilterChange({
                      ...filter,
                      trashed:
                        filter.trashed === true ? undefined : true,
                    })
                  }
                  data-testid="button-filter-trashed"
                >
                  {t("common.delete")}
                </Button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("common.close")}
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
