import { MapPin, Server, Users, FileText, MessageSquare, Mail, Settings, LayoutDashboard, Bell, Shield, ClipboardList, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "./NotificationPanel";
import type { Notification } from "@/hooks/useRealtimeNotifications";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: AppRole[];
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRoles: AppRole[];
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  stats: {
    datacenters: number;
    servers: number;
    users: number;
    tickets: number;
    testimonials?: number;
  };
}

const TAB_CONFIG: TabConfig[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, allowedRoles: ["admin", "moderator", "support"] },
  { id: "datacenters", label: "Datacenters", icon: MapPin, allowedRoles: ["admin"] },
  { id: "servers", label: "Servers", icon: Server, allowedRoles: ["admin"] },
  { id: "user-servers", label: "User Servers", icon: Users, allowedRoles: ["admin", "moderator"] },
  { id: "invoices", label: "Invoices", icon: FileText, allowedRoles: ["admin"] },
  { id: "tickets", label: "Tickets", icon: MessageSquare, allowedRoles: ["admin", "moderator", "support"] },
  { id: "testimonials", label: "Testimonials", icon: Quote, allowedRoles: ["admin", "moderator"] },
  { id: "contacts", label: "Contacts", icon: Mail, allowedRoles: ["admin", "moderator"] },
  { id: "permissions", label: "Permissions", icon: Settings, allowedRoles: ["admin"] },
  { id: "audit-logs", label: "Audit Logs", icon: ClipboardList, allowedRoles: ["admin"] },
];

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  userRoles,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  stats,
}: AdminSidebarProps) => {
  const hasAccess = (allowedRoles: AppRole[]) => {
    return userRoles.some((role) => allowedRoles.includes(role));
  };

  const accessibleTabs = TAB_CONFIG.filter((tab) => hasAccess(tab.allowedRoles));

  const getBadgeCount = (id: string) => {
    switch (id) {
      case "datacenters": return stats.datacenters;
      case "servers": return stats.servers;
      case "user-servers": return stats.users;
      case "tickets": return stats.tickets;
      case "testimonials": return stats.testimonials || 0;
      default: return 0;
    }
  };

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] border-r bg-card/50 hidden lg:flex flex-col sticky top-16">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Admin Panel</h2>
          </div>
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearAll={onClearAll}
          />
        </div>
      </div>
      
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {accessibleTabs.map((item) => {
            const badgeCount = getBadgeCount(item.id);
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && item.id !== "overview" && (
                    <Badge 
                      variant={activeTab === item.id ? "secondary" : "outline"}
                      className="h-5 px-1.5 text-xs"
                    >
                      {badgeCount}
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <Bell className="h-4 w-4 text-primary" />
            Live Notifications
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time alerts for tickets and invoices
          </p>
        </div>
      </div>
    </aside>
  );
};
