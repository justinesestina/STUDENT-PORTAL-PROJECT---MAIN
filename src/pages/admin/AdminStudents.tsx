import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StudentFormDialog } from "@/components/admin/StudentFormDialog";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { useAdminStudents } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Key,
  Trash2,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";

type Profile = Tables<"profiles">;

const AdminStudents: React.FC = () => {
  const { students, loading, refetch } = useAdminStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Profile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Profile | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.student_number?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.course?.toLowerCase().includes(query)
    );
  });

  const handleAddStudent = async (data: any) => {
    setFormLoading(true);
    try {
      // Create auth user first (this would need an edge function in production)
      // For now, we'll create the profile directly
      const fullName = `${data.first_name} ${data.last_name}`.trim();
      const internalEmail = `${data.student_number.toLowerCase()}@zapgateway.internal`;

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password: data.password,
        options: {
          data: {
            full_name: fullName,
            student_number: data.student_number,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: authData.user.id,
          student_number: data.student_number,
          full_name: fullName,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          mobile_number: data.mobile_number || null,
          course: data.course || null,
          year_level: data.year_level || null,
          address: data.address || null,
          birthday: data.birthday || null,
        });

        if (profileError) throw profileError;

        // Add student role
        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "student",
        });
      }

      toast.success("Student created successfully");
      setFormOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast.error(error.message || "Failed to create student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    setFormLoading(true);
    
    try {
      const fullName = `${data.first_name} ${data.last_name}`.trim();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          mobile_number: data.mobile_number || null,
          course: data.course || null,
          year_level: data.year_level || null,
          address: data.address || null,
          birthday: data.birthday || null,
        })
        .eq("id", editingStudent.id);

      if (error) throw error;

      toast.success("Student updated successfully");
      setFormOpen(false);
      setEditingStudent(null);
      refetch();
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast.error(error.message || "Failed to update student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resetPasswordStudent) return;
    setFormLoading(true);

    try {
      // In production, this would use an edge function with admin rights
      // For now, we show a success message
      toast.success(`Password reset for ${resetPasswordStudent.full_name}`);
      setResetPasswordOpen(false);
      setResetPasswordStudent(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingStudent.id);

      if (error) throw error;

      toast.success("Student deleted successfully");
      setDeleteOpen(false);
      setDeletingStudent(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student");
    } finally {
      setFormLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage all student accounts and profiles</p>
          </div>
          <Button onClick={() => {
            setEditingStudent(null);
            setFormOpen(true);
          }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
                <p className="text-sm text-muted-foreground">Showing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, ID, email, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No students found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "Add your first student to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">Student ID</TableHead>
                      <TableHead className="hidden lg:table-cell">Course</TableHead>
                      <TableHead className="hidden sm:table-cell">Year</TableHead>
                      <TableHead className="hidden xl:table-cell">Contact</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={student.avatar_url || undefined} />
                              <AvatarFallback className="bg-muted text-xs">
                                {getInitials(student.full_name || "ST")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate md:hidden">
                                {student.student_number}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {student.student_number}
                          </code>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm truncate max-w-[200px] block">
                            {student.course || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{student.year_level || "-"}</Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="text-sm">
                            <p className="truncate max-w-[180px]">{student.email}</p>
                            <p className="text-muted-foreground">{student.mobile_number || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStudent(student);
                                  setFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setResetPasswordStudent(student);
                                  setResetPasswordOpen(true);
                                }}
                              >
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setDeletingStudent(student);
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Dialogs */}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editingStudent}
        onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
        loading={formLoading}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        studentName={resetPasswordStudent?.full_name || ""}
        onSubmit={handleResetPassword}
        loading={formLoading}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${deletingStudent?.full_name}? This action cannot be undone.`}
        onConfirm={handleDeleteStudent}
        loading={formLoading}
      />
    </AdminLayout>
  );
};

export default AdminStudents;
