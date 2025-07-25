export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
          points: number
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          category: string
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id?: string
          name: string
          points?: number
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          permissions: string[] | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: string[] | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: string[] | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assessment_configs: {
        Row: {
          coding_count: number | null
          created_at: string | null
          created_by: string | null
          difficulty_distribution: Json | null
          domain: string
          id: string
          mcq_count: number | null
          module_id: string | null
          scenario_count: number | null
          total_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          coding_count?: number | null
          created_at?: string | null
          created_by?: string | null
          difficulty_distribution?: Json | null
          domain: string
          id?: string
          mcq_count?: number | null
          module_id?: string | null
          scenario_count?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          coding_count?: number | null
          created_at?: string | null
          created_by?: string | null
          difficulty_distribution?: Json | null
          domain?: string
          id?: string
          mcq_count?: number | null
          module_id?: string | null
          scenario_count?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_configs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: true
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          detailed_results: Json | null
          difficulty: string
          domain: string
          id: string
          module_id: string | null
          question_ids: string[] | null
          score: number
          strong_areas: string[] | null
          time_taken: number | null
          total_questions: number
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string | null
          detailed_results?: Json | null
          difficulty: string
          domain: string
          id?: string
          module_id?: string | null
          question_ids?: string[] | null
          score: number
          strong_areas?: string[] | null
          time_taken?: number | null
          total_questions: number
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string | null
          detailed_results?: Json | null
          difficulty?: string
          domain?: string
          id?: string
          module_id?: string | null
          question_ids?: string[] | null
          score?: number
          strong_areas?: string[] | null
          time_taken?: number | null
          total_questions?: number
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          domain_key: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_key: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_key?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_recommendations: {
        Row: {
          created_at: string
          description: string
          domain: string
          expires_at: string | null
          id: string
          is_completed: boolean | null
          priority: number
          recommendation_type: string
          resource_links: Json | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          domain: string
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number
          recommendation_type: string
          resource_links?: Json | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          domain?: string
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number
          recommendation_type?: string
          resource_links?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mastery_assessment_questions: {
        Row: {
          code_template: string | null
          correct_answer: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation: string | null
          id: string
          mastery_assessment_id: string
          memory_limit: number | null
          options: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          tags: string[] | null
          test_cases: Json | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code_template?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation?: string | null
          id?: string
          mastery_assessment_id: string
          memory_limit?: number | null
          options?: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code_template?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain?: string
          explanation?: string | null
          id?: string
          mastery_assessment_id?: string
          memory_limit?: number | null
          options?: Json | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mastery_assessment_questions_mastery_assessment_id_fkey"
            columns: ["mastery_assessment_id"]
            isOneToOne: false
            referencedRelation: "mastery_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_assessments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          domains: Json
          id: string
          is_active: boolean | null
          order_index: number | null
          time_limit_minutes: number
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty: string
          domains?: Json
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          time_limit_minutes?: number
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          domains?: Json
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          time_limit_minutes?: number
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          domain_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          code_template: string | null
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          domain: string
          explanation: string | null
          id: string
          is_active: boolean | null
          memory_limit: number | null
          options: Json | null
          question_text: string
          question_type: string
          tags: string[] | null
          test_cases: Json | null
          time_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          code_template?: string | null
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty: string
          domain: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          memory_limit?: number | null
          options?: Json | null
          question_text: string
          question_type: string
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          code_template?: string | null
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          domain?: string
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          memory_limit?: number | null
          options?: Json | null
          question_text?: string
          question_type?: string
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          code_template: string | null
          correct_answer: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation: string | null
          id: string
          memory_limit: number | null
          module_id: string | null
          options: Json | null
          question_bank_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          tags: string[] | null
          test_cases: Json | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          code_template?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation?: string | null
          id?: string
          memory_limit?: number | null
          module_id?: string | null
          options?: Json | null
          question_bank_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          code_template?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain?: string
          explanation?: string | null
          id?: string
          memory_limit?: number | null
          module_id?: string | null
          options?: Json | null
          question_bank_id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          tags?: string[] | null
          test_cases?: Json | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_progress: {
        Row: {
          current_level: number
          domain: string
          experience_points: number
          id: string
          last_updated: string
          mastery_percentage: number
          skill_name: string
          user_id: string
        }
        Insert: {
          current_level?: number
          domain: string
          experience_points?: number
          id?: string
          last_updated?: string
          mastery_percentage?: number
          skill_name: string
          user_id: string
        }
        Update: {
          current_level?: number
          domain?: string
          experience_points?: number
          id?: string
          last_updated?: string
          mastery_percentage?: number
          skill_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mastery_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          mastery_assessment_id: string
          score: number | null
          started_at: string
          time_taken: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          id?: string
          mastery_assessment_id: string
          score?: number | null
          started_at?: string
          time_taken?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          mastery_assessment_id?: string
          score?: number | null
          started_at?: string
          time_taken?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mastery_attempts_mastery_assessment_id_fkey"
            columns: ["mastery_assessment_id"]
            isOneToOne: false
            referencedRelation: "mastery_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      questions_with_bank: {
        Row: {
          assigned_at: string | null
          code_template: string | null
          correct_answer: string | null
          created_by: string | null
          difficulty: string | null
          domain: string | null
          domain_id: string | null
          domain_key: string | null
          domain_name: string | null
          explanation: string | null
          id: string | null
          is_active: boolean | null
          memory_limit: number | null
          module_id: string | null
          module_name: string | null
          options: Json | null
          question_text: string | null
          question_type: string | null
          tags: string[] | null
          test_cases: Json | null
          time_limit: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      find_similar_questions: {
        Args: {
          search_title: string
          search_text: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          title: string
          question_text: string
          similarity_score: number
        }[]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password_input: string }
        Returns: Json
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      question_type: "mcq" | "coding" | "scenario"
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
      difficulty_level: ["beginner", "intermediate", "advanced"],
      question_type: ["mcq", "coding", "scenario"],
    },
  },
} as const
