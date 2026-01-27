import React, { useState } from "react";
import { 
  Brain, 
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Target,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { createNotificationForAllStudents } from "@/hooks/useNotifications";

const AdminQuizzes: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: "",
    duration_minutes: "30",
    total_points: "100",
    is_active: true,
    start_date: "",
    end_date: "",
  });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, course:courses(name, code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name, code").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: attempts } = useQuery({
    queryKey: ["quiz-attempts-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_quiz_attempts").select("quiz_id");
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("quizzes").insert(data);
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      
      // Notify all students about new quiz
      await createNotificationForAllStudents(
        "📝 New Quiz Available",
        `A new quiz "${data.title}" has been added. Check it out!`,
        "info",
        "/quizzes"
      );
      
      toast.success("Quiz created and students notified!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create quiz"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("quizzes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast.success("Quiz updated");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update quiz"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast.success("Quiz deleted");
    },
    onError: () => toast.error("Failed to delete quiz"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course_id: "",
      duration_minutes: "30",
      total_points: "100",
      is_active: true,
      start_date: "",
      end_date: "",
    });
    setEditingQuiz(null);
  };

  const handleSubmit = () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      course_id: formData.course_id || null,
      duration_minutes: parseInt(formData.duration_minutes),
      total_points: parseInt(formData.total_points),
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingQuiz) {
      updateMutation.mutate({ id: editingQuiz.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (quiz: any) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      course_id: quiz.course_id || "",
      duration_minutes: quiz.duration_minutes?.toString() || "30",
      total_points: quiz.total_points?.toString() || "100",
      is_active: quiz.is_active ?? true,
      start_date: quiz.start_date?.slice(0, 16) || "",
      end_date: quiz.end_date?.slice(0, 16) || "",
    });
    setIsDialogOpen(true);
  };

  const getAttemptCount = (quizId: string) => attempts?.filter(a => a.quiz_id === quizId).length || 0;

  const filteredQuizzes = quizzes?.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.course?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold">Quizzes Management</h1>
            <p className="text-muted-foreground">Create and manage student assessments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Quiz</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingQuiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <Label>Course (Optional)</Label>
                  <Select value={formData.course_id} onValueChange={(v) => setFormData(p => ({ ...p, course_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {courses?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData(p => ({ ...p, duration_minutes: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Total Points</Label>
                    <Input type="number" value={formData.total_points} onChange={(e) => setFormData(p => ({ ...p, total_points: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(p => ({ ...p, is_active: c }))} />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingQuiz ? "Update Quiz" : "Create Quiz"}
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
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                  <p className="text-2xl font-bold">{quizzes?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{quizzes?.filter(q => q.is_active).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold">{attempts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quizzes..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes?.map((quiz: any) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge variant={quiz.is_active ? "default" : "secondary"}>
                    {quiz.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(quiz)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(quiz.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{quiz.description || "No description"}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{quiz.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Target className="h-4 w-4" />{quiz.total_points} pts</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{getAttemptCount(quiz.id)}</span>
                </div>
                {quiz.course && (
                  <Badge variant="outline" className="mt-3">{quiz.course.code}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!filteredQuizzes || filteredQuizzes.length === 0) && (
          <Card className="p-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No quizzes found</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQuizzes;
