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
      calculator_completions: {
        Row: {
          bloco_gestao: number
          bloco_nr1: number
          bloco_sinais: number
          created_at: string
          email: string
          empresa: string
          estrutura: string
          faturamento: string
          id: string
          impacto_max: number
          impacto_min: number
          momento: string
          multa_max: number
          multa_min: number
          nome: string
          num_colaboradores: string
          respostas: Json
          risk_level: string
          risk_score: number
          whatsapp: string
        }
        Insert: {
          bloco_gestao?: number
          bloco_nr1?: number
          bloco_sinais?: number
          created_at?: string
          email?: string
          empresa?: string
          estrutura?: string
          faturamento?: string
          id?: string
          impacto_max?: number
          impacto_min?: number
          momento?: string
          multa_max?: number
          multa_min?: number
          nome?: string
          num_colaboradores?: string
          respostas?: Json
          risk_level?: string
          risk_score?: number
          whatsapp?: string
        }
        Update: {
          bloco_gestao?: number
          bloco_nr1?: number
          bloco_sinais?: number
          created_at?: string
          email?: string
          empresa?: string
          estrutura?: string
          faturamento?: string
          id?: string
          impacto_max?: number
          impacto_min?: number
          momento?: string
          multa_max?: number
          multa_min?: number
          nome?: string
          num_colaboradores?: string
          respostas?: Json
          risk_level?: string
          risk_score?: number
          whatsapp?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          cargo: string
          created_at: string
          desafio: string
          email: string
          empresa: string
          id: string
          nome: string
          notas: string
          status: Database["public"]["Enums"]["lead_status"]
          whatsapp: string
        }
        Insert: {
          cargo?: string
          created_at?: string
          desafio?: string
          email?: string
          empresa?: string
          id?: string
          nome?: string
          notas?: string
          status?: Database["public"]["Enums"]["lead_status"]
          whatsapp?: string
        }
        Update: {
          cargo?: string
          created_at?: string
          desafio?: string
          email?: string
          empresa?: string
          id?: string
          nome?: string
          notas?: string
          status?: Database["public"]["Enums"]["lead_status"]
          whatsapp?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          viewed_at?: string
        }
        Update: {
          id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      quiz_completions: {
        Row: {
          created_at: string
          email: string
          id: string
          level: string
          nome: string
          score: number
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          level?: string
          nome?: string
          score?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          level?: string
          nome?: string
          score?: number
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
      lead_status: "novo" | "em_contato" | "negociando" | "fechado" | "perdido"
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
      lead_status: ["novo", "em_contato", "negociando", "fechado", "perdido"],
    },
  },
} as const
