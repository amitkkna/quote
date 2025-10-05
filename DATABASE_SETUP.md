# Database Setup Guide for Taxable Invoice System

## 🎯 Overview
This guide will help you set up the Supabase database for storing customer master data and taxable invoice information.

## 📋 Prerequisites
- Supabase account and project
- Database URL and anon key (already configured in `.env.local`)

## 🗄️ Database Schema Setup

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query

### Step 2: Run the Schema Script
Copy and paste the contents of `database/schema.sql` into the SQL Editor and execute it. This will create:

#### Tables Created:
- **`customers`** - Customer master data
- **`taxable_invoices`** - Invoice header information  
- **`taxable_invoice_items`** - Invoice line items

#### Key Features:
- ✅ UUID primary keys
- ✅ Proper foreign key relationships
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Row Level Security (RLS) enabled
- ✅ Indexes for performance
- ✅ Data validation constraints

## 🔧 Configuration Details

### Environment Variables
Already configured in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://agyksncznpgntnkzghcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Connection
The application uses the Supabase JavaScript client configured in `app/lib/supabase.ts`.

## 📊 Data Flow

### Customer Data Saved:
- Customer name
- Billing address
- GST number (if provided)
- Email and phone (future enhancement)

### Invoice Data Saved:
- Invoice number and date
- PO reference and date
- Customer information (bill-to and ship-to)
- Company details
- Tax calculations (IGST/CGST+SGST)
- Invoice totals
- Terms and conditions
- Status tracking

### Invoice Items Saved:
- Item descriptions (English/Hindi)
- HSN/SAC codes
- Quantities and rates
- Calculated amounts
- Custom column data

## 🚀 Features Implemented

### ✅ Customer Management
- **Auto-deduplication**: Prevents duplicate customers based on name + address
- **GST tracking**: Stores and displays GST numbers
- **Address management**: Separate bill-to and ship-to addresses

### ✅ Invoice Management
- **Status tracking**: Draft → Sent → Paid → Cancelled
- **Tax calculations**: Automatic IGST/CGST+SGST calculations
- **Multi-language**: Hindi support for PO and item descriptions
- **Custom columns**: Flexible item attributes

### ✅ Data Integrity
- **Foreign keys**: Proper relationships between tables
- **Validation**: Data type and constraint validation
- **Timestamps**: Automatic creation and update tracking

## 🔍 Database Views

### Invoice Summary View
A pre-built view `invoice_summary` provides:
- Invoice details with customer information
- Total amounts and tax calculations
- Item counts per invoice
- Status and date information

## 📈 Usage Statistics

The system tracks:
- Total invoices created
- Total invoice amounts
- Paid vs pending invoices
- Customer transaction history

## 🛡️ Security

### Row Level Security (RLS)
- Enabled on all tables
- Public access policies (adjust as needed)
- Secure API key authentication

### Data Protection
- Environment variables for sensitive data
- Supabase built-in security features
- Proper error handling

## 🔧 Maintenance

### Regular Tasks
1. **Monitor database size**: Check storage usage
2. **Review policies**: Adjust RLS policies as needed
3. **Backup data**: Regular database backups
4. **Performance**: Monitor query performance

### Troubleshooting
- Check Supabase logs for errors
- Verify environment variables
- Test database connectivity
- Review RLS policies

## 📞 Support
- **Supabase Documentation**: https://supabase.com/docs
- **Database Schema**: See `database/schema.sql`
- **API Functions**: See `app/lib/supabase.ts`

---
**Database setup completed successfully! Your taxable invoice system is now ready to store and manage customer and invoice data.**
