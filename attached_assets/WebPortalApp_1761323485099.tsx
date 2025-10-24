import { useState } from 'react';
import { UploadsOverviewScreen } from './web-screens/UploadsOverviewScreen';
import { GallerySelectionScreen } from './web-screens/GallerySelectionScreen';
import { PaymentScreen } from './web-screens/PaymentScreen';
import { StatusTimelineScreen } from './web-screens/StatusTimelineScreen';
import { DeliveryScreen } from './web-screens/DeliveryScreen';
import { RevisionScreen } from './web-screens/RevisionScreen';

export type WebScreen = 
  | 'uploads'
  | 'gallery'
  | 'payment'
  | 'status'
  | 'delivery'
  | 'revision';

interface WebPortalAppProps {
  initialScreen?: WebScreen;
}

export function WebPortalApp({ initialScreen = 'uploads' }: WebPortalAppProps) {
  const [currentScreen, setCurrentScreen] = useState<WebScreen>(initialScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'uploads':
        return <UploadsOverviewScreen />;
      case 'gallery':
        return <GallerySelectionScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'status':
        return <StatusTimelineScreen />;
      case 'delivery':
        return <DeliveryScreen />;
      case 'revision':
        return <RevisionScreen />;
      default:
        return <UploadsOverviewScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Dev Navigation Bar (nur für Testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 text-white p-2 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium mr-2">DEV NAV:</span>
            {(['uploads', 'gallery', 'payment', 'status', 'delivery', 'revision'] as const).map((screen) => (
              <button
                key={screen}
                onClick={() => setCurrentScreen(screen)}
                className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  currentScreen === screen
                    ? 'bg-[#4A5849] text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {screen.charAt(0).toUpperCase() + screen.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Screen */}
      {renderScreen()}
    </div>
  );
}