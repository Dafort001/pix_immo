import { useState, useEffect } from 'react';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { ChevronRight, Camera, RotateCcw, Info } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { useManualModeStore } from '@/lib/manual-mode/store';
import {
  formatISO,
  formatShutterSpeed,
  formatWhiteBalance,
  formatExposureComp,
} from '@/lib/manual-mode/types';

export default function SettingsScreen() {
  const [photoCount, setPhotoCount] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Manual Mode Store
  const manualSettings = useManualModeStore();
  const isManualMode = manualSettings.enabled;

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

  const handleResetToAuto = () => {
    manualSettings.resetToAuto();
    setShowResetDialog(false);
  };

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
          Manueller Modus
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 py-6 space-y-8">
          {/* MANUAL MODE SECTION */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4" data-testid="section-manual-mode">
              Professionelle Steuerung
            </h2>
            
            {/* Manual Mode Toggle */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-[#4A5849]" />
                  <div>
                    <div className="text-gray-900 text-base font-medium" data-testid="label-manual-mode">
                      Manueller Modus
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Volle Kontrolle über Kamera-Einstellungen
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => manualSettings.setEnabled(!isManualMode)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isManualMode ? 'bg-[#4A5849]' : 'bg-gray-300'
                  }`}
                  data-testid="toggle-manual-mode"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      isManualMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Manual Settings Preview (when enabled) */}
              {isManualMode && (
                <>
                  <SettingRow
                    label="ISO"
                    value={formatISO(manualSettings.iso)}
                    testId="setting-iso"
                  />
                  <SettingRow
                    label="Verschlusszeit"
                    value={formatShutterSpeed(manualSettings.shutterSpeed)}
                    testId="setting-shutter"
                  />
                  <SettingRow
                    label="Weißabgleich"
                    value={formatWhiteBalance(manualSettings.whiteBalanceKelvin)}
                    testId="setting-wb"
                  />
                  <SettingRow
                    label="Fokus"
                    value={manualSettings.focusMode === 'auto' ? 'Automatisch' : 'Manuell'}
                    testId="setting-focus"
                  />
                  <SettingRow
                    label="EV"
                    value={formatExposureComp(manualSettings.exposureCompensation)}
                    testId="setting-ev"
                  />
                  <SettingRow
                    label="Dateiformat"
                    value={manualSettings.fileFormat.toUpperCase()}
                    testId="setting-format"
                    noBorder
                  />
                </>
              )}
            </div>

            {/* Reset to Auto Button */}
            {isManualMode && (
              <HapticButton
                onClick={() => setShowResetDialog(true)}
                hapticStyle="medium"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 text-[#4A5849] font-medium"
                data-testid="button-reset-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Auf Auto zurücksetzen
              </HapticButton>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Manuelle Kontrollen</p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  Aktivieren Sie den manuellen Modus für professionelle Steuerung von ISO, Verschlusszeit, 
                  Weißabgleich, Fokus und mehr. Alle Einstellungen werden persistent gespeichert.
                </p>
              </div>
            </div>
          </div>

          {/* ADVANCED CAMERA SETTINGS (only when manual mode enabled) */}
          {isManualMode && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4" data-testid="section-advanced">
                Erweiterte Einstellungen
              </h2>
              
              {/* Grid Type */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-gray-900 text-base font-medium">Raster-Typ</span>
                </div>
                <div className="p-2 space-y-1">
                  {(['none', '3x3', 'golden-ratio'] as const).map((type) => (
                    <HapticButton
                      key={type}
                      onClick={() => manualSettings.setGridType(type)}
                      hapticStyle="light"
                      className={`w-full px-3 py-2 rounded-lg text-left transition-all ${
                        manualSettings.gridType === type
                          ? 'bg-[#4A5849] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      data-testid={`button-grid-${type}`}
                    >
                      {type === 'none' && 'Kein Raster'}
                      {type === '3x3' && '3×3 Raster (Drittel-Regel)'}
                      {type === 'golden-ratio' && 'Goldener Schnitt'}
                    </HapticButton>
                  ))}
                </div>
              </div>

              {/* Horizon Level & Metering */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ToggleRow
                  label="Horizont-Wasserwaage"
                  enabled={manualSettings.horizonLevelEnabled}
                  onChange={manualSettings.setHorizonLevel}
                  testId="toggle-horizon"
                />
                <div className="px-4 py-3 border-t border-b border-gray-100">
                  <span className="text-gray-900 text-base font-medium">Belichtungsmessung</span>
                </div>
                <div className="p-2 space-y-1">
                  {(['matrix', 'center', 'spot'] as const).map((mode) => (
                    <HapticButton
                      key={mode}
                      onClick={() => manualSettings.setMeteringMode(mode)}
                      hapticStyle="light"
                      className={`w-full px-3 py-2 rounded-lg text-left transition-all ${
                        manualSettings.meteringMode === mode
                          ? 'bg-[#4A5849] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      data-testid={`button-metering-${mode}`}
                    >
                      {mode === 'matrix' && 'Matrix (gesamtes Bild)'}
                      {mode === 'center' && 'Mittenbetont'}
                      {mode === 'spot' && 'Spotmessung (Mitte)'}
                    </HapticButton>
                  ))}
                </div>
              </div>

              {/* OIS, Tripod, Night Mode */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <ToggleRow
                  label="Bildstabilisierung (OIS)"
                  enabled={manualSettings.oisEnabled}
                  onChange={manualSettings.setOIS}
                  testId="toggle-ois"
                  subtitle="Reduziert Verwacklungen"
                />
                <ToggleRow
                  label="Stativ-Modus"
                  enabled={manualSettings.tripodMode}
                  onChange={manualSettings.setTripodMode}
                  testId="toggle-tripod"
                  subtitle="Deaktiviert OIS, verlängert Belichtung"
                />
                <ToggleRow
                  label="Nachtmodus"
                  enabled={manualSettings.nightMode}
                  onChange={manualSettings.setNightMode}
                  testId="toggle-night"
                  subtitle="Optimiert für schwaches Licht"
                  noBorder
                />
              </div>

              {/* Info */}
              <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">Professionelle Features</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Diese Einstellungen bieten erweiterte Kontrolle für professionelle Immobilienfotografie. 
                    Nutzen Sie den Goldenen Schnitt für optimale Komposition.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* EXISTING SECTIONS */}
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

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl mx-6 overflow-hidden shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Auf Auto zurücksetzen?
              </h3>
              <p className="text-gray-600 text-sm">
                Alle manuellen Einstellungen werden auf die Standardwerte zurückgesetzt. 
                Der manuelle Modus bleibt aktiv.
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 py-4 text-center text-[#4A5849] font-medium"
                data-testid="button-cancel-reset"
              >
                Abbrechen
              </button>
              <button
                onClick={handleResetToAuto}
                className="flex-1 py-4 text-center text-red-600 font-semibold border-l border-gray-200"
                data-testid="button-confirm-reset"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav photoCount={photoCount} variant="light" />
    </div>
  );
}

/**
 * Reusable Setting Row Component
 */
interface SettingRowProps {
  label: string;
  value: string;
  testId: string;
  noBorder?: boolean;
}

function SettingRow({ label, value, testId, noBorder = false }: SettingRowProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        !noBorder ? 'border-b border-gray-100' : ''
      }`}
    >
      <span className="text-gray-900 text-base" data-testid={testId}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-base" data-testid={`${testId}-value`}>
          {value}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={2} />
      </div>
    </div>
  );
}

/**
 * Toggle Row Component
 */
interface ToggleRowProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  testId: string;
  subtitle?: string;
  noBorder?: boolean;
}

function ToggleRow({ label, enabled, onChange, testId, subtitle, noBorder = false }: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        !noBorder ? 'border-b border-gray-100' : ''
      }`}
    >
      <div>
        <div className="text-gray-900 text-base" data-testid={testId}>
          {label}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-[#4A5849]' : 'bg-gray-300'
        }`}
        data-testid={`${testId}-switch`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
