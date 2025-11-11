import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ReviewPackagePanel } from '@/components/portal/ReviewPackagePanel';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useOrderActions } from '@/hooks/useOrderActions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function OrderReviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const { data: orderStatus, isLoading: statusLoading } = useOrderStatus({
    orderId: orderId || '',
    enabled: !!orderId,
  });

  const { submitEdits } = useOrderActions({ orderId: orderId || '' });

  if (!orderId) return <div>Invalid order ID</div>;

  const handleSubmit = (data: { files: string[]; express?: boolean; order_notes?: string }) => {
    submitEdits.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Files submitted for editing',
        });
        setLocation(`/orders/${orderId}/stacks`);
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit files',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Link href={`/orders/${orderId}/stacks`}>
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Files
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4" data-testid="heading-order-review">
          Review & Submit
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit your selected files for professional editing
        </p>
      </div>

      {/* Review Panel */}
      <ReviewPackagePanel
        selectedFileIds={selectedFileIds}
        orderStatus={orderStatus}
        isLoading={statusLoading}
        onSubmit={handleSubmit}
        isPending={submitEdits.isPending}
      />
    </div>
  );
}
