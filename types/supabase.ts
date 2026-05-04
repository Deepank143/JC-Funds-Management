export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'owner' | 'accountant' | 'viewer' | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'owner' | 'accountant' | 'viewer' | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: 'owner' | 'accountant' | 'viewer' | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          gstin: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          gstin?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          gstin?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          location: string | null;
          description: string | null;
          contract_value: number;
          start_date: string | null;
          expected_end_date: string | null;
          actual_end_date: string | null;
          status: 'active' | 'completed' | 'on_hold' | 'cancelled';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          location?: string | null;
          description?: string | null;
          contract_value?: number;
          start_date?: string | null;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          location?: string | null;
          description?: string | null;
          contract_value?: number;
          start_date?: string | null;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          project_id: string;
          category_id: string | null;
          subcategory_id: string | null;
          vendor_id: string | null;
          amount: number;
          expense_date: string;
          payment_status: 'paid' | 'unpaid' | 'partial';
          amount_paid: number;
          payment_mode: string | null;
          reference_number: string | null;
          bill_photo_url: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          category_id?: string | null;
          subcategory_id?: string | null;
          vendor_id?: string | null;
          amount: number;
          expense_date: string;
          payment_status?: 'paid' | 'unpaid' | 'partial';
          amount_paid?: number;
          payment_mode?: string | null;
          reference_number?: string | null;
          bill_photo_url?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          category_id?: string | null;
          subcategory_id?: string | null;
          vendor_id?: string | null;
          amount?: number;
          expense_date?: string;
          payment_status?: 'paid' | 'unpaid' | 'partial';
          amount_paid?: number;
          payment_mode?: string | null;
          reference_number?: string | null;
          bill_photo_url?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          milestone_id: string | null;
          amount: number;
          payment_date: string;
          payment_mode: string;
          reference_number: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          milestone_id?: string | null;
          amount: number;
          payment_date: string;
          payment_mode?: string;
          reference_number?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          milestone_id?: string | null;
          amount?: number;
          payment_date?: string;
          payment_mode?: string;
          reference_number?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          type: 'vendor' | 'labour' | 'broker';
          phone: string | null;
          email: string | null;
          address: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'vendor' | 'labour' | 'broker';
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          category_id?: string | null;
          subcategory_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'vendor' | 'labour' | 'broker';
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          category_id?: string | null;
          subcategory_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
