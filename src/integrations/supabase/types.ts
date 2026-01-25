export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          student_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          student_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          attachments: string[] | null
          course_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          points: number | null
          priority: string | null
          title: string
        }
        Insert: {
          attachments?: string[] | null
          course_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number | null
          priority?: string | null
          title: string
        }
        Update: {
          attachments?: string[] | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number | null
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          course_id: string
          created_at: string | null
          date: string
          id: string
          marked_by: string | null
          remarks: string | null
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          credits: number | null
          current_enrollment: number | null
          description: string | null
          id: string
          instructor: string | null
          level: string | null
          max_enrollment: number | null
          name: string
          prerequisites: string[] | null
          rating: number | null
          room: string | null
          schedule: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credits?: number | null
          current_enrollment?: number | null
          description?: string | null
          id?: string
          instructor?: string | null
          level?: string | null
          max_enrollment?: number | null
          name: string
          prerequisites?: string[] | null
          rating?: number | null
          room?: string | null
          schedule?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number | null
          current_enrollment?: number | null
          description?: string | null
          id?: string
          instructor?: string | null
          level?: string | null
          max_enrollment?: number | null
          name?: string
          prerequisites?: string[] | null
          rating?: number | null
          room?: string | null
          schedule?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          assignment_name: string
          course_id: string
          created_at: string | null
          date: string | null
          grade: string | null
          id: string
          points_earned: number | null
          points_total: number | null
          semester: string | null
          student_id: string
          weight: number | null
        }
        Insert: {
          assignment_name: string
          course_id: string
          created_at?: string | null
          date?: string | null
          grade?: string | null
          id?: string
          points_earned?: number | null
          points_total?: number | null
          semester?: string | null
          student_id: string
          weight?: number | null
        }
        Update: {
          assignment_name?: string
          course_id?: string
          created_at?: string | null
          date?: string | null
          grade?: string | null
          id?: string
          points_earned?: number | null
          points_total?: number | null
          semester?: string | null
          student_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthday: string | null
          course: string | null
          created_at: string | null
          email: string
          emergency_contact: string | null
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          mobile_number: string | null
          student_number: string
          updated_at: string | null
          user_id: string
          year_level: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          course?: string | null
          created_at?: string | null
          email: string
          emergency_contact?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          last_name?: string | null
          mobile_number?: string | null
          student_number: string
          updated_at?: string | null
          user_id: string
          year_level?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          course?: string | null
          created_at?: string | null
          email?: string
          emergency_contact?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          mobile_number?: string | null
          student_number?: string
          updated_at?: string | null
          user_id?: string
          year_level?: string | null
        }
        Relationships: []
      }
      student_assignments: {
        Row: {
          assignment_id: string
          feedback: string | null
          grade: number | null
          id: string
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_assignments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_courses: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          status: string | null
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          course_id: string | null
          created_at: string | null
          day_of_week: string
          end_time: string
          event_type: string | null
          id: string
          room: string | null
          start_time: string
          student_id: string | null
          title: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          day_of_week: string
          end_time: string
          event_type?: string | null
          id?: string
          room?: string | null
          start_time: string
          student_id?: string | null
          title?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          event_type?: string | null
          id?: string
          room?: string | null
          start_time?: string
          student_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const
