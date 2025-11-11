import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, RotateCw } from 'lucide-react';

interface RollbackBannerProps {
  visible: boolean;
}

export function RollbackBanner({ visible }: RollbackBannerProps) {
  if (!visible) return null;

  return (
    <div
      className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800"
      data-testid="rollback-banner"
    >
      <div className="container max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                QA Failures Detected
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Do not publish this preview. Check CORS/ENV/API configuration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-7 sm:ml-0">
            <Link href="/qa">
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                data-testid="button-open-qa"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View QA Details
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
              data-testid="button-reload"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
