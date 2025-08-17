# Custom Columns Guide for Taxable Invoice System

## 🎯 Overview
The taxable invoice system now supports dynamic custom columns that are properly saved to the database. This guide explains how to use and troubleshoot custom columns.

## 🗄️ Database Schema for Custom Columns

### Tables Involved:
1. **`taxable_invoice_items`** - Stores item data with custom columns in JSONB format
2. **`taxable_invoice_custom_columns`** - Stores custom column definitions per invoice

### Custom Column Storage:
- **Column Definitions**: Stored in `taxable_invoice_custom_columns` table
- **Column Data**: Stored in `custom_columns` JSONB field of `taxable_invoice_items`
- **Mapping**: Column ID → Display Name mapping preserved

## 🔧 How Custom Columns Work

### 1. Adding Custom Columns
1. In the taxable invoice create form, scroll to the items table
2. Click **"Add Custom Column"** button
3. Enter column name (e.g., "Brand", "Model", "Unit Type")
4. Click **"Add Column"** to create it
5. The column appears in the table before the "Amount" column

### 2. Using Custom Columns
1. Add items to your invoice
2. Fill in the custom column values for each item
3. Custom columns support text, numbers, and other data types
4. Empty custom column values are not saved (to keep database clean)

### 3. Saving to Database
When you click **"Save Invoice"**:
1. Custom column definitions are saved to `taxable_invoice_custom_columns`
2. Item data with custom values is saved to `taxable_invoice_items.custom_columns`
3. Column mapping (ID → Display Name) is preserved

## 🧪 Testing Custom Columns

### Test Page Available:
Visit `/test-custom-columns` to test the functionality:
1. Add custom columns
2. Add items and fill custom column data
3. Click "Test Save Data" to see console output
4. Verify data structure before database save

### Manual Testing Steps:
1. **Create Invoice with Custom Columns**:
   ```
   1. Go to /taxable-invoice/create
   2. Add custom columns: "Brand", "Model", "Warranty"
   3. Add items and fill custom data
   4. Save invoice
   5. Check console for debug output
   ```

2. **Verify Database Storage**:
   ```sql
   -- Check custom column definitions
   SELECT * FROM taxable_invoice_custom_columns 
   WHERE invoice_id = 'your-invoice-id';
   
   -- Check item data with custom columns
   SELECT custom_columns FROM taxable_invoice_items 
   WHERE invoice_id = 'your-invoice-id';
   ```

3. **View Saved Invoices**:
   ```
   1. Go to /taxable-invoice/list
   2. Find your saved invoice
   3. Custom column data should be preserved
   ```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Custom Columns Not Saving
**Symptoms**: Custom columns appear in form but not in database
**Solutions**:
- Check browser console for errors
- Verify custom column names are not empty
- Ensure items have values in custom columns
- Check database connection

#### 2. Custom Column Data Missing
**Symptoms**: Column definitions saved but item data missing
**Solutions**:
- Verify item data includes custom column values
- Check JSONB format in database
- Ensure custom column IDs match between tables

#### 3. Column Mapping Issues
**Symptoms**: Column names don't match between form and database
**Solutions**:
- Check `customColumnsMap` in console output
- Verify column ID generation (lowercase, underscores)
- Ensure mapping consistency

### Debug Console Output:
When saving an invoice, check browser console for:
```javascript
=== SAVING INVOICE DEBUG ===
Custom Columns: ["brand", "model", "warranty"]
Custom Columns Map: {"brand": "Brand", "model": "Model", "warranty": "Warranty"}
Items Data: [
  {
    description: "Test Item",
    hsn_sac_code: "1234",
    quantity: "1",
    rate: 100,
    amount: 100,
    brand: "Samsung",
    model: "Galaxy",
    warranty: "1 Year"
  }
]
```

## 📊 Database Structure Example

### Custom Column Definitions:
```sql
INSERT INTO taxable_invoice_custom_columns VALUES
('uuid1', 'invoice-id', 'brand', 'Brand', 0),
('uuid2', 'invoice-id', 'model', 'Model', 1),
('uuid3', 'invoice-id', 'warranty', 'Warranty', 2);
```

### Item Data with Custom Columns:
```sql
INSERT INTO taxable_invoice_items VALUES
('uuid', 'invoice-id', 1, 'Smartphone', '', '8517', '1 pc', 50000.00, 50000.00, 
'{"brand": "Samsung", "model": "Galaxy S24", "warranty": "1 Year"}');
```

## 🚀 Advanced Features

### 1. Column Ordering
- Custom columns are ordered by `column_order` field
- Order is preserved when displaying invoices
- Columns appear before the "Amount" column

### 2. Data Types Support
- **Text**: Brand names, descriptions
- **Numbers**: Quantities, measurements
- **Mixed**: "5 pcs", "2.5 kg"

### 3. Flexible Schema
- No limit on number of custom columns
- Column names can be changed per invoice
- JSONB storage allows complex data structures

## 🔧 API Functions

### Save Invoice with Custom Columns:
```typescript
await invoiceService.saveTaxableInvoice(
  invoiceData,
  itemsData,
  customColumns,     // Array of column IDs
  customColumnsMap   // ID → Display Name mapping
);
```

### Retrieve Invoice with Custom Columns:
```typescript
const result = await invoiceService.getTaxableInvoiceById(invoiceId);
// Returns: { invoice, items, customer, customColumns }
```

## 📈 Performance Considerations

### Optimizations:
- JSONB indexing for fast custom column queries
- Separate table for column definitions reduces redundancy
- Empty values not stored to minimize database size

### Best Practices:
- Use consistent column naming
- Avoid too many custom columns (< 10 recommended)
- Keep custom column values concise

## 🛡️ Data Validation

### Client-Side:
- Column names must not be empty
- Duplicate column names prevented
- Required fields validated before save

### Database-Side:
- UNIQUE constraint on (invoice_id, column_name)
- JSONB validation for custom_columns field
- Foreign key constraints maintained

---

**Custom columns are now fully functional with proper database storage and retrieval! 🎉**
