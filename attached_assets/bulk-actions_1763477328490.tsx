import { Download, Trash2, CheckSquare, Package } from 'lucide-react';
import { Button } from './ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onDownloadSelected: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  maxSelection?: number;
  packageCount?: number;
  additionalCount?: number;
}

export function BulkActions({ 
  selectedCount, 
  onDownloadSelected, 
  onClearSelection,
  onSelectAll,
  totalCount,
  maxSelection,
  packageCount,
  additionalCount
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  const isMaxReached = maxSelection !== undefined && selectedCount >= maxSelection;
  const hasAdditionalImages = additionalCount !== undefined && additionalCount > 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4">
      <div className="bg-[#2d2d2d] text-white rounded-full shadow-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
        {/* Selected count with package info */}
        <div className="flex items-center gap-2">
          {packageCount !== undefined ? (
            <>
              {/* Package Images */}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <CheckSquare className="w-4 h-4 text-green-300" />
                <span className="text-xs sm:text-sm">
                  {packageCount} im Paket
                </span>
              </div>
              
              {/* Additional Images */}
              {hasAdditionalImages && (
                <>
                  <span className="text-white/40">+</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    <span className="text-xs sm:text-sm text-amber-300">€</span>
                    <span className="text-xs sm:text-sm">
                      {additionalCount} zusätzlich
                    </span>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Fallback without package info */
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isMaxReached ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/10'
            }`}>
              <CheckSquare className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {selectedCount}
                {maxSelection !== undefined && ` / ${maxSelection}`}
                {' '}
                {selectedCount === 1 ? 'Bild' : 'Bilder'}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!maxSelection && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectAll}
              className="text-white hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9"
            >
              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Alle ({totalCount})</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={onDownloadSelected}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm h-8 sm:h-9"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Download</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-white hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Löschen</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
