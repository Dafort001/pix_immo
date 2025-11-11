import { useState } from "react";
import { Send, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  useMarkedFiles,
  useSubmitForEditing,
  type OrderFile,
} from "../hooks/useOrderFiles";

interface ReviewPackagePanelProps {
  orderId: string;
}

export function ReviewPackagePanel({ orderId }: ReviewPackagePanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data, isLoading } = useMarkedFiles(orderId);
  const submitMutation = useSubmitForEditing();

  const markedFiles = data?.files || [];
  const markedCount = markedFiles.length;

  // Group files by room type
  const filesByRoom = markedFiles.reduce<Record<string, OrderFile[]>>(
    (acc, file) => {
      const room = file.roomType || "default";
      if (!acc[room]) acc[room] = [];
      acc[room].push(file);
      return acc;
    },
    {}
  );

  const handleSubmit = async () => {
    if (!confirmChecked) {
      toast({
        variant: "destructive",
        title: t("dialog.review_package.title"),
        description: t("dialog.review_package.confirm_required"),
      });
      return;
    }

    if (markedCount === 0) {
      toast({
        variant: "destructive",
        title: t("error.network"),
        description: t("empty.no_marked"),
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await submitMutation.mutateAsync({
        orderId,
        files: markedFiles.map((file: OrderFile) => file.id),
        orderNotes: notes || undefined,
      });

      toast({
        title: t("toast.submitted"),
        description: t("dialog.review_package.success", {
          count: markedCount,
        }),
      });

      setNotes("");
      setConfirmChecked(false);
      setConfirmDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("error.network"),
        description:
          error instanceof Error ? error.message : t("error.network"),
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dialog.review_package.title")}</CardTitle>
          <CardDescription>
            {t("dialog.review_package.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {t("common.loading")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card data-testid="card-review-package">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("dialog.review_package.title")}</CardTitle>
              <CardDescription>
                {t("dialog.review_package.subtitle")}
              </CardDescription>
            </div>
            <Badge variant={markedCount > 0 ? "default" : "secondary"}>
              {markedCount} {t("label.filename", { count: markedCount })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {markedCount === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {t("empty.no_marked")}
              </p>
            </div>
          )}

          {markedCount > 0 && (
            <>
              {/* Files by Room Type */}
              <div className="space-y-3">
                <Label>{t("dialog.review_package.files_by_room")}</Label>
                <div className="space-y-2">
                  {Object.entries(filesByRoom).map(([roomType, files]) => {
                    const roomFiles = files as OrderFile[];
                    return (
                      <div
                        key={roomType}
                        className="flex items-center justify-between p-3 rounded border bg-muted/30"
                        data-testid={`room-group-${roomType}`}
                      >
                        <span className="font-medium">
                          {t(`rooms.${roomType}`)}
                        </span>
                        <Badge variant="outline">{roomFiles.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t("dialog.review_package.notes_label")}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={t("dialog.review_package.notes_placeholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  data-testid="textarea-notes"
                />
                <p className="text-xs text-muted-foreground">
                  {t("dialog.review_package.notes_hint")}
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded border bg-accent/20">
                <Checkbox
                  id="confirm"
                  checked={confirmChecked}
                  onCheckedChange={(checked) =>
                    setConfirmChecked(checked as boolean)
                  }
                  data-testid="checkbox-confirm"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="confirm"
                    className="font-medium cursor-pointer"
                  >
                    {t("dialog.review_package.confirm_label")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dialog.review_package.confirm_hint")}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={
              markedCount === 0 ||
              !confirmChecked ||
              submitMutation.isPending
            }
            className="flex-1"
            data-testid="button-submit-package"
          >
            {submitMutation.isPending ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t("button.submit_for_editing")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.review_package.confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.review_package.confirm_text", {
                count: markedCount,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">
              {t("button.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={submitMutation.isPending}
              data-testid="button-confirm-submit"
            >
              {submitMutation.isPending ? (
                <>{t("common.loading")}</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t("button.submit")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
