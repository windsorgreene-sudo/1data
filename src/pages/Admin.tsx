import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { DatacenterManager } from "@/components/admin/DatacenterManager";
import { ServerManager } from "@/components/admin/ServerManager";
import { ContactSubmissions } from "@/components/admin/ContactSubmissions";
import { UserServersManager } from "@/components/admin/UserServersManager";
import { InvoicesManager } from "@/components/admin/InvoicesManager";
import { TicketsManager } from "@/components/admin/TicketsManager";
import { UserRolesManager } from "@/components/admin/UserRolesManager";
import { AuditLogsViewer } from "@/components/admin/AuditLogsViewer";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { AdminSidebar } from "@/components/AdminSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useToast } from "@/hooks/use-toast";
import { Shield, MapPin, Server, Users, FileText, MessageSquare, Mail, Settings, LayoutDashboard, TrendingUp, Activity, ClipboardList, Quote } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import PageTransition from "@/components/PageTransition";

type AppRole = Database["public"]["Enums"]["app_role"];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    datacenters: 0,
    servers: 0,
    users: 0,
    tickets: 0,
    testimonials: 0,
  });

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useRealtimeNotifications(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (error) throw error;

      const roles = (data || []).map((r) => r.role as AppRole);
      const elevatedRoles = roles.filter((r) => r !== "user");

      if (elevatedRoles.length === 0) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const [dcRes, serverRes, usersRes, ticketsRes, testimonialsRes] = await Promise.all([
        supabase.from("datacenter_locations").select("id", { count: "exact" }),
        supabase.from("servers").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("support_tickets").select("id", { count: "exact" }).in("status", ["open", "in_progress"]),
        supabase.from("testimonials").select("id", { count: "exact" }).eq("status", "pending"),
      ]);

      setStats({
        datacenters: dcRes.count || 0,
        servers: serverRes.count || 0,
        users: usersRes.count || 0,
        tickets: ticketsRes.count || 0,
        testimonials: testimonialsRes.count || 0,
      });

      setUserRoles(elevatedRoles);
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (allowedRoles: AppRole[]) => {
    return userRoles.some((role) => allowedRoles.includes(role));
  };

  const mobileMenuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(hasAccess(["admin"]) ? [{ id: "datacenters", label: "DC", icon: MapPin }] : []),
    ...(hasAccess(["admin"]) ? [{ id: "servers", label: "Servers", icon: Server }] : []),
    ...(hasAccess(["admin", "moderator"]) ? [{ id: "user-servers", label: "Users", icon: Users }] : []),
    ...(hasAccess(["admin"]) ? [{ id: "invoices", label: "Bills", icon: FileText }] : []),
    ...(hasAccess(["admin", "moderator", "support"]) ? [{ id: "tickets", label: "Tickets", icon: MessageSquare }] : []),
    ...(hasAccess(["admin", "moderator"]) ? [{ id: "contacts", label: "Mail", icon: Mail }] : []),
    ...(hasAccess(["admin", "moderator"]) ? [{ id: "testimonials", label: "Reviews", icon: Quote }] : []),
    ...(hasAccess(["admin"]) ? [{ id: "permissions", label: "Roles", icon: Settings }] : []),
    ...(hasAccess(["admin"]) ? [{ id: "audit-logs", label: "Audit", icon: ClipboardList }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 animate-pulse text-primary" />
            </div>
            <p className="text-muted-foreground">Verifying credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mobileMenuItems.length === 0) {
    return null;
  }

  const statCards = [
    { label: "Datacenters", value: stats.datacenters, icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Servers", value: stats.servers, icon: Server, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Users", value: stats.users, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Open Tickets", value: stats.tickets, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "datacenters":
        return <DatacenterManager />;
      case "servers":
        return <ServerManager />;
      case "user-servers":
        return <UserServersManager />;
      case "invoices":
        return <InvoicesManager />;
      case "tickets":
        return <TicketsManager />;
      case "testimonials":
        return <TestimonialsManager />;
      case "contacts":
        return <ContactSubmissions />;
      case "permissions":
        return <UserRolesManager />;
      case "audit-logs":
        return <AuditLogsViewer />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              </div>
              <p className="text-muted-foreground">
                Manage infrastructure, users, and support tickets from here.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasAccess(["admin"]) && (
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setActiveTab("datacenters")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Datacenters</p>
                      <p className="text-sm text-muted-foreground">Manage locations</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasAccess(["admin"]) && (
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setActiveTab("servers")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Server className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">Servers</p>
                      <p className="text-sm text-muted-foreground">Manage inventory</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasAccess(["admin", "moderator", "support"]) && (
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setActiveTab("tickets")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Tickets</p>
                      <p className="text-sm text-muted-foreground">{stats.tickets} open</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasAccess(["admin"]) && (
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setActiveTab("permissions")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="font-medium">Permissions</p>
                      <p className="text-sm text-muted-foreground">User roles</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* System Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">System Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">All Systems Operational</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Real-time updates enabled</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Admin access verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <>
      <Header />
      <PageTransition>
        <div className="min-h-screen bg-background pt-16">
          
          {/* Mobile Navigation */}
          <MobileNav
            items={mobileMenuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />

          <div className="flex">
          {/* Desktop Sidebar */}
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRoles={userRoles}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            stats={stats}
          />

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              {renderContent()}
            </div>
          </main>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Admin;
