import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileArchive, FileText, CheckCircle2 } from 'lucide-react';

interface ExportsPanelProps {
  orderId: string;
  isLoading?: boolean;
  approvedCount?: number;
}

type ExportFormat = 'zip' | 'txt' | 'json';
type Language = 'de' | 'en';

export function ExportsPanel({ orderId, isLoading = false, approvedCount = 0 }: ExportsPanelProps) {
  const [language, setLanguage] = useState<Language>('de');
  const [downloading, setDownloading] = useState<Record<ExportFormat, boolean>>({
    zip: false,
    txt: false,
    json: false,
  });

  const handleDownload = async (format: ExportFormat) => {
    setDownloading((prev) => ({ ...prev, [format]: true }));

    try {
      const url = `/api/orders/${orderId}/exports/${format}?lang=${language}`;
      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `order-${orderId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading((prev) => ({ ...prev, [format]: false }));
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-10 w-32" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold mb-1" data-testid="text-exports-title">
            Download Exports
          </h2>
          <p className="text-sm text-muted-foreground">
            Download edited files and alt-text descriptions
          </p>
        </div>

        {/* Status */}
        {approvedCount > 0 && (
          <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {approvedCount} file{approvedCount !== 1 ? 's' : ''} approved and ready to download
              </span>
            </div>
          </Card>
        )}

        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select">Caption Language</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger id="language-select" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">German (DE)</SelectItem>
              <SelectItem value="en">English (EN)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Language for alt-text captions in TXT and JSON exports
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          {/* ZIP Archive */}
          <Card className="p-4 hover-elevate">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileArchive className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-medium">Image Package (ZIP)</h3>
                  <p className="text-xs text-muted-foreground">
                    All approved files in a single archive
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleDownload('zip')}
                disabled={downloading.zip || approvedCount === 0}
                data-testid="button-download-zip"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading.zip ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </Card>

          {/* TXT Captions */}
          <Card className="p-4 hover-elevate">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-medium">Alt-Text (TXT)</h3>
                  <p className="text-xs text-muted-foreground">
                    Tab-separated captions in {language === 'de' ? 'German' : 'English'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleDownload('txt')}
                disabled={downloading.txt || approvedCount === 0}
                data-testid="button-download-txt"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading.txt ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </Card>

          {/* JSON Metadata */}
          <Card className="p-4 hover-elevate">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-medium">Metadata (JSON)</h3>
                  <p className="text-xs text-muted-foreground">
                    Structured metadata with {language === 'de' ? 'German' : 'English'} captions
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleDownload('json')}
                disabled={downloading.json || approvedCount === 0}
                data-testid="button-download-json"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading.json ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Info */}
        {approvedCount === 0 && (
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              No approved files yet. Approve files to enable downloads.
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
}
