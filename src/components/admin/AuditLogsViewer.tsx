import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, User, FileText, Ticket, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

interface AuditLog {
  id: string;
  action_type: string;
  table_name: string;
  record_id: string | null;
  actor_id: string;
  actor_email: string | null;
  old_values: JsonValue | null;
  new_values: JsonValue | null;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Shield }> = {
  ROLE_GRANTED: { label: "Role Granted", variant: "default", icon: Shield },
  ROLE_REVOKED: { label: "Role Revoked", variant: "destructive", icon: Shield },
  ROLE_CHANGED: { label: "Role Changed", variant: "secondary", icon: Shield },
  INVOICE_UPDATED: { label: "Invoice Updated", variant: "secondary", icon: FileText },
  INVOICE_DELETED: { label: "Invoice Deleted", variant: "destructive", icon: FileText },
  TICKET_UPDATED: { label: "Ticket Updated", variant: "secondary", icon: Ticket },
};

const ITEMS_PER_PAGE = 20;

export const AuditLogsViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (actionFilter !== "all") {
        query = query.eq("action_type", actionFilter);
      }

      if (searchQuery) {
        query = query.ilike("actor_email", `%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, searchQuery, page]);

  const formatChanges = (oldVals: JsonValue | null, newVals: JsonValue | null) => {
    const changes: string[] = [];
    
    const oldObj = (oldVals && typeof oldVals === 'object' && !Array.isArray(oldVals)) ? oldVals : null;
    const newObj = (newVals && typeof newVals === 'object' && !Array.isArray(newVals)) ? newVals : null;
    
    if (oldObj && newObj) {
      Object.keys(newObj).forEach(key => {
        if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
          changes.push(`${key}: ${oldObj[key] ?? "null"} → ${newObj[key] ?? "null"}`);
        }
      });
    } else if (newObj) {
      Object.entries(newObj).forEach(([key, val]) => {
        changes.push(`${key}: ${val}`);
      });
    } else if (oldObj) {
      Object.entries(oldObj).forEach(([key, val]) => {
        changes.push(`${key}: ${val} (deleted)`);
      });
    }
    
    return changes.length > 0 ? changes.join(", ") : "No changes recorded";
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Read-only view of all sensitive actions (role changes, invoice edits, ticket updates)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by actor email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={actionFilter}
            onValueChange={(val) => {
              setActionFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="ROLE_GRANTED">Role Granted</SelectItem>
              <SelectItem value="ROLE_REVOKED">Role Revoked</SelectItem>
              <SelectItem value="ROLE_CHANGED">Role Changed</SelectItem>
              <SelectItem value="INVOICE_UPDATED">Invoice Updated</SelectItem>
              <SelectItem value="INVOICE_DELETED">Invoice Deleted</SelectItem>
              <SelectItem value="TICKET_UPDATED">Ticket Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const config = ACTION_CONFIG[log.action_type] || {
                    label: log.action_type,
                    variant: "outline" as const,
                    icon: User,
                  };
                  const Icon = config.icon;
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{log.actor_email || "System"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {formatChanges(log.old_values, log.new_values)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {logs.length} of {totalCount} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
