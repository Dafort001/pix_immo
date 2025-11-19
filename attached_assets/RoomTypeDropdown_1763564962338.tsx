import { useState, useMemo } from "react";
import { roomGroups } from "../data/roomTypes";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface RoomTypeDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function RoomTypeDropdown({
  value,
  onValueChange,
}: RoomTypeDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return roomGroups;

    const query = searchQuery.toLowerCase();
    return roomGroups
      .map((group) => ({
        ...group,
        rooms: group.rooms.filter((room) =>
          room.label.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [searchQuery]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Raumtyp wählen..." />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Raum suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        
        {filteredGroups.length === 0 ? (
          <div className="px-2 py-6 text-center text-muted-foreground">
            Keine passenden Räume gefunden
          </div>
        ) : (
          filteredGroups.map((group) => (
            <SelectGroup key={group.groupName}>
              <SelectLabel className="text-muted-foreground">
                {group.groupName}
              </SelectLabel>
              {group.rooms.map((room) => (
                <SelectItem key={room.value} value={room.value}>
                  {room.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
