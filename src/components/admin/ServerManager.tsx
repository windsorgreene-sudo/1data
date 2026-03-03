import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Server, HardDrive, Loader2, DollarSign } from "lucide-react";

type ServerType = {
  id: string;
  name: string;
  datacenter_id: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  price_monthly: number;
  status: string;
};

type Datacenter = {
  id: string;
  name: string;
  region: string;
};

export const ServerManager = () => {
  const { toast } = useToast();
  const [servers, setServers] = useState<ServerType[]>([]);
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    datacenter_id: "",
    cpu: "",
    ram: "",
    storage: "",
    bandwidth: "",
    price_monthly: "",
    status: "available",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [serversResponse, datacentersResponse] = await Promise.all([
        supabase.from("servers").select("*").order("created_at", { ascending: false }),
        supabase.from("datacenter_locations").select("id, name, region"),
      ]);

      if (serversResponse.error) throw serversResponse.error;
      if (datacentersResponse.error) throw datacentersResponse.error;

      setServers(serversResponse.data || []);
      setDatacenters(datacentersResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load servers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serverData = {
        name: formData.name,
        datacenter_id: formData.datacenter_id,
        cpu: formData.cpu,
        ram: formData.ram,
        storage: formData.storage,
        bandwidth: formData.bandwidth,
        price_monthly: parseFloat(formData.price_monthly),
        status: formData.status,
      };

      if (editingId) {
        const { error } = await supabase
          .from("servers")
          .update(serverData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Server updated successfully",
        });
      } else {
        const { error } = await supabase.from("servers").insert([serverData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Server added successfully",
        });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving server:", error);
      toast({
        title: "Error",
        description: "Failed to save server",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (server: ServerType) => {
    setEditingId(server.id);
    setFormData({
      name: server.name,
      datacenter_id: server.datacenter_id,
      cpu: server.cpu,
      ram: server.ram,
      storage: server.storage,
      bandwidth: server.bandwidth,
      price_monthly: server.price_monthly.toString(),
      status: server.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this server?")) return;

    try {
      const { error } = await supabase.from("servers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Server deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting server:", error);
      toast({
        title: "Error",
        description: "Failed to delete server",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      datacenter_id: "",
      cpu: "",
      ram: "",
      storage: "",
      bandwidth: "",
      price_monthly: "",
      status: "available",
    });
  };

  const getDatacenterName = (id: string) => {
    const datacenter = datacenters.find((dc) => dc.id === id);
    return datacenter ? `${datacenter.name}` : "Unknown";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" };
      case "low_stock":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" };
      case "out_of_stock":
        return { color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" };
      default:
        return { color: "", dot: "" };
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Form Card */}
      <Card className="xl:col-span-1 border-border/50 h-fit">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{editingId ? "Edit" : "Add"} Server</CardTitle>
              <CardDescription>
                {editingId ? "Update" : "Create a new"} configuration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                placeholder="e.g., Pro VPS 8GB"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datacenter">Datacenter</Label>
              <Select
                value={formData.datacenter_id}
                onValueChange={(value) => setFormData({ ...formData, datacenter_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select datacenter" />
                </SelectTrigger>
                <SelectContent>
                  {datacenters.map((dc) => (
                    <SelectItem key={dc.id} value={dc.id}>
                      {dc.name} ({dc.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU</Label>
                <Input
                  id="cpu"
                  placeholder="8 vCPU"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input
                  id="ram"
                  placeholder="16 GB"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Input
                  id="storage"
                  placeholder="500 GB SSD"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bandwidth">Bandwidth</Label>
                <Input
                  id="bandwidth"
                  placeholder="10 TB"
                  value={formData.bandwidth}
                  onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Monthly Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="49.99"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Availability</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Add"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List Card */}
      <Card className="xl:col-span-2 border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Server Inventory</CardTitle>
              <CardDescription>{servers.length} configurations available</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {servers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No servers configured yet
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => {
                const statusConfig = getStatusConfig(server.status);
                return (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{server.name}</h3>
                          <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 text-xs`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {server.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{getDatacenterName(server.datacenter_id)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {server.cpu} • {server.ram} • {server.storage} • {server.bandwidth}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">{server.price_monthly.toFixed(2)}/mo</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => handleEdit(server)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(server.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans Reference Section */}
      <Card className="xl:col-span-3 border-border/50 mt-6">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Pricing Plans Reference</CardTitle>
              <CardDescription>Standard pricing tiers from frontend</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VPS Plans */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                <Server className="w-4 h-4" /> VPS Plans
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Starter", vcpu: 2, ram: "4 GB", storage: "80 GB SSD", price: 9 },
                  { name: "Pro", vcpu: 4, ram: "8 GB", storage: "160 GB SSD", price: 17 },
                  { name: "Business", vcpu: 6, ram: "16 GB", storage: "320 GB SSD", price: 31 },
                  { name: "Enterprise", vcpu: 8, ram: "32 GB", storage: "640 GB SSD", price: 56 },
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div>
                      <p className="font-medium text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.vcpu} vCPU • {plan.ram} • {plan.storage}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      ${plan.price}/mo
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* RDP Plans */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-accent flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> RDP Plans
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Basic", vcpu: 4, ram: "8 GB", storage: "160 GB SSD", price: 33 },
                  { name: "Standard", vcpu: 6, ram: "16 GB", storage: "320 GB SSD", price: 60 },
                  { name: "Premium", vcpu: 8, ram: "32 GB", storage: "640 GB SSD", price: 99 },
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div>
                      <p className="font-medium text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.vcpu} vCPU • {plan.ram} • {plan.storage}</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      ${plan.price}/mo
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};