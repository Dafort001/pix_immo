import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface PushNotification {
  id: string;
  type: 'status' | 'editor' | 'marketing';
  titleDe: string;
  titleEn: string;
  messageDe: string;
  messageEn: string;
  timestamp: Date;
  jobId?: string;
  link?: string;
}

interface PushNotificationBannerProps {
  notification: PushNotification;
  language?: 'de' | 'en';
  onClose?: () => void;
  onClick?: () => void;
}

export function PushNotificationBanner({
  notification,
  language = 'de',
  onClose,
  onClick,
}: PushNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Fade-in + Slide-down animation
    setTimeout(() => setIsVisible(true), 50);

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      handleClose();
    }
  };

  const title = language === 'de' ? notification.titleDe : notification.titleEn;
  const message = language === 'de' ? notification.messageDe : notification.messageEn;

  return (
    <div
      className={`
        fixed top-0 left-1/2 -translate-x-1/2 z-50 
        w-full max-w-[640px] px-4 pt-4
        transition-all duration-200
        ${isVisible && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{
        pointerEvents: isClosing ? 'none' : 'auto',
      }}
    >
      <div
        onClick={handleClick}
        className="bg-[#F4F4F4] dark:bg-[#2C2C2C] rounded-[10px] shadow-sm cursor-pointer group"
        style={{
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center"
            style={{
              borderColor: '#C8C8C8',
              backgroundColor: '#F0F0F0',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: '9px',
                color: '#888',
              }}
            >
              px
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className="text-[#222] dark:text-[#ECECEC] mb-1"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '13pt',
                lineHeight: '16pt',
              }}
            >
              {title}
            </div>
            <div
              className="text-[#222] dark:text-[#ECECEC]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '13pt',
                lineHeight: '18pt',
              }}
            >
              {message}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={14} className="text-[#999]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Multiple notification manager
interface MultiPushProps {
  notifications: PushNotification[];
  language?: 'de' | 'en';
  onClose?: (id: string) => void;
  onClick?: (notification: PushNotification) => void;
}

export function MultiPushBanners({
  notifications,
  language = 'de',
  onClose,
  onClick,
}: MultiPushProps) {
  // Show max 3 notifications
  const visibleNotifications = notifications.slice(0, 3);

  return (
    <>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            marginTop: index > 0 ? '8px' : '0',
          }}
        >
          <PushNotificationBanner
            notification={notification}
            language={language}
            onClose={() => onClose?.(notification.id)}
            onClick={() => onClick?.(notification)}
          />
        </div>
      ))}
    </>
  );
}
