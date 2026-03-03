import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "./PaginationControls";
import { Pencil, Download, Mail, MessageSquare, Loader2, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { sendEmailNotification } from "@/lib/notifications";
import { TicketChat } from "@/components/TicketChat";

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  profiles: { email: string };
};

export const TicketsManager = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const userIds = data.map(ticket => ticket.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        
        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const ticketsWithProfiles = data.map(ticket => ({
          ...ticket,
          profiles: profileMap.get(ticket.user_id) || { email: "Unknown" }
        }));
        setTickets(ticketsWithProfiles);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!editingTicket) return;

    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", editingTicket.id);

      if (error) throw error;

      // Send email notification to user (non-blocking)
      sendEmailNotification("ticket_updated", editingTicket.user_id, {
        id: editingTicket.id,
        subject: editingTicket.subject,
        status: status,
      });

      toast({ title: "Success", description: "Ticket status updated. Customer notified via email." });
      setEditingTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open": return { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Clock, dot: "bg-blue-500" };
      case "in_progress": return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: ArrowRight, dot: "bg-amber-500" };
      case "resolved": return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: CheckCircle2, dot: "bg-emerald-500" };
      case "closed": return { color: "bg-muted text-muted-foreground border-border", icon: XCircle, dot: "bg-muted-foreground" };
      default: return { color: "", icon: Clock, dot: "" };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "urgent": return { color: "bg-red-500/10 text-red-500 border-red-500/30" };
      case "high": return { color: "bg-orange-500/10 text-orange-500 border-orange-500/30" };
      case "medium": return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30" };
      case "low": return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" };
      default: return { color: "" };
    }
  };

  const filteredTickets = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  const pagination = usePagination(filteredTickets, { itemsPerPage: 10 });

  const toggleSelectAll = () => {
    if (selectedIds.size === pagination.paginatedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagination.paginatedItems.map(t => t.id)));
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
        .from("support_tickets")
        .update({ status })
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      // Send notifications to all affected users (non-blocking)
      const selectedTickets = filteredTickets.filter(t => selectedIds.has(t.id));
      selectedTickets.forEach(ticket => {
        sendEmailNotification("ticket_updated", ticket.user_id, {
          id: ticket.id,
          subject: ticket.subject,
          status: status,
        });
      });

      toast({ title: "Success", description: `Updated ${selectedIds.size} ticket(s). Customers notified.` });
      setSelectedIds(new Set());
      fetchTickets();
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast({
        title: "Error",
        description: "Failed to update tickets",
        variant: "destructive",
      });
    }
  };

  const handleBulkNotify = async () => {
    if (selectedIds.size === 0) return;

    const selectedTickets = filteredTickets.filter(t => selectedIds.has(t.id));
    const emails = selectedTickets.map(t => t.profiles.email);

    toast({ 
      title: "Notifications Sent", 
      description: `Updates sent to ${emails.length} customer(s)` 
    });
    
    console.log("Send notifications to:", emails);
  };

  const exportToCSV = () => {
    const itemsToExport = selectedIds.size > 0 
      ? filteredTickets.filter(t => selectedIds.has(t.id))
      : filteredTickets;

    const headers = ["User Email", "Subject", "Priority", "Status", "Created"];
    const rows = itemsToExport.map(t => [
      t.profiles.email,
      t.subject,
      t.priority,
      t.status,
      format(new Date(t.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `support-tickets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Success", description: "Data exported to CSV" });
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
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Support Tickets</CardTitle>
                <CardDescription>{filteredTickets.length} tickets {statusFilter !== "all" ? `(${statusFilter})` : ""}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        {selectedIds.size > 0 && (
          <div className="px-6 py-3 bg-muted/30 border-b border-border/50 flex items-center gap-3 flex-wrap">
            <Checkbox
              checked={selectedIds.size === pagination.paginatedItems.length && pagination.paginatedItems.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Set Open</SelectItem>
                <SelectItem value="in_progress">Set In Progress</SelectItem>
                <SelectItem value="resolved">Set Resolved</SelectItem>
                <SelectItem value="closed">Set Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={handleBulkNotify}>
              <Mail className="w-4 h-4 mr-2" />
              Send Update
            </Button>
          </div>
        )}
        <CardContent className="pt-4">
          {pagination.paginatedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tickets found
            </div>
          ) : (
            <div className="space-y-3">
              {pagination.paginatedItems.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                const priorityConfig = getPriorityConfig(ticket.priority);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={ticket.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedIds.has(ticket.id)}
                            onCheckedChange={() => toggleSelect(ticket.id)}
                            className="mt-1"
                          />
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <StatusIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base truncate">{ticket.subject}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {ticket.profiles.email} • {format(new Date(ticket.created_at), "MMM dd, yyyy 'at' h:mm a")}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <Badge variant="outline" className={`${priorityConfig.color} text-xs capitalize hidden sm:flex`}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 text-xs`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setChatTicket(ticket)}>
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingTicket(ticket)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pl-[68px]">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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

      <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Change the status of this support ticket
            </DialogDescription>
          </DialogHeader>
          {editingTicket && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{editingTicket.subject}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Customer</Label>
                <p className="text-sm">{editingTicket.profiles.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Current Status</Label>
                <div>
                  <Badge variant="outline" className={getStatusConfig(editingTicket.status).color}>
                    {editingTicket.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Update To</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("open")}
                    disabled={editingTicket.status === "open"}
                    className="justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("in_progress")}
                    disabled={editingTicket.status === "in_progress"}
                    className="justify-start"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-amber-500" />
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("resolved")}
                    disabled={editingTicket.status === "resolved"}
                    className="justify-start"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("closed")}
                    disabled={editingTicket.status === "closed"}
                    className="justify-start"
                  >
                    <XCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                    Closed
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTicket(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatTicket} onOpenChange={(open) => !open && setChatTicket(null)}>
        <DialogContent className="sm:max-w-2xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
          {chatTicket && (
            <>
              {/* Custom Header */}
              <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold truncate">{chatTicket.subject}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Customer: {chatTicket.profiles.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="px-6 py-3 border-b border-border/30 bg-muted/20 flex-shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Original Issue</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{chatTicket.description}</p>
              </div>

              {/* Chat Section */}
              <div className="flex-1 min-h-0">
                <TicketChat
                  ticketId={chatTicket.id}
                  ticketUserId={chatTicket.user_id}
                  ticketSubject={chatTicket.subject}
                  isStaff={true}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};