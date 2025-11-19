import { Stack } from "../types";
import { getRoomLabelByValue } from "../data/roomTypes";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { MoreVertical, GripVertical } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";

interface StackCardProps {
  stack: Stack;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onThumbnailClick: (stack: Stack) => void;
  index: number;
  moveStack: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = "STACK_CARD";

export function StackCard({
  stack,
  isSelected,
  onSelect,
  onThumbnailClick,
  index,
  moveStack,
}: StackCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    hover: (item: { index: number }) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveStack(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all ${
        isSelected ? "ring-2 ring-orange-500" : "hover:shadow-md"
      } ${isDragging ? "opacity-50" : ""} ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-muted">
        <ImageWithFallback
          src={stack.thumbnailUrl}
          alt={`Stack ${stack.id}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onThumbnailClick(stack)}
        />
        
        {/* Drag Handle */}
        <div
          ref={drag}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 cursor-move opacity-0 hover:opacity-100 transition-opacity"
        >
          <GripVertical className="size-6 text-white" />
        </div>
        
        {/* Badge: Image Count */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/70"
        >
          {stack.imageCount} Bilder
        </Badge>
        
        {/* Badge: Status */}
        {stack.markedForDeletion && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2"
          >
            Löschen
          </Badge>
        )}
        {stack.uncertain && !stack.markedForDeletion && (
          <Badge
            variant="default"
            className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600"
          >
            Unsicher
          </Badge>
        )}
      </div>
      
      {/* Metadata */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="text-muted-foreground mb-1">
              Stack-ID: {stack.id}
            </div>
            <div className={stack.roomType ? "" : "text-muted-foreground italic"}>
              {getRoomLabelByValue(stack.roomType)}
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1">
            <MoreVertical className="size-4" />
          </button>
        </div>
        
        {/* Checkbox */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Checkbox
            id={`select-${stack.id}`}
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect(stack.id, checked as boolean)
            }
          />
          <label
            htmlFor={`select-${stack.id}`}
            className="flex-1 cursor-pointer"
          >
            Auswählen
          </label>
        </div>
      </div>
    </div>
  );
}