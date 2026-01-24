import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

const AdminAttendance: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track and manage student attendance</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Attendance Tracking</h3>
            <p className="text-muted-foreground">
              Attendance management functionality coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
