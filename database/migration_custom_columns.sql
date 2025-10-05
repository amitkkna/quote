-- Migration: Add Custom Columns Support to Taxable Invoice System
-- Run this if you already have the basic schema and just need custom columns support

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

-- Update existing taxable_invoice_items table to add custom_columns field if not exists
DO $$
BEGIN
    -- Check if custom_columns column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'taxable_invoice_items' 
        AND column_name = 'custom_columns'
    ) THEN
        -- Add custom_columns field with default empty object
        ALTER TABLE taxable_invoice_items 
        ADD COLUMN custom_columns JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_columns_invoice ON taxable_invoice_custom_columns(invoice_id);
CREATE INDEX IF NOT EXISTS idx_custom_columns_name ON taxable_invoice_custom_columns(column_name);

-- Enable Row Level Security (RLS) for new table
ALTER TABLE taxable_invoice_custom_columns ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed for your security requirements)
DROP POLICY IF EXISTS "Enable all operations for taxable_invoice_custom_columns" ON taxable_invoice_custom_columns;
CREATE POLICY "Enable all operations for taxable_invoice_custom_columns" ON taxable_invoice_custom_columns
    FOR ALL USING (true);

-- Sample invoice with custom columns (for testing) - only if not exists
DO $$
DECLARE
    sample_customer_id UUID;
    sample_invoice_id UUID;
    existing_invoice_count INTEGER;
BEGIN
    -- Check if sample invoice already exists
    SELECT COUNT(*) INTO existing_invoice_count FROM taxable_invoices WHERE invoice_number = 'SAMPLE-CUSTOM-001';
    
    IF existing_invoice_count = 0 THEN
        -- Get or create sample customer
        SELECT id INTO sample_customer_id FROM customers WHERE name = 'Sample Customer Ltd.' LIMIT 1;
        
        -- If no sample customer exists, create one
        IF sample_customer_id IS NULL THEN
            INSERT INTO customers (name, address, gst_number, email, phone) VALUES
            ('Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001', '27ABCDE1234F1Z5', 'contact@samplecustomer.com', '+91 9876543210')
            RETURNING id INTO sample_customer_id;
        END IF;
        
        -- Insert sample invoice with custom columns
        INSERT INTO taxable_invoices (
            invoice_number, invoice_date, customer_id, company_name,
            bill_to_name, bill_to_address, ship_to_name, ship_to_address,
            subtotal, tax_type, cgst_rate, sgst_rate, cgst_amount, sgst_amount,
            tax_amount, total, status
        ) VALUES (
            'SAMPLE-CUSTOM-001', CURRENT_DATE, sample_customer_id, 'Global Digital Connect',
            'Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001',
            'Sample Customer Ltd.', '123 Business Street, Mumbai, Maharashtra 400001',
            25000.00, 'cgst_sgst', 9.00, 9.00, 2250.00, 2250.00, 4500.00, 29500.00, 'draft'
        ) RETURNING id INTO sample_invoice_id;
        
        -- Insert custom column definitions
        INSERT INTO taxable_invoice_custom_columns (invoice_id, column_name, column_display_name, column_order) VALUES
        (sample_invoice_id, 'brand', 'Brand', 0),
        (sample_invoice_id, 'model', 'Model', 1),
        (sample_invoice_id, 'warranty', 'Warranty', 2),
        (sample_invoice_id, 'color', 'Color', 3);
        
        -- Insert sample items with custom columns
        INSERT INTO taxable_invoice_items (
            invoice_id, serial_no, description, hsn_sac_code, quantity, rate, amount, custom_columns
        ) VALUES
        (sample_invoice_id, 1, 'Smartphone', '8517', '1 pc', 15000.00, 15000.00, 
         '{"brand": "Samsung", "model": "Galaxy S24", "warranty": "1 Year", "color": "Black"}'),
        (sample_invoice_id, 2, 'Phone Case', '3926', '1 pc', 500.00, 500.00, 
         '{"brand": "Samsung", "model": "S24 Case", "warranty": "6 Months", "color": "Clear"}'),
        (sample_invoice_id, 3, 'Wireless Charger', '8504', '1 pc', 2500.00, 2500.00, 
         '{"brand": "Samsung", "model": "Fast Wireless", "warranty": "1 Year", "color": "White"}'),
        (sample_invoice_id, 4, 'Screen Protector', '7013', '2 pcs', 3500.00, 7000.00, 
         '{"brand": "Generic", "model": "Tempered Glass", "warranty": "3 Months", "color": "Transparent"}');
    END IF;
END $$;

-- Create a view for easy querying of invoices with custom columns
CREATE OR REPLACE VIEW invoice_with_custom_columns AS
SELECT 
    ti.id as invoice_id,
    ti.invoice_number,
    ti.invoice_date,
    ti.company_name,
    ti.bill_to_name,
    ti.total,
    ti.status,
    c.name as customer_name,
    c.gst_number as customer_gst,
    -- Aggregate custom columns as JSON
    COALESCE(
        json_agg(
            json_build_object(
                'column_name', tcc.column_name,
                'display_name', tcc.column_display_name,
                'order', tcc.column_order
            ) ORDER BY tcc.column_order
        ) FILTER (WHERE tcc.id IS NOT NULL), 
        '[]'::json
    ) as custom_columns,
    -- Count of items
    COUNT(tii.id) as item_count
FROM taxable_invoices ti
LEFT JOIN customers c ON ti.customer_id = c.id
LEFT JOIN taxable_invoice_custom_columns tcc ON ti.id = tcc.invoice_id
LEFT JOIN taxable_invoice_items tii ON ti.id = tii.invoice_id
GROUP BY ti.id, c.name, c.gst_number
ORDER BY ti.created_at DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Custom columns migration completed successfully!';
    RAISE NOTICE 'New table created: taxable_invoice_custom_columns';
    RAISE NOTICE 'Updated table: taxable_invoice_items (added custom_columns JSONB field)';
    RAISE NOTICE 'Sample invoice with custom columns created: SAMPLE-CUSTOM-001';
    RAISE NOTICE 'View created: invoice_with_custom_columns';
END $$;
