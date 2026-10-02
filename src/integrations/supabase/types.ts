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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message_id: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          parts?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          course: string
          course_code: string | null
          created_at: string
          description: string | null
          downloads: number
          file_name: string
          file_path: string
          file_size: number
          id: string
          institution: string
          level: string | null
          material_type: string
          mime_type: string
          page_count: number
          points_awarded: number
          reviewed_at: string | null
          status: Database["public"]["Enums"]["material_status"]
          title: string
          user_id: string
          verification_notes: string | null
          verification_score: number | null
        }
        Insert: {
          course: string
          course_code?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          institution: string
          level?: string | null
          material_type: string
          mime_type: string
          page_count?: number
          points_awarded?: number
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          title: string
          user_id: string
          verification_notes?: string | null
          verification_score?: number | null
        }
        Update: {
          course?: string
          course_code?: string | null
          created_at?: string
          description?: string | null
          downloads?: number
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          institution?: string
          level?: string | null
          material_type?: string
          mime_type?: string
          page_count?: number
          points_awarded?: number
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["material_status"]
          title?: string
          user_id?: string
          verification_notes?: string | null
          verification_score?: number | null
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          material_id: string | null
          reason: string
          user_id: string
          withdrawal_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          material_id?: string | null
          reason: string
          user_id: string
          withdrawal_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          material_id?: string | null
          reason?: string
          user_id?: string
          withdrawal_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          course: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          institution: string | null
          level: string | null
          onboarding_step: number
          phone: string | null
          points: number
          referral_source: string | null
          study_plan: Json
          updated_at: string
        }
        Insert: {
          course?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          institution?: string | null
          level?: string | null
          onboarding_step?: number
          phone?: string | null
          points?: number
          referral_source?: string | null
          study_plan?: Json
          updated_at?: string
        }
        Update: {
          course?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          level?: string | null
          onboarding_step?: number
          phone?: string | null
          points?: number
          referral_source?: string | null
          study_plan?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_name: string
          account_number: string
          admin_note: string | null
          amount_naira: number
          bank_name: string
          created_at: string
          id: string
          points: number
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_note?: string | null
          amount_naira: number
          bank_name: string
          created_at?: string
          id?: string
          points: number
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_note?: string | null
          amount_naira?: number
          bank_name?: string
          created_at?: string
          id?: string
          points?: number
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_process_withdrawal: {
        Args: {
          _id: string
          _note: string
          _status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Returns: undefined
      }
      admin_review_material: {
        Args: {
          _material_id: string
          _notes: string
          _status: Database["public"]["Enums"]["material_status"]
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_withdrawal: {
        Args: {
          _account_name: string
          _account_number: string
          _bank: string
          _points: number
        }
        Returns: string
      }
      set_material_status: {
        Args: {
          _material_id: string
          _notes: string
          _score: number
          _status: Database["public"]["Enums"]["material_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      material_status: "pending" | "verified" | "rejected"
      withdrawal_status: "pending" | "paid" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      material_status: ["pending", "verified", "rejected"],
      withdrawal_status: ["pending", "paid", "rejected"],
    },
  },
} as const
