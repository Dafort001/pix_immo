import { JobStack } from "@/types/jobStacks";
import { getRoomLabelByValue } from "@/data/roomTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, GripVertical, Maximize2, Tag, Trash2, AlertCircle } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StackCardProps {
  stack: JobStack;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onThumbnailClick: (stack: JobStack) => void;
  onOpenInLightbox: (stack: JobStack) => void;
  onToggleDeletion: (stackId: string) => void;
  onToggleUncertain: (stackId: string) => void;
  onAssignRoomType: (stackId: string) => void;
  index: number;
  moveStack: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = "STACK_CARD";

export function StackCard({
  stack,
  isSelected,
  onSelect,
  onThumbnailClick,
  onOpenInLightbox,
  onToggleDeletion,
  onToggleUncertain,
  onAssignRoomType,
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
      className={`bg-card rounded-lg overflow-hidden shadow-sm transition-all ${
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      } ${isDragging ? "opacity-50" : ""} ${isOver ? "ring-2 ring-blue-400" : ""}`}
      data-testid={`card-stack-${stack.id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={stack.previewUrl}
          alt={`Stack ${stack.id}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onThumbnailClick(stack)}
          data-testid={`img-stack-${stack.id}`}
        />
        
        {/* Drag Handle */}
        <div
          ref={drag}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 cursor-move opacity-0 hover:opacity-100 transition-opacity"
          data-testid={`drag-handle-${stack.id}`}
        >
          <GripVertical className="size-6 text-white" />
        </div>
        
        {/* Badge: Image Count */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/70"
        >
          {stack.imageCount === 1 ? "1 Bild" : `${stack.imageCount} Bilder`}
        </Badge>
        
        {/* Badge: Status */}
        {stack.markedForDeletion && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2"
            data-testid={`badge-deletion-${stack.id}`}
          >
            Löschen
          </Badge>
        )}
        {stack.flaggedUncertain && !stack.markedForDeletion && (
          <Badge
            variant="default"
            className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white"
            data-testid={`badge-uncertain-${stack.id}`}
          >
            Unsicher
          </Badge>
        )}
      </div>
      
      {/* Metadata */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              Stack-ID: {stack.id}
            </div>
            <div className={`text-sm ${stack.roomTypeKey ? "" : "text-muted-foreground italic"}`}>
              {getRoomLabelByValue(stack.roomTypeKey)}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="text-muted-foreground hover:text-foreground p-1 rounded hover-elevate"
                data-testid={`button-menu-${stack.id}`}
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onOpenInLightbox(stack)}
                data-testid={`menu-lightbox-${stack.id}`}
              >
                <Maximize2 className="mr-2 h-4 w-4" />
                In Lightbox öffnen
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onAssignRoomType(stack.id)}
                data-testid={`menu-assign-room-${stack.id}`}
              >
                <Tag className="mr-2 h-4 w-4" />
                Raumtyp zuweisen
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onToggleDeletion(stack.id)}
                data-testid={`menu-toggle-deletion-${stack.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {stack.markedForDeletion ? "Löschmarkierung entfernen" : "Zur Löschung markieren"}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onToggleUncertain(stack.id)}
                data-testid={`menu-toggle-uncertain-${stack.id}`}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {stack.flaggedUncertain ? "Unsicher-Markierung entfernen" : "Als unsicher markieren"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Checkbox */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Checkbox
            id={`select-${stack.id}`}
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect(stack.id, checked as boolean)
            }
            data-testid={`checkbox-select-${stack.id}`}
          />
          <label
            htmlFor={`select-${stack.id}`}
            className="flex-1 text-sm cursor-pointer"
          >
            Auswählen
          </label>
        </div>
      </div>
    </div>
  );
}
