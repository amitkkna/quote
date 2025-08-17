import React, { forwardRef, useImperativeHandle } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, PDFViewer, Image } from '@react-pdf/renderer';
import ClientOnlyPDFViewer from './ClientOnlyPDFViewer';

interface QuotationItem {
  id: string;
  serial_no: string;
  description: string;
  qty?: string;
  price?: string;
  amount: number;
  [key: string]: any;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerGST?: string;
  customerPhone: string;
  subject?: string;
  items: QuotationItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  amountInWords: string;
  notes?: string;
  terms?: string;
  fitInOnePage?: boolean;
}

interface SanghiStationersPDFProps {
  quotation: QuotationData;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 25,
    fontFamily: 'Helvetica'
  },
  headerImage: {
    width: '100%',
    height: 120,
    marginBottom: 20,
    objectFit: 'contain'
  },
  headerBorder: {
    borderTop: '4 solid #0D9488',
    borderBottom: '4 solid #0D9488',
    marginBottom: 20,
    paddingVertical: 15
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D9488',
    textAlign: 'center',
    marginBottom: 3
  },
  companySubtitle: {
    fontSize: 14,
    color: '#0F766E',
    textAlign: 'center',
    marginBottom: 8
  },
  companyDetails: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 1.3
  },
  gstInfo: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#0D9488',
    padding: 12,
    marginBottom: 20,
    borderRadius: 3
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F0FDFA',
    padding: 15,
    borderRadius: 5,
    border: '1 solid #5EEAD4'
  },
  leftInfo: {
    flex: 1,
    paddingRight: 15
  },
  rightInfo: {
    flex: 1,
    paddingLeft: 15
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F766E',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 8
  },
  customerSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 5,
    border: '1 solid #FCD34D'
  },
  customerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5
  },
  customerValue: {
    fontSize: 10,
    color: '#451A03',
    marginBottom: 3
  },
  consolidatedInfoSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 5,
    border: '1 solid #DEE2E6'
  },
  leftColumn: {
    flex: 1,
    paddingRight: 15
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 15
  },
  compactLabel: {
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 2
  },
  compactValue: {
    color: '#212529',
    fontWeight: 'normal'
  },
  subjectBox: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 5,
    border: '1 solid #3B82F6'
  },
  subjectLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 3
  },
  subjectText: {
    fontSize: 10,
    color: '#1E3A8A'
  },
  itemsTable: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 35
  },
  tableRowEven: {
    flexDirection: 'row',
    borderBottom: '1 solid #D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 35
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'left',
    paddingHorizontal: 3,
    display: 'flex',
    justifyContent: 'center'
  },
  tableCellRight: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'right',
    paddingHorizontal: 3,
    display: 'flex',
    justifyContent: 'center'
  },
  colSerial: { width: '10%' },
  colDesc: { width: '45%' },
  colQty: { width: '12%' },
  colPrice: { width: '16%' },
  colAmount: { width: '17%' },
  summarySection: {
    marginTop: 15,
    paddingTop: 15,
    borderTop: '2 solid #0D9488'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 15
  },
  summaryLabel: {
    fontSize: 11,
    color: '#374151'
  },
  summaryValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0D9488',
    padding: 12,
    borderRadius: 5,
    marginTop: 8
  },
  totalLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  wordsSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 5,
    border: '1 solid #22C55E'
  },
  wordsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 3
  },
  wordsText: {
    fontSize: 10,
    color: '#166534',
    fontStyle: 'italic'
  },
  footerSection: {
    marginTop: 25,
    paddingTop: 15,
    borderTop: '1 solid #D1D5DB'
  },
  thankYou: {
    fontSize: 11,
    color: '#0D9488',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8
  },
  footerNote: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30
  },
  signatureBlock: {
    width: '35%',
    borderTop: '1 solid #374151',
    paddingTop: 5
  },
  signatureText: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'center'
  }
});

const SanghiStationersPDFDocument = ({ quotation }: SanghiStationersPDFProps) => {
  // Get custom columns dynamically from the first item
  const getCustomColumns = () => {
    if (!quotation.items || quotation.items.length === 0) return [];
    const firstItem = quotation.items[0];
    return Object.keys(firstItem).filter(key =>
      !['id', 'serial_no', 'description', 'amount'].includes(key)
    );
  };

  const customColumns = getCustomColumns();
  const numCustomColumns = customColumns.length;

  // Dynamic styles based on fitInOnePage option
  const dynamicStyles = {
    headerImageHeight: quotation.fitInOnePage ? 80 : 120,
    titleFontSize: quotation.fitInOnePage ? 16 : 20,
    titleMargin: quotation.fitInOnePage ? 8 : 15,
    infoSectionMargin: quotation.fitInOnePage ? 8 : 15,
    infoFontSize: quotation.fitInOnePage ? 8 : 10,
    customerSectionMargin: quotation.fitInOnePage ? 8 : 15,
    customerFontSize: quotation.fitInOnePage ? 8 : 10,
    tableFontSize: quotation.fitInOnePage ? 7 : 9,
    tableHeaderFontSize: quotation.fitInOnePage ? 8 : 9,
    tableMinHeight: quotation.fitInOnePage ? 25 : 35,
    summaryFontSize: quotation.fitInOnePage ? 9 : 11,
    totalFontSize: quotation.fitInOnePage ? 11 : 13,
    wordsFontSize: quotation.fitInOnePage ? 8 : 10,
    notesFontSize: quotation.fitInOnePage ? 7 : 9,
    footerFontSize: quotation.fitInOnePage ? 7 : 9
  };

  // Calculate dynamic column widths
  const getColumnWidths = () => {
    const baseWidth = 100;
    let serialWidth = 8;
    let descriptionWidth = 35;
    let amountWidth = 15;

    if (numCustomColumns === 0) {
      descriptionWidth = 77;
    } else if (numCustomColumns === 1) {
      descriptionWidth = 62;
    } else if (numCustomColumns === 2) {
      descriptionWidth = 47;
    } else if (numCustomColumns === 3) {
      descriptionWidth = 32;
    } else {
      descriptionWidth = 25;
    }

    const customColumnWidth = numCustomColumns > 0 ?
      (baseWidth - serialWidth - descriptionWidth - amountWidth) / numCustomColumns : 0;

    return {
      serial: `${serialWidth}%`,
      description: `${descriptionWidth}%`,
      custom: `${customColumnWidth}%`,
      amount: `${amountWidth}%`
    };
  };

  const columnWidths = getColumnWidths();

  // Helper function to format proper case
  const formatProperCase = (text: string) => {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format currency safely - ultra simple approach
  const formatCurrency = (amount: number | string) => {
    try {
      // Force conversion to number
      const num = Number(amount);
      if (isNaN(num)) return 'Rs. 0.00';

      // Use basic toFixed without any complex operations
      const fixed = num.toFixed(2);
      return `Rs. ${fixed}`;
    } catch (error) {
      return 'Rs. 0.00';
    }
  };

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Image */}
      <Image
        src="/sanghi-header.jpg"
        style={[styles.headerImage, {height: dynamicStyles.headerImageHeight}]}
      />

      <Text style={[styles.title, {fontSize: dynamicStyles.titleFontSize, marginBottom: dynamicStyles.titleMargin}]}>QUOTATION</Text>

      {/* Consolidated Quotation & Customer Info Strip */}
      <View style={[styles.consolidatedInfoSection, {marginBottom: dynamicStyles.infoSectionMargin}]}>
        {/* Left Column - Quotation Details */}
        <View style={styles.leftColumn}>
          <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Quote No: <Text style={styles.compactValue}>{quotation.quotationNumber}</Text></Text>
          <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Date: <Text style={styles.compactValue}>{quotation.date}</Text></Text>
          <Text style={[styles.compactLabel, {fontSize: dynamicStyles.infoFontSize}]}>Valid Until: <Text style={styles.compactValue}>{quotation.validUntil}</Text></Text>
        </View>

        {/* Right Column - Customer Details */}
        <View style={styles.rightColumn}>
          <Text style={[styles.compactLabel, {fontSize: dynamicStyles.customerFontSize}]}>Bill To:</Text>
          <Text style={[styles.compactValue, {fontSize: dynamicStyles.customerFontSize}]}>{quotation.customerName}</Text>
          <Text style={[styles.compactValue, {fontSize: dynamicStyles.customerFontSize}]}>{quotation.customerAddress}</Text>
          {quotation.customerPhone && (
            <Text style={[styles.compactValue, {fontSize: dynamicStyles.customerFontSize}]}>Phone: {quotation.customerPhone}</Text>
          )}
          {quotation.customerGST && (
            <Text style={[styles.compactValue, {fontSize: dynamicStyles.customerFontSize}]}>GST: {quotation.customerGST}</Text>
          )}
        </View>
      </View>

      {/* Subject */}
      {quotation.subject && (
        <View style={styles.subjectBox}>
          <Text style={styles.subjectLabel}>Subject:</Text>
          <Text style={styles.subjectText}>{quotation.subject}</Text>
        </View>
      )}

      {/* Items Table */}
      <View style={styles.itemsTable}>
        <View style={[styles.tableHeader, {minHeight: dynamicStyles.tableMinHeight}]}>
          <Text style={[styles.tableHeaderCell, {width: columnWidths.serial, fontSize: dynamicStyles.tableHeaderFontSize}]}>Sr. No.</Text>
          <Text style={[styles.tableHeaderCell, {width: columnWidths.description, fontSize: dynamicStyles.tableHeaderFontSize}]}>Item Description</Text>
          {customColumns.map((column) => (
            <Text key={column} style={[styles.tableHeaderCell, {width: columnWidths.custom, fontSize: dynamicStyles.tableHeaderFontSize}]}>
              {formatProperCase(column)}
            </Text>
          ))}
          <Text style={[styles.tableHeaderCell, {width: columnWidths.amount, fontSize: dynamicStyles.tableHeaderFontSize}]}>Amount</Text>
        </View>

        {quotation.items.map((item, index) => (
          <View key={item.id} style={[index % 2 === 0 ? styles.tableRow : styles.tableRowEven, {minHeight: dynamicStyles.tableMinHeight}]}>
            <Text style={[styles.tableCell, {width: columnWidths.serial, fontSize: dynamicStyles.tableFontSize}]}>{item.serial_no}</Text>
            <Text style={[styles.tableCell, {width: columnWidths.description, fontSize: dynamicStyles.tableFontSize}]}>{formatProperCase(item.description)}</Text>
            {customColumns.map((column) => (
              <Text key={column} style={[styles.tableCell, {width: columnWidths.custom, textAlign: 'center', fontSize: dynamicStyles.tableFontSize}]}>
                {formatProperCase(item[column] || '')}
              </Text>
            ))}
            <Text style={[styles.tableCellRight, {width: columnWidths.amount, fontSize: dynamicStyles.tableFontSize}]}>Rs. {Number(item.amount).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, {fontSize: dynamicStyles.summaryFontSize}]}>Subtotal:</Text>
          <Text style={[styles.summaryValue, {fontSize: dynamicStyles.summaryFontSize}]}>Rs. {Number(quotation.subtotal).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, {fontSize: dynamicStyles.summaryFontSize}]}>GST ({quotation.gstRate}%):</Text>
          <Text style={[styles.summaryValue, {fontSize: dynamicStyles.summaryFontSize}]}>Rs. {Number(quotation.gstAmount).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, {fontSize: dynamicStyles.totalFontSize}]}>Grand Total:</Text>
          <Text style={[styles.totalValue, {fontSize: dynamicStyles.totalFontSize}]}>Rs. {Number(quotation.total).toFixed(2)}</Text>
        </View>
      </View>

      {/* Amount in Words */}
      <View style={styles.wordsSection}>
        <Text style={[styles.wordsLabel, {fontSize: dynamicStyles.wordsFontSize}]}>Amount in Words:</Text>
        <Text style={[styles.wordsText, {fontSize: dynamicStyles.wordsFontSize}]}>{quotation.amountInWords}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footerSection}>
        <Text style={styles.thankYou}>Thank you for choosing Sanghi Stationers!</Text>
        <Text style={styles.footerNote}>
          This is a system generated quotation. For any queries, please contact us.
        </Text>
        
        <View style={styles.signatureArea}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureText}>Customer Signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureText}>Authorized Signatory</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
  );
};

const SanghiStationersPDF = forwardRef<any, SanghiStationersPDFProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      try {
        const blob = await pdf(<SanghiStationersPDFDocument {...props} />).toBlob();
        
        // Create custom filename
        const customerName = props.quotation.customerName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
        const date = props.quotation.date?.replace(/[^0-9]/g, '') || new Date().toISOString().split('T')[0].replace(/[^0-9]/g, '');
        const quotationNumber = props.quotation.quotationNumber?.replace(/[^a-zA-Z0-9]/g, '_') || 'Quote';
        const filename = `${customerName}_${date}_${quotationNumber}.pdf`;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
      }
    }
  }));

  return (
    <ClientOnlyPDFViewer>
      <PDFViewer style={{ width: '100%', height: '600px' }}>
        <SanghiStationersPDFDocument {...props} />
      </PDFViewer>
    </ClientOnlyPDFViewer>
  );
});

SanghiStationersPDF.displayName = 'SanghiStationersPDF';

export default SanghiStationersPDF;
