# Performa Invoice System

A comprehensive invoice management system built with Next.js, React, and TypeScript. This system provides professional invoice generation with PDF export capabilities, GST calculations, and multiple document types.

## 🚀 Features

### Document Types
- **Performa Invoices** - Standard invoices with customizable layouts
- **Taxable Invoices** - GST-compliant invoices with IGST/CGST/SGST calculations
- **Quotations** - Professional quotations with multiple company support
- **Challans** - Delivery challans with quantity tracking
- **GTC Letters** - Global Trading Corporation letter templates
- **GTC Table Documents** - Structured table documents with image support

### Key Capabilities
- ✅ **PDF Generation** - High-quality PDF export with letterhead integration
- ✅ **GST Compliance** - Full Indian GST tax calculations (IGST/CGST/SGST)
- ✅ **Multi-Company Support** - Global Digital Connect, Global Trading Corporation, Rudharma Enterprises
- ✅ **Custom Columns** - Dynamic column addition for flexible data entry
- ✅ **Multi-line Descriptions** - Ctrl+Enter support for detailed descriptions
- ✅ **Bank Details Integration** - Automatic bank information inclusion
- ✅ **Digital Signatures** - Company seal and signature integration
- ✅ **Amount in Words** - Automatic conversion of numbers to words
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

### Advanced Features
- **HSN/SAC Codes** - Built-in support for tax classification codes
- **Bill To/Ship To** - Separate billing and shipping addresses
- **PO Management** - Purchase order reference and date tracking
- **Layout Options** - Fit to one page or allow multi-page documents
- **Real-time Calculations** - Automatic amount calculations
- **Professional Formatting** - Indian number formatting with commas

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: @react-pdf/renderer
- **Icons**: Heroicons
- **Fonts**: Google Fonts (Inter)
- **Development**: ESLint, PostCSS

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitkkna/quote.git
   cd quote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Build and Deploy

### Build for Production
```bash
npm run build
```

### Export Static Files
```bash
npm run export
```

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build && npm run export`
3. Set publish directory: `out`
4. Deploy automatically on push to main branch

## 🎯 Usage Guide

### Creating a Taxable Invoice
1. Navigate to "Create Taxable Invoice"
2. Fill in invoice details (number, date, PO reference)
3. Add Bill To and Ship To addresses
4. Add items with HSN/SAC codes and taxable values
5. Configure tax type (IGST or CGST+SGST)
6. Set tax rates and review calculations
7. Add terms and conditions
8. Choose layout options (fit to one page)
9. Preview and download PDF

### Multi-line Descriptions
- Use **Ctrl+Enter** in description fields to add line breaks
- Supports rich text formatting in PDF output

### Custom Columns
- Click "Add Custom Column" to add additional fields
- Custom columns appear before the Amount column
- Remove custom columns using the X button

## 🏢 Company Configurations

### Global Digital Connect (Default)
- **Address**: 320, Regus, Magnato Mall, VIP Chowk, Raipur- 492006
- **Phone**: 9685047519
- **Email**: prateek@globaldigitalconnect.com
- **Bank**: HDFC Bank Limited (A/c: 50200072078516)

### Global Trading Corporation
- **Address**: G-607 Golchaa Enclave, Amlidih Raipur
- **GST**: 22AOLPK1034M1Z2
- **Proprietor**: Amit Khera

### Rudharma Enterprises
- **Address**: 133 Metro Green Society, Saddu Raipur
- **GST**: 22APMPR8089K1Z3

## 📄 PDF Features

### Included in All PDFs
- Company letterhead (header and footer)
- Professional formatting with Indian number system
- Bank details section
- Digital signature and company seal
- Legal declaration statement
- GST compliance formatting

### Layout Options
- **Normal Layout**: Standard spacing for 1-2 pages
- **Compact Layout**: Compressed for single-page fit
- **Responsive**: Adapts to content length

## 📞 Support

For support and questions, contact:
- **Email**: prateek@globaldigitalconnect.com
- **Phone**: +91 9685047519

---

**Built with ❤️ by Global Digital Connect Team**
