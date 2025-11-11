import { useState } from "react";
import { Trash2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import {
  type OrderFile,
  useTrashFiles,
  useRestoreFiles,
  useBulkDeleteFiles,
} from "../hooks/useOrderFiles";

interface TrashDrawerProps {
  orderId: string;
}

export function TrashDrawer({ orderId }: TrashDrawerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);

  const { data, isLoading } = useTrashFiles(orderId);
  const restoreMutation = useRestoreFiles();
  const deleteMutation = useBulkDeleteFiles();

  const trashedFiles = data?.files || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(trashedFiles.map((f) => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(fileId);
    } else {
      newSelection.delete(fileId);
    }
    setSelectedIds(newSelection);
  };

  const handleRestore = async () => {
    if (selectedIds.size === 0) return;

    try {
      await restoreMutation.mutateAsync(Array.from(selectedIds));
      toast({
        title: t("toast.restored"),
        description: `${selectedIds.size} ${
          selectedIds.size === 1 ? t("common.file") : t("common.files")
        } ${t("toast.restored")}`,
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error.network"),
        description:
          error instanceof Error
            ? error.message
            : t("error.restore_failed"),
      });
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await deleteMutation.mutateAsync(Array.from(selectedIds));
      toast({
        title: t("toast.permanently_deleted"),
        description: `${selectedIds.size} ${
          selectedIds.size === 1 ? t("common.file") : t("common.files")
        } ${t("toast.permanently_deleted")}`,
      });
      setSelectedIds(new Set());
      setPermanentDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error.network"),
        description:
          error instanceof Error ? error.message : t("error.delete_failed"),
      });
    }
  };

  const allSelected =
    trashedFiles.length > 0 && selectedIds.size === trashedFiles.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" data-testid="button-open-trash">
            <Trash2 className="w-4 h-4 mr-2" />
            {t("button.open_trash")}
            {trashedFiles.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {trashedFiles.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("dialog.trash.title")}</SheetTitle>
            <SheetDescription>{t("legal.trash_hint")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-10rem)] mt-4">
            {/* Header with bulk select */}
            {trashedFiles.length > 0 && (
              <div className="flex items-center gap-3 pb-3 border-b">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? "indeterminate" : undefined}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all-trash"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} / ${trashedFiles.length}`
                    : `${trashedFiles.length} ${
                        trashedFiles.length === 1 ? t("common.file") : t("common.files")
                      }`}
                </span>
              </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-auto py-4 space-y-2">
              {isLoading && (
                <div className="text-center text-muted-foreground">
                  {t("common.loading")}
                </div>
              )}

              {!isLoading && trashedFiles.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Trash2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t("empty.trash")}</p>
                </div>
              )}

              {trashedFiles.map((file) => {
                const isSelected = selectedIds.has(file.id);

                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded border hover-elevate ${
                      isSelected ? "bg-accent/50" : ""
                    }`}
                    data-testid={`trash-file-${file.id}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectFile(file.id, checked as boolean)
                      }
                      data-testid={`checkbox-trash-file-${file.id}`}
                    />

                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {file.mimeType.split("/")[1]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Footer */}
            {selectedIds.size > 0 && (
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  onClick={handleRestore}
                  disabled={restoreMutation.isPending}
                  className="flex-1"
                  data-testid="button-restore-selected"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("button.restore")}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setPermanentDeleteDialogOpen(true)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-permanent"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("button.delete_permanent")}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        open={permanentDeleteDialogOpen}
        onOpenChange={setPermanentDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.delete_permanent.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.delete_permanent.text", {
                count: selectedIds.size,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t("button.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending
                ? t("common.loading")
                : t("button.delete_permanent")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
