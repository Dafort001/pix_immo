import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationsBellProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (notification: Notification) => void;
  showBadge?: boolean;
}

export function NotificationsBell({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onNavigate,
  showBadge = true,
}: NotificationsBellProps) {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 10);

  const getIcon = (type: string) => {
    switch (type) {
      case 'upload_received':
      case 'edit_done':
      case 'order_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'revision_required':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'edit_started':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'upload_received':
        return 'Upload Received';
      case 'edit_started':
        return 'Editing Started';
      case 'edit_done':
        return 'Editing Complete';
      case 'revision_required':
        return 'Revision Required';
      case 'order_completed':
        return 'Order Completed';
      default:
        return 'Notification';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onNavigate) {
      onNavigate(notification);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {showBadge && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="popover-notifications">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" data-testid="badge-unread-header">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" data-testid={`skeleton-notification-${i}`} />
              ))}
            </div>
          )}

          {!isLoading && recentNotifications.length === 0 && (
            <Card className="m-4 p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground" data-testid="text-no-notifications">
                No notifications
              </p>
            </Card>
          )}

          {!isLoading && recentNotifications.length > 0 && (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.read && 'bg-blue-50 dark:bg-blue-950'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-item-${notification.id}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{getTitle(notification.type)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {recentNotifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setOpen(false)}
              data-testid="button-close-notifications"
            >
              Close
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
