import React from "react";
import { 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Download,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentLayout } from "@/components/layout/StudentLayout";

// Mock data
const gradeStats = [
  { label: "Current GPA", value: "3.67", icon: Target },
  { label: "Cumulative GPA", value: "3.75", icon: Award },
  { label: "Current Credits", value: "10", icon: TrendingUp },
  { label: "Total Credits", value: "45", icon: Calendar },
];

const courseGrades = [
  {
    code: "MATH301",
    name: "Advanced Mathematics",
    instructor: "Dr. Smith",
    credits: 4,
    currentGrade: "A-",
    gpaImpact: 3.7,
    assignments: [
      { name: "Quiz 1", grade: "A-", points: "18/20", weight: "10%", date: "2024-01-15" },
      { name: "Midterm Exam", grade: "B+", points: "85/100", weight: "30%", date: "2024-02-15" },
      { name: "Homework 1", grade: "A", points: "95/100", weight: "15%", date: "2024-01-22" },
      { name: "Homework 2", grade: "A-", points: "90/100", weight: "15%", date: "2024-02-05" },
    ],
  },
  {
    code: "CS101",
    name: "Computer Science Fundamentals",
    instructor: "Prof. Johnson",
    credits: 3,
    currentGrade: "A",
    gpaImpact: 4.0,
    assignments: [
      { name: "Programming Assignment 1", grade: "A", points: "100/100", weight: "20%", date: "2024-01-20" },
      { name: "Quiz 1", grade: "A+", points: "20/20", weight: "10%", date: "2024-01-25" },
      { name: "Programming Assignment 2", grade: "A", points: "95/100", weight: "20%", date: "2024-02-10" },
    ],
  },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "grade-a";
  if (grade.startsWith("B")) return "grade-b";
  if (grade.startsWith("C")) return "grade-c";
  if (grade.startsWith("D")) return "grade-d";
  return "grade-f";
};

const Grades: React.FC = () => {
  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Grades & Transcript</h1>
            <p className="text-muted-foreground">Track your academic performance and progress</p>
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="spring-2024">
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring-2024">Spring 2024 (Current)</SelectItem>
                <SelectItem value="fall-2023">Fall 2023</SelectItem>
                <SelectItem value="spring-2023">Spring 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Transcript
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeStats.map((stat) => (
            <Card key={stat.label} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="history">Grade History</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {courseGrades.map((course) => (
              <Card key={course.code}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.instructor} • {course.credits} Credits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Grade:</p>
                    <Badge className={`${getGradeColor(course.currentGrade)} text-lg px-3 py-1`}>
                      {course.currentGrade}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      GPA Impact: {course.gpaImpact}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.assignments.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{assignment.name}</TableCell>
                          <TableCell>
                            <span className={`grade-badge ${getGradeColor(assignment.grade)}`}>
                              {assignment.grade}
                            </span>
                          </TableCell>
                          <TableCell>{assignment.points}</TableCell>
                          <TableCell>{assignment.weight}</TableCell>
                          <TableCell>{assignment.date}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Grade history will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Performance analytics will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Grades;
