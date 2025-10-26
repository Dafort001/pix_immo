/**
 * Manual Mode Controls Panel
 * Professional camera controls overlay for landscape mode
 */

import { useState } from 'react';
import { useManualModeStore } from '@/lib/manual-mode/store';
import {
  formatISO,
  formatShutterSpeed,
  formatWhiteBalance,
  formatExposureComp,
  ISO_LIMITS,
  SHUTTER_LIMITS,
  SHUTTER_PRESETS,
  WHITE_BALANCE_PRESETS,
} from '@/lib/manual-mode/types';
import { 
  Sliders,
  Sun,
  Droplets,
  Focus,
  FileImage,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HapticButton } from './HapticButton';

interface ManualControlsProps {
  onClose?: () => void;
}

export function ManualControls({ onClose }: ManualControlsProps) {
  const settings = useManualModeStore();
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  if (!settings.enabled) return null;

  const togglePanel = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end pointer-events-none">
      {/* Main Controls Panel - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute bottom-20 right-4 pointer-events-auto"
      >
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Manuelle Kontrolle</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white"
                data-testid="button-close-manual"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Settings */}
          <div className="p-3 space-y-2">
            {/* ISO Control */}
            <ControlRow
              icon={<Zap className="w-4 h-4" />}
              label="ISO"
              value={formatISO(settings.iso)}
              isActive={expandedPanel === 'iso'}
              onClick={() => togglePanel('iso')}
              testId="control-iso"
            />

            {/* Shutter Speed */}
            <ControlRow
              icon={<Sliders className="w-4 h-4" />}
              label="Verschluss"
              value={formatShutterSpeed(settings.shutterSpeed)}
              isActive={expandedPanel === 'shutter'}
              onClick={() => togglePanel('shutter')}
              testId="control-shutter"
            />

            {/* White Balance */}
            <ControlRow
              icon={<Sun className="w-4 h-4" />}
              label="Weißabgleich"
              value={formatWhiteBalance(settings.whiteBalanceKelvin)}
              isActive={expandedPanel === 'wb'}
              onClick={() => togglePanel('wb')}
              testId="control-wb"
            />

            {/* Exposure Compensation */}
            <ControlRow
              icon={<Sun className="w-4 h-4" />}
              label="Belichtung"
              value={formatExposureComp(settings.exposureCompensation)}
              isActive={expandedPanel === 'ev'}
              onClick={() => togglePanel('ev')}
              testId="control-ev"
            />

            {/* Focus */}
            <ControlRow
              icon={<Focus className="w-4 h-4" />}
              label="Fokus"
              value={settings.focusMode === 'auto' ? 'Auto' : 'Manuell'}
              isActive={expandedPanel === 'focus'}
              onClick={() => togglePanel('focus')}
              testId="control-focus"
            />

            {/* File Format */}
            <ControlRow
              icon={<FileImage className="w-4 h-4" />}
              label="Format"
              value={settings.fileFormat.toUpperCase()}
              isActive={expandedPanel === 'format'}
              onClick={() => togglePanel('format')}
              testId="control-format"
            />
          </div>
        </div>
      </motion.div>

      {/* Expanded Panel Overlay */}
      <AnimatePresence>
        {expandedPanel === 'iso' && (
          <ISOPanel
            value={settings.iso}
            onChange={settings.setISO}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'shutter' && (
          <ShutterPanel
            value={settings.shutterSpeed}
            onChange={settings.setShutterSpeed}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'wb' && (
          <WhiteBalancePanel
            kelvin={settings.whiteBalanceKelvin}
            preset={settings.whiteBalancePreset}
            onKelvinChange={settings.setWhiteBalanceKelvin}
            onPresetChange={settings.setWhiteBalancePreset}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'ev' && (
          <ExposureCompensationPanel
            value={settings.exposureCompensation}
            onChange={settings.setExposureComp}
            histogramEnabled={settings.histogramEnabled}
            onHistogramToggle={settings.setHistogram}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'focus' && (
          <FocusPanel
            mode={settings.focusMode}
            distance={settings.focusDistance}
            peakingEnabled={settings.focusPeakingEnabled}
            onModeChange={settings.setFocusMode}
            onDistanceChange={settings.setFocusDistance}
            onPeakingToggle={settings.setFocusPeaking}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'format' && (
          <FileFormatPanel
            format={settings.fileFormat}
            onChange={settings.setFileFormat}
            onClose={() => setExpandedPanel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Control Row Component
 */
interface ControlRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  testId: string;
}

function ControlRow({ icon, label, value, isActive, onClick, testId }: ControlRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <div className={isActive ? 'text-white' : 'text-white/50'}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{value}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
}

/**
 * ISO Control Panel
 */
interface ISOPanelProps {
  value: number | 'auto';
  onChange: (value: number | 'auto') => void;
  onClose: () => void;
}

function ISOPanel({ value, onChange, onClose }: ISOPanelProps) {
  const isAuto = value === 'auto';
  const numericValue = isAuto ? ISO_LIMITS.DEFAULT : value;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">ISO Einstellungen</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-iso-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto ISO Button */}
        <HapticButton
          onClick={() => onChange('auto')}
          hapticStyle="light"
          className={`w-full mb-4 py-3 rounded-xl font-medium transition-all ${
            isAuto
              ? 'bg-[#4A5849] text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          data-testid="button-iso-auto"
        >
          Auto ISO
        </HapticButton>

        {/* ISO Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Manuell</span>
            <span className="text-white text-lg font-mono font-semibold">
              {formatISO(numericValue)}
            </span>
          </div>
          
          <input
            type="range"
            min={ISO_LIMITS.MIN}
            max={ISO_LIMITS.MAX}
            step="50"
            value={numericValue}
            onChange={(e) => onChange(parseInt(e.target.value))}
            disabled={isAuto}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isAuto
                ? undefined
                : `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                    ((numericValue - ISO_LIMITS.MIN) / (ISO_LIMITS.MAX - ISO_LIMITS.MIN)) * 100
                  }%, rgba(255,255,255,0.2) ${
                    ((numericValue - ISO_LIMITS.MIN) / (ISO_LIMITS.MAX - ISO_LIMITS.MIN)) * 100
                  }%, rgba(255,255,255,0.2) 100%)`,
            }}
            data-testid="slider-iso"
          />

          <div className="flex justify-between text-xs text-white/50">
            <span>{ISO_LIMITS.MIN}</span>
            <span>{ISO_LIMITS.MAX}</span>
          </div>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Niedrige ISO-Werte (32-400) für helle Bedingungen, höhere Werte (800-6400) für 
          schwaches Licht. Höhere ISO erhöht Bildrauschen.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Shutter Speed Control Panel
 */
interface ShutterPanelProps {
  value: number | 'auto';
  onChange: (value: number | 'auto') => void;
  onClose: () => void;
}

function ShutterPanel({ value, onChange, onClose }: ShutterPanelProps) {
  const isAuto = value === 'auto';
  const numericValue = isAuto ? 1 / 250 : value;

  // Convert to logarithmic scale for better UX
  const valueToSlider = (v: number) => Math.log2(v / SHUTTER_LIMITS.MIN);
  const sliderToValue = (s: number) => SHUTTER_LIMITS.MIN * Math.pow(2, s);

  const sliderValue = valueToSlider(numericValue);
  const sliderMax = valueToSlider(SHUTTER_LIMITS.MAX);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Verschlusszeit</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-shutter-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Button */}
        <HapticButton
          onClick={() => onChange('auto')}
          hapticStyle="light"
          className={`w-full mb-4 py-3 rounded-xl font-medium transition-all ${
            isAuto
              ? 'bg-[#4A5849] text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          data-testid="button-shutter-auto"
        >
          Auto Verschluss
        </HapticButton>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <HapticButton
            onClick={() => onChange(SHUTTER_PRESETS.DAY)}
            hapticStyle="light"
            className="py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg text-xs font-medium"
            data-testid="button-shutter-day"
          >
            Tag (1/500)
          </HapticButton>
          <HapticButton
            onClick={() => onChange(SHUTTER_PRESETS.DUSK)}
            hapticStyle="light"
            className="py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg text-xs font-medium"
            data-testid="button-shutter-dusk"
          >
            Dämmerung (1/60)
          </HapticButton>
          <HapticButton
            onClick={() => onChange(SHUTTER_PRESETS.NIGHT)}
            hapticStyle="light"
            className="py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg text-xs font-medium"
            data-testid="button-shutter-night"
          >
            Nacht (1s)
          </HapticButton>
        </div>

        {/* Shutter Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Manuell</span>
            <span className="text-white text-lg font-mono font-semibold">
              {formatShutterSpeed(numericValue)}
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max={sliderMax}
            step="0.1"
            value={sliderValue}
            onChange={(e) => onChange(sliderToValue(parseFloat(e.target.value)))}
            disabled={isAuto}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isAuto
                ? undefined
                : `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                    (sliderValue / sliderMax) * 100
                  }%, rgba(255,255,255,0.2) ${
                    (sliderValue / sliderMax) * 100
                  }%, rgba(255,255,255,0.2) 100%)`,
            }}
            data-testid="slider-shutter"
          />

          <div className="flex justify-between text-xs text-white/50">
            <span>1/8000s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Warning for long exposures */}
        {!isAuto && numericValue >= SHUTTER_LIMITS.HAND_HELD_WARNING && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-200 text-xs">
              ⚠️ Gerät ruhig halten! Für Belichtungen ≥1s empfehlen wir ein Stativ.
            </p>
          </div>
        )}

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Kurze Verschlusszeiten (1/500s) für bewegte Motive, längere (≥1s) für Low-Light. 
          Verwenden Sie ein Stativ für Belichtungen über 1 Sekunde.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * White Balance Control Panel
 */
interface WhiteBalancePanelProps {
  kelvin: number;
  preset: string;
  onKelvinChange: (kelvin: number) => void;
  onPresetChange: (preset: any) => void;
  onClose: () => void;
}

function WhiteBalancePanel({
  kelvin,
  preset,
  onKelvinChange,
  onPresetChange,
  onClose,
}: WhiteBalancePanelProps) {
  const presets = [
    { key: 'daylight', label: 'Tageslicht', kelvin: WHITE_BALANCE_PRESETS.daylight },
    { key: 'cloudy', label: 'Bewölkt', kelvin: WHITE_BALANCE_PRESETS.cloudy },
    { key: 'tungsten', label: 'Glühlampe', kelvin: WHITE_BALANCE_PRESETS.tungsten },
    { key: 'fluorescent', label: 'Neon', kelvin: WHITE_BALANCE_PRESETS.fluorescent },
    { key: 'shade', label: 'Schatten', kelvin: WHITE_BALANCE_PRESETS.shade },
    { key: 'custom', label: 'Benutzerdefiniert', kelvin: kelvin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Weißabgleich</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-wb-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {presets.slice(0, -1).map((p) => (
            <HapticButton
              key={p.key}
              onClick={() => {
                onPresetChange(p.key);
                onKelvinChange(p.kelvin);
              }}
              hapticStyle="light"
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                preset === p.key
                  ? 'bg-[#4A5849] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              data-testid={`button-wb-${p.key}`}
            >
              {p.label}
            </HapticButton>
          ))}
        </div>

        {/* Kelvin Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Kelvin</span>
            <span className="text-white text-lg font-mono font-semibold">
              {formatWhiteBalance(kelvin)}
            </span>
          </div>
          
          <input
            type="range"
            min="2800"
            max="7500"
            step="100"
            value={kelvin}
            onChange={(e) => onKelvinChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                ((kelvin - 2800) / (7500 - 2800)) * 100
              }%, rgba(255,255,255,0.2) ${
                ((kelvin - 2800) / (7500 - 2800)) * 100
              }%, rgba(255,255,255,0.2) 100%)`,
            }}
            data-testid="slider-wb-kelvin"
          />

          <div className="flex justify-between text-xs text-white/50">
            <span>2800K (Warm)</span>
            <span>7500K (Kalt)</span>
          </div>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Niedrige Kelvin-Werte (2800-4000K) für warmes Licht, höhere Werte (5500-7500K) für 
          kühles Tageslicht. Passen Sie den Farbton an Ihre Lichtquelle an.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Exposure Compensation (EV) Panel
 */
interface ExposureCompensationPanelProps {
  value: number;
  onChange: (value: number) => void;
  histogramEnabled: boolean;
  onHistogramToggle: (enabled: boolean) => void;
  onClose: () => void;
}

function ExposureCompensationPanel({
  value,
  onChange,
  histogramEnabled,
  onHistogramToggle,
  onClose,
}: ExposureCompensationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Belichtungskorrektur</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-ev-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reset Button */}
        <HapticButton
          onClick={() => onChange(0)}
          hapticStyle="light"
          className={`w-full mb-4 py-3 rounded-xl font-medium transition-all ${
            value === 0
              ? 'bg-[#4A5849] text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          data-testid="button-ev-reset"
        >
          ±0 (Standard)
        </HapticButton>

        {/* EV Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Korrektur</span>
            <span className="text-white text-lg font-mono font-semibold">
              {formatExposureComp(value)}
            </span>
          </div>
          
          <input
            type="range"
            min="-2"
            max="2"
            step="0.33"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                ((value + 2) / 4) * 100
              }%, rgba(255,255,255,0.2) ${
                ((value + 2) / 4) * 100
              }%, rgba(255,255,255,0.2) 100%)`,
            }}
            data-testid="slider-ev"
          />

          <div className="flex justify-between text-xs text-white/50">
            <span>-2 (Dunkler)</span>
            <span>+2 (Heller)</span>
          </div>
        </div>

        {/* Histogram Toggle */}
        <div className="mt-4 flex items-center justify-between p-3 bg-white/10 rounded-lg">
          <span className="text-white text-sm">Histogram anzeigen</span>
          <button
            onClick={() => onHistogramToggle(!histogramEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              histogramEnabled ? 'bg-[#4A5849]' : 'bg-gray-600'
            }`}
            data-testid="toggle-histogram"
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                histogramEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Negative Werte (bis -2) machen das Bild dunkler, positive Werte (bis +2) heller. 
          Nutzen Sie dies für schwierige Lichtverhältnisse.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Focus Control Panel
 */
interface FocusPanelProps {
  mode: 'auto' | 'manual';
  distance: number | null;
  peakingEnabled: boolean;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onDistanceChange: (distance: number | null) => void;
  onPeakingToggle: (enabled: boolean) => void;
  onClose: () => void;
}

function FocusPanel({
  mode,
  distance,
  peakingEnabled,
  onModeChange,
  onDistanceChange,
  onPeakingToggle,
  onClose,
}: FocusPanelProps) {
  const isAuto = mode === 'auto';
  const numericDistance = distance ?? 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Fokus-Steuerung</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-focus-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <HapticButton
            onClick={() => {
              onModeChange('auto');
              onDistanceChange(null);
            }}
            hapticStyle="light"
            className={`py-3 rounded-xl font-medium transition-all ${
              isAuto
                ? 'bg-[#4A5849] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            data-testid="button-focus-auto"
          >
            Autofokus
          </HapticButton>
          <HapticButton
            onClick={() => onModeChange('manual')}
            hapticStyle="light"
            className={`py-3 rounded-xl font-medium transition-all ${
              !isAuto
                ? 'bg-[#4A5849] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            data-testid="button-focus-manual"
          >
            Manuell
          </HapticButton>
        </div>

        {/* Manual Focus Distance */}
        {!isAuto && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Fokus-Distanz</span>
              <span className="text-white text-lg font-mono font-semibold">
                {(numericDistance * 100).toFixed(0)}%
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={numericDistance}
              onChange={(e) => onDistanceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                  numericDistance * 100
                }%, rgba(255,255,255,0.2) ${
                  numericDistance * 100
                }%, rgba(255,255,255,0.2) 100%)`,
              }}
              data-testid="slider-focus-distance"
            />

            <div className="flex justify-between text-xs text-white/50">
              <span>Nah</span>
              <span>Unendlich</span>
            </div>
          </div>
        )}

        {/* Focus Peaking Toggle */}
        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
          <div>
            <span className="text-white text-sm font-medium">Focus Peaking</span>
            <p className="text-white/50 text-xs mt-0.5">
              Hebt scharfe Kanten hervor
            </p>
          </div>
          <button
            onClick={() => onPeakingToggle(!peakingEnabled)}
            disabled={isAuto}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              peakingEnabled && !isAuto ? 'bg-[#4A5849]' : 'bg-gray-600'
            } ${isAuto ? 'opacity-30 cursor-not-allowed' : ''}`}
            data-testid="toggle-focus-peaking"
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                peakingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Im manuellen Modus können Sie die Fokus-Distanz präzise einstellen. 
          Focus Peaking hilft beim präzisen Fokussieren.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * File Format Selection Panel
 */
interface FileFormatPanelProps {
  format: 'heic' | 'jpg' | 'raw';
  onChange: (format: 'heic' | 'jpg' | 'raw') => void;
  onClose: () => void;
}

function FileFormatPanel({ format, onChange, onClose }: FileFormatPanelProps) {
  const formats = [
    {
      value: 'jpg' as const,
      label: 'JPEG',
      description: 'Komprimiert, kleine Dateigröße',
      size: '~3 MB',
    },
    {
      value: 'heic' as const,
      label: 'HEIC',
      description: 'Apple Format, beste Kompression',
      size: '~2 MB',
    },
    {
      value: 'raw' as const,
      label: 'RAW (DNG)',
      description: 'Unkomprimiert, maximale Qualität',
      size: '~25 MB',
      warning: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mx-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold">Dateiformat</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-format-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Options */}
        <div className="space-y-2">
          {formats.map((f) => (
            <HapticButton
              key={f.value}
              onClick={() => onChange(f.value)}
              hapticStyle="light"
              className={`w-full p-4 rounded-xl text-left transition-all ${
                format === f.value
                  ? 'bg-[#4A5849] text-white border-2 border-white/20'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-transparent'
              }`}
              data-testid={`button-format-${f.value}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-base">{f.label}</div>
                  <div className={`text-xs mt-1 ${format === f.value ? 'text-white/80' : 'text-white/50'}`}>
                    {f.description}
                  </div>
                </div>
                <div className={`text-xs font-mono ml-3 ${format === f.value ? 'text-white/80' : 'text-white/50'}`}>
                  {f.size}
                </div>
              </div>
            </HapticButton>
          ))}
        </div>

        {/* RAW Warning */}
        {format === 'raw' && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-200 text-xs leading-relaxed">
              ⚠️ RAW-Dateien benötigen ~25 MB pro Foto. Stellen Sie sicher, dass genügend Speicherplatz verfügbar ist.
            </p>
          </div>
        )}

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          JPEG bietet die beste Balance zwischen Qualität und Dateigröße. RAW bietet maximale 
          Flexibilität bei der Nachbearbeitung.
        </p>
      </div>
    </motion.div>
  );
}
