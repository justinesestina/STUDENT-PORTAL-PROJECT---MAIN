import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminCourses } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  BookPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  Users,
  Star,
} from "lucide-react";

type Course = Tables<"courses">;

interface CourseForm {
  code: string;
  name: string;
  description: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  max_enrollment: number;
}

const defaultForm: CourseForm = {
  code: "",
  name: "",
  description: "",
  instructor: "",
  credits: 3,
  schedule: "",
  room: "",
  max_enrollment: 40,
};

const AdminCourses: React.FC = () => {
  const { courses, loading, refetch } = useAdminCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(defaultForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.name?.toLowerCase().includes(query) ||
      course.code?.toLowerCase().includes(query) ||
      course.instructor?.toLowerCase().includes(query)
    );
  });

  const handleOpenForm = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setForm({
        code: course.code || "",
        name: course.name || "",
        description: course.description || "",
        instructor: course.instructor || "",
        credits: course.credits || 3,
        schedule: course.schedule || "",
        room: course.room || "",
        max_enrollment: course.max_enrollment || 40,
      });
    } else {
      setEditingCourse(null);
      setForm(defaultForm);
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update({
            code: form.code,
            name: form.name,
            description: form.description || null,
            instructor: form.instructor || null,
            credits: form.credits,
            schedule: form.schedule || null,
            room: form.room || null,
            max_enrollment: form.max_enrollment,
          })
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase.from("courses").insert({
          code: form.code,
          name: form.name,
          description: form.description || null,
          instructor: form.instructor || null,
          credits: form.credits,
          schedule: form.schedule || null,
          room: form.room || null,
          max_enrollment: form.max_enrollment,
          current_enrollment: 0,
        });

        if (error) throw error;
        toast.success("Course created successfully");
      }

      setFormOpen(false);
      setForm(defaultForm);
      refetch();
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast.error(error.message || "Failed to save course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", deletingCourse.id);

      if (error) throw error;

      toast.success("Course deleted successfully");
      setDeleteOpen(false);
      setDeletingCourse(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(error.message || "Failed to delete course");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">Manage all courses and subjects</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <BookPlus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((acc, c) => acc + (c.current_enrollment || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(courses.reduce((acc, c) => acc + (c.rating || 0), 0) / (courses.length || 1)).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by name, code, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Add your first course"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="hidden md:table-cell">Instructor</TableHead>
                      <TableHead className="hidden sm:table-cell">Credits</TableHead>
                      <TableHead className="hidden lg:table-cell">Enrollment</TableHead>
                      <TableHead className="hidden xl:table-cell">Schedule</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <code className="text-xs text-muted-foreground">{course.code}</code>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {course.instructor || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{course.credits}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {course.current_enrollment}/{course.max_enrollment}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {course.schedule || "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenForm(course)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setDeletingCourse(course);
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Create a new course"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="CS101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={6}
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Introduction to Computer Science"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Dr. John Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  placeholder="MWF 9:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="Room 101"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCourse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.name}"?`}
        onConfirm={handleDelete}
        loading={formLoading}
      />
    </AdminLayout>
  );
};

export default AdminCourses;
