import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Search, Users, Headphones } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  role: AppRole;
  email: string;
  created_at: string;
}

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  admin: { label: "Admin", icon: <Shield className="w-3 h-3 mr-1" />, variant: "default" },
  moderator: { label: "Moderator", icon: <Users className="w-3 h-3 mr-1" />, variant: "secondary" },
  support: { label: "Support", icon: <Headphones className="w-3 h-3 mr-1" />, variant: "outline" },
  user: { label: "User", icon: null, variant: "outline" },
};

export const UserRolesManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [filterRole, setFilterRole] = useState<AppRole | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

      const usersWithRoles: UserWithRole[] = (roles || []).map((r) => ({
        user_id: r.user_id,
        role: r.role as AppRole,
        email: profileMap.get(r.user_id) || "Unknown",
        created_at: r.created_at,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = async () => {
    if (!addingEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", addingEmail.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: "User not found",
          description: "No user found with that email address",
          variant: "destructive",
        });
        return;
      }

      const existingRole = users.find(
        (u) => u.user_id === profile.id && u.role === selectedRole
      );
      if (existingRole) {
        toast({
          title: "Role exists",
          description: `This user already has the ${ROLE_CONFIG[selectedRole].label} role`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("user_roles").insert({
        user_id: profile.id,
        role: selectedRole,
      });

      if (error) throw error;

      toast({
        title: "Role added",
        description: `${addingEmail} now has ${ROLE_CONFIG[selectedRole].label} permissions`,
      });

      setAddingEmail("");
      fetchUsersWithRoles();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add role",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: AppRole, email: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Role removed",
        description: `${email} no longer has ${ROLE_CONFIG[role].label} permissions`,
      });

      fetchUsersWithRoles();
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Filter out basic 'user' role from display (only show elevated roles)
  const elevatedRoles = filteredUsers.filter((u) => u.role !== "user");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Shield className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Enter user email..."
              value={addingEmail}
              onChange={(e) => setAddingEmail(e.target.value)}
              className="max-w-md"
            />
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addRole}>
              <Shield className="w-4 h-4 mr-2" />
              Grant Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <span>User Roles ({elevatedRoles.length})</span>
            <div className="flex gap-4">
              <Select value={filterRole} onValueChange={(v) => setFilterRole(v as AppRole | "all")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elevatedRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                elevatedRoles.map((user) => (
                  <TableRow key={`${user.user_id}-${user.role}`}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_CONFIG[user.role].variant}>
                        {ROLE_CONFIG[user.role].icon}
                        {ROLE_CONFIG[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRole(user.user_id, user.role, user.email)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
