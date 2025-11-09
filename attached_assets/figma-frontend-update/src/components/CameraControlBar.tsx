import { Maximize, Home, Settings, Grid3x3, BarChart3 } from 'lucide-react';

interface CameraControlBarProps {
  orientation: 'portrait' | 'landscape';
  safeAreaBottom: number;
  navBarSize?: number;
  gridEnabled: boolean;
  histogramEnabled: boolean;
  onFormatClick: () => void;
  onRoomClick: () => void;
  onShutterClick: () => void;
  onGridToggle: () => void;
  onHistogramToggle: () => void;
  onSettingsClick: () => void;
}

export function CameraControlBar({
  orientation,
  safeAreaBottom,
  navBarSize = 72,
  gridEnabled,
  histogramEnabled,
  onFormatClick,
  onRoomClick,
  onShutterClick,
  onGridToggle,
  onHistogramToggle,
  onSettingsClick,
}: CameraControlBarProps) {
  const isPortrait = orientation === 'portrait';
  const buttonSize = 44;
  const shutterSize = 68;
  const spacing = 16;
  
  const buttons = [
    { icon: Grid3x3, onClick: onGridToggle, active: gridEnabled, label: 'Raster' },
    { icon: Maximize, onClick: onFormatClick, active: false, label: 'Format' },
    { type: 'shutter', onClick: onShutterClick, label: 'Auslöser' },
    { icon: BarChart3, onClick: onHistogramToggle, active: histogramEnabled, label: 'Histogramm' },
    { icon: Settings, onClick: onSettingsClick, active: false, label: 'Einstellungen' },
  ];
  
  return (
    <div
      style={{
        position: 'absolute',
        ...(isPortrait
          ? {
              bottom: safeAreaBottom + navBarSize + 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: `${spacing}px`,
            }
          : {
              right: navBarSize + 16,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${spacing}px`,
            }),
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        padding: '12px',
        borderRadius: '40px',
        zIndex: 20,
      }}
    >
      {buttons.map((button, index) => {
        if (button.type === 'shutter') {
          return (
            <div
              key={index}
              style={{
                width: `${shutterSize}px`,
                height: `${shutterSize}px`,
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onClick={button.onClick}
              onMouseDown={(e) => {
                const target = e.currentTarget;
                target.style.transform = 'scale(0.92)';
              }}
              onMouseUp={(e) => {
                const target = e.currentTarget;
                target.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.transform = 'scale(1)';
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '2px solid #1A1A1C',
                }}
              />
            </div>
          );
        }
        
        const Icon = button.icon!;
        return (
          <div
            key={index}
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              borderRadius: '50%',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              opacity: 1,
            }}
            onClick={button.onClick}
            onMouseDown={(e) => {
              const target = e.currentTarget;
              target.style.opacity = '0.6';
            }}
            onMouseUp={(e) => {
              const target = e.currentTarget;
              target.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.opacity = '1';
            }}
          >
            <Icon
              size={24}
              color={button.active ? '#3B82F6' : 'rgba(255, 255, 255, 0.7)'}
              strokeWidth={2}
            />
          </div>
        );
      })}
    </div>
  );
}
