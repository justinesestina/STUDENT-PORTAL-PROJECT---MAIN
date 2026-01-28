import * as XLSX from "xlsx";

export interface StudentExportData {
  student_number: string;
  full_name: string;
  email: string;
  course: string | null;
  year_level: string | null;
  mobile_number: string | null;
  birthday: string | null;
  address: string | null;
  created_at: string | null;
}

export const exportStudentsToExcel = (students: StudentExportData[], filename = "students") => {
  // Transform data for Excel
  const excelData = students.map((student, index) => ({
    "No.": index + 1,
    "Student ID": student.student_number,
    "Full Name": student.full_name,
    "Email": student.email,
    "Course/Program": student.course || "Not Enrolled",
    "Year Level": student.year_level || "-",
    "Mobile Number": student.mobile_number || "-",
    "Birthday": student.birthday || "-",
    "Address": student.address || "-",
    "Registration Date": student.created_at 
      ? new Date(student.created_at).toLocaleString() 
      : "-",
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 5 },  // No.
    { wch: 15 }, // Student ID
    { wch: 25 }, // Full Name
    { wch: 30 }, // Email
    { wch: 40 }, // Course
    { wch: 12 }, // Year Level
    { wch: 15 }, // Mobile
    { wch: 12 }, // Birthday
    { wch: 40 }, // Address
    { wch: 20 }, // Registration Date
  ];
  worksheet["!cols"] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  // Generate filename with date
  const date = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${date}.xlsx`;

  // Download
  XLSX.writeFile(workbook, fullFilename);
};

export interface EnrollmentExportData {
  student: {
    student_number: string;
    full_name: string;
    email: string;
    course: string | null;
  };
  course: {
    name: string;
    code: string;
    credits: number;
  };
  enrolled_at: string | null;
  status: string | null;
}

export const exportEnrollmentsToExcel = (enrollments: EnrollmentExportData[], filename = "enrollments") => {
  const excelData = enrollments.map((enrollment, index) => ({
    "No.": index + 1,
    "Student ID": enrollment.student?.student_number || "-",
    "Student Name": enrollment.student?.full_name || "-",
    "Student Email": enrollment.student?.email || "-",
    "Program": enrollment.student?.course || "-",
    "Course Code": enrollment.course?.code || "-",
    "Course Name": enrollment.course?.name || "-",
    "Credits": enrollment.course?.credits || "-",
    "Status": enrollment.status || "enrolled",
    "Enrollment Date": enrollment.enrolled_at 
      ? new Date(enrollment.enrolled_at).toLocaleString() 
      : "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const columnWidths = [
    { wch: 5 },  // No.
    { wch: 15 }, // Student ID
    { wch: 25 }, // Student Name
    { wch: 30 }, // Student Email
    { wch: 35 }, // Program
    { wch: 12 }, // Course Code
    { wch: 30 }, // Course Name
    { wch: 8 },  // Credits
    { wch: 10 }, // Status
    { wch: 20 }, // Enrollment Date
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollments");

  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
};
