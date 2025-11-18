import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems 
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items info */}
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          Zeige <span className="text-gray-800">{startItem}</span> bis{' '}
          <span className="text-gray-800">{endItem}</span> von{' '}
          <span className="text-gray-800">{totalItems}</span> Bildern
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Zurück</span>
          </Button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <Button
                  key={index}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`min-w-[2.5rem] ${
                    currentPage === page
                      ? 'bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 text-gray-400">
                  {page}
                </span>
              )
            ))}
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded">
            {currentPage} / {totalPages}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-300"
          >
            <span className="hidden sm:inline mr-1">Weiter</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
