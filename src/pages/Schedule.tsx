import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { format, addDays, startOfWeek } from "date-fns";

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Mock schedule data
const scheduleData: Record<string, Record<string, { code: string; name: string; room: string; type: string; color: string }>> = {
  "Monday": {
    "9:00 AM": { code: "MATH301", name: "Advanced Mathematics", room: "Engineering Building", type: "Lecture", color: "bg-blue-100 border-blue-500 text-blue-900" },
    "2:00 PM": { code: "PHYS202", name: "Physics II Lab", room: "Physics Lab", type: "Lab", color: "bg-purple-100 border-purple-500 text-purple-900" },
  },
  "Tuesday": {
    "11:00 AM": { code: "CS101", name: "Computer Science Fundamentals", room: "Computer Lab", type: "Lecture", color: "bg-green-100 border-green-500 text-green-900" },
    "3:00 PM": { code: "STUDY", name: "Study Group - Mathematics", room: "Library", type: "Study", color: "bg-emerald-100 border-emerald-500 text-emerald-900" },
  },
  "Wednesday": {
    "9:00 AM": { code: "MATH301", name: "Advanced Mathematics", room: "Engineering Building", type: "Lecture", color: "bg-blue-100 border-blue-500 text-blue-900" },
    "1:00 PM": { code: "PHYS202", name: "Physics II", room: "Physics Building", type: "Lecture", color: "bg-purple-100 border-purple-500 text-purple-900" },
  },
  "Thursday": {
    "11:00 AM": { code: "CS101", name: "Computer Science Fundamentals", room: "Computer Lab", type: "Lab", color: "bg-green-100 border-green-500 text-green-900" },
    "4:00 PM": { code: "OFFICE", name: "Office Hours - Dr. Smith", room: "Engineering Building", type: "Meeting", color: "bg-orange-100 border-orange-500 text-orange-900" },
  },
  "Friday": {
    "9:00 AM": { code: "MATH301", name: "Advanced Mathematics", room: "Engineering Building", type: "Lecture", color: "bg-blue-100 border-blue-500 text-blue-900" },
    "2:00 PM": { code: "CS101", name: "CS Assignment Review", room: "Computer Lab", type: "Review", color: "bg-yellow-100 border-yellow-500 text-yellow-900" },
  },
};

const todaysSchedule = [
  { time: "9:00 AM", name: "Advanced Mathematics", code: "MATH301", location: "Engineering Building - Room 204", type: "Lecture" },
  { time: "2:00 PM", name: "Physics II Lab", code: "PHYS202", location: "Physics Lab - Room 101", type: "Lab" },
];

const upcomingDeadlines = [
  { title: "Mathematics Quiz", time: "Today, 2:00 PM", location: "Engineering Building - Room 204", icon: "📝" },
  { title: "CS Assignment Due", time: "Tomorrow, 11:59 PM", location: "Online Submission", icon: "📋" },
  { title: "Physics Lab Report", time: "Friday, 5:00 PM", location: "Online Submission", icon: "📋" },
];

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <p className="text-muted-foreground">Manage your weekly class schedule and events</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="week">
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold">
                  Week of {format(weekStart, "MMMM d, yyyy")}
                </h2>
                <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-px bg-border rounded-t-lg overflow-hidden">
                  <div className="bg-card p-3 font-medium text-sm text-muted-foreground">
                    Time
                  </div>
                  {days.map((day) => (
                    <div key={day} className="bg-card p-3 font-medium text-sm text-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="border rounded-b-lg overflow-hidden">
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-6 gap-px bg-border">
                      <div className="bg-card p-3 text-sm text-muted-foreground">
                        {time}
                      </div>
                      {days.map((day) => {
                        const event = scheduleData[day]?.[time];
                        return (
                          <div key={day} className="bg-card p-1 min-h-[60px]">
                            {event && (
                              <div className={`p-2 rounded-lg border-l-4 text-xs ${event.color}`}>
                                <p className="font-semibold">{event.code}</p>
                                <p className="text-xs opacity-75">{event.name}</p>
                                <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.room}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Today's Schedule
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysSchedule.map((item, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-sm font-medium w-16">{item.time}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="h-fit">{item.type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.map((item, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg border">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Schedule;
