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
import { isProCapable, useDeviceProfileStore } from '@/lib/device-profile/store';
import { registerAsOfficePro } from '@/lib/device-profile/detection';
import { 
  Sliders,
  Sun,
  Droplets,
  Focus,
  FileImage,
  X,
  ChevronRight,
  Zap,
  Eye,
  Grid3x3,
  Camera,
  ZoomIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HapticButton } from './HapticButton';
import { Switch } from '@/components/ui/switch';

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
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
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
            
            {/* Expert Mode Toggle */}
            <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
              <span className="text-white/70 text-xs font-medium">Expertenmodus</span>
              <Switch
                checked={settings.expertMode}
                onCheckedChange={settings.setExpertMode}
                data-testid="switch-expert-mode"
              />
            </div>
          </div>

          {/* Quick Settings */}
          <div className="p-3 space-y-2">
            {/* Expert Mode Only Controls */}
            {settings.expertMode && (
              <>
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

                {/* White Balance (Kelvin) */}
                <ControlRow
                  icon={<Sun className="w-4 h-4" />}
                  label="Weißabgleich"
                  value={formatWhiteBalance(settings.whiteBalanceKelvin)}
                  isActive={expandedPanel === 'wb'}
                  onClick={() => togglePanel('wb')}
                  testId="control-wb"
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
              </>
            )}

            {/* Exposure Compensation */}
            <ControlRow
              icon={<Sun className="w-4 h-4" />}
              label="Belichtung"
              value={formatExposureComp(settings.exposureCompensation)}
              isActive={expandedPanel === 'ev'}
              onClick={() => togglePanel('ev')}
              testId="control-ev"
            />

            {/* HDR Brackets */}
            <ControlRow
              icon={<Camera className="w-4 h-4" />}
              label="HDR"
              value={`${settings.hdrBrackets} Brackets`}
              isActive={expandedPanel === 'hdr'}
              onClick={() => togglePanel('hdr')}
              testId="control-hdr"
            />

            {/* Zoom/Lens */}
            <ControlRow
              icon={<ZoomIn className="w-4 h-4" />}
              label="Objektiv"
              value={`${settings.zoomLevel}×`}
              isActive={expandedPanel === 'zoom'}
              onClick={() => togglePanel('zoom')}
              testId="control-zoom"
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

            {/* Display & Level */}
            <ControlRow
              icon={<Grid3x3 className="w-4 h-4" />}
              label="Anzeige"
              value={settings.showLevelIndicator ? 'Level Ein' : 'Level Aus'}
              isActive={expandedPanel === 'display'}
              onClick={() => togglePanel('display')}
              testId="control-display"
            />

            {/* Capture Thumbnail */}
            <ControlRow
              icon={<Eye className="w-4 h-4" />}
              label="Vorschau"
              value={settings.showCaptureThumb ? 'Thumb Ein' : 'Thumb Aus'}
              isActive={expandedPanel === 'thumbnail'}
              onClick={() => togglePanel('thumbnail')}
              testId="control-thumbnail"
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
        {expandedPanel === 'hdr' && (
          <HDRPanel
            brackets={settings.hdrBrackets}
            onChange={settings.setHdrBrackets}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'zoom' && (
          <ZoomPanel
            zoom={settings.zoomLevel}
            onChange={settings.setZoomLevel}
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
        {expandedPanel === 'display' && (
          <DisplayPanel
            showLevelIndicator={settings.showLevelIndicator}
            showLevelDegrees={settings.showLevelDegrees}
            levelSensitivity={settings.levelSensitivity}
            onLevelIndicatorToggle={settings.setLevelIndicator}
            onLevelDegreesToggle={settings.setLevelDegrees}
            onSensitivityChange={settings.setLevelSensitivity}
            onClose={() => setExpandedPanel(null)}
          />
        )}
        {expandedPanel === 'thumbnail' && (
          <ThumbnailPanel
            showCaptureThumb={settings.showCaptureThumb}
            autoHideThumb={settings.autoHideThumb}
            showThumbProgress={settings.showThumbProgress}
            onCaptureThumbToggle={settings.setCaptureThumb}
            onAutoHideToggle={settings.setAutoHideThumb}
            onProgressToggle={settings.setThumbProgress}
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
            min="-4"
            max="4"
            step="0.33"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4A5849 0%, #4A5849 ${
                ((value + 4) / 8) * 100
              }%, rgba(255,255,255,0.2) ${
                ((value + 4) / 8) * 100
              }%, rgba(255,255,255,0.2) 100%)`,
            }}
            data-testid="slider-ev"
          />

          <div className="flex justify-between text-xs text-white/50">
            <span>-4 (Dunkler)</span>
            <span>+4 (Heller)</span>
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
          Negative Werte (bis -4) machen das Bild dunkler, positive Werte (bis +4) heller. 
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
  // Device capability check (ProRAW support)
  const hasProRAWCapability = isProCapable();
  const isOfficePro = useDeviceProfileStore((state) => state.office_pro);
  
  // RAW is only available if BOTH conditions are met
  const canUseRAW = hasProRAWCapability && isOfficePro;
  const needsRegistration = hasProRAWCapability && !isOfficePro;
  
  const handleRegister = async () => {
    await registerAsOfficePro();
    // Note: Sync queue integration for backend sync will be added in next task
  };
  
  type FormatOption = {
    value: 'heic' | 'jpg' | 'raw';
    label: string;
    description: string;
    size: string;
  };
  
  const formats: FormatOption[] = [
    {
      value: 'jpg',
      label: 'JPEG',
      description: 'Komprimiert, kleine Dateigröße',
      size: '~3 MB',
    },
    {
      value: 'heic',
      label: 'HEIC',
      description: 'Apple Format, beste Kompression',
      size: '~2 MB',
    },
  ];
  
  // Only add RAW option if device and account support it
  if (canUseRAW) {
    formats.push({
      value: 'raw',
      label: 'RAW (DNG)',
      description: 'Unkomprimiert, maximale Qualität',
      size: '~25 MB',
    });
  }

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
        
        {/* Office-Pro Registration Button */}
        {needsRegistration && (
          <div className="mt-4 p-4 bg-[#A85B2E]/20 border border-[#A85B2E]/40 rounded-lg">
            <p className="text-[#A85B2E] text-xs leading-relaxed mb-3">
              <span className="font-semibold">ProRAW-fähiges Gerät erkannt!</span>
              <br />
              Registrieren Sie dieses Gerät als Office-Pro, um RAW/DNG-Funktionen freizuschalten.
            </p>
            <HapticButton
              onClick={handleRegister}
              hapticStyle="medium"
              className="w-full py-2.5 px-4 bg-[#A85B2E] hover:bg-[#A85B2E]/90 text-white font-semibold rounded-lg transition-colors"
              data-testid="button-register-office-pro"
            >
              Dieses Gerät als Office-Pro registrieren
            </HapticButton>
          </div>
        )}
        
        {/* RAW Not Available Info (Non-Pro Device) */}
        {!hasProRAWCapability && (
          <div className="mt-4 p-3 bg-white/10 border border-white/20 rounded-lg">
            <p className="text-white/70 text-xs leading-relaxed">
              ℹ️ <span className="font-semibold">RAW nur auf Pro-Geräten verfügbar</span>
              <br />
              Dieses Gerät unterstützt kein ProRAW. Verwenden Sie ein iPhone Pro-Modell für RAW-Aufnahmen.
            </p>
          </div>
        )}

        {/* RAW Warning */}
        {format === 'raw' && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-200 text-xs leading-relaxed">
              ⚠️ RAW-Dateien benötigen ~25 MB pro Foto. Stellen Sie sicher, dass genügend Speicherplatz verfügbar ist.
            </p>
          </div>
        )}

        {/* Office-Pro Vorteile Info */}
        <div className="mt-4 p-3 bg-[#4A5849]/20 border border-[#4A5849]/30 rounded-lg">
          <p className="text-[#A85B2E] text-xs font-semibold mb-1">Office-Pro Vorteile</p>
          <p className="text-white/70 text-xs leading-relaxed">
            RAW (DNG) • Bessere Retusche • Premium-Exposé
          </p>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          JPEG bietet die beste Balance zwischen Qualität und Dateigröße. RAW bietet maximale 
          Flexibilität bei der Nachbearbeitung.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Display & Level Indicator Panel
 */
interface DisplayPanelProps {
  showLevelIndicator: boolean;
  showLevelDegrees: boolean;
  levelSensitivity: 'standard' | 'strict' | 'loose';
  onLevelIndicatorToggle: (enabled: boolean) => void;
  onLevelDegreesToggle: (enabled: boolean) => void;
  onSensitivityChange: (sensitivity: 'standard' | 'strict' | 'loose') => void;
  onClose: () => void;
}

function DisplayPanel({
  showLevelIndicator,
  showLevelDegrees,
  levelSensitivity,
  onLevelIndicatorToggle,
  onLevelDegreesToggle,
  onSensitivityChange,
  onClose,
}: DisplayPanelProps) {
  const sensitivityOptions = [
    {
      value: 'loose' as const,
      label: 'Locker',
      description: '±1.0° Roll / ±1.5° Pitch',
    },
    {
      value: 'standard' as const,
      label: 'Standard',
      description: '±0.5° Roll / ±1.0° Pitch',
    },
    {
      value: 'strict' as const,
      label: 'Streng',
      description: '±0.3° Roll / ±0.8° Pitch',
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
          <h3 className="text-white text-lg font-semibold">Anzeige & Level</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-display-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Indicator Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm font-medium">Level-Indicator</label>
            <button
              onClick={() => onLevelIndicatorToggle(!showLevelIndicator)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                showLevelIndicator ? 'bg-[#4A5849]' : 'bg-gray-600'
              }`}
              data-testid="toggle-level-indicator"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  showLevelIndicator ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-white/50">
            Zeigt ein Fadenkreuz in der Bildmitte mit Sensor-basierter Level-Erkennung
          </p>
        </div>

        {/* Level Degrees Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm font-medium">Grad-Anzeige</label>
            <button
              onClick={() => onLevelDegreesToggle(!showLevelDegrees)}
              disabled={!showLevelIndicator}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                showLevelDegrees && showLevelIndicator ? 'bg-[#4A5849]' : 'bg-gray-600'
              } ${!showLevelIndicator ? 'opacity-30 cursor-not-allowed' : ''}`}
              data-testid="toggle-level-degrees"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  showLevelDegrees ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-white/50">
            Zeigt numerische Winkel-Werte unter dem Level-Indicator
          </p>
        </div>

        {/* Sensitivity Presets */}
        <div className="mb-4">
          <label className="text-white text-sm font-medium block mb-3">Empfindlichkeit</label>
          <div className="space-y-2">
            {sensitivityOptions.map((option) => (
              <HapticButton
                key={option.value}
                onClick={() => onSensitivityChange(option.value)}
                disabled={!showLevelIndicator}
                hapticStyle="light"
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  levelSensitivity === option.value && showLevelIndicator
                    ? 'bg-[#4A5849] text-white border-2 border-white/20'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-transparent'
                } ${!showLevelIndicator ? 'opacity-30 cursor-not-allowed' : ''}`}
                data-testid={`button-sensitivity-${option.value}`}
              >
                <div className="font-medium">{option.label}</div>
                <div className={`text-xs mt-0.5 ${
                  levelSensitivity === option.value ? 'text-white/80' : 'text-white/50'
                }`}>
                  {option.description}
                </div>
              </HapticButton>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Der Level-Indicator hilft bei präziser Kamera-Ausrichtung. 
          Bei erfolgreicher Level-Erkennung erhalten Sie haptisches Feedback.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Capture Thumbnail Settings Panel
 */
interface ThumbnailPanelProps {
  showCaptureThumb: boolean;
  autoHideThumb: boolean;
  showThumbProgress: boolean;
  onCaptureThumbToggle: (enabled: boolean) => void;
  onAutoHideToggle: (enabled: boolean) => void;
  onProgressToggle: (enabled: boolean) => void;
  onClose: () => void;
}

function ThumbnailPanel({
  showCaptureThumb,
  autoHideThumb,
  showThumbProgress,
  onCaptureThumbToggle,
  onAutoHideToggle,
  onProgressToggle,
  onClose,
}: ThumbnailPanelProps) {
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
          <h3 className="text-white text-lg font-semibold">Aufnahme-Vorschau</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-thumbnail-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm font-medium">Aufnahmesatz-Thumbnail anzeigen</label>
            <button
              onClick={() => onCaptureThumbToggle(!showCaptureThumb)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                showCaptureThumb ? 'bg-[#4A5849]' : 'bg-gray-600'
              }`}
              data-testid="toggle-capture-thumb"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  showCaptureThumb ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-white/50">
            Zeigt nach jeder Aufnahme ein Vorschaubild unten links
          </p>
        </div>

        {/* Sub-Options (only visible when main toggle is on) */}
        {showCaptureThumb && (
          <>
            {/* Auto-Hide Toggle */}
            <div className="mb-6 pl-4 border-l-2 border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">Automatisch ausblenden</label>
                <button
                  onClick={() => onAutoHideToggle(!autoHideThumb)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    autoHideThumb ? 'bg-[#4A5849]' : 'bg-gray-600'
                  }`}
                  data-testid="toggle-auto-hide-thumb"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoHideThumb ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-white/50">
                Blendet das Vorschaubild nach 4 Sekunden automatisch aus
              </p>
            </div>

            {/* Progress Toggle */}
            <div className="mb-4 pl-4 border-l-2 border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">Fortschritt anzeigen</label>
                <button
                  onClick={() => onProgressToggle(!showThumbProgress)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    showThumbProgress ? 'bg-[#4A5849]' : 'bg-gray-600'
                  }`}
                  data-testid="toggle-thumb-progress"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      showThumbProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-white/50">
                Zeigt bei Belichtungsreihen den Fortschritt (z.B. "3 / 5")
              </p>
            </div>
          </>
        )}

        {/* Info */}
        <p className="mt-4 text-xs text-white/50 leading-relaxed">
          Das Vorschaubild bestätigt sofort, dass die Aufnahme erfolgreich gespeichert wurde. 
          Bei Belichtungsreihen sehen Sie den Fortschritt in Echtzeit.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * HDR Bracket Selection Panel
 */
interface HDRPanelProps {
  brackets: 3 | 5;
  onChange: (brackets: 3 | 5) => void;
  onClose: () => void;
}

function HDRPanel({ brackets, onChange, onClose }: HDRPanelProps) {
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
          <h3 className="text-white text-lg font-semibold">HDR Belichtungsreihe</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-hdr-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bracket Options */}
        <div className="space-y-3">
          <HapticButton
            onClick={() => onChange(3)}
            hapticStyle="light"
            className={`w-full py-4 rounded-xl font-medium transition-all ${
              brackets === 3
                ? 'bg-[#4A5849] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            data-testid="button-hdr-3"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">3 Brackets</span>
              <span className="text-xs text-white/50">-2 EV, 0 EV, +2 EV</span>
            </div>
          </HapticButton>

          <HapticButton
            onClick={() => onChange(5)}
            hapticStyle="light"
            className={`w-full py-4 rounded-xl font-medium transition-all ${
              brackets === 5
                ? 'bg-[#4A5849] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            data-testid="button-hdr-5"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">5 Brackets</span>
              <span className="text-xs text-white/50">-4, -2, 0, +2, +4 EV</span>
            </div>
          </HapticButton>
        </div>

        {/* Info */}
        <p className="mt-6 text-xs text-white/50 leading-relaxed">
          HDR-Belichtungsreihen erfassen mehrere Aufnahmen mit unterschiedlichen Belichtungsstufen 
          für optimale Ergebnisse bei schwierigen Lichtverhältnissen. 5 Brackets bieten einen 
          größeren Dynamikumfang für extreme Kontraste.
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Zoom/Lens Selection Panel
 */
interface ZoomPanelProps {
  zoom: 0.5 | 1 | 2 | 3;
  onChange: (zoom: 0.5 | 1 | 2 | 3) => void;
  onClose: () => void;
}

function ZoomPanel({ zoom, onChange, onClose }: ZoomPanelProps) {
  const zoomOptions: Array<{ value: 0.5 | 1 | 2 | 3; label: string; description: string }> = [
    { value: 0.5, label: '0.5× Weitwinkel', description: 'Ultra-Weitwinkel für große Räume' },
    { value: 1, label: '1× Standard', description: 'Standard-Brennweite' },
    { value: 2, label: '2× Tele', description: 'Telephoto für Details' },
    { value: 3, label: '3× Tele+', description: 'Starke Vergrößerung' },
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
          <h3 className="text-white text-lg font-semibold">Objektiv / Zoom</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-zoom-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Options */}
        <div className="space-y-3">
          {zoomOptions.map((option) => (
            <HapticButton
              key={option.value}
              onClick={() => onChange(option.value)}
              hapticStyle="light"
              className={`w-full py-4 rounded-xl font-medium transition-all ${
                zoom === option.value
                  ? 'bg-[#4A5849] text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              data-testid={`button-zoom-${option.value}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{option.label}</span>
                <span className="text-xs text-white/50">{option.description}</span>
              </div>
            </HapticButton>
          ))}
        </div>

        {/* Info */}
        <p className="mt-6 text-xs text-white/50 leading-relaxed">
          Wählen Sie die passende Brennweite für Ihre Aufnahme. Weitwinkel (0.5×) eignet sich 
          für große Räume, Standard (1×) für normale Aufnahmen, Tele (2×/3×) für Detailaufnahmen.
        </p>
      </div>
    </motion.div>
  );
}
