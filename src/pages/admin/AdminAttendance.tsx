import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Download,
  Search,
  Users,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from "date-fns";

interface Student {
  id: string;
  student_number: string;
  full_name: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: string;
  remarks: string | null;
}

const AdminAttendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        supabase.from('profiles').select('id, student_number, full_name').order('full_name'),
        supabase.from('courses').select('id, code, name').order('code')
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (coursesRes.data) {
        setCourses(coursesRes.data);
        if (coursesRes.data.length > 0) {
          setSelectedCourse(coursesRes.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourse)
        .eq('date', selectedDate);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getStudentAttendance = (studentId: string): AttendanceRecord | undefined => {
    return attendance.find(a => a.student_id === studentId);
  };

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!selectedCourse || !selectedDate) return;
    
    setSaving(true);
    try {
      const existing = getStudentAttendance(studentId);
      
      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            course_id: selectedCourse,
            date: selectedDate,
            status
          });
        
        if (error) throw error;
      }
      
      await fetchAttendance();
      toast.success('Attendance updated');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    }
    setSaving(false);
  };

  const handleMarkAll = async (status: 'present' | 'absent') => {
    if (!selectedCourse || !selectedDate || students.length === 0) return;
    
    setSaving(true);
    try {
      const records = students.map(student => ({
        student_id: student.id,
        course_id: selectedCourse,
        date: selectedDate,
        status
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,course_id,date' });
      
      if (error) throw error;
      
      await fetchAttendance();
      toast.success(`Marked all students as ${status}`);
    } catch (error) {
      console.error('Error marking all:', error);
      toast.error('Failed to mark all');
    }
    setSaving(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><Check className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
      case 'excused':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Excused</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
  };

  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'Select Course';

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Management</h1>
            <p className="text-muted-foreground">Track and manage student attendance by course</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-muted-foreground">Late</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.late}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Rate</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-primary">{attendanceRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => handleMarkAll('present')} 
            disabled={saving || students.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleMarkAll('absent')} 
            disabled={saving || students.length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Mark All Absent
          </Button>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedCourseName} - {format(new Date(selectedDate), "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No Students Found</h3>
                <p className="text-muted-foreground">Register students first to mark attendance</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const record = getStudentAttendance(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.student_number}</TableCell>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{getStatusBadge(record?.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant={record?.status === 'present' ? 'default' : 'outline'}
                                className={record?.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                onClick={() => handleMarkAttendance(student.id, 'present')}
                                disabled={saving}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={record?.status === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => handleMarkAttendance(student.id, 'absent')}
                                disabled={saving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={record?.status === 'late' ? 'default' : 'outline'}
                                className={record?.status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                onClick={() => handleMarkAttendance(student.id, 'late')}
                                disabled={saving}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={record?.status === 'excused' ? 'secondary' : 'outline'}
                                onClick={() => handleMarkAttendance(student.id, 'excused')}
                                disabled={saving}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
