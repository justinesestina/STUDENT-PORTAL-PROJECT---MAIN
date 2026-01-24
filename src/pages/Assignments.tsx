import React, { useState } from "react";
import { 
  Clock, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Download,
  FileText,
  Eye,
  Filter
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
import { StudentLayout } from "@/components/layout/StudentLayout";
import { toast } from "sonner";

// Mock data
const assignmentStats = [
  { label: "Pending", value: 2, icon: Clock, color: "text-warning" },
  { label: "Submitted", value: 1, icon: Upload, color: "text-info" },
  { label: "Overdue", value: 1, icon: AlertCircle, color: "text-destructive" },
  { label: "Avg Grade", value: "85%", icon: CheckCircle, color: "text-success" },
];

const assignments = [
  {
    id: "1",
    title: "Data Structures Implementation",
    course: "Computer Science Fundamentals",
    code: "CS101",
    points: 100,
    description: "Implement binary tree and hash table data structures with full documentation.",
    dueDate: "2024-03-15T23:59:00",
    status: "pending",
    priority: "High",
    attachments: ["project_spec.pdf", "starter_code.zip"],
    daysOverdue: 679,
  },
  {
    id: "2",
    title: "Calculus Problem Set #3",
    course: "Advanced Mathematics",
    code: "MATH301",
    points: 50,
    description: "Complete problems 1-25 from Chapter 8, focusing on integration techniques.",
    dueDate: "2024-03-12T23:59:00",
    status: "overdue",
    priority: "High",
    attachments: ["problem_set_3.pdf"],
    daysOverdue: 682,
    submitted: true,
  },
  {
    id: "3",
    title: "Physics Lab Report",
    course: "Physics II",
    code: "PHYS202",
    points: 75,
    description: "Write a detailed lab report on the electromagnetic induction experiment.",
    dueDate: "2024-03-20T17:00:00",
    status: "pending",
    priority: "Medium",
    attachments: ["lab_template.docx"],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "submitted": return "bg-blue-100 text-blue-700 border-blue-300";
    case "overdue": return "bg-red-100 text-red-700 border-red-300";
    case "graded": return "bg-green-100 text-green-700 border-green-300";
    default: return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const Assignments: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleSubmit = (title: string) => {
    toast.success(`Assignment "${title}" submission started`);
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Track and manage your course assignments</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="cs101">CS101</SelectItem>
                <SelectItem value="math301">MATH301</SelectItem>
                <SelectItem value="phys202">PHYS202</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assignmentStats.map((stat) => (
            <Card key={stat.label} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {assignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className={`border-l-4 ${
                  assignment.status === "overdue" ? "border-l-destructive" : 
                  assignment.status === "pending" ? "border-l-warning" : 
                  "border-l-success"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.course} • {assignment.code} • {assignment.points} points
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {assignment.daysOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            {assignment.daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>

                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                          {assignment.attachments.map((file, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {file}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      <Badge variant="outline">{assignment.priority} Priority</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                    {assignment.submitted ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Submission
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download Files
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleSubmit(assignment.title)}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Assignment
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download Files
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Upcoming assignments will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Submitted assignments will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graded">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Graded assignments will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Assignments;
