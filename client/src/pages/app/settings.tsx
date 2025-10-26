import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { ChevronRight } from 'lucide-react';

export default function SettingsScreen() {
  const [photoCount, setPhotoCount] = useState(0);

  // R4: Set white background for Settings page
  useEffect(() => {
    document.body.style.backgroundColor = '#FFFFFF';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Load photo count
  useEffect(() => {
    const stored = sessionStorage.getItem('appPhotos');
    if (stored) {
      const photos = JSON.parse(stored);
      setPhotoCount(photos.length);
    }
  }, []);

  const settingsSections = [
    {
      title: 'Kamera',
      items: [
        { label: 'HDR standardmäßig aktivieren', value: 'Ein', testId: 'setting-hdr' },
        { label: 'Raster anzeigen', value: 'Aus', testId: 'setting-grid' },
        { label: 'Histogram anzeigen', value: 'Ein', testId: 'setting-histogram' },
        { label: 'Standard Raumtyp', value: 'Wohnzimmer', testId: 'setting-room' },
      ],
    },
    {
      title: 'Upload',
      items: [
        { label: 'Auto-Upload', value: 'Aus', testId: 'setting-autoupload' },
        { label: 'Nur über WLAN', value: 'Ein', testId: 'setting-wifi' },
        { label: 'Bild-Qualität', value: 'Original', testId: 'setting-quality' },
      ],
    },
    {
      title: 'Allgemein',
      items: [
        { label: 'Haptisches Feedback', value: 'Ein', testId: 'setting-haptic' },
        { label: 'Sound-Effekte', value: 'Ein', testId: 'setting-sound' },
        { label: 'App-Version', value: '1.0.0', testId: 'setting-version' },
      ],
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Status Bar */}
      <StatusBar variant="dark" />

      {/* Header */}
      <div className="safe-top-header bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#4A5849] px-6 py-4" data-testid="heading-settings">
          Einstellungen
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 py-6 space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4" data-testid={`section-${section.title.toLowerCase()}`}>
                {section.title}
              </h2>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                {section.items.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-4 py-3 ${
                      index !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-900 text-base" data-testid={item.testId}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-base" data-testid={`${item.testId}-value`}>
                        {item.value}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Info Section */}
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500" data-testid="text-app-info">
              pix.immo Camera App
            </p>
            <p className="text-xs text-gray-400 mt-1" data-testid="text-copyright">
              © 2025 pix.immo
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav photoCount={photoCount} variant="light" />
    </div>
  );
}
