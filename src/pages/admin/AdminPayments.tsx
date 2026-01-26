import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminPayments: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    description: "",
    payment_type: "tuition",
    status: "pending",
    due_date: "",
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, student:profiles(full_name, student_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, student_number")
        .order("full_name");
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("payments").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Payment record created");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create payment"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("payments").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Payment updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update payment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Payment deleted");
    },
    onError: () => toast.error("Failed to delete payment"),
  });

  const resetForm = () => {
    setFormData({
      student_id: "",
      amount: "",
      description: "",
      payment_type: "tuition",
      status: "pending",
      due_date: "",
    });
    setEditingPayment(null);
  };

  const handleSubmit = () => {
    const payload = {
      student_id: formData.student_id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      payment_type: formData.payment_type,
      status: formData.status,
      due_date: formData.due_date || null,
      paid_at: formData.status === "paid" ? new Date().toISOString() : null,
    };

    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (payment: any) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id,
      amount: payment.amount.toString(),
      description: payment.description,
      payment_type: payment.payment_type || "tuition",
      status: payment.status || "pending",
      due_date: payment.due_date || "",
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments?.filter(p =>
    p.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student?.student_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPending = payments?.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payments Management</h1>
            <p className="text-muted-foreground">Manage student payments and billing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPayment ? "Edit Payment" : "Add Payment"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Student</Label>
                  <Select value={formData.student_id} onValueChange={(v) => setFormData(p => ({ ...p, student_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {students?.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.student_number})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (₱)</Label>
                  <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.payment_type} onValueChange={(v) => setFormData(p => ({ ...p, payment_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="tuition">Tuition</SelectItem>
                        <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.due_date} onChange={(e) => setFormData(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPayment ? "Update Payment" : "Create Payment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{payments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">₱{totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold">₱{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by student or description..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Student</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Due Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments?.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{payment.student?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{payment.student?.student_number}</p>
                        </div>
                      </td>
                      <td className="p-4">{payment.description}</td>
                      <td className="p-4 font-bold">₱{Number(payment.amount).toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">
                        {payment.due_date ? format(new Date(payment.due_date), "MMM d, yyyy") : "-"}
                      </td>
                      <td className="p-4">{getStatusBadge(payment.status || "pending")}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(payment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(payment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredPayments || filteredPayments.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">No payment records found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
