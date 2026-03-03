import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Calendar, AlertCircle, Cpu, HardDrive, Wifi, MemoryStick, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type UserServer = {
  id: string;
  status: string;
  purchased_at: string;
  expires_at: string;
  servers: {
    name: string;
    cpu: string;
    ram: string;
    storage: string;
    bandwidth: string;
  };
};

export const ActiveServers = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<UserServer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_servers")
        .select(`
          id,
          status,
          purchased_at,
          expires_at,
          servers (
            name,
            cpu,
            ram,
            storage,
            bandwidth
          )
        `)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setServers(data || []);
    } catch (error) {
      console.error("Error fetching servers:", error);
      toast({
        title: "Error",
        description: "Failed to load your servers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" };
      case "suspended":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" };
      case "expired":
        return { color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" };
      case "cancelled":
        return { color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };
      default:
        return { color: "", dot: "" };
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Server className="w-6 h-6 animate-pulse text-primary" />
            </div>
            <p className="text-muted-foreground">Loading servers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (servers.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Servers Found</h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            You don't have any active servers. Browse our plans to get started.
          </p>
          <Button onClick={() => navigate('/pricing')}>
            View Plans
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Active</p>
            <p className="text-2xl font-bold">{servers.filter(s => s.status === 'active').length} Servers</p>
          </div>
        </div>
        <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => navigate('/pricing')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Plans
        </Button>
      </div>

      {/* Server Cards Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {servers.map((server) => {
          const statusConfig = getStatusConfig(server.status);
          return (
            <Card key={server.id} className="group border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                    {server.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{server.servers.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires {format(new Date(server.expires_at), "MMM dd, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Cpu className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{server.servers.cpu}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <MemoryStick className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{server.servers.ram}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <HardDrive className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{server.servers.storage}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Wifi className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{server.servers.bandwidth}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Since {format(new Date(server.purchased_at), "MMM dd, yyyy")}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};