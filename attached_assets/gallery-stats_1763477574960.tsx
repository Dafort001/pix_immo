import { ImageIcon, CheckCircle2, Lock, Clock } from 'lucide-react';

interface GalleryStatsProps {
  total: number;
  selected: number;
  locked: number;
  editing: number;
}

export function GalleryStats({ total, selected, locked, editing }: GalleryStatsProps) {
  const normal = total - selected - locked - editing;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-gray-800 mb-4 text-base sm:text-lg">Galerie-Statistik</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
          <div className="p-2 bg-gray-200 rounded">
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Gesamt</p>
            <p className="text-lg sm:text-xl text-gray-800">{total}</p>
          </div>
        </div>
        
        {/* Selected */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
          <div className="p-2 bg-blue-200 rounded">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Ausgewählt</p>
            <p className="text-lg sm:text-xl text-gray-800">{selected}</p>
          </div>
        </div>
        
        {/* Locked */}
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
          <div className="p-2 bg-red-200 rounded">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Gesperrt</p>
            <p className="text-lg sm:text-xl text-gray-800">{locked}</p>
          </div>
        </div>
        
        {/* In Bearbeitung */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded">
          <div className="p-2 bg-amber-200 rounded">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Bearbeitung</p>
            <p className="text-lg sm:text-xl text-gray-800">{editing}</p>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm text-gray-600">Verfügbar</p>
          <p className="text-xs sm:text-sm text-gray-800">{normal} von {total}</p>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(normal / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
