import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Calendar, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type ContactSubmission = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ip_address: string | null;
  submitted_at: string;
};

export const ContactSubmissions = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      read: "secondary",
      responded: "outline",
      archived: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Submissions</CardTitle>
              <CardDescription>View and manage customer inquiries</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); fetchSubmissions(); }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions found</p>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-1 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">
                              {submission.first_name} {submission.last_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${submission.email}`} className="hover:underline">
                                {submission.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(submission.submitted_at), "PPp")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(submission.status || "new")}
                          <Select
                            value={submission.status || "new"}
                            onValueChange={(value) => updateStatus(submission.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="responded">Responded</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pl-8 space-y-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Subject</span>
                          </div>
                          <p className="text-sm">{submission.subject}</p>
                        </div>

                        <div>
                          <span className="text-sm font-medium block mb-1">Message</span>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {submission.message}
                          </p>
                        </div>
                      </div>

                      {submission.ip_address && (
                        <div className="pl-8 text-xs text-muted-foreground">
                          IP: {submission.ip_address}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
