import { HealthCheckPanel } from '@/qa/HealthCheckPanel';

export default function QAPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Preview QA Checks</h1>
          <p className="text-muted-foreground">
            Run smoke tests to verify API connectivity and configuration before deployment.
          </p>
        </div>

        <HealthCheckPanel />

        <div className="p-4 rounded-md bg-muted/50 text-sm space-y-2">
          <p className="font-medium">What these checks do:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>API Base URL:</strong> Verifies VITE_API_BASE_URL is configured</li>
            <li><strong>CORS Preflight:</strong> Tests basic CORS configuration without credentials</li>
            <li><strong>Cookie Credentials:</strong> Tests authenticated requests with cookies</li>
            <li><strong>Signed URL Format:</strong> Validates upload endpoint URL structure</li>
            <li><strong>Download Endpoints:</strong> Validates download URL structure</li>
          </ul>
        </div>

        <div className="p-4 rounded-md border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 text-sm space-y-2">
          <p className="font-medium text-yellow-900 dark:text-yellow-100">Common Issues:</p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li><strong>Missing API URL:</strong> Configure VITE_API_BASE_URL in Cloudflare Pages environment variables</li>
            <li><strong>CORS Blocked:</strong> Backend needs CORS headers for frontend domain (e.g., Access-Control-Allow-Origin)</li>
            <li><strong>Cookie Issues:</strong> Ensure SameSite=None and Secure flag for cross-origin cookies (HTTPS required)</li>
            <li><strong>Network Errors:</strong> Check that backend API is running and accessible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
