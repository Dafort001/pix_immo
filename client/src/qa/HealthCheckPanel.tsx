import { useEffect } from 'react';
import { useSmokeChecks, type SmokeCheck, type CheckStatus } from '@/hooks/useSmokeChecks';
import { getApiBaseUrl, getAppEnv } from '@/config/runtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Circle, Loader2 } from 'lucide-react';

function getStatusIcon(status: CheckStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case 'fail':
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    case 'warn':
      return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    case 'pending':
      return <Circle className="w-5 h-5 text-muted-foreground" />;
    case 'skipped':
      return <Circle className="w-5 h-5 text-muted-foreground" />;
    default:
      return <Circle className="w-5 h-5 text-muted-foreground" />;
  }
}

function getStatusBadge(status: CheckStatus) {
  switch (status) {
    case 'pass':
      return <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">PASS</Badge>;
    case 'fail':
      return <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">FAIL</Badge>;
    case 'warn':
      return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">WARN</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-muted-foreground">PENDING</Badge>;
    case 'skipped':
      return <Badge variant="outline" className="text-muted-foreground">SKIPPED</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">UNKNOWN</Badge>;
  }
}

function CheckRow({ check }: { check: SmokeCheck }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md border hover-elevate" data-testid={`check-${check.id}`}>
      <div className="mt-0.5">{getStatusIcon(check.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{check.name}</span>
          {getStatusBadge(check.status)}
        </div>
        {check.message && (
          <p className="text-sm text-muted-foreground truncate" title={check.message}>
            {check.message}
          </p>
        )}
      </div>
    </div>
  );
}

export function HealthCheckPanel() {
  const { checks, isRunning, hasFailures, runChecks } = useSmokeChecks({ autoRun: false });

  // Manual run on mount (to control timing)
  useEffect(() => {
    runChecks();
  }, []);

  const apiUrl = (() => {
    try {
      return getApiBaseUrl() || '(relative URLs)';
    } catch {
      return '(not configured)';
    }
  })();

  const appEnv = getAppEnv();
  const timestamp = new Date().toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <Card data-testid="health-check-panel">
      <CardHeader>
        <CardTitle>Preview Smoke Checks</CardTitle>
        <CardDescription>
          Verify API connectivity and CORS configuration before deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md bg-muted/50">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">API Base URL</p>
            <p className="text-sm font-mono truncate" title={apiUrl}>{apiUrl}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Environment</p>
            <p className="text-sm font-mono">{appEnv}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Last Run</p>
            <p className="text-sm font-mono">{timestamp}</p>
          </div>
        </div>

        {/* Checks List */}
        <div className="space-y-2">
          {checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={runChecks}
            disabled={isRunning}
            data-testid="button-run-checks"
          >
            {isRunning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isRunning ? 'Running Checks...' : 'Re-run Checks'}
          </Button>

          {hasFailures && (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ Deployment not recommended - fix failures first
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
