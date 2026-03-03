import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Check, X, Trash2, Sparkles, Quote, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Testimonial {
  id: string;
  user_id: string;
  customer_name: string;
  customer_role: string | null;
  rating: number;
  review_text: string;
  status: string;
  is_featured: boolean;
  created_at: string;
}

export const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    setLoading(true);
    let query = supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch testimonials.",
        variant: "destructive",
      });
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Testimonial ${status}.`,
      });
      fetchTestimonials();
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_featured: !currentValue })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Testimonial ${!currentValue ? "featured" : "unfeatured"}.`,
      });
      fetchTestimonials();
    }
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Testimonial has been removed.",
      });
      fetchTestimonials();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
    }
  };

  const pendingCount = testimonials.filter(t => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Quote className="w-5 h-5 text-primary" />
            <CardTitle>Testimonials</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="destructive">{pendingCount} pending</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchTestimonials}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No testimonials found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="max-w-[300px]">Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{testimonial.customer_name}</p>
                          {testimonial.customer_role && (
                            <p className="text-sm text-muted-foreground">
                              {testimonial.customer_role}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {renderStars(testimonial.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm line-clamp-2">{testimonial.review_text}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(testimonial.status)}
                          {testimonial.is_featured && (
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(testimonial.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {testimonial.status !== "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus(testimonial.id, "approved")}
                              title="Approve"
                            >
                              <Check className="w-4 h-4 text-emerald-500" />
                            </Button>
                          )}
                          {testimonial.status !== "rejected" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus(testimonial.id, "rejected")}
                              title="Reject"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                            title={testimonial.is_featured ? "Unfeature" : "Feature"}
                          >
                            <Sparkles
                              className={`w-4 h-4 ${
                                testimonial.is_featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTestimonial(testimonial.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
