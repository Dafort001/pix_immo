export function FocusIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Horizontal line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          background: '#FFFFFF',
          transform: 'translateY(-50%)',
        }}
      />
      
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '50%',
          width: '2px',
          background: '#FFFFFF',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#FFFFFF',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
