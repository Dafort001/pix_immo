import { useState, useEffect, useRef } from 'react';
import { getApiBaseUrl } from '@/config/runtime';

export type CheckStatus = 'pending' | 'pass' | 'warn' | 'fail' | 'skipped';

export interface SmokeCheck {
  id: string;
  name: string;
  status: CheckStatus;
  message?: string;
}

interface SmokeCheckResult {
  checks: SmokeCheck[];
  isRunning: boolean;
  hasFailures: boolean;
  runChecks: () => Promise<void>;
}

export interface UseSmokeChecksOptions {
  autoRun?: boolean;
  runIntervalMs?: number;
}

export function useSmokeChecks(options: UseSmokeChecksOptions = {}): SmokeCheckResult {
  const { autoRun = true, runIntervalMs } = options;
  const [checks, setChecks] = useState<SmokeCheck[]>([
    { id: 'api-url', name: 'API Base URL', status: 'pending' },
    { id: 'cors-preflight', name: 'CORS Preflight', status: 'pending' },
    { id: 'credentials', name: 'Cookie Credentials', status: 'pending' },
    { id: 'signed-urls', name: 'Signed URL Format', status: 'pending' },
    { id: 'downloads', name: 'Download Endpoints', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = (id: string, status: CheckStatus, message?: string) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, message } : c))
    );
  };

  const runChecks = async () => {
    setIsRunning(true);

    // Reset all checks to pending
    setChecks((prev) => prev.map((c) => ({ ...c, status: 'pending' as CheckStatus })));

    // Check 1: API Base URL is set
    try {
      const apiUrl = getApiBaseUrl();
      if (!apiUrl || apiUrl === '') {
        updateCheck('api-url', 'fail', 'API Base URL is not configured');
      } else if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        // Development mode - relative URLs OK
        updateCheck('api-url', 'pass', `Relative URL (dev mode)`);
      } else {
        updateCheck('api-url', 'pass', `${apiUrl}`);
      }
    } catch (error) {
      updateCheck('api-url', 'fail', error instanceof Error ? error.message : 'Unknown error');
    }

    // Check 2: CORS Preflight (without credentials)
    try {
      const apiUrl = getApiBaseUrl();
      const baseUrl = apiUrl || '';
      const testUrl = baseUrl ? `${baseUrl}/api/notifications` : '/api/notifications';
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // 401/403/200 are all acceptable (no CORS block)
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        updateCheck('cors-preflight', 'pass', `HTTP ${response.status}`);
      } else {
        updateCheck('cors-preflight', 'warn', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        // CORS block or network error
        updateCheck('cors-preflight', 'fail', 'CORS blocked or network error');
      } else if (error instanceof Error && error.name === 'AbortError') {
        updateCheck('cors-preflight', 'warn', 'Request timeout (5s)');
      } else {
        updateCheck('cors-preflight', 'warn', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Check 3: Credentials Cookie (with credentials:include)
    try {
      const apiUrl = getApiBaseUrl();
      const baseUrl = apiUrl || '';
      const testUrl = baseUrl ? `${baseUrl}/api/notifications` : '/api/notifications';
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 200) {
        updateCheck('credentials', 'pass', 'Authenticated request OK');
      } else if (response.status === 401) {
        updateCheck('credentials', 'skipped', 'Not logged in (expected)');
      } else {
        updateCheck('credentials', 'warn', `HTTP ${response.status}`);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        updateCheck('credentials', 'fail', 'CORS blocked with credentials');
      } else if (error instanceof Error && error.name === 'AbortError') {
        updateCheck('credentials', 'warn', 'Request timeout (5s)');
      } else {
        updateCheck('credentials', 'warn', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Check 4: Signed URL Format (dry run - just check URL construction)
    try {
      const apiUrl = getApiBaseUrl();
      const baseUrl = apiUrl || '';
      const intentUrl = baseUrl ? `${baseUrl}/api/uploads/intent` : '/api/uploads/intent';
      
      // Just validate URL format, don't make actual request
      const url = new URL(intentUrl, window.location.origin);
      updateCheck('signed-urls', 'pass', `Format OK: ${url.pathname}`);
    } catch (error) {
      updateCheck('signed-urls', 'fail', error instanceof Error ? error.message : 'Invalid URL format');
    }

    // Check 5: Download Endpoints (dry run - just check URL format)
    try {
      const apiUrl = getApiBaseUrl();
      const baseUrl = apiUrl || '';
      const downloadUrl = baseUrl 
        ? `${baseUrl}/api/orders/TEST/alt-texts.txt?lang=de`
        : '/api/orders/TEST/alt-texts.txt?lang=de';
      
      // Just validate URL format, don't make actual request
      const url = new URL(downloadUrl, window.location.origin);
      updateCheck('downloads', 'pass', `Format OK: ${url.pathname}`);
    } catch (error) {
      updateCheck('downloads', 'fail', error instanceof Error ? error.message : 'Invalid URL format');
    }

    setIsRunning(false);
  };

  const hasFailures = checks.some((c) => c.status === 'fail');
  const hasRunOnce = useRef(false);

  useEffect(() => {
    if (autoRun && !hasRunOnce.current) {
      hasRunOnce.current = true;
      runChecks();
    }
  }, [autoRun]);

  useEffect(() => {
    if (!runIntervalMs) return;

    const interval = setInterval(() => {
      runChecks();
    }, runIntervalMs);

    return () => clearInterval(interval);
  }, [runIntervalMs]);

  return {
    checks,
    isRunning,
    hasFailures,
    runChecks,
  };
}
