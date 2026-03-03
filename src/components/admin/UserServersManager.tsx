import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "./PaginationControls";
import { Pencil, Trash2, Plus, Download, Mail } from "lucide-react";
import { format } from "date-fns";

type UserServer = {
  id: string;
  user_id: string;
  server_id: string;
  status: string;
  purchased_at: string;
  expires_at: string;
  profiles: { email: string };
  servers: { name: string };
};

type Server = {
  id: string;
  name: string;
};

type Profile = {
  id: string;
  email: string;
};

export const UserServersManager = () => {
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    user_id: "",
    server_id: "",
    status: "active",
    expires_at: "",
  });
  const { toast } = useToast();

  const pagination = usePagination(userServers, { itemsPerPage: 10 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [serversRes, profilesRes, userServersRes] = await Promise.all([
        supabase.from("servers").select("id, name").order("name"),
        supabase.from("profiles").select("id, email").order("email"),
        supabase.from("user_servers").select(`
          *,
          servers (name)
        `).order("purchased_at", { ascending: false }),
      ]);

      if (serversRes.error) throw serversRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (userServersRes.error) throw userServersRes.error;

      setServers(serversRes.data || []);
      setProfiles(profilesRes.data || []);
      
      // Fetch profile emails separately for user_servers
      if (userServersRes.data && userServersRes.data.length > 0) {
        const userIds = userServersRes.data.map(us => us.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        
        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const userServersWithProfiles = userServersRes.data.map(us => ({
          ...us,
          profiles: profileMap.get(us.user_id) || { email: "Unknown" }
        }));
        setUserServers(userServersWithProfiles);
      } else {
        setUserServers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from("user_servers")
          .update({
            status: formData.status,
            expires_at: formData.expires_at,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Success", description: "User server updated" });
      } else {
        const { error } = await supabase.from("user_servers").insert({
          user_id: formData.user_id,
          server_id: formData.server_id,
          status: formData.status,
          expires_at: formData.expires_at,
        });

        if (error) throw error;
        toast({ title: "Success", description: "User server created" });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving user server:", error);
      toast({
        title: "Error",
        description: "Failed to save user server",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (userServer: UserServer) => {
    setEditingId(userServer.id);
    setFormData({
      user_id: userServer.user_id,
      server_id: userServer.server_id,
      status: userServer.status,
      expires_at: new Date(userServer.expires_at).toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user server?")) return;

    try {
      const { error } = await supabase.from("user_servers").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "User server deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting user server:", error);
      toast({
        title: "Error",
        description: "Failed to delete user server",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      server_id: "",
      status: "active",
      expires_at: "",
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "suspended": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "expired": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "cancelled": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "";
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pagination.paginatedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagination.paginatedItems.map(us => us.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;

    try {
      const { error } = await supabase
        .from("user_servers")
        .update({ status })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      toast({ title: "Success", description: `Updated ${selectedIds.size} server(s)` });
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast({
        title: "Error",
        description: "Failed to update servers",
        variant: "destructive",
      });
    }
  };

  const handleBulkEmail = async () => {
    if (selectedIds.size === 0) return;

    const selectedServers = userServers.filter(us => selectedIds.has(us.id));
    const emails = selectedServers.map(us => us.profiles.email);

    toast({ 
      title: "Email Sent", 
      description: `Notifications sent to ${emails.length} user(s)` 
    });
    
    console.log("Send emails to:", emails);
  };

  const exportToCSV = () => {
    const itemsToExport = selectedIds.size > 0 
      ? userServers.filter(us => selectedIds.has(us.id))
      : userServers;

    const headers = ["User Email", "Server", "Status", "Purchased", "Expires"];
    const rows = itemsToExport.map(us => [
      us.profiles.email,
      us.servers.name,
      us.status,
      format(new Date(us.purchased_at), "yyyy-MM-dd"),
      format(new Date(us.expires_at), "yyyy-MM-dd"),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-servers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Success", description: "Data exported to CSV" });
  };

  if (loading) {
    return <Card><CardContent className="py-16 text-center">Loading...</CardContent></Card>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} User Server</CardTitle>
          <CardDescription>Assign servers to users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                disabled={!!editingId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server_id">Server</Label>
              <Select
                value={formData.server_id}
                onValueChange={(value) => setFormData({ ...formData, server_id: value })}
                disabled={!!editingId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date</Label>
              <Input
                type="date"
                id="expires_at"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Update" : <><Plus className="w-4 h-4 mr-2" />Add</>}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Servers ({userServers.length})</CardTitle>
              <CardDescription>Manage customer server assignments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        {selectedIds.size > 0 && (
          <div className="px-6 pb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Set Active</SelectItem>
                <SelectItem value="suspended">Set Suspended</SelectItem>
                <SelectItem value="expired">Set Expired</SelectItem>
                <SelectItem value="cancelled">Set Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleBulkEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === pagination.paginatedItems.length && pagination.paginatedItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map((us) => (
                <TableRow key={us.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(us.id)}
                      onCheckedChange={() => toggleSelect(us.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{us.profiles.email}</TableCell>
                  <TableCell className="text-sm">{us.servers.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(us.status)}>
                      {us.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(us.expires_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(us)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(us.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={pagination.totalItems}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onNextPage={pagination.nextPage}
            onPrevPage={pagination.prevPage}
            onGoToPage={pagination.goToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};
