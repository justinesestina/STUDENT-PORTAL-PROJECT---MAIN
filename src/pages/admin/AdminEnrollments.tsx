import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminEnrollments } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  GraduationCap,
  Search,
  Loader2,
  Users,
  BookOpen,
  RefreshCw,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { exportEnrollmentsToExcel } from "@/utils/exportExcel";

const AdminEnrollments: React.FC = () => {
  const { enrollments, loading, refetch } = useAdminEnrollments();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.student?.student_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enrollments.length,
    enrolled: enrollments.filter((e) => e.status === "enrolled").length,
    completed: enrollments.filter((e) => e.status === "completed").length,
    dropped: enrollments.filter((e) => e.status === "dropped").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Enrollment Management</h1>
            <p className="text-muted-foreground">
              View and manage student course enrollments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                exportEnrollmentsToExcel(enrollments as any);
                toast.success("Enrollment data exported to Excel!");
              }}
              disabled={enrollments.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Enrollments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enrolled}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.dropped}</p>
                <p className="text-xs text-muted-foreground">Dropped</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, ID, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No enrollments found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Students will appear here when they enroll"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">Student ID</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Progress</TableHead>
                      <TableHead className="hidden xl:table-cell">Enrolled Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {enrollment.student?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {enrollment.student?.student_number}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {enrollment.student?.student_number}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{enrollment.course?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course?.code} • {enrollment.course?.credits} Credits
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={
                              enrollment.status === "enrolled"
                                ? "default"
                                : enrollment.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {enrollment.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {enrollment.enrolled_at
                              ? format(new Date(enrollment.enrolled_at), "MMM d, yyyy")
                              : "-"}
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
    </AdminLayout>
  );
};

export default AdminEnrollments;
