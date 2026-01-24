import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const availableCourses = [
  {
    id: "1",
    code: "CS401",
    name: "Advanced Algorithms",
    instructor: "Dr. Anderson",
    credits: 3,
    description: "Deep dive into advanced algorithmic concepts and optimization techniques.",
    schedule: "Mon, Wed, Fri • 10:00-11:00 AM",
    room: "Engineering Building - Room 204",
    enrolled: 28,
    max: 35,
    level: "Advanced",
    prerequisites: ["CS301", "MATH250"],
    rating: 4.8,
  },
  {
    id: "2",
    code: "CS450",
    name: "Machine Learning Fundamentals",
    instructor: "Prof. Chen",
    credits: 4,
    description: "Introduction to machine learning algorithms and practical applications.",
    schedule: "Tue, Thu • 2:00-4:00 PM",
    room: "Computer Lab - Room 105",
    enrolled: 32,
    max: 40,
    level: "Intermediate",
    prerequisites: ["CS301", "STAT200"],
    rating: 4.9,
  },
  {
    id: "3",
    code: "CS350",
    name: "Database Systems",
    instructor: "Dr. Kumar",
    credits: 3,
    description: "Comprehensive study of database design, implementation, and management.",
    schedule: "Mon, Wed • 1:00-2:30 PM",
    room: "Engineering Building - Room 301",
    enrolled: 15,
    max: 30,
    level: "Intermediate",
    prerequisites: ["CS201"],
    rating: 4.6,
  },
];

const myCourses = [
  {
    id: "1",
    code: "MATH301",
    name: "Advanced Mathematics",
    instructor: "Dr. Smith",
    credits: 4,
    status: "enrolled",
    progress: 75,
  },
  {
    id: "2",
    code: "CS101",
    name: "Computer Science Fundamentals",
    instructor: "Prof. Johnson",
    credits: 3,
    status: "enrolled",
    progress: 90,
  },
];

const Enrollment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleEnroll = (courseName: string) => {
    toast.success(`Successfully enrolled in ${courseName}`);
  };

  const filteredCourses = availableCourses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCredits = myCourses.reduce((sum, c) => sum + c.credits, 0);
  const maxCredits = 18;

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Enrollment</h1>
            <p className="text-muted-foreground">Browse and enroll in available courses</p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Current Credits: {currentCredits}/{maxCredits}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.code} • {course.instructor} • {course.credits} Credits
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {course.schedule}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {course.room}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {course.enrolled}/{course.max} enrolled
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant={course.level === "Advanced" ? "destructive" : "secondary"}>
                        {course.level}
                      </Badge>
                      {course.prerequisites.length > 0 && (
                        <Badge variant="outline">
                          Prerequisites: {course.prerequisites.join(", ")}
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleEnroll(course.name)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.code} • {course.instructor} • {course.credits} Credits
                        </p>
                      </div>
                      <Badge variant="default">Enrolled</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="waitlist">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No courses in waitlist</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default Enrollment;
