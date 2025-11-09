interface PushPreviewProps {
  title: string;
  message: string;
  timestamp: string;
  isDark?: boolean;
}

export function PushNotificationPreview({
  title,
  message,
  timestamp,
  isDark = false,
}: PushPreviewProps) {
  return (
    <div
      className="w-full max-w-[360px] mx-auto"
      style={{
        height: '80px',
        backgroundColor: isDark ? '#222' : '#F7F7F7',
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#3A3A3A' : '#D9D9D9'}`,
        padding: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: `1px solid ${isDark ? '#4A4A4A' : '#C8C8C8'}`,
          backgroundColor: isDark ? '#333' : '#F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '10px',
            color: isDark ? '#999' : '#888',
          }}
        >
          px
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '13pt',
            color: isDark ? '#ECECEC' : '#2C2C2C',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '13pt',
            lineHeight: '18pt',
            color: isDark ? '#ECECEC' : '#2C2C2C',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {message}
        </div>
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '10pt',
          color: '#A0A0A0',
          flexShrink: 0,
        }}
      >
        {timestamp}
      </div>
    </div>
  );
}
