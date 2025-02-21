"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { NotificationType } from "@prisma/client";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: notification.read || notificationIds.includes(notification.id),
        }))
      );

      setUnreadCount(Math.max(0, unreadCount - notificationIds.length));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "CONNECTION_REQUEST":
        return <UserPlus className="h-4 w-4" />;
      case "CONNECTION_ACCEPTED":
        return <UserCheck className="h-4 w-4" />;
      case "CONNECTION_DECLINED":
        return <UserX className="h-4 w-4" />;
      case "CONNECTION_REMOVED":
        return <UserMinus className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    markAsRead(
                      notifications.filter((n) => !n.read).map((n) => n.id)
                    )
                  }
                >
                  <Check className="mr-2 h-3 w-3" />
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 cursor-default ${
                      !notification.read ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead([notification.id]);
                      }
                    }}
                  >
                    <span className="text-primary mt-1">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">
                  No notifications
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
