import { useLocation } from 'wouter';
import { Home, Camera, Image, Upload, Settings } from 'lucide-react';

interface AppNavigationBarProps {
  activeRoute?: string;
  orientation?: 'portrait' | 'landscape';
  darkMode?: boolean;
}

export function AppNavigationBar({ activeRoute, orientation = 'portrait', darkMode = false }: AppNavigationBarProps) {
  const [, setLocation] = useLocation();

  const SAFE_AREA_BOTTOM = 34;

  const navButtons = [
    { id: 'start', icon: Home, label: 'Start', route: '/pixcapture-app/jobs' },
    { id: 'camera', icon: Camera, label: 'Kamera', route: '/pixcapture-app/camera' },
    { id: 'gallery', icon: Image, label: 'Galerie', route: '/pixcapture-app/gallery' },
    { id: 'upload', icon: Upload, label: 'Upload', route: '/pixcapture-app/upload' },
    { id: 'manual', icon: Settings, label: 'Manuell', route: '/pixcapture-app/settings' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        [orientation === 'portrait' ? 'bottom' : 'right']: 0,
        [orientation === 'portrait' ? 'left' : 'top']: 0,
        [orientation === 'portrait' ? 'right' : 'bottom']: 0,
        [orientation === 'portrait' ? 'height' : 'width']: '72px',
        background: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        [orientation === 'portrait' ? 'flexDirection' : 'flexDirection']: 
          orientation === 'portrait' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: orientation === 'portrait' ? `0 ${SAFE_AREA_BOTTOM}px` : `${SAFE_AREA_BOTTOM}px 0`,
        zIndex: 50,
        borderTop: orientation === 'portrait' ? (darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E5E5') : 'none',
        borderLeft: orientation === 'landscape' ? (darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E5E5') : 'none',
      }}
    >
      {navButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = activeRoute === btn.route;
        
        return (
          <button
            key={btn.id}
            onClick={() => {
              if (btn.route) setLocation(btn.route);
            }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: isActive ? 'rgba(176, 224, 230, 0.75)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isActive ? 1 : 0.4,
              transition: 'all 0.2s ease',
              transform: orientation === 'landscape' ? 'rotate(90deg)' : 'none',
            }}
          >
            <Icon size={22} color={isActive ? 'white' : (darkMode ? '#FFFFFF' : '#1A1A1C')} />
          </button>
        );
      })}
    </div>
  );
}
