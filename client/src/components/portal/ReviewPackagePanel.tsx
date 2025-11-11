import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/hooks/useOrderStatus';

interface ReviewPackagePanelProps {
  orderStatus: OrderStatus | undefined;
  isLoading?: boolean;
  selectedFileIds: string[];
  onSubmit: (data: { files: string[]; express?: boolean; order_notes?: string }) => void;
  isPending?: boolean;
}

export function ReviewPackagePanel({
  orderStatus,
  isLoading = false,
  selectedFileIds,
  onSubmit,
  isPending = false,
}: ReviewPackagePanelProps) {
  const [express, setExpress] = useState(false);
  const [notes, setNotes] = useState('');

  const canSubmit = selectedFileIds.length > 0 && !orderStatus?.submitted;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({
        files: selectedFileIds,
        express: express || undefined,
        order_notes: notes || undefined,
      });
      // Reset form
      setExpress(false);
      setNotes('');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-10 w-32" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold mb-1" data-testid="text-panel-title">
            Submit for Editing
          </h2>
          <p className="text-sm text-muted-foreground">
            Review your selection and submit files for professional editing
          </p>
        </div>

        {/* Status Info */}
        {orderStatus && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Editing Progress:</span>
            <Badge variant="secondary" data-testid="badge-order-status">
              {orderStatus.done}/{orderStatus.total} complete
            </Badge>
            {orderStatus.submitted && (
              <Badge variant="default">Submitted</Badge>
            )}
          </div>
        )}

        {/* Selection Info */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" data-testid="text-selection-count">
              {selectedFileIds.length} file{selectedFileIds.length !== 1 ? 's' : ''} selected
            </span>
            {selectedFileIds.length === 0 && (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            )}
          </div>
        </Card>

        {/* Express Option */}
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="express-option"
            checked={express}
            onCheckedChange={(checked) => setExpress(checked as boolean)}
            data-testid="checkbox-express"
          />
          <div className="flex-1">
            <Label
              htmlFor="express-option"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <Zap className="w-4 h-4 text-yellow-600" />
              Express Editing (24h turnaround)
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Additional fee applies. Files will be prioritized for faster delivery.
            </p>
          </div>
        </div>

        {/* Order Notes */}
        <div className="space-y-2">
          <Label htmlFor="order-notes">Special Instructions (Optional)</Label>
          <Textarea
            id="order-notes"
            placeholder="Add any special instructions or notes for the editor..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            data-testid="textarea-notes"
          />
          <p className="text-xs text-muted-foreground">
            {notes.length}/500 characters
          </p>
        </div>

        {/* Warning if already submitted */}
        {orderStatus && orderStatus.submitted && (
          <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Files have already been submitted for editing. New submissions are disabled.
              </p>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="flex-1"
            data-testid="button-submit"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Editing
            {selectedFileIds.length > 0 && ` (${selectedFileIds.length})`}
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <Card className="p-3">
            <h4 className="font-medium mb-1">Standard Turnaround</h4>
            <p className="text-muted-foreground">3-5 business days</p>
          </Card>
          <Card className="p-3">
            <h4 className="font-medium mb-1">Express Turnaround</h4>
            <p className="text-muted-foreground">24 hours (additional fee)</p>
          </Card>
        </div>
      </div>
    </Card>
  );
}
