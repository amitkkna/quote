# 📁 Project Structure

This document outlines the complete structure of the Invoice & Quotation System.

## 🏗️ Directory Structure

```
quote-main/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 components/               # Reusable React components
│   │   ├── ClientOnlyPDFModal.tsx   # PDF preview modal
│   │   ├── GTCTaxableInvoicePDF.tsx # GTC-specific PDF template
│   │   ├── PDFPreviewModal.tsx      # PDF preview component
│   │   ├── RudharmaTaxableInvoicePDF.tsx # Rudharma PDF template
│   │   ├── TaxableInvoiceItemsTable.tsx # Items table component
│   │   └── TaxableInvoicePDF.tsx    # Default PDF template
│   │
│   ├── 📁 lib/                      # Utility libraries
│   │   └── supabase.ts              # Database service layer
│   │
│   ├── 📁 reports/                  # Reports module
│   │   └── page.tsx                 # Sales reports page
│   │
│   ├── 📁 taxable-invoice/          # Invoice management
│   │   ├── 📁 create/               # Create invoice
│   │   │   └── page.tsx             # Invoice creation form
│   │   ├── 📁 edit/[id]/            # Edit invoice
│   │   │   ├── EditTaxableInvoiceClient.tsx # Edit client component
│   │   │   └── page.tsx             # Edit page wrapper
│   │   ├── 📁 list/                 # Invoice list
│   │   │   └── page.tsx             # Invoice list with actions
│   │   └── 📁 view/[id]/            # View invoice
│   │       ├── ViewTaxableInvoiceClient.tsx # View client component
│   │       └── page.tsx             # View page wrapper
│   │
│   ├── 📁 test-custom-columns/      # Testing utilities
│   │   └── page.tsx                 # Custom columns test page
│   │
│   ├── favicon.ico                  # App favicon
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
│
├── 📁 database/                     # Database schema and migrations
│   ├── migration_custom_columns.sql # Custom columns migration
│   └── schema.sql                   # Complete database schema
│
├── 📁 public/                       # Static assets
│   ├── 📁 images/                   # Image assets
│   └── ...                          # Other static files
│
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .eslintrc.json               # ESLint configuration
├── 📄 BACKUP_README.md             # Backup documentation
├── 📄 CUSTOM_COLUMNS_GUIDE.md      # Custom columns guide
├── 📄 DATABASE_SETUP.md            # Database setup guide
├── 📄 DEPLOYMENT.md                # Deployment guide
├── 📄 next.config.js               # Next.js configuration
├── 📄 package.json                 # Dependencies and scripts
├── 📄 package-lock.json            # Dependency lock file
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 README.md                    # Main documentation
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
└── 📄 tsconfig.json                # TypeScript configuration
```

## 🧩 Component Architecture

### **PDF Components**
- **TaxableInvoicePDF.tsx**: Default PDF template with custom columns support
- **GTCTaxableInvoicePDF.tsx**: Global Trading Corporation specific formatting
- **RudharmaTaxableInvoicePDF.tsx**: Rudharma Enterprises specific formatting

### **Modal Components**
- **ClientOnlyPDFModal.tsx**: Client-side PDF preview modal
- **PDFPreviewModal.tsx**: PDF preview with download functionality

### **Form Components**
- **TaxableInvoiceItemsTable.tsx**: Dynamic items table with custom columns

## 🗄️ Database Layer

### **Service Layer** (`app/lib/supabase.ts`)
```typescript
// Customer Management
- getCustomers()
- saveCustomer()

// Invoice Management
- saveTaxableInvoice()
- getTaxableInvoices()
- getTaxableInvoiceById()
- updateTaxableInvoice()
- deleteInvoice()
- updateInvoiceStatus()
```

### **Database Schema** (`database/schema.sql`)
```sql
-- Core Tables
- customers
- taxable_invoices
- taxable_invoice_items
- taxable_invoice_custom_columns

-- Relationships
- Foreign key constraints
- Cascading deletes
- Audit timestamps
```

## 🎯 Feature Modules

### **Invoice Management**
```
📁 taxable-invoice/
├── create/     # Invoice creation with custom columns
├── list/       # Invoice listing with actions
├── view/[id]/  # Detailed invoice view
└── edit/[id]/  # Invoice editing functionality
```

### **Reporting System**
```
📁 reports/
└── page.tsx    # Monthly sales and HSN/SAC analysis
```

## 🔧 Configuration Files

### **Next.js Configuration** (`next.config.js`)
- Static export settings
- Image optimization
- Build configuration

### **Tailwind Configuration** (`tailwind.config.ts`)
- Custom color schemes
- Component styling
- Responsive breakpoints

### **TypeScript Configuration** (`tsconfig.json`)
- Strict type checking
- Path aliases
- Compiler options

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### **Mobile Optimizations**
- Touch-friendly buttons
- Horizontal scroll tables
- Collapsible sections
- Optimized forms

## 🎨 Styling Architecture

### **Global Styles** (`app/globals.css`)
- Tailwind CSS imports
- Custom utility classes
- Print media styles

### **Component Styles**
- Tailwind utility classes
- Responsive modifiers
- Dark mode support (future)

## 🔐 Security Implementation

### **Client-Side Security**
- Input validation
- XSS prevention
- CSRF protection

### **Database Security**
- Row Level Security (RLS)
- Parameterized queries
- Data sanitization

## 📊 Data Flow

### **Invoice Creation Flow**
```
User Input → Form Validation → Database Save → PDF Generation
```

### **Invoice Management Flow**
```
List View → Action Selection → CRUD Operations → Status Updates
```

### **Reporting Flow**
```
Filter Selection → Database Query → Data Processing → CSV Export
```

## 🧪 Testing Structure

### **Test Files** (Future Implementation)
```
📁 __tests__/
├── components/
├── pages/
├── lib/
└── integration/
```

### **Testing Strategy**
- Unit tests for components
- Integration tests for database
- E2E tests for user flows
- PDF generation tests

## 🚀 Build Process

### **Development**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
```

### **Build Output**
```
📁 .next/       # Next.js build output
📁 out/         # Static export output (if enabled)
```

## 📦 Dependencies

### **Core Dependencies**
- Next.js 14 (React framework)
- React 18 (UI library)
- TypeScript (Type safety)
- Tailwind CSS (Styling)

### **Database**
- Supabase (Backend as a Service)
- PostgreSQL (Database)

### **PDF Generation**
- @react-pdf/renderer (PDF creation)
- React-PDF components

### **Development Tools**
- ESLint (Code linting)
- PostCSS (CSS processing)
- Autoprefixer (CSS prefixing)

---

**This structure provides a scalable foundation for the invoice management system! 🏗️**
