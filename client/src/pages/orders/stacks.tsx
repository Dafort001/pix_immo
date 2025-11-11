import { useState } from 'react';
import { useParams } from 'wouter';
import { FileList } from '@/components/portal/FileList';
import { StackFilters } from '@/components/portal/StackFilters';
import { TrashDrawer } from '@/components/portal/TrashDrawer';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useOrderFiles, type OrderFilesFilter } from '@/hooks/useOrderFiles';
import { useOrderActions } from '@/hooks/useOrderActions';
import { useQuery } from '@tanstack/react-query';
import type { OrderFile } from '@/hooks/useOrderFiles';

export default function OrderStacksPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<OrderFilesFilter>({});

  const { data, isLoading } = useOrderFiles({
    orderId: orderId || '',
    filter,
    limit: 100,
    enabled: !!orderId,
  });

  const { data: trashData, isLoading: trashLoading } = useQuery<{ files: OrderFile[] }>({
    queryKey: ['/api/trash'],
    enabled: !!orderId,
  });

  const { markFiles, deleteFiles, restoreFiles, approveFile, revisionFile } =
    useOrderActions({ orderId: orderId || '' });

  if (!orderId) return <div>Invalid order ID</div>;

  const files = data?.files || [];
  const trashFiles = trashData?.files || [];

  const handleToggleFavorite = (fileId: string, marked: boolean) => {
    markFiles.mutate({ ids: [fileId], marked: !marked });
  };

  const handleDelete = (fileId: string) => {
    deleteFiles.mutate([fileId]);
  };

  const handleApprove = (fileId: string) => {
    approveFile.mutate(fileId);
  };

  const handleRevision = (fileId: string, note: string) => {
    revisionFile.mutate({ id: fileId, note });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-order-stacks">
            Order Files
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage your photo files
          </p>
        </div>
        
        {/* Trash Drawer Trigger */}
        <TrashDrawer
          trashFiles={trashFiles}
          isLoading={trashLoading}
          onRestore={(ids) => restoreFiles.mutate(ids)}
          onPermanentDelete={(ids) => deleteFiles.mutate(ids)}
          isPending={restoreFiles.isPending || deleteFiles.isPending}
        >
          <Button
            variant="outline"
            data-testid="button-open-trash"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Trash ({trashFiles.length})
          </Button>
        </TrashDrawer>
      </div>

      {/* Filters */}
      <StackFilters
        filter={filter}
        onFilterChange={setFilter}
        showClearButton
      />

      {/* File List */}
      <FileList
        files={files}
        selectedIds={selectedFileIds}
        onSelectionChange={setSelectedFileIds}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onRevision={handleRevision}
        isLoading={isLoading}
        showApproveControls
      />

    </div>
  );
}
