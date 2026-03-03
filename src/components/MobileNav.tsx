import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "./NotificationPanel";
import type { Notification } from "@/hooks/useRealtimeNotifications";

interface MobileNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const MobileNav = ({
  items,
  activeTab,
  onTabChange,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: MobileNavProps) => {
  return (
    <div className="lg:hidden sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <div className="flex-1 overflow-x-auto scrollbar-hide -mx-1">
          <div className="flex gap-1.5 px-1 min-w-max">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 pl-1">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </div>
  );
};