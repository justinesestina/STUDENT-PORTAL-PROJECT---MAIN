import React from "react";
import { 
  Brain, 
  Clock, 
  Trophy,
  Play,
  CheckCircle2,
  BookOpen,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Quizzes: React.FC = () => {
  const { profile } = useAuth();

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, course:courses(name, code)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["quiz-attempts", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("student_quiz_attempts")
        .select("*, quiz:quizzes(title)")
        .eq("student_id", profile.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const completedCount = attempts?.filter(a => a.status === 'completed').length || 0;
  const avgScore = attempts?.filter(a => a.status === 'completed').reduce((acc, a) => acc + ((a.score || 0) / (a.total_points || 1) * 100), 0) / (completedCount || 1);

  const isLoading = quizzesLoading || attemptsLoading;

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
        <div>
          <h1 className="text-2xl font-bold">Quizzes & Assessments</h1>
          <p className="text-muted-foreground">Test your knowledge and track your progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{quizzes?.length || 0}</p>
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
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{avgScore.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{attempts?.filter(a => a.status === 'in_progress').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Quizzes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Quizzes</h2>
          {quizzes && quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz: any) => {
                const attempt = attempts?.find(a => a.quiz_id === quiz.id);
                const isCompleted = attempt?.status === 'completed';
                
                return (
                  <Card key={quiz.id} className="hover:shadow-lg transition-all duration-300 group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="mb-2">
                          {quiz.course?.code || "General"}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-success/20 text-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {quiz.description || "Test your knowledge with this quiz"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.duration_minutes} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {quiz.total_points} pts
                          </span>
                        </div>
                        
                        {isCompleted && attempt && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Your Score</span>
                              <span className="font-medium">{attempt.score}/{attempt.total_points}</span>
                            </div>
                            <Progress value={(attempt.score || 0) / (attempt.total_points || 1) * 100} className="h-2" />
                          </div>
                        )}
                        
                        <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                          <Play className="h-4 w-4 mr-2" />
                          {isCompleted ? "Review Quiz" : "Start Quiz"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available at the moment</p>
            </Card>
          )}
        </div>

        {/* Recent Attempts */}
        {attempts && attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.slice(0, 5).map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        attempt.status === 'completed' ? 'bg-success/20' : 'bg-warning/20'
                      }`}>
                        {attempt.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Clock className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{attempt.quiz?.title || "Quiz"}</p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.started_at && format(new Date(attempt.started_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    {attempt.status === 'completed' && (
                      <div className="text-right">
                        <p className="font-bold">{attempt.score}/{attempt.total_points}</p>
                        <p className="text-sm text-muted-foreground">
                          {((attempt.score || 0) / (attempt.total_points || 1) * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default Quizzes;
