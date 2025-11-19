import { JobMeta } from "@/types/jobStacks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobHeaderProps {
  job: JobMeta;
  onBracketSizeChange: (size: 3 | 5) => void;
}

export function JobHeader({ job, onBracketSizeChange }: JobHeaderProps) {
  return (
    <div className="border-b bg-card px-8 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Job: {job.shootCode}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Job-ID</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">{job.jobId}</div>
        </div>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Datum</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">{job.date}</div>
        </div>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Bracket-Größe</label>
          <Select
            value={String(job.bracketSize)}
            onValueChange={(value) => onBracketSizeChange(Number(value) as 3 | 5)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Belichtungen</SelectItem>
              <SelectItem value="5">5 Belichtungen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">RAW-Dateien</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">{job.rawCount}</div>
        </div>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Erkannte Stacks</label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">{job.stackCount}</div>
        </div>
      </div>
    </div>
  );
}
