import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sendEmailNotification } from "@/lib/notifications";
import { z } from "zod";
import { TicketChat } from "@/components/TicketChat";

// Validation schema for support tickets
const ticketSchema = z.object({
  subject: z.string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  description: z.string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    errorMap: () => ({ message: "Invalid priority level" })
  }),
});

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
};

export const SupportTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
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
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load your support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input using zod schema
    const validationResult = ticketSchema.safeParse(formData);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid input";
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const validatedData = validationResult.data;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: newTicket, error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: validatedData.subject,
        description: validatedData.description,
        priority: validatedData.priority,
      }).select().single();

      if (error) throw error;

      // Send email notification (non-blocking)
      sendEmailNotification("ticket_created", user.id, {
        id: newTicket.id,
        subject: validatedData.subject,
        priority: validatedData.priority,
        status: "open",
      });

      toast({
        title: "Ticket Created",
        description: "Our team will respond shortly. You'll receive an email confirmation.",
      });

      setIsDialogOpen(false);
      setFormData({ subject: "", description: "", priority: "medium" });
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive",
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Clock, dot: "bg-blue-500" };
      case "in_progress":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: ArrowRight, dot: "bg-amber-500" };
      case "resolved":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: CheckCircle2, dot: "bg-emerald-500" };
      case "closed":
        return { color: "bg-muted text-muted-foreground border-border", icon: XCircle, dot: "bg-muted-foreground" };
      default:
        return { color: "", icon: Clock, dot: "" };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { color: "bg-red-500/10 text-red-500 border-red-500/30" };
      case "high":
        return { color: "bg-orange-500/10 text-orange-500 border-orange-500/30" };
      case "medium":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30" };
      case "low":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" };
      default:
        return { color: "" };
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 animate-pulse text-primary" />
            </div>
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[120px] p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Open</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{tickets.filter(t => t.status === "open").length}</p>
        </div>
        <div className="flex-1 min-w-[120px] p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{tickets.filter(t => t.status === "in_progress").length}</p>
        </div>
        <div className="flex-1 min-w-[120px] p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{tickets.filter(t => t.status === "resolved").length}</p>
        </div>
      </div>

      {/* Create Ticket Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            Create New Ticket
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md border-border/50">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and our team will respond shortly
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="border-border/50 focus:border-primary"
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="border-border/50 focus:border-primary resize-none"
                  maxLength={5000}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Service issue</SelectItem>
                    <SelectItem value="high">High - Major impact</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground max-w-sm mb-5">
              Need help? Create a ticket and our team will assist you promptly.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => {
            const statusConfig = getStatusConfig(ticket.status);
            const priorityConfig = getPriorityConfig(ticket.priority);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={ticket.id} className="group border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                        ticket.status === "open" ? "bg-blue-500/10" :
                        ticket.status === "in_progress" ? "bg-amber-500/10" :
                        ticket.status === "resolved" ? "bg-emerald-500/10" : "bg-muted"
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          ticket.status === "open" ? "text-blue-400" :
                          ticket.status === "in_progress" ? "text-amber-400" :
                          ticket.status === "resolved" ? "text-emerald-400" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{ticket.subject}</CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {format(new Date(ticket.created_at), "MMM dd, yyyy 'at' h:mm a")}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-14 sm:ml-0">
                      <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 text-xs`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={`${priorityConfig.color} text-xs capitalize`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 ml-14">
                    {ticket.description}
                  </p>
                  <div className="mt-4 pt-4 ml-14 border-t border-border/30">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-4 text-xs hover:bg-primary/10 hover:text-primary"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      View & Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ticket Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
          {selectedTicket && (
            <>
              {/* Custom Header */}
              <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold truncate">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`${getStatusConfig(selectedTicket.status).color} text-xs`}>
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={`${getPriorityConfig(selectedTicket.priority).color} text-xs capitalize`}>
                        {selectedTicket.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        • Created {format(new Date(selectedTicket.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="px-6 py-3 border-b border-border/30 bg-muted/20 flex-shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Original Issue</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Chat Section */}
              <div className="flex-1 min-h-0">
                <TicketChat
                  ticketId={selectedTicket.id}
                  ticketUserId={selectedTicket.user_id}
                  ticketSubject={selectedTicket.subject}
                  isStaff={false}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};