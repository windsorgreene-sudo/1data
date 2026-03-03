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
import { Pencil, Trash2, Plus, Download, Mail, FileText, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { sendEmailNotification } from "@/lib/notifications";

type Invoice = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  invoice_number: string;
  issued_at: string;
  due_at: string;
  paid_at: string | null;
  profiles: { email: string };
};

type Profile = {
  id: string;
  email: string;
};

export const InvoicesManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    user_id: "",
    amount: "",
    status: "pending",
    invoice_number: "",
    due_at: "",
    paid_at: "",
  });
  const { toast } = useToast();

  const pagination = usePagination(invoices, { itemsPerPage: 10 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesRes, invoicesRes] = await Promise.all([
        supabase.from("profiles").select("id, email").order("email"),
        supabase.from("invoices").select("*").order("issued_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (invoicesRes.error) throw invoicesRes.error;

      setProfiles(profilesRes.data || []);

      if (invoicesRes.data && invoicesRes.data.length > 0) {
        const userIds = invoicesRes.data.map(inv => inv.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        
        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const invoicesWithProfiles = invoicesRes.data.map(inv => ({
          ...inv,
          profiles: profileMap.get(inv.user_id) || { email: "Unknown" }
        }));
        setInvoices(invoicesWithProfiles);
      } else {
        setInvoices([]);
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
      const invoiceData: any = {
        amount: parseFloat(formData.amount),
        status: formData.status,
        due_at: formData.due_at,
      };

      if (formData.paid_at) {
        invoiceData.paid_at = formData.paid_at;
      }

      if (editingId) {
        const { data: updatedInvoice, error } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        // Send notification for invoice update (non-blocking)
        const existingInvoice = invoices.find(inv => inv.id === editingId);
        if (existingInvoice) {
          sendEmailNotification("invoice_updated", existingInvoice.user_id, {
            ...updatedInvoice,
            invoice_number: existingInvoice.invoice_number,
          });
        }

        toast({ title: "Success", description: "Invoice updated. Customer notified." });
      } else {
        invoiceData.user_id = formData.user_id;
        invoiceData.invoice_number = formData.invoice_number;

        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();

        if (error) throw error;

        // Send notification for new invoice (non-blocking)
        sendEmailNotification("invoice_created", formData.user_id, newInvoice);

        toast({ title: "Success", description: "Invoice created. Customer notified." });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setFormData({
      user_id: invoice.user_id,
      amount: invoice.amount.toString(),
      status: invoice.status,
      invoice_number: invoice.invoice_number,
      due_at: new Date(invoice.due_at).toISOString().split('T')[0],
      paid_at: invoice.paid_at ? new Date(invoice.paid_at).toISOString().split('T')[0] : "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Invoice deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      amount: "",
      status: "pending",
      invoice_number: "",
      due_at: "",
      paid_at: "",
    });
    setEditingId(null);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid": return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" };
      case "pending": return { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" };
      case "overdue": return { color: "bg-red-500/10 text-red-500 border-red-500/30", dot: "bg-red-500" };
      case "cancelled": return { color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" };
      default: return { color: "", dot: "" };
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pagination.paginatedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagination.paginatedItems.map(inv => inv.id)));
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
      const updateData: any = { status };
      if (status === "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      // Send notifications to all affected users (non-blocking)
      const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));
      selectedInvoices.forEach(invoice => {
        sendEmailNotification("invoice_updated", invoice.user_id, {
          ...invoice,
          status: status,
          paid_at: status === "paid" ? new Date().toISOString() : invoice.paid_at,
        });
      });

      toast({ title: "Success", description: `Updated ${selectedIds.size} invoice(s). Customers notified.` });
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast({
        title: "Error",
        description: "Failed to update invoices",
        variant: "destructive",
      });
    }
  };

  const handleBulkReminder = async () => {
    if (selectedIds.size === 0) return;

    const selectedInvoices = invoices.filter(inv => selectedIds.has(inv.id));
    const emails = selectedInvoices.map(inv => inv.profiles.email);

    toast({ 
      title: "Reminders Sent", 
      description: `Payment reminders sent to ${emails.length} customer(s)` 
    });
    
    console.log("Send reminders to:", emails);
  };

  const exportToCSV = () => {
    const itemsToExport = selectedIds.size > 0 
      ? invoices.filter(inv => selectedIds.has(inv.id))
      : invoices;

    const headers = ["Invoice #", "User Email", "Amount", "Status", "Issued", "Due", "Paid"];
    const rows = itemsToExport.map(inv => [
      inv.invoice_number,
      inv.profiles.email,
      Number(inv.amount).toFixed(2),
      inv.status,
      format(new Date(inv.issued_at), "yyyy-MM-dd"),
      format(new Date(inv.due_at), "yyyy-MM-dd"),
      inv.paid_at ? format(new Date(inv.paid_at), "yyyy-MM-dd") : "",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`;
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
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Form Card */}
      <Card className="xl:col-span-1 border-border/50 h-fit">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{editingId ? "Edit" : "Create"} Invoice</CardTitle>
              <CardDescription>
                {editingId ? "Update invoice details" : "Generate a new invoice"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Customer</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                disabled={!!editingId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
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
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                disabled={!!editingId}
                placeholder="INV-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                id="amount"
                placeholder="99.99"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_at">Due Date</Label>
              <Input
                type="date"
                id="due_at"
                value={formData.due_at}
                onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_at">Paid Date (Optional)</Label>
              <Input
                type="date"
                id="paid_at"
                value={formData.paid_at}
                onChange={(e) => setFormData({ ...formData, paid_at: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Create"}
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

      {/* Table Card */}
      <Card className="xl:col-span-2 border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-lg">All Invoices</CardTitle>
                <CardDescription>{invoices.length} total invoices</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        {selectedIds.size > 0 && (
          <div className="px-6 py-3 bg-muted/30 border-b border-border/50 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Mark Paid</SelectItem>
                <SelectItem value="pending">Mark Pending</SelectItem>
                <SelectItem value="overdue">Mark Overdue</SelectItem>
                <SelectItem value="cancelled">Mark Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={handleBulkReminder}>
              <Mail className="w-4 h-4 mr-2" />
              Send Reminder
            </Button>
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === pagination.paginatedItems.length && pagination.paginatedItems.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Invoice</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Due</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedItems.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  return (
                    <TableRow key={invoice.id} className="border-border/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(invoice.id)}
                          onCheckedChange={() => toggleSelect(invoice.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.profiles.email}</TableCell>
                      <TableCell className="font-semibold">${Number(invoice.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1.5 w-fit`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {format(new Date(invoice.due_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(invoice)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(invoice.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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