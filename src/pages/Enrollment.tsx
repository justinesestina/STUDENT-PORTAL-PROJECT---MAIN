import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Plus,
  Loader2,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useEnrollment, COLLEGE_COURSES } from "@/hooks/useEnrollment";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Enrollment: React.FC = () => {
  const { profile, user } = useAuth();
  const {
    availableCourses,
    enrolledCourses,
    loading,
    enrolling,
    currentCredits,
    maxCredits,
    enrollInCourse,
    collegeCourses,
    refetch,
  } = useEnrollment();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [enrollingProgram, setEnrollingProgram] = useState(false);

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === "all" || course.level?.toLowerCase() === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const result = await enrollInCourse(courseId);
      toast.success(`Successfully enrolled in ${result.courseName}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll");
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some((e) => e.course_id === courseId);
  };

  // Handle program enrollment with subjects
  const handleProgramEnroll = async () => {
    if (!selectedProgram || !profile?.id || !user?.id) {
      toast.error("Please select a program");
      return;
    }

    const program = collegeCourses.find((c) => c.id === selectedProgram);
    if (!program) return;

    setEnrollingProgram(true);
    try {
      // Program enrollment touches tables that students cannot write to directly
      // (e.g., courses/timetable). We delegate this to a secured backend function.
      const { data: res, error } = await supabase.functions.invoke("student-enroll-program", {
        body: { programId: selectedProgram },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!res?.success) {
        throw new Error(res?.error || "Failed to complete enrollment");
      }

      toast.success(`Successfully enrolled in ${program.name}!`);
      setEnrollDialogOpen(false);
      setSelectedProgram(null);
      setSelectedSubjects([]);

      // Refresh client-side enrollment data
      await refetch();
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Failed to complete enrollment");
    } finally {
      setEnrollingProgram(false);
    }
  };

  const selectedProgramData = collegeCourses.find((c) => c.id === selectedProgram);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Course Enrollment</h1>
            <p className="text-muted-foreground">
              Browse and enroll in available courses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Credits: {currentCredits}/{maxCredits}
            </Badge>
            <Button onClick={() => setEnrollDialogOpen(true)}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Enroll in Program
            </Button>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Student ID: <span className="font-mono font-medium">{profile?.student_number}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Program: {profile?.course || "Not enrolled in a program yet"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{enrolledCourses.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="my-courses">
              My Courses ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No courses available</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "Check back later for new courses"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{course.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.instructor || "TBA"} •{" "}
                            {course.credits} Credits
                          </p>
                        </div>
                        {course.rating && (
                          <div className="flex items-center gap-1 text-warning">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {course.description || "No description available"}
                      </p>

                      <div className="space-y-2 text-sm">
                        {course.schedule && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.schedule}
                          </div>
                        )}
                        {course.room && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {course.room}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {course.current_enrollment}/{course.max_enrollment}{" "}
                          enrolled
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Badge
                          variant={
                            course.level === "Advanced"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {course.level || "Intermediate"}
                        </Badge>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={() => handleEnrollCourse(course.id)}
                        disabled={
                          enrolling ||
                          isEnrolled(course.id) ||
                          (course.current_enrollment || 0) >=
                            (course.max_enrollment || 40)
                        }
                      >
                        {isEnrolled(course.id) ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Enrolled
                          </>
                        ) : enrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Enroll Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No enrolled courses</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by enrolling in a program or individual courses
                  </p>
                  <Button onClick={() => setEnrollDialogOpen(true)}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {enrollment.course?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.course?.code} •{" "}
                            {enrollment.course?.instructor || "TBA"} •{" "}
                            {enrollment.course?.credits} Credits
                          </p>
                        </div>
                        <Badge variant="default">Enrolled</Badge>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        {enrollment.course?.schedule && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {enrollment.course.schedule}
                          </div>
                        )}
                        {enrollment.course?.room && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {enrollment.course.room}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment.progress || 0} />
                      </div>

                      <p className="text-xs text-muted-foreground mt-4">
                        Enrolled on{" "}
                        {new Date(
                          enrollment.enrolled_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collegeCourses.map((program) => (
                <Card
                  key={program.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                  onClick={() => {
                    setSelectedProgram(program.id);
                    setEnrollDialogOpen(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{program.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {program.code}
                    </p>
                    <Badge variant="outline">
                      {program.subjects.length} Subjects
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-3">
                      {program.subjects.reduce((acc, s) => acc + s.credits, 0)}{" "}
                      Total Credits
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Program Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll in a Program</DialogTitle>
            <DialogDescription>
              Select a program to view its subjects and complete your enrollment.
              Your Student ID ({profile?.student_number}) will be used for this
              enrollment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Program Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Program</label>
              <Select
                value={selectedProgram || ""}
                onValueChange={setSelectedProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a program..." />
                </SelectTrigger>
                <SelectContent>
                  {collegeCourses.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.code} - {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subjects List */}
            {selectedProgramData && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Subjects ({selectedProgramData.subjects.length})
                </label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedProgramData.subjects.map((subject) => (
                    <div
                      key={subject.code}
                      className="p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.code} • {subject.credits} Credits
                          </p>
                        </div>
                        <Badge variant="outline">{subject.credits} CR</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {subject.schedule}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {subject.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium">Total Credits:</span>
                  <span className="font-bold text-primary">
                    {selectedProgramData.subjects.reduce(
                      (acc, s) => acc + s.credits,
                      0
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEnrollDialogOpen(false);
                setSelectedProgram(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProgramEnroll}
              disabled={!selectedProgram || enrollingProgram}
            >
              {enrollingProgram ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
};

export default Enrollment;
