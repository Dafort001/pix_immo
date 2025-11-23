import { useParams } from 'wouter';
import { UploadWorkflow } from './admin/workflow/UploadWorkflow';

export default function AdminUploadWorkflow() {
  const params = useParams();
  const jobId = params.jobId;

  if (!jobId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Fehler</h1>
          <p className="text-gray-600">Keine Job-ID angegeben</p>
        </div>
      </div>
    );
  }

  return <UploadWorkflow jobId={jobId} />;
}
