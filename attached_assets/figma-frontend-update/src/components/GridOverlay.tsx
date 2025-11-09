interface GridOverlayProps {
  visible: boolean;
  levelIndicatorEnabled?: boolean;
}

export function GridOverlay({ visible, levelIndicatorEnabled = false }: GridOverlayProps) {
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Vertical lines */}
      <div style={{ gridColumn: '1', gridRow: '1 / -1', borderRight: '1px solid rgba(255, 255, 255, 0.3)' }} />
      <div style={{ gridColumn: '2', gridRow: '1 / -1', borderRight: '1px solid rgba(255, 255, 255, 0.3)' }} />
      
      {/* Horizontal lines */}
      <div style={{ gridColumn: '1 / -1', gridRow: '1', borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }} />
      <div style={{ gridColumn: '1 / -1', gridRow: '2', borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }} />
      
      {/* Apple-Style: Level Indicator in Center Horizontal Line (wenn aktiviert) */}
      {levelIndicatorEnabled && (
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '2',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Center Crosshair Mark (Apple-Style) */}
          <div
            style={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Small center cross */}
            <div style={{ position: 'absolute', width: '1px', height: '12px', background: 'rgba(255, 204, 0, 0.8)' }} />
            <div style={{ position: 'absolute', width: '12px', height: '1px', background: 'rgba(255, 204, 0, 0.8)' }} />
            
            {/* Corner brackets (Apple-Style) */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: '2px solid rgba(255, 204, 0, 0.6)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
