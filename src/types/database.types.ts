export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
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
    public: {
        Tables: {
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
            profiles: {
                Row: {
                    business_name: string | null
                    cep: string | null
                    address: string | null
                    address_number: string | null
                    complement: string | null
                    neighborhood: string | null
                    city: string | null
                    state: string | null
                    cnpj: string | null
                    delivery_days: number | null
                    email: string | null
                    id: string
                    is_superadmin: boolean | null
                    layout_style: string | null
                    logo_url: string | null
                    onboarded_at: string | null
                    payment_info: string | null
                    phone: string | null
                    pix_discount_percent: number | null
                    plan: string | null
                    quote_font_family: string | null
                    primary_color: string | null
                    quote_settings: Json | null
                    stripe_customer_id: string | null
                    stripe_price_id: string | null
                    stripe_subscription_id: string | null
                    subscription_status: string | null
                    current_period_end: string | null
                    cancel_at_period_end: boolean | null
                    theme_color: string | null
                    updated_at: string | null
                }
                Insert: {
                    business_name?: string | null
                    cep?: string | null
                    address?: string | null
                    address_number?: string | null
                    complement?: string | null
                    neighborhood?: string | null
                    city?: string | null
                    state?: string | null
                    cnpj?: string | null
                    delivery_days?: number | null
                    email?: string | null
                    id: string
                    is_superadmin?: boolean | null
                    layout_style?: string | null
                    logo_url?: string | null
                    onboarded_at?: string | null
                    payment_info?: string | null
                    phone?: string | null
                    pix_discount_percent?: number | null
                    plan?: string | null
                    quote_font_family?: string | null
                    primary_color?: string | null
                    quote_settings?: Json | null
                    stripe_customer_id?: string | null
                    stripe_price_id?: string | null
                    stripe_subscription_id?: string | null
                    subscription_status?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean | null
                    theme_color?: string | null
                    updated_at?: string | null
                }
                Update: {
                    business_name?: string | null
                    cep?: string | null
                    address?: string | null
                    address_number?: string | null
                    complement?: string | null
                    neighborhood?: string | null
                    city?: string | null
                    state?: string | null
                    cnpj?: string | null
                    delivery_days?: number | null
                    email?: string | null
                    id?: string
                    is_superadmin?: boolean | null
                    layout_style?: string | null
                    logo_url?: string | null
                    onboarded_at?: string | null
                    payment_info?: string | null
                    phone?: string | null
                    pix_discount_percent?: number | null
                    plan?: string | null
                    quote_font_family?: string | null
                    primary_color?: string | null
                    quote_settings?: Json | null
                    stripe_customer_id?: string | null
                    stripe_price_id?: string | null
                    stripe_subscription_id?: string | null
                    subscription_status?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean | null
                    theme_color?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            quote_items: {
                Row: {
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
            quotes: {
                Row: {
                    amount_paid: number
                    cash_discount_fixed: number | null
                    cash_discount_percent: number | null
                    cash_discount_type: string | null
                    client_responded_at: string | null
                    client_response_note: string | null
                    client_company_name: string | null
                    client_name: string
                    client_phone: string | null
                    client_type: string | null
                    created_at: string | null
                    discount: number | null
                    estimated_days: number | null
                    expiration_date: string | null
                    id: string
                    installment_count: number | null
                    layout_style: string | null
                    notes: string | null
                    organization_id: string
                    paid_at: string | null
                    payment_methods: string[] | null
                    payment_terms: string | null
                    payment_status: string
                    payment_updated_at: string | null
                    professional_context: string
                    public_token: string
                    show_detailed_items: boolean | null
                    show_payment_options: boolean | null
                    show_timeline: boolean | null
                    status: string | null
                    total: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    amount_paid?: number
                    cash_discount_fixed?: number | null
                    cash_discount_percent?: number | null
                    cash_discount_type?: string | null
                    client_responded_at?: string | null
                    client_response_note?: string | null
                    client_company_name?: string | null
                    client_name: string
                    client_phone?: string | null
                    client_type?: string | null
                    created_at?: string | null
                    discount?: number | null
                    estimated_days?: number | null
                    expiration_date?: string | null
                    id?: string
                    installment_count?: number | null
                    layout_style?: string | null
                    notes?: string | null
                    organization_id: string
                    paid_at?: string | null
                    payment_methods?: string[] | null
                    payment_terms?: string | null
                    payment_status?: string
                    payment_updated_at?: string | null
                    professional_context?: string
                    public_token?: string
                    show_detailed_items?: boolean | null
                    show_payment_options?: boolean | null
                    show_timeline?: boolean | null
                    status?: string | null
                    total?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    amount_paid?: number
                    cash_discount_fixed?: number | null
                    cash_discount_percent?: number | null
                    cash_discount_type?: string | null
                    client_responded_at?: string | null
                    client_response_note?: string | null
                    client_company_name?: string | null
                    client_name?: string
                    client_phone?: string | null
                    client_type?: string | null
                    created_at?: string | null
                    discount?: number | null
                    estimated_days?: number | null
                    expiration_date?: string | null
                    id?: string
                    installment_count?: number | null
                    layout_style?: string | null
                    notes?: string | null
                    organization_id?: string
                    paid_at?: string | null
                    payment_methods?: string[] | null
                    payment_terms?: string | null
                    payment_status?: string
                    payment_updated_at?: string | null
                    professional_context?: string
                    public_token?: string
                    show_detailed_items?: boolean | null
                    show_payment_options?: boolean | null
                    show_timeline?: boolean | null
                    status?: string | null
                    total?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quotes_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
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
            support_tickets: {
                Row: {
                    created_at: string
                    id: string
                    message: string
                    organization_id: string
                    status: string
                    subject: string
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    message: string
                    organization_id: string
                    status?: string
                    subject: string
                    type: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    message?: string
                    organization_id?: string
                    status?: string
                    subject?: string
                    type?: string
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
            check_email_exists: {
                Args: {
                    email_to_check: string
                }
                Returns: boolean
            }
            consume_quote_stock: {
                Args: {
                    p_quote_id: string
                }
                Returns: Json
            }
            record_stock_movement: {
                Args: {
                    p_service_id: string
                    p_quantity_delta: number
                    p_movement_type?: string
                    p_note?: string | null
                }
                Returns: Json
            }
            user_in_organization: {
                Args: {
                    org_id: string
                }
                Returns: boolean
            }
            user_is_org_admin: {
                Args: {
                    org_id: string
                }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
