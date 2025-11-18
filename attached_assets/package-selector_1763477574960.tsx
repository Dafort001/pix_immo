import { Check } from 'lucide-react';
import { Button } from './ui/button';

export type PackageType = {
  id: string;
  name: string;
  imageCount: number;
  price: number;
  pricePerAdditionalImage: number;
};

interface PackageSelectorProps {
  packages: PackageType[];
  selectedPackage: PackageType;
  onPackageChange: (pkg: PackageType) => void;
  additionalImagesCount: number;
}

export function PackageSelector({ 
  packages, 
  selectedPackage, 
  onPackageChange,
  additionalImagesCount 
}: PackageSelectorProps) {
  const totalPrice = selectedPackage.price + (additionalImagesCount * selectedPackage.pricePerAdditionalImage);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-gray-900">Ihr Paket</h3>
          <p className="text-sm text-gray-600 mt-1">
            Wählen Sie die Anzahl der Bilder, die Sie erwerben möchten
          </p>
        </div>

        {/* Package Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onPackageChange(pkg)}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedPackage.id === pkg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {selectedPackage.id === pkg.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="space-y-1">
                <div className="text-gray-900">{pkg.name}</div>
                <div className="text-sm text-gray-600">{pkg.imageCount} Bilder</div>
                <div className="text-blue-600 mt-2">€ {pkg.price.toFixed(2)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Images Info */}
        {additionalImagesCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Zusätzliche Bilder:
              </span>
              <span className="text-sm text-gray-900">
                {additionalImagesCount} × € {selectedPackage.pricePerAdditionalImage.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-amber-300">
              <span className="text-gray-900">Gesamt:</span>
              <span className="text-blue-600">
                € {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Summary without additional images */}
        {additionalImagesCount === 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {selectedPackage.imageCount} Bilder im Paket enthalten
            </span>
            <span className="text-gray-900">
              € {selectedPackage.price.toFixed(2)}
            </span>
          </div>
        )}

        {/* Info Text */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          💡 Sie können zusätzlich zur Paketgröße weitere Bilder für je € {selectedPackage.pricePerAdditionalImage.toFixed(2)} auswählen
        </div>
      </div>
    </div>
  );
}
