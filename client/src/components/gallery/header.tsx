import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  jobTitle: string;
  packageSize: string;
  onDownloadZip?: () => void;
}

export function Header({ jobTitle, packageSize, onDownloadZip }: HeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        {/* Linker Bereich */}
        <div className="flex flex-col gap-1 flex-1">
          <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl" data-testid="text-job-title">{jobTitle}</h1>
          <p className="text-gray-500 text-sm sm:text-base" data-testid="text-package-size">{packageSize}</p>
        </div>
        
        {/* Rechter Bereich */}
        <Button 
          onClick={onDownloadZip}
          className="bg-[#2d2d2d] text-white w-full sm:w-auto"
          data-testid="button-download-zip"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">ZIP-Download</span>
          <span className="sm:hidden">Download</span>
        </Button>
      </div>
    </div>
  );
}
