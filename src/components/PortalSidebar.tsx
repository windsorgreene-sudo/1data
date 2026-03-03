import { Server, FileText, MessageSquare, LayoutDashboard, Bell, Zap, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "./NotificationPanel";
import type { Notification } from "@/hooks/useRealtimeNotifications";

interface PortalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  stats: {
    activeServers: number;
    pendingInvoices: number;
    openTickets: number;
  };
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "text-primary" },
  { id: "servers", label: "Active Servers", icon: Server, color: "text-emerald-400" },
  { id: "invoices", label: "Invoices", icon: FileText, color: "text-blue-400" },
  { id: "tickets", label: "Support Tickets", icon: MessageSquare, color: "text-violet-400" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-amber-400" },
];

export const PortalSidebar = ({
  activeTab,
  onTabChange,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  stats,
}: PortalSidebarProps) => {
  const getBadgeCount = (id: string) => {
    switch (id) {
      case "servers": return stats.activeServers;
      case "invoices": return stats.pendingInvoices;
      case "tickets": return stats.openTickets;
      default: return 0;
    }
  };

  return (
    <aside className="w-72 min-h-[calc(100vh-4rem)] border-r border-border/50 bg-gradient-to-b from-card/80 to-background hidden lg:flex flex-col sticky top-16">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Customer Portal</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your services</p>
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
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Navigation
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const badgeCount = getBadgeCount(item.id);
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-primary-foreground/20" : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    <item.icon className={cn(
                      "h-4.5 w-4.5",
                      isActive ? "text-primary-foreground" : item.color
                    )} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && item.id !== "overview" && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "h-6 px-2 text-xs font-semibold",
                        isActive && "bg-primary-foreground/20 text-primary-foreground border-transparent"
                      )}
                    >
                      {badgeCount}
                    </Badge>
                  )}
                  {item.id === "overview" && (
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isActive && "rotate-90"
                    )} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* Real-time Status */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Real-time Updates</p>
              <p className="text-xs text-muted-foreground truncate">
                Notifications enabled
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{stats.activeServers}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Servers</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{stats.pendingInvoices}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{stats.openTickets}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tickets</p>
          </div>
        </div>
      </div>
    </aside>
  );
};