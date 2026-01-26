import React from "react";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Download,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Payments: React.FC = () => {
  const { profile } = useAuth();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const totalDue = payments?.filter(p => p.status === 'pending').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payments & Billing</h1>
            <p className="text-muted-foreground">View and manage your tuition and fees</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">₱{totalDue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">₱{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Methods</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.due_date && `Due: ${format(new Date(payment.due_date), "MMM d, yyyy")}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold">₱{Number(payment.amount).toLocaleString()}</p>
                          {getStatusBadge(payment.status || 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payment records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-6">
                {payments?.filter(p => p.status === 'pending').length ? (
                  <div className="space-y-4">
                    {payments.filter(p => p.status === 'pending').map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {payment.due_date && format(new Date(payment.due_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold">₱{Number(payment.amount).toLocaleString()}</p>
                          <Button size="sm">Pay Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No pending payments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card>
              <CardContent className="p-6">
                {payments?.filter(p => p.status === 'paid').length ? (
                  <div className="space-y-4">
                    {payments.filter(p => p.status === 'paid').map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Paid: {payment.paid_at && format(new Date(payment.paid_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold">₱{Number(payment.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No paid payments yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Payments;
