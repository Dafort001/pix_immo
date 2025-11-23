import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { JobMeta } from "@/types/jobStacks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobHeaderProps {
  job: JobMeta;
  onBracketSizeChange: (size: 1 | 3 | 5) => void;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
}

export function JobHeader({ 
  job, 
  onBracketSizeChange,
  showBackButton = true,
  backTo = "/dashboard",
  backLabel = "Zurück zum Dashboard"
}: JobHeaderProps) {
  return (
    <div className="border-b bg-card px-8 py-6">
      <div className="flex items-center gap-4 mb-4">
        {showBackButton && (
          <Link href={backTo}>
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        )}
        <h1 className="text-2xl font-semibold">Job: {job.shootCode}</h1>
      </div>
      
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
          <label className="block text-sm text-muted-foreground mb-1">Belichtungsreihe</label>
          <Select
            value={String(job.bracketSize)}
            onValueChange={(value) => onBracketSizeChange(Number(value) as 1 | 3 | 5)}
          >
            <SelectTrigger className="w-full" data-testid="select-bracket-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Bild</SelectItem>
              <SelectItem value="3">3 Bilder</SelectItem>
              <SelectItem value="5">5 Bilder</SelectItem>
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
