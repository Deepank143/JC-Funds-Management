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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_by: string | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      expense_subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          amount_paid: number | null
          bill_photo_url: string | null
          category_id: string | null
          correction_reason: string | null
          created_at: string | null
          created_by: string | null
          expense_date: string
          id: string
          is_correction: boolean | null
          milestone_id: string | null
          notes: string | null
          original_data: Json | null
          payment_mode: string | null
          payment_status: string | null
          project_id: string | null
          reference_number: string | null
          subcategory_id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          bill_photo_url?: string | null
          category_id?: string | null
          correction_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date: string
          id?: string
          is_correction?: boolean | null
          milestone_id?: string | null
          notes?: string | null
          original_data?: Json | null
          payment_mode?: string | null
          payment_status?: string | null
          project_id?: string | null
          reference_number?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          bill_photo_url?: string | null
          category_id?: string | null
          correction_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date?: string
          id?: string
          is_correction?: boolean | null
          milestone_id?: string | null
          notes?: string | null
          original_data?: Json | null
          payment_mode?: string | null
          payment_status?: string | null
          project_id?: string | null
          reference_number?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount: number
          client_id: string | null
          correction_reason: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_correction: boolean | null
          milestone_id: string | null
          notes: string | null
          original_data: Json | null
          payment_date: string
          payment_mode: string | null
          project_id: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          correction_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_correction?: boolean | null
          milestone_id?: string | null
          notes?: string | null
          original_data?: Json | null
          payment_date: string
          payment_mode?: string | null
          project_id?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          correction_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_correction?: boolean | null
          milestone_id?: string | null
          notes?: string | null
          original_data?: Json | null
          payment_date?: string
          payment_mode?: string | null
          project_id?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number | null
          completed_date: string | null
          created_at: string | null
          due_date: string | null
          id: string
          name: string
          percentage: number | null
          project_id: string | null
          sort_order: number | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          name: string
          percentage?: number | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          name?: string
          percentage?: number | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_budgets: {
        Row: {
          budget_amount: number | null
          category_id: string | null
          created_at: string | null
          id: string
          project_id: string | null
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget_amount?: number | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_amount?: number | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_budgets_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end_date: string | null
          client_id: string | null
          contract_value: number
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          client_id?: string | null
          contract_value?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          client_id?: string | null
          contract_value?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          subcategory_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          subcategory_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          subcategory_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "expense_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_aging: {
        Args: { client_uuid: string }
        Returns: {
          amount: number
          bucket: string
        }[]
      }
      get_dashboard_kpis: {
        Args: never
        Returns: {
          active_projects: number
          net_position: number
          overdue_expense_count: number
          overdue_income_count: number
          total_payables: number
          total_projects: number
          total_receivables: number
        }[]
      }
      get_project_summary: {
        Args: { project_uuid: string }
        Returns: {
          profit: number
          profit_margin: number
          realized_profit: number
          total_expenses: number
          total_income: number
          total_paid: number
          total_payable: number
        }[]
      }
      get_projects_with_margins: {
        Args: never
        Returns: {
          client_id: string
          client_name: string
          contract_value: number
          expected_end_date: string
          id: string
          location: string
          name: string
          profit: number
          profit_margin: number
          start_date: string
          status: string
          total_expenses: number
          total_income: number
        }[]
      }
      record_income_with_milestone_update: {
        Args: {
          p_amount: number
          p_client_id: string
          p_created_by: string
          p_milestone_id: string
          p_notes: string
          p_payment_date: string
          p_payment_mode: string
          p_project_id: string
          p_reference_number: string
        }
        Returns: Json
      }
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
