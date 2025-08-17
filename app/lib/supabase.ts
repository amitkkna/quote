import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a safe Supabase client that handles missing environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Database Types
export interface Customer {
  id?: string
  name: string
  address: string
  gst_number?: string
  email?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface TaxableInvoice {
  id?: string
  invoice_number: string
  invoice_date: string
  po_reference?: string
  po_date?: string
  customer_id: string
  company_name: string
  bill_to_name: string
  bill_to_address: string
  bill_to_gst?: string
  ship_to_name: string
  ship_to_address: string
  ship_to_gst?: string
  subtotal: number
  tax_type: 'igst' | 'cgst_sgst'
  igst_rate: number
  cgst_rate: number
  sgst_rate: number
  igst_amount: number
  cgst_amount: number
  sgst_amount: number
  tax_amount: number
  total: number
  terms_and_conditions?: string
  round_off: boolean
  hindi_mode: boolean
  fit_to_one_page: boolean
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface TaxableInvoiceItem {
  id?: string
  invoice_id: string
  serial_no: number
  description: string
  description_hindi?: string
  hsn_sac_code: string
  quantity: string
  rate: number
  amount: number
  custom_columns?: Record<string, any>
  created_at?: string
}

export interface TaxableInvoiceCustomColumn {
  id?: string
  invoice_id: string
  column_name: string
  column_display_name: string
  column_order: number
  created_at?: string
}

// Database Functions
export const customerService = {
  // Create or update customer
  async upsertCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning mock customer')
      return { id: 'mock-id', ...customer, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    }

    // First try to find existing customer by name and address
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('name', customer.name)
      .eq('address', customer.address)
      .single()

    if (existingCustomer) {
      // Update existing customer
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new customer
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }
}

export const invoiceService = {
  // Save taxable invoice with items and custom columns
  async saveTaxableInvoice(
    invoiceData: Omit<TaxableInvoice, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<TaxableInvoiceItem, 'id' | 'invoice_id' | 'created_at'>[],
    customColumns?: string[],
    customColumnsMap?: Record<string, string>
  ): Promise<{ invoice: TaxableInvoice; items: TaxableInvoiceItem[]; customColumns: TaxableInvoiceCustomColumn[] }> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning mock data')
      const mockInvoice = { id: 'mock-invoice-id', ...invoiceData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      return { invoice: mockInvoice as TaxableInvoice, items: [], customColumns: [] }
    }

    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from('taxable_invoices')
      .insert([invoiceData])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Insert custom column definitions if any
    let savedCustomColumns: TaxableInvoiceCustomColumn[] = []
    if (customColumns && customColumns.length > 0) {
      const customColumnData = customColumns.map((colName, index) => ({
        invoice_id: invoice.id,
        column_name: colName,
        column_display_name: customColumnsMap?.[colName] || colName,
        column_order: index
      }))

      const { data: customColsData, error: customColsError } = await supabase
        .from('taxable_invoice_custom_columns')
        .insert(customColumnData)
        .select()

      if (customColsError) throw customColsError
      savedCustomColumns = customColsData || []
    }

    // Insert invoice items with custom column data
    const itemsWithInvoiceId = items.map((item, index) => {
      // Extract custom column values from the item
      const customColumnValues: Record<string, any> = {}
      if (customColumns) {
        customColumns.forEach(colName => {
          if (item[colName as keyof typeof item] !== undefined) {
            customColumnValues[colName] = item[colName as keyof typeof item]
          }
        })
      }

      return {
        invoice_id: invoice.id,
        serial_no: index + 1,
        description: item.description,
        description_hindi: item.description_hindi,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        custom_columns: Object.keys(customColumnValues).length > 0 ? customColumnValues : {}
      }
    })

    const { data: savedItems, error: itemsError } = await supabase
      .from('taxable_invoice_items')
      .insert(itemsWithInvoiceId)
      .select()

    if (itemsError) throw itemsError

    return { invoice, items: savedItems || [], customColumns: savedCustomColumns }
  },

  // Get all taxable invoices
  async getTaxableInvoices(): Promise<TaxableInvoice[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    const { data, error } = await supabase
      .from('taxable_invoices')
      .select(`
        *,
        customer:customers(name, address, gst_number)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get taxable invoice by ID with items and custom columns
  async getTaxableInvoiceById(id: string): Promise<{
    invoice: TaxableInvoice;
    items: TaxableInvoiceItem[];
    customer: Customer;
    customColumns: TaxableInvoiceCustomColumn[];
  } | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning null')
      return null
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('taxable_invoices')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single()

    if (invoiceError) return null

    const { data: items, error: itemsError } = await supabase
      .from('taxable_invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('serial_no')

    if (itemsError) return null

    const { data: customColumns, error: customColumnsError } = await supabase
      .from('taxable_invoice_custom_columns')
      .select('*')
      .eq('invoice_id', id)
      .order('column_order')

    if (customColumnsError) return null

    return {
      invoice,
      items: items || [],
      customer: invoice.customer,
      customColumns: customColumns || []
    }
  },

  // Update invoice status
  async updateInvoiceStatus(id: string, status: TaxableInvoice['status']): Promise<void> {
    const { error } = await supabase
      .from('taxable_invoices')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  },

  // Delete invoice (cascades to items and custom columns)
  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('taxable_invoices')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Update existing taxable invoice
  async updateTaxableInvoice(
    invoiceId: string,
    invoiceData: Omit<TaxableInvoice, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<TaxableInvoiceItem, 'id' | 'invoice_id' | 'created_at'>[],
    customColumns?: string[],
    customColumnsMap?: {[key: string]: string}
  ): Promise<{ invoiceId: string }> {
    // Update invoice
    const { error: invoiceError } = await supabase
      .from('taxable_invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    if (invoiceError) throw invoiceError

    // Delete existing items and custom columns
    const { error: deleteItemsError } = await supabase
      .from('taxable_invoice_items')
      .delete()
      .eq('invoice_id', invoiceId)

    if (deleteItemsError) throw deleteItemsError

    const { error: deleteCustomColumnsError } = await supabase
      .from('taxable_invoice_custom_columns')
      .delete()
      .eq('invoice_id', invoiceId)

    if (deleteCustomColumnsError) throw deleteCustomColumnsError

    // Insert updated items
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceId
      }))

      const { error: itemsError } = await supabase
        .from('taxable_invoice_items')
        .insert(itemsWithInvoiceId)

      if (itemsError) throw itemsError
    }

    // Insert updated custom columns
    if (customColumns && customColumns.length > 0 && customColumnsMap) {
      const customColumnsData = customColumns.map((columnName, index) => ({
        invoice_id: invoiceId,
        column_name: columnName,
        column_display_name: customColumnsMap[columnName] || columnName,
        column_order: index
      }))

      const { error: customColumnsError } = await supabase
        .from('taxable_invoice_custom_columns')
        .insert(customColumnsData)

      if (customColumnsError) throw customColumnsError
    }

    return { invoiceId }
  }
}
