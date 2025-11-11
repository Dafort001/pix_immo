import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useNotifications, useMarkNotificationRead } from "../hooks/useNotifications";

export function NotificationsBell() {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useNotifications(20, false);
  const markReadMutation = useMarkNotificationRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread || 0;

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Mark read failed:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => markReadMutation.mutateAsync(n.id))
      );
    } catch (error) {
      console.error("Mark all read failed:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0"
        data-testid="popover-notifications"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              data-testid="button-mark-all-read"
            >
              <Check className="w-4 h-4 mr-2" />
              {t("notifications.mark_all_read")}
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-auto">
          {notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t("empty.no_notifications")}</p>
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b last:border-b-0 hover-elevate ${
                !notification.read ? "bg-accent/20" : ""
              }`}
              data-testid={`notification-${notification.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleString(
                      language === "de" ? "de-DE" : "en-US"
                    )}
                  </p>
                </div>

                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => handleMarkRead(notification.id)}
                    data-testid={`button-mark-read-${notification.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
