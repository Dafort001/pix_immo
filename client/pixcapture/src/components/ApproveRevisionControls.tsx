import { useState } from "react";
import { Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { useApproveRevision, useRequestRevision } from "../hooks/useOrderActions";

interface ApproveRevisionControlsProps {
  orderId: string;
  revisionId: string;
  disabled?: boolean;
}

export function ApproveRevisionControls({
  orderId,
  revisionId,
  disabled = false,
}: ApproveRevisionControlsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [revisionNote, setRevisionNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const approveMutation = useApproveRevision();
  const revisionMutation = useRequestRevision();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ orderId, revisionId });
      toast({
        title: t("toast.approved"),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t("error.network"),
        variant: "destructive",
      });
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      toast({
        title: t("error.network"),
        description: t("dialog.revision.note_required"),
        variant: "destructive",
      });
      return;
    }

    try {
      await revisionMutation.mutateAsync({
        orderId,
        revisionId,
        note: revisionNote,
      });
      toast({
        title: t("toast.revision"),
        variant: "default",
      });
      setDialogOpen(false);
      setRevisionNote("");
    } catch (error) {
      toast({
        title: t("error.network"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleApprove}
        disabled={disabled || approveMutation.isPending}
        variant="default"
        data-testid="button-approve"
      >
        <Check className="w-4 h-4 mr-2" />
        {t("button.approve")}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || revisionMutation.isPending}
            data-testid="button-request-revision"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t("button.revision")}
          </Button>
        </DialogTrigger>

        <DialogContent data-testid="dialog-request-revision">
          <DialogHeader>
            <DialogTitle>{t("dialog.revision.title")}</DialogTitle>
            <DialogDescription>
              {t("dialog.revision.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revision-note">
                {t("dialog.revision.note_label")}
              </Label>
              <Textarea
                id="revision-note"
                placeholder={t("dialog.revision.note_placeholder")}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                rows={5}
                data-testid="textarea-revision-note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setRevisionNote("");
              }}
              data-testid="button-cancel-revision"
            >
              <X className="w-4 h-4 mr-2" />
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRequestRevision}
              disabled={!revisionNote.trim() || revisionMutation.isPending}
              data-testid="button-submit-revision"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t("button.submit_package")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
