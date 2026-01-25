import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Clock, 
  MapPin,
  Save,
  X,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimetableEntry {
  id: string;
  course_id: string | null;
  title: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string | null;
  event_type: string | null;
  course?: { code: string; name: string } | null;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const eventTypes = ["Lecture", "Lab", "Tutorial", "Seminar", "Exam", "Meeting"];
const eventColors: Record<string, string> = {
  "Lecture": "bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  "Lab": "bg-purple-100 border-purple-500 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  "Tutorial": "bg-green-100 border-green-500 text-green-900 dark:bg-green-900/30 dark:text-green-200",
  "Seminar": "bg-orange-100 border-orange-500 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  "Exam": "bg-red-100 border-red-500 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  "Meeting": "bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
};

const AdminTimetable: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    room: "",
    event_type: "Lecture"
  });

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('timetable-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEntries(), fetchCourses()]);
    setLoading(false);
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select('*, course:courses(code, name)')
        .is('student_id', null)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name')
        .order('code');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenDialog = (entry?: TimetableEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        course_id: entry.course_id || "",
        title: entry.title || "",
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room || "",
        event_type: entry.event_type || "Lecture"
      });
    } else {
      setEditingEntry(null);
      setFormData({
        course_id: "",
        title: "",
        day_of_week: "Monday",
        start_time: "09:00",
        end_time: "10:00",
        room: "",
        event_type: "Lecture"
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.course_id && !formData.title) {
      toast.error('Please select a course or enter a title');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const payload = {
        course_id: formData.course_id || null,
        title: formData.title || null,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room || null,
        event_type: formData.event_type,
        student_id: null
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('timetable')
          .update(payload)
          .eq('id', editingEntry.id);
        
        if (error) throw error;
        toast.success('Entry updated');
      } else {
        const { error } = await supabase
          .from('timetable')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Entry added');
      }

      setDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entry deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const getEntriesForSlot = (day: string, time: string) => {
    return entries.filter(entry => 
      entry.day_of_week === day && 
      entry.start_time <= time && 
      entry.end_time > time
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <p className="text-muted-foreground">Create and manage class schedules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
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
                  <div key={time} className="grid grid-cols-7 gap-px bg-border">
                    <div className="bg-card p-2 text-sm text-muted-foreground">
                      {formatTime(time)}
                    </div>
                    {days.map((day) => {
                      const slotEntries = getEntriesForSlot(day, time);
                      return (
                        <div key={day} className="bg-card p-1 min-h-[60px]">
                          {slotEntries.map((entry) => (
                            <div 
                              key={entry.id}
                              className={`p-2 rounded-lg border-l-4 text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity ${eventColors[entry.event_type || 'Lecture']}`}
                              onClick={() => handleOpenDialog(entry)}
                            >
                              <p className="font-semibold truncate">
                                {entry.course?.code || entry.title}
                              </p>
                              {entry.room && (
                                <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(type => (
                <Badge key={type} className={eventColors[type]} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course (Optional)</Label>
                <Select value={formData.course_id} onValueChange={(v) => setFormData({...formData, course_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Title (if no course)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Study Group, Office Hours"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select value={formData.day_of_week} onValueChange={(v) => setFormData({...formData, day_of_week: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={formData.event_type} onValueChange={(v) => setFormData({...formData, event_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Room/Location</Label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="e.g., Room 204, Lab 1"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {editingEntry && (
                <Button variant="destructive" onClick={() => { handleDelete(editingEntry.id); setDialogOpen(false); }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTimetable;
