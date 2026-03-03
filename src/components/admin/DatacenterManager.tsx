import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, Globe, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Datacenter = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  is_primary_hub: boolean;
  status: string;
};

export const DatacenterManager = () => {
  const { toast } = useToast();
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    latitude: "",
    longitude: "",
    is_primary_hub: false,
    status: "active",
  });

  useEffect(() => {
    fetchDatacenters();
  }, []);

  const fetchDatacenters = async () => {
    try {
      const { data, error } = await supabase
        .from("datacenter_locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDatacenters(data || []);
    } catch (error) {
      console.error("Error fetching datacenters:", error);
      toast({
        title: "Error",
        description: "Failed to load datacenters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const datacenterData = {
        name: formData.name,
        region: formData.region,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        is_primary_hub: formData.is_primary_hub,
        status: formData.status,
      };

      if (editingId) {
        const { error } = await supabase
          .from("datacenter_locations")
          .update(datacenterData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Datacenter updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("datacenter_locations")
          .insert([datacenterData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Datacenter added successfully",
        });
      }

      resetForm();
      fetchDatacenters();
    } catch (error) {
      console.error("Error saving datacenter:", error);
      toast({
        title: "Error",
        description: "Failed to save datacenter",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (datacenter: Datacenter) => {
    setEditingId(datacenter.id);
    setFormData({
      name: datacenter.name,
      region: datacenter.region,
      latitude: datacenter.latitude.toString(),
      longitude: datacenter.longitude.toString(),
      is_primary_hub: datacenter.is_primary_hub,
      status: datacenter.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this datacenter?")) return;

    try {
      const { error } = await supabase
        .from("datacenter_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Datacenter deleted successfully",
      });
      fetchDatacenters();
    } catch (error) {
      console.error("Error deleting datacenter:", error);
      toast({
        title: "Error",
        description: "Failed to delete datacenter",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      is_primary_hub: false,
      status: "active",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" };
      case "maintenance":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" };
      case "offline":
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
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{editingId ? "Edit" : "Add"} Datacenter</CardTitle>
              <CardDescription>
                {editingId ? "Update" : "Create a new"} location
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., New York DC1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="e.g., North America"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="40.7128"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-74.0060"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <Label htmlFor="is_primary_hub" className="cursor-pointer">Primary Hub</Label>
              <Switch
                id="is_primary_hub"
                checked={formData.is_primary_hub}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary_hub: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Datacenter Network</CardTitle>
                <CardDescription>{datacenters.length} locations worldwide</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {datacenters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No datacenters configured yet
            </div>
          ) : (
            <div className="space-y-3">
              {datacenters.map((datacenter) => {
                const statusConfig = getStatusConfig(datacenter.status);
                return (
                  <div
                    key={datacenter.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${datacenter.is_primary_hub ? 'bg-primary/10' : 'bg-muted/50'}`}>
                        <MapPin className={`w-5 h-5 ${datacenter.is_primary_hub ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{datacenter.name}</h3>
                          {datacenter.is_primary_hub && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                              Primary
                            </Badge>
                          )}
                          <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 text-xs`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {datacenter.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{datacenter.region}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {datacenter.latitude.toFixed(4)}, {datacenter.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => handleEdit(datacenter)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(datacenter.id)}>
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
    </div>
  );
};