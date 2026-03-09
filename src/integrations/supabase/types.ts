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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      container_types: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          total_cash: number
          total_oil: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          total_cash?: number
          total_oil?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          total_cash?: number
          total_oil?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          cash_amount: number
          container_count: number
          container_type: string
          created_at: string
          customer_id: string | null
          customer_name: string
          id: string
          oil_amount: number
          oil_produced: number
          payment_type: string
          total_display: string
          user_id: string
        }
        Insert: {
          cash_amount?: number
          container_count: number
          container_type?: string
          created_at?: string
          customer_id?: string | null
          customer_name: string
          id?: string
          oil_amount?: number
          oil_produced: number
          payment_type: string
          total_display: string
          user_id: string
        }
        Update: {
          cash_amount?: number
          container_count?: number
          container_type?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          oil_amount?: number
          oil_produced?: number
          payment_type?: string
          total_display?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      oil_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          party_name: string | null
          price: number
          total_price: number
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          party_name?: string | null
          price: number
          total_price: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          party_name?: string | null
          price?: number
          total_price?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      queue: {
        Row: {
          bags: number
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: number
          status: string
          user_id: string
        }
        Insert: {
          bags: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: number
          status?: string
          user_id: string
        }
        Update: {
          bags?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          cash_return_cost: number
          created_at: string
          id: string
          metal_container_price: number
          oil_buy_price: number
          oil_sell_price: number
          plastic_container_price: number
          return_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_return_cost?: number
          created_at?: string
          id?: string
          metal_container_price?: number
          oil_buy_price?: number
          oil_sell_price?: number
          plastic_container_price?: number
          return_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_return_cost?: number
          created_at?: string
          id?: string
          metal_container_price?: number
          oil_buy_price?: number
          oil_sell_price?: number
          plastic_container_price?: number
          return_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_records: {
        Row: {
          amount: number
          created_at: string
          hours: number | null
          id: string
          notes: string | null
          shifts: number | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          hours?: number | null
          id?: string
          notes?: string | null
          shifts?: number | null
          user_id: string
          worker_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          hours?: number | null
          id?: string
          notes?: string | null
          shifts?: number | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_records_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
          worker_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_payments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          shift_rate: number | null
          total_earned: number
          total_paid: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          shift_rate?: number | null
          total_earned?: number
          total_paid?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          shift_rate?: number | null
          total_earned?: number
          total_paid?: number
          type?: string
          updated_at?: string
          user_id?: string
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
