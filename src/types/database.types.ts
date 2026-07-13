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
      cancellation_feedback: {
        Row: {
          additional_comments: string | null
          created_at: string
          id: string
          organization_id: string | null
          plan: string | null
          reason: string
          user_id: string
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          plan?: string | null
          reason: string
          user_id: string
        }
        Update: {
          additional_comments?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          plan?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_return_reminders: {
        Row: {
          client_id: string | null
          created_at: string
          dismissed_at: string | null
          due_date: string
          id: string
          note: string | null
          organization_id: string
          quote_id: string
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          due_date: string
          id?: string
          note?: string | null
          organization_id: string
          quote_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          due_date?: string
          id?: string
          note?: string | null
          organization_id?: string
          quote_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_return_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_return_reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_return_reminders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_return_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cep: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          person_type: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          person_type?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          person_type?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_suggestions: {
        Row: {
          admin_note: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          votes_count: number
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          votes_count?: number
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "feature_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      item_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_email_dispatches: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          provider_message_id: string | null
          quote_id: string | null
          sent_at: string | null
          stage: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          stage: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          stage?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_email_dispatches_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_email_dispatches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          organization_id: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          organization_id: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          organization_id?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          document: string | null
          document_type: string | null
          id: string
          logo_url: string | null
          name: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          document_type?: string | null
          id?: string
          logo_url?: string | null
          name: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          document_type?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pro_trial_grants: {
        Row: {
          ends_at: string
          id: string
          organization_id: string
          profile_id: string
          quote_id: string
          source: string
          started_at: string
        }
        Insert: {
          ends_at: string
          id?: string
          organization_id: string
          profile_id: string
          quote_id: string
          source?: string
          started_at?: string
        }
        Update: {
          ends_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          quote_id?: string
          source?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_trial_grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_trial_grants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_trial_grants_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: true
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          address_number: string | null
          business_name: string | null
          cancel_at_period_end: boolean | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          created_at: string
          current_period_end: string | null
          delivery_days: number | null
          email: string | null
          first_attribution: Json | null
          id: string
          intended_plan: string | null
          is_superadmin: boolean | null
          last_attribution: Json | null
          layout_style: string | null
          lifecycle_emails_enabled: boolean
          logo_url: string | null
          neighborhood: string | null
          onboarded_at: string | null
          payment_info: string | null
          phone: string | null
          pix_discount_percent: number | null
          pix_key: string | null
          pix_key_type: string | null
          pix_recipient_city: string | null
          pix_recipient_name: string | null
          plan: string | null
          primary_color: string | null
          pro_trial_ends_at: string | null
          pro_trial_source: string | null
          pro_trial_started_at: string | null
          quote_font_family: string | null
          quote_settings: Json | null
          state: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          target_margin_percent: number
          theme_color: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          business_name?: string | null
          cancel_at_period_end?: boolean | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          current_period_end?: string | null
          delivery_days?: number | null
          email?: string | null
          first_attribution?: Json | null
          id: string
          intended_plan?: string | null
          is_superadmin?: boolean | null
          last_attribution?: Json | null
          layout_style?: string | null
          lifecycle_emails_enabled?: boolean
          logo_url?: string | null
          neighborhood?: string | null
          onboarded_at?: string | null
          payment_info?: string | null
          phone?: string | null
          pix_discount_percent?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_recipient_city?: string | null
          pix_recipient_name?: string | null
          plan?: string | null
          primary_color?: string | null
          pro_trial_ends_at?: string | null
          pro_trial_source?: string | null
          pro_trial_started_at?: string | null
          quote_font_family?: string | null
          quote_settings?: Json | null
          state?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          target_margin_percent?: number
          theme_color?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_number?: string | null
          business_name?: string | null
          cancel_at_period_end?: boolean | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          current_period_end?: string | null
          delivery_days?: number | null
          email?: string | null
          first_attribution?: Json | null
          id?: string
          intended_plan?: string | null
          is_superadmin?: boolean | null
          last_attribution?: Json | null
          layout_style?: string | null
          lifecycle_emails_enabled?: boolean
          logo_url?: string | null
          neighborhood?: string | null
          onboarded_at?: string | null
          payment_info?: string | null
          phone?: string | null
          pix_discount_percent?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_recipient_city?: string | null
          pix_recipient_name?: string | null
          plan?: string | null
          primary_color?: string | null
          pro_trial_ends_at?: string | null
          pro_trial_source?: string | null
          pro_trial_started_at?: string | null
          quote_font_family?: string | null
          quote_settings?: Json | null
          state?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          target_margin_percent?: number
          theme_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_evidences: {
        Row: {
          caption: string | null
          content_type: string
          created_at: string
          file_name: string
          file_size: number
          id: string
          is_client_visible: boolean
          organization_id: string
          quote_id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_type: string
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          is_client_visible?: boolean
          organization_id: string
          quote_id: string
          storage_path: string
          user_id: string
        }
        Update: {
          caption?: string | null
          content_type?: string
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          is_client_visible?: boolean
          organization_id?: string
          quote_id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_evidences_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_evidences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          cost_is_known: boolean
          description: string
          details: string | null
          id: string
          item_type: string
          quantity: number | null
          quote_id: string
          service_id: string | null
          stock_deducted_at: string | null
          total_price: number | null
          unit_cost: number
          unit_price: number | null
        }
        Insert: {
          cost_is_known?: boolean
          description: string
          details?: string | null
          id?: string
          item_type?: string
          quantity?: number | null
          quote_id: string
          service_id?: string | null
          stock_deducted_at?: string | null
          total_price?: number | null
          unit_cost?: number
          unit_price?: number | null
        }
        Update: {
          cost_is_known?: boolean
          description?: string
          details?: string | null
          id?: string
          item_type?: string
          quantity?: number | null
          quote_id?: string
          service_id?: string | null
          stock_deducted_at?: string | null
          total_price?: number | null
          unit_cost?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_quota_usages: {
        Row: {
          experience_mode: string
          id: string
          organization_id: string
          period_start: string | null
          quote_id: string | null
          reserved_at: string
          user_id: string
        }
        Insert: {
          experience_mode: string
          id?: string
          organization_id: string
          period_start?: string | null
          quote_id?: string | null
          reserved_at?: string
          user_id: string
        }
        Update: {
          experience_mode?: string
          id?: string
          organization_id?: string
          period_start?: string | null
          quote_id?: string | null
          reserved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_quota_usages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_quota_usages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: true
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_quota_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount_paid: number
          approval_link_issued_at: string | null
          approval_recipient_name: string | null
          approval_recipient_phone: string | null
          approval_token: string
          approval_verification_method: string | null
          approval_verified_at: string | null
          cash_discount_fixed: number | null
          cash_discount_percent: number | null
          cash_discount_type: string | null
          client_company_name: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          client_responded_at: string | null
          client_response_note: string | null
          client_type: string | null
          cost_total: number
          costs_complete: boolean
          created_at: string | null
          deposit_amount: number
          deposit_marked_paid_at: string | null
          deposit_requested_at: string | null
          deposit_status: string
          discount: number | null
          estimated_days: number | null
          experience_mode: string
          expiration_date: string | null
          first_public_opened_at: string | null
          follow_up_count: number
          follow_up_sent_at: string | null
          id: string
          installment_count: number | null
          last_follow_up_message: string | null
          layout_style: string | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          payment_methods: string[] | null
          payment_status: string
          payment_terms: string | null
          payment_updated_at: string | null
          pix_key_snapshot: string | null
          pix_key_type_snapshot: string | null
          pix_recipient_city_snapshot: string | null
          pix_recipient_name_snapshot: string | null
          professional_context: string
          profit_amount: number
          profit_margin_percent: number
          public_token: string
          sent_at: string | null
          sent_confirmed_at: string | null
          sent_via: string | null
          show_detailed_items: boolean | null
          show_payment_options: boolean | null
          show_timeline: boolean | null
          source_quote_id: string | null
          status: string | null
          target_margin_percent: number
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number
          approval_link_issued_at?: string | null
          approval_recipient_name?: string | null
          approval_recipient_phone?: string | null
          approval_token?: string
          approval_verification_method?: string | null
          approval_verified_at?: string | null
          cash_discount_fixed?: number | null
          cash_discount_percent?: number | null
          cash_discount_type?: string | null
          client_company_name?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          client_responded_at?: string | null
          client_response_note?: string | null
          client_type?: string | null
          cost_total?: number
          costs_complete?: boolean
          created_at?: string | null
          deposit_amount?: number
          deposit_marked_paid_at?: string | null
          deposit_requested_at?: string | null
          deposit_status?: string
          discount?: number | null
          estimated_days?: number | null
          experience_mode?: string
          expiration_date?: string | null
          first_public_opened_at?: string | null
          follow_up_count?: number
          follow_up_sent_at?: string | null
          id?: string
          installment_count?: number | null
          last_follow_up_message?: string | null
          layout_style?: string | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          payment_methods?: string[] | null
          payment_status?: string
          payment_terms?: string | null
          payment_updated_at?: string | null
          pix_key_snapshot?: string | null
          pix_key_type_snapshot?: string | null
          pix_recipient_city_snapshot?: string | null
          pix_recipient_name_snapshot?: string | null
          professional_context?: string
          profit_amount?: number
          profit_margin_percent?: number
          public_token?: string
          sent_at?: string | null
          sent_confirmed_at?: string | null
          sent_via?: string | null
          show_detailed_items?: boolean | null
          show_payment_options?: boolean | null
          show_timeline?: boolean | null
          source_quote_id?: string | null
          status?: string | null
          target_margin_percent?: number
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          approval_link_issued_at?: string | null
          approval_recipient_name?: string | null
          approval_recipient_phone?: string | null
          approval_token?: string
          approval_verification_method?: string | null
          approval_verified_at?: string | null
          cash_discount_fixed?: number | null
          cash_discount_percent?: number | null
          cash_discount_type?: string | null
          client_company_name?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          client_responded_at?: string | null
          client_response_note?: string | null
          client_type?: string | null
          cost_total?: number
          costs_complete?: boolean
          created_at?: string | null
          deposit_amount?: number
          deposit_marked_paid_at?: string | null
          deposit_requested_at?: string | null
          deposit_status?: string
          discount?: number | null
          estimated_days?: number | null
          experience_mode?: string
          expiration_date?: string | null
          first_public_opened_at?: string | null
          follow_up_count?: number
          follow_up_sent_at?: string | null
          id?: string
          installment_count?: number | null
          last_follow_up_message?: string | null
          layout_style?: string | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_methods?: string[] | null
          payment_status?: string
          payment_terms?: string | null
          payment_updated_at?: string | null
          pix_key_snapshot?: string | null
          pix_key_type_snapshot?: string | null
          pix_recipient_city_snapshot?: string | null
          pix_recipient_name_snapshot?: string | null
          professional_context?: string
          profit_amount?: number
          profit_margin_percent?: number
          public_token?: string
          sent_at?: string | null
          sent_confirmed_at?: string | null
          sent_via?: string | null
          show_detailed_items?: boolean | null
          show_payment_options?: boolean | null
          show_timeline?: boolean | null
          source_quote_id?: string | null
          status?: string | null
          target_margin_percent?: number
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_source_quote_id_fkey"
            columns: ["source_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          cost_price: number
          created_at: string | null
          default_price: number
          description: string
          details: string | null
          folder_id: string | null
          id: string
          min_stock: number
          organization_id: string
          stock_quantity: number
          stock_updated_at: string | null
          track_stock: boolean
          type: string | null
          unit: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number
          created_at?: string | null
          default_price?: number
          description: string
          details?: string | null
          folder_id?: string | null
          id?: string
          min_stock?: number
          organization_id: string
          stock_quantity?: number
          stock_updated_at?: string | null
          track_stock?: boolean
          type?: string | null
          unit?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number
          created_at?: string | null
          default_price?: number
          description?: string
          details?: string | null
          folder_id?: string | null
          id?: string
          min_stock?: number
          organization_id?: string
          stock_quantity?: number
          stock_updated_at?: string | null
          track_stock?: boolean
          type?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "item_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          new_quantity: number | null
          note: string | null
          organization_id: string
          previous_quantity: number | null
          quantity_delta: number
          quote_id: string | null
          quote_item_id: string | null
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          new_quantity?: number | null
          note?: string | null
          organization_id: string
          previous_quantity?: number | null
          quantity_delta: number
          quote_id?: string | null
          quote_item_id?: string | null
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          new_quantity?: number | null
          note?: string | null
          organization_id?: string
          previous_quantity?: number | null
          quantity_delta?: number
          quote_id?: string | null
          quote_item_id?: string | null
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_quote_item_id_fkey"
            columns: ["quote_item_id"]
            isOneToOne: false
            referencedRelation: "quote_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_votes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "feature_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          first_response_at: string | null
          id: string
          message: string
          organization_id: string
          priority: string
          replied_at: string | null
          status: string
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          first_response_at?: string | null
          id?: string
          message: string
          organization_id: string
          priority?: string
          replied_at?: string | null
          status?: string
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          first_response_at?: string | null
          id?: string
          message?: string
          organization_id?: string
          priority?: string
          replied_at?: string | null
          status?: string
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      template_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon: string
          id: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      template_products: {
        Row: {
          category_id: string | null
          created_at: string
          default_price: number
          description: string | null
          id: string
          name: string
          specialty_tags: string[] | null
          unit: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_price: number
          description?: string | null
          id?: string
          name: string
          specialty_tags?: string[] | null
          unit?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          name?: string
          specialty_tags?: string[] | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      template_services: {
        Row: {
          category_id: string | null
          created_at: string
          default_price: number
          description: string | null
          id: string
          name: string
          specialty_tags: string[] | null
          unit: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_price: number
          description?: string | null
          id?: string
          name: string
          specialty_tags?: string[] | null
          unit?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          name?: string
          specialty_tags?: string[] | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_quote_public: {
        Args: { new_status: string; quote_id: string }
        Returns: undefined
      }
      check_email_exists: { Args: { email_to_check: string }; Returns: boolean }
      claim_free_quote_quota: {
        Args: { p_quote_id: string; p_usage_id: string }
        Returns: undefined
      }
      confirm_quote_sent_and_start_trial: {
        Args: { p_channel: string; p_quote_id: string }
        Returns: {
          confirmed_at: string
          quote_status: string
          trial_ends_at: string
          trial_started: boolean
        }[]
      }
      consume_quote_stock: { Args: { p_quote_id: string }; Returns: Json }
      record_stock_movement: {
        Args: {
          p_movement_type?: string
          p_note?: string
          p_quantity_delta: number
          p_service_id: string
        }
        Returns: Json
      }
      register_quote_follow_up: {
        Args: { p_quote_id: string }
        Returns: number
      }
      release_free_quote_quota: {
        Args: { p_usage_id: string }
        Returns: undefined
      }
      reserve_free_quote_quota: {
        Args: {
          p_experience_mode: string
          p_limit: number
          p_organization_id: string
          p_period_start: string
          p_user_id: string
        }
        Returns: string
      }
      update_quote_status: {
        Args: { new_status: string; quote_id: string }
        Returns: undefined
      }
      user_in_organization: { Args: { org_id: string }; Returns: boolean }
      user_is_org_admin: { Args: { org_id: string }; Returns: boolean }
      user_shares_profile_org: {
        Args: { profile_id: string }
        Returns: boolean
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
