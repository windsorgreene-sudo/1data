import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveServers } from "@/components/portal/ActiveServers";
import { Invoices } from "@/components/portal/Invoices";
import { SupportTickets } from "@/components/portal/SupportTickets";
import { ProfileSettings } from "@/components/portal/ProfileSettings";
import { PortalSidebar } from "@/components/PortalSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useToast } from "@/hooks/use-toast";
import { Server, FileText, MessageSquare, User, Clock, DollarSign, LayoutDashboard, TrendingUp, Calendar, ChevronRight, Zap, Shield, Headphones, Settings } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const Portal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    activeServers: 0,
    pendingInvoices: 0,
    openTickets: 0,
    totalSpent: 0,
  });

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useRealtimeNotifications(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the customer portal.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || profile.email?.split("@")[0] || "User");
      }

      const [serversRes, invoicesRes, ticketsRes] = await Promise.all([
        supabase.from("user_servers").select("status").eq("status", "active"),
        supabase.from("invoices").select("amount, status"),
        supabase.from("support_tickets").select("status").in("status", ["open", "in_progress"]),
      ]);

      const paidInvoices = invoicesRes.data?.filter(i => i.status === "paid") || [];
      const pendingInvoices = invoicesRes.data?.filter(i => i.status === "pending") || [];

      setStats({
        activeServers: serversRes.data?.length || 0,
        pendingInvoices: pendingInvoices.length,
        openTickets: ticketsRes.data?.length || 0,
        totalSpent: paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigate("/auth");
    }
  };

  const mobileMenuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "servers", label: "Servers", icon: Server },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "tickets", label: "Support", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Portal</h3>
            <p className="text-sm text-muted-foreground">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Active Servers", value: stats.activeServers, icon: Server, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: Clock, color: "text-amber-400", bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20" },
    { label: "Open Tickets", value: stats.openTickets, icon: MessageSquare, color: "text-blue-400", bg: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20" },
    { label: "Total Spent", value: `$${stats.totalSpent.toFixed(0)}`, icon: DollarSign, color: "text-primary", bg: "from-primary/20 to-primary/5", border: "border-primary/20" },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case "servers": return { title: "Active Servers", desc: "Manage and monitor your VPS instances" };
      case "invoices": return { title: "Invoices", desc: "View billing history and manage payments" };
      case "tickets": return { title: "Support Tickets", desc: "Get help from our support team" };
      case "settings": return { title: "Profile Settings", desc: "Manage your account and notification preferences" };
      default: return { title: `Welcome back, ${userName}!`, desc: "Here's an overview of your account" };
    }
  };

  const pageInfo = getPageTitle();

  const renderContent = () => {
    switch (activeTab) {
      case "servers":
        return <ActiveServers />;
      case "invoices":
        return <Invoices />;
      case "tickets":
        return <SupportTickets />;
      case "settings":
        return <ProfileSettings />;
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card 
                  key={index} 
                  className={`group border ${stat.border} bg-gradient-to-br ${stat.bg} hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden`}
                >
                  <CardContent className="p-5 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50" />
                    <div className="flex items-center gap-4 relative">
                      <div className={`w-12 h-12 rounded-xl bg-background/50 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
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

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="group cursor-pointer border-border/50 hover:border-emerald-500/30 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
                onClick={() => setActiveTab("servers")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Server className="w-6 h-6 text-emerald-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">Manage Servers</h3>
                    <p className="text-sm text-muted-foreground mt-1">View and control your VPS instances</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer border-border/50 hover:border-blue-500/30 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                onClick={() => setActiveTab("invoices")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">View Invoices</h3>
                    <p className="text-sm text-muted-foreground mt-1">Check billing history & payments</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer border-border/50 hover:border-violet-500/30 bg-gradient-to-br from-card to-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
                onClick={() => setActiveTab("tickets")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Headphones className="w-6 h-6 text-violet-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">Get Support</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create or manage tickets</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Banner */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Need More Power?</h3>
                      <p className="text-sm text-muted-foreground">Upgrade your plan for enhanced performance and features</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
                    onClick={() => navigate("/pricing")}
                  >
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Your account is secure.</span> Real-time notifications are enabled for tickets and invoice updates.
              </p>
            </div>
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
          <PortalSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            stats={{
              activeServers: stats.activeServers,
              pendingInvoices: stats.pendingInvoices,
              openTickets: stats.openTickets,
            }}
          />

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-auto">
            <div className="p-4 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {pageInfo.title}
                  </h1>
                  <p className="text-muted-foreground mt-1">{pageInfo.desc}</p>
                </div>

                {/* Page Content */}
                {renderContent()}
              </div>
            </div>
          </main>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Portal;