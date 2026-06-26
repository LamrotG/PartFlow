export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'employee'
          department: string | null
          is_active: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'admin' | 'employee'
          department?: string | null
          is_active?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'employee'
          department?: string | null
          is_active?: boolean
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category_id: string | null
          brand_id: string | null
          unit_price: number
          cost_price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          unit_price: number
          cost_price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string
          name?: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          unit_price?: number
          cost_price?: number | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'products_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'categories'; referencedColumns: ['id'] },
          { foreignKeyName: 'products_brand_id_fkey'; columns: ['brand_id']; isOneToOne: false; referencedRelation: 'brands'; referencedColumns: ['id'] },
        ]
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          quantity_on_hand: number
          reorder_level: number
          reorder_quantity: number
          last_restocked_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity_on_hand?: number
          reorder_level?: number
          reorder_quantity?: number
          last_restocked_at?: string | null
          updated_at?: string
        }
        Update: {
          product_id?: string
          quantity_on_hand?: number
          reorder_level?: number
          reorder_quantity?: number
          last_restocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'inventory_product_id_fkey'; columns: ['product_id']; isOneToOne: true; referencedRelation: 'products'; referencedColumns: ['id'] },
        ]
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          employee_id: string
          total_amount: number
          paid_amount: number
          remaining_amount: number
          payment_status: 'paid' | 'partial' | 'unpaid'
          payment_method: 'cash' | 'check' | 'bank_transfer' | 'credit'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          employee_id: string
          total_amount: number
          paid_amount?: number
          payment_status?: 'paid' | 'partial' | 'unpaid'
          payment_method?: 'cash' | 'check' | 'bank_transfer' | 'credit'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer_id?: string | null
          total_amount?: number
          paid_amount?: number
          payment_status?: 'paid' | 'partial' | 'unpaid'
          payment_method?: 'cash' | 'check' | 'bank_transfer' | 'credit'
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'orders_customer_id_fkey'; columns: ['customer_id']; isOneToOne: false; referencedRelation: 'customers'; referencedColumns: ['id'] },
          { foreignKeyName: 'orders_employee_id_fkey'; columns: ['employee_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          { foreignKeyName: 'order_items_order_id_fkey'; columns: ['order_id']; isOneToOne: false; referencedRelation: 'orders'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_product_id_fkey'; columns: ['product_id']; isOneToOne: false; referencedRelation: 'products'; referencedColumns: ['id'] },
        ]
      }
      purchase_orders: {
        Row: {
          id: string
          po_number: string
          supplier_id: string
          ordered_by: string
          status: 'draft' | 'submitted' | 'received' | 'cancelled'
          total_amount: number
          expected_delivery_date: string | null
          received_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number?: string
          supplier_id: string
          ordered_by: string
          status?: 'draft' | 'submitted' | 'received' | 'cancelled'
          total_amount?: number
          expected_delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          supplier_id?: string
          status?: 'draft' | 'submitted' | 'received' | 'cancelled'
          total_amount?: number
          expected_delivery_date?: string | null
          received_at?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'purchase_orders_supplier_id_fkey'; columns: ['supplier_id']; isOneToOne: false; referencedRelation: 'suppliers'; referencedColumns: ['id'] },
          { foreignKeyName: 'purchase_orders_ordered_by_fkey'; columns: ['ordered_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number
          unit_cost: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number
          unit_cost: number
          created_at?: string
        }
        Update: {
          quantity_ordered?: number
          quantity_received?: number
          unit_cost?: number
        }
        Relationships: [
          { foreignKeyName: 'purchase_order_items_po_id_fkey'; columns: ['purchase_order_id']; isOneToOne: false; referencedRelation: 'purchase_orders'; referencedColumns: ['id'] },
          { foreignKeyName: 'purchase_order_items_product_id_fkey'; columns: ['product_id']; isOneToOne: false; referencedRelation: 'products'; referencedColumns: ['id'] },
        ]
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          order_id: string | null
          purchase_order_id: string | null
          type: 'sale' | 'purchase' | 'adjustment' | 'return'
          quantity: number
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          order_id?: string | null
          purchase_order_id?: string | null
          type: 'sale' | 'purchase' | 'adjustment' | 'return'
          quantity: number
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          note?: string | null
        }
        Relationships: [
          { foreignKeyName: 'stock_movements_product_id_fkey'; columns: ['product_id']; isOneToOne: false; referencedRelation: 'products'; referencedColumns: ['id'] },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: 'create' | 'update' | 'delete'
          table_name: string
          record_id: string
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: 'create' | 'update' | 'delete'
          table_name: string
          record_id: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          [key: string]: never
        }
        Relationships: [
          { foreignKeyName: 'audit_logs_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ]
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

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Inventory = Database['public']['Tables']['inventory']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export type ProductWithDetails = Product & {
  categories: Category | null
  brands: Brand | null
  inventory: Inventory | null
}

export type OrderWithDetails = Order & {
  customers: Customer | null
  profiles: Profile | null
  order_items: (OrderItem & { products: Product })[]
}

export type PurchaseOrderWithDetails = PurchaseOrder & {
  suppliers: Supplier
  profiles: Profile
  purchase_order_items: (PurchaseOrderItem & { products: Product })[]
}

export type InventoryWithProduct = Inventory & {
  products: Product & {
    categories: Category | null
    brands: Brand | null
  }
}
