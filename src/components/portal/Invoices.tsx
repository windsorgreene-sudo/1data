import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertCircle, Download, Eye, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issued_at: string;
  due_at: string;
  paid_at: string | null;
};

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load your invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" };
      case "pending":
        return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" };
      case "overdue":
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
              <FileText className="w-6 h-6 animate-pulse text-primary" />
            </div>
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
          <p className="text-muted-foreground max-w-sm">
            You don't have any invoices yet. They will appear here once you make a purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card View
  const MobileInvoiceCard = ({ invoice }: { invoice: Invoice }) => {
    const statusConfig = getStatusConfig(invoice.status);
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold">{invoice.invoice_number}</p>
              <p className="text-2xl font-bold text-primary">${Number(invoice.amount).toFixed(2)}</p>
            </div>
            <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {invoice.status}
            </Badge>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Issued: {format(new Date(invoice.issued_at), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Due: {format(new Date(invoice.due_at), "MMM dd, yyyy")}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-1.5" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-1.5" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate totals
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Mobile View */}
      <div className="grid gap-3 md:hidden">
        {invoices.map((invoice) => (
          <MobileInvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="border-border/50 hidden md:block overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Invoice History
            </CardTitle>
            <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50 bg-muted/10">
                <TableHead className="font-semibold">Invoice</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Issued</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Due Date</TableHead>
                <TableHead className="font-semibold hidden xl:table-cell">Paid</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                return (
                  <TableRow key={invoice.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="font-bold text-primary">${Number(invoice.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 w-fit`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invoice.issued_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {format(new Date(invoice.due_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">
                      {invoice.paid_at ? format(new Date(invoice.paid_at), "MMM dd, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};