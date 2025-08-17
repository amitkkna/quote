-- Supabase Database Schema for Taxable Invoice System
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    gst_number VARCHAR(15),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create taxable_invoices table
CREATE TABLE IF NOT EXISTS taxable_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL,
    po_reference VARCHAR(100),
    po_date DATE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    bill_to_name VARCHAR(255) NOT NULL,
    bill_to_address TEXT NOT NULL,
    bill_to_gst VARCHAR(15),
    ship_to_name VARCHAR(255) NOT NULL,
    ship_to_address TEXT NOT NULL,
    ship_to_gst VARCHAR(15),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('igst', 'cgst_sgst')),
    igst_rate DECIMAL(5,2) DEFAULT 0,
    cgst_rate DECIMAL(5,2) DEFAULT 0,
    sgst_rate DECIMAL(5,2) DEFAULT 0,
    igst_amount DECIMAL(12,2) DEFAULT 0,
    cgst_amount DECIMAL(12,2) DEFAULT 0,
    sgst_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    terms_and_conditions TEXT,
    round_off BOOLEAN DEFAULT FALSE,
    hindi_mode BOOLEAN DEFAULT FALSE,
    fit_to_one_page BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create taxable_invoice_items table
CREATE TABLE IF NOT EXISTS taxable_invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES taxable_invoices(id) ON DELETE CASCADE,
    serial_no INTEGER NOT NULL,
    description TEXT NOT NULL,
    description_hindi TEXT,
    hsn_sac_code VARCHAR(20) NOT NULL,
    quantity VARCHAR(50) NOT NULL, -- Allow text like "5 pcs", "2 units"
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    custom_columns JSONB DEFAULT '{}', -- Store custom column data as JSON with default empty object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a separate table to store custom column definitions per invoice
CREATE TABLE IF NOT EXISTS taxable_invoice_custom_columns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES taxable_invoices(id) ON DELETE CASCADE,
    column_name VARCHAR(100) NOT NULL,
    column_display_name VARCHAR(200) NOT NULL,
    column_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invoice_id, column_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_gst ON customers(gst_number);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON taxable_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON taxable_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON taxable_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON taxable_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON taxable_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_custom_columns_invoice ON taxable_invoice_custom_columns(invoice_id);
CREATE INDEX IF NOT EXISTS idx_custom_columns_name ON taxable_invoice_custom_columns(column_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (with IF NOT EXISTS equivalent)
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_taxable_invoices_updated_at ON taxable_invoices;
CREATE TRIGGER update_taxable_invoices_updated_at
    BEFORE UPDATE ON taxable_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxable_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxable_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxable_invoice_custom_columns ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
DROP POLICY IF EXISTS "Enable all operations for customers" ON customers;
CREATE POLICY "Enable all operations for customers" ON customers
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for taxable_invoices" ON taxable_invoices;
CREATE POLICY "Enable all operations for taxable_invoices" ON taxable_invoices
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for taxable_invoice_items" ON taxable_invoice_items;
CREATE POLICY "Enable all operations for taxable_invoice_items" ON taxable_invoice_items
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for taxable_invoice_custom_columns" ON taxable_invoice_custom_columns;
CREATE POLICY "Enable all operations for taxable_invoice_custom_columns" ON taxable_invoice_custom_columns
    FOR ALL USING (true);

-- Insert some sample data (optional) - only if not exists
INSERT INTO customers (name, address, gst_number, email, phone)
SELECT 'Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001', '27ABCDE1234F1Z5', 'contact@samplecustomer.com', '+91 9876543210'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'Sample Customer Ltd.');

INSERT INTO customers (name, address, gst_number, email, phone)
SELECT 'Tech Solutions Pvt Ltd', '456 IT Park, Bangalore, Karnataka 560001', '29FGHIJ5678K2L6', 'info@techsolutions.com', '+91 9876543211'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name = 'Tech Solutions Pvt Ltd.');

-- Sample invoice with custom columns (for testing) - only if not exists
DO $$
DECLARE
    sample_customer_id UUID;
    sample_invoice_id UUID;
    existing_invoice_count INTEGER;
BEGIN
    -- Check if sample invoice already exists
    SELECT COUNT(*) INTO existing_invoice_count FROM taxable_invoices WHERE invoice_number = 'SAMPLE-001';

    IF existing_invoice_count = 0 THEN
        -- Get sample customer ID
        SELECT id INTO sample_customer_id FROM customers WHERE name = 'Sample Customer Ltd.' LIMIT 1;

        IF sample_customer_id IS NOT NULL THEN
            -- Insert sample invoice
            INSERT INTO taxable_invoices (
                invoice_number, invoice_date, customer_id, company_name,
                bill_to_name, bill_to_address, ship_to_name, ship_to_address,
                subtotal, tax_type, cgst_rate, sgst_rate, cgst_amount, sgst_amount,
                tax_amount, total, status
            ) VALUES (
                'SAMPLE-001', CURRENT_DATE, sample_customer_id, 'Global Digital Connect',
                'Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001',
                'Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001',
                10000.00, 'cgst_sgst', 9.00, 9.00, 900.00, 900.00, 1800.00, 11800.00, 'draft'
            ) RETURNING id INTO sample_invoice_id;

            -- Insert custom column definitions
            INSERT INTO taxable_invoice_custom_columns (invoice_id, column_name, column_display_name, column_order) VALUES
            (sample_invoice_id, 'brand', 'Brand', 0),
            (sample_invoice_id, 'model', 'Model', 1),
            (sample_invoice_id, 'warranty', 'Warranty', 2);

            -- Insert sample items with custom columns
            INSERT INTO taxable_invoice_items (
                invoice_id, serial_no, description, hsn_sac_code, quantity, rate, amount, custom_columns
            ) VALUES
            (sample_invoice_id, 1, 'Smartphone', '8517', '1 pc', 10000.00, 10000.00,
             '{"brand": "Samsung", "model": "Galaxy S24", "warranty": "1 Year"}');
        END IF;
    END IF;
END $$;

-- Create a view for invoice summary
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
    ti.id,
    ti.invoice_number,
    ti.invoice_date,
    ti.po_reference,
    c.name as customer_name,
    c.gst_number as customer_gst,
    ti.company_name,
    ti.subtotal,
    ti.tax_amount,
    ti.total,
    ti.status,
    ti.created_at,
    COUNT(tii.id) as item_count
FROM taxable_invoices ti
LEFT JOIN customers c ON ti.customer_id = c.id
LEFT JOIN taxable_invoice_items tii ON ti.id = tii.invoice_id
GROUP BY ti.id, c.name, c.gst_number
ORDER BY ti.created_at DESC;
