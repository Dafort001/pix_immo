import { useParams } from 'wouter';
import { ExportsPanel } from '@/components/portal/ExportsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function OrderExportsPage() {
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) return <div>Invalid order ID</div>;

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
        <h1 className="text-3xl font-bold mt-4" data-testid="heading-order-exports">
          Downloads & Exports
        </h1>
        <p className="text-muted-foreground mt-1">
          Download your edited files and captions
        </p>
      </div>

      {/* Exports Panel */}
      <ExportsPanel orderId={orderId} />
    </div>
  );
}
