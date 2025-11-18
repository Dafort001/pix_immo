import { Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  jobTitle: string;
  packageSize: string;
  onDownloadZip?: () => void;
  selectedCount?: number;
  allowedCount?: number;
}

export function Header({ jobTitle, packageSize, onDownloadZip, selectedCount = 0, allowedCount = 0 }: HeaderProps) {
  const remainingCount = allowedCount - selectedCount;
  const isOverLimit = selectedCount > allowedCount;
  
  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
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

        {/* Package Info Banner */}
        {allowedCount > 0 && (
          <div className={`mt-4 px-4 py-3 rounded-lg border flex items-center gap-3 ${
            isOverLimit 
              ? 'bg-amber-50 border-amber-200' 
              : selectedCount === allowedCount
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <Package className={`w-5 h-5 flex-shrink-0 ${
              isOverLimit 
                ? 'text-amber-600' 
                : selectedCount === allowedCount
                ? 'text-green-600'
                : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isOverLimit 
                  ? 'text-amber-900' 
                  : selectedCount === allowedCount
                  ? 'text-green-900'
                  : 'text-blue-900'
              }`}>
                {isOverLimit ? (
                  <>
                    <span className="font-semibold">{selectedCount - allowedCount} zusätzliche Bilder</span> gewählt (€{(selectedCount - allowedCount) * 6} Aufpreis)
                  </>
                ) : selectedCount === allowedCount ? (
                  <>
                    <span className="font-semibold">Paket voll</span> - {allowedCount} von {allowedCount} Bildern ausgewählt
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{selectedCount} von {allowedCount}</span> Bildern ausgewählt
                    {remainingCount > 0 && <span className="text-blue-700"> ({remainingCount} verbleibend)</span>}
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
