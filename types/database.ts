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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          context_type: string | null
          created_at: string | null
          id: string
          messages: Json
          related_meal_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_type?: string | null
          created_at?: string | null
          id?: string
          messages: Json
          related_meal_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_type?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          related_meal_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_related_meal_id_fkey"
            columns: ["related_meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          id: string
          items: Json
          meal_plan_id: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          items: Json
          meal_plan_id?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          items?: Json
          meal_plan_id?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          id: string
          is_completed: boolean | null
          meal_id: string
          meal_plan_id: string
          meal_time: string | null
          scheduled_date: string | null
          servings: number | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_completed?: boolean | null
          meal_id: string
          meal_plan_id: string
          meal_time?: string | null
          scheduled_date?: string | null
          servings?: number | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_completed?: boolean | null
          meal_id?: string
          meal_plan_id?: string
          meal_time?: string | null
          scheduled_date?: string | null
          servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_protein: number | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_protein?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          batch_cooking_multiplier: number | null
          calories_per_serving: number | null
          carbs_per_serving: number | null
          container_type: string | null
          cook_time: number | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          difficulty_level: string | null
          fats_per_serving: number | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string[] | null
          is_ai_generated: boolean | null
          is_public: boolean | null
          meal_prep_friendly: boolean | null
          meal_type: string | null
          name: string
          prep_time: number | null
          protein_per_serving: number | null
          rating: number | null
          reheating_instructions: string | null
          servings: number | null
          storage_duration_days: number | null
          storage_instructions: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          batch_cooking_multiplier?: number | null
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          container_type?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty_level?: string | null
          fats_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions?: string[] | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          meal_prep_friendly?: boolean | null
          meal_type?: string | null
          name: string
          prep_time?: number | null
          protein_per_serving?: number | null
          rating?: number | null
          reheating_instructions?: string | null
          servings?: number | null
          storage_duration_days?: number | null
          storage_instructions?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          batch_cooking_multiplier?: number | null
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          container_type?: string | null
          cook_time?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty_level?: string | null
          fats_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string[] | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          meal_prep_friendly?: boolean | null
          meal_type?: string | null
          name?: string
          prep_time?: number | null
          protein_per_serving?: number | null
          rating?: number | null
          reheating_instructions?: string | null
          servings?: number | null
          storage_duration_days?: number | null
          storage_instructions?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          calories_consumed: number | null
          carbs_consumed: number | null
          created_at: string | null
          fats_consumed: number | null
          id: string
          log_date: string
          notes: string | null
          protein_consumed: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          calories_consumed?: number | null
          carbs_consumed?: number | null
          created_at?: string | null
          fats_consumed?: number | null
          id?: string
          log_date: string
          notes?: string | null
          protein_consumed?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          calories_consumed?: number | null
          carbs_consumed?: number | null
          created_at?: string | null
          fats_consumed?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          protein_consumed?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      saved_meals: {
        Row: {
          created_at: string | null
          id: string
          meal_id: string
          notes: string | null
          personal_rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_id: string
          notes?: string | null
          personal_rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_id?: string
          notes?: string | null
          personal_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_meals_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          budget_level: string | null
          cooking_skill_level: string | null
          created_at: string | null
          currency: string | null
          daily_calorie_target: number | null
          dietary_preference: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          locale: string | null
          target_carbs: number | null
          target_fats: number | null
          target_protein: number | null
          tdee: number | null
          time_available: number | null
          unit_system: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          budget_level?: string | null
          cooking_skill_level?: string | null
          created_at?: string | null
          currency?: string | null
          daily_calorie_target?: number | null
          dietary_preference?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id: string
          locale?: string | null
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          tdee?: number | null
          time_available?: number | null
          unit_system?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          budget_level?: string | null
          cooking_skill_level?: string | null
          created_at?: string | null
          currency?: string | null
          daily_calorie_target?: number | null
          dietary_preference?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          locale?: string | null
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          tdee?: number | null
          time_available?: number | null
          unit_system?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
